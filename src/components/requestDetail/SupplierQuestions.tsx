import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { BuyerActionRead } from '../../types/buyerAction'
import type { InboundMessageRead } from '../../types/inbound'
import type { QuoteListItem } from '../../types/quote'
import type { RFQDetail, SupplierRead } from '../../types/rfq'
import { composeSupplierReply, patchFromAnswers, quickAnswersForQuestion, type QuickChip } from '../../lib/quickAnswers'
import { useResolveBuyerAction, useUpdateCommercialRFQ } from '../../hooks/useRFQs'
import { replyToInbound } from '../../api/inbound'
import { Btn, SectionCard } from '../ds'
import { toast } from '../ui'

function compactAgo(iso: string, t: TFunction): string {
  const minutes = Math.max(1, Math.round(Math.abs(Date.now() - new Date(iso).getTime()) / 60_000))
  if (minutes < 60) return t('buyerActions.agoMinutes', { count: minutes })
  const hours = Math.round(minutes / 60)
  if (hours < 48) return t('buyerActions.agoHours', { count: hours })
  return t('buyerActions.agoDays', { count: Math.round(hours / 24) })
}

function blocksQuote(supplier: SupplierRead | undefined, quotes: QuoteListItem[]) {
  if (!supplier) return false
  if (supplier.status === 'buyer_action_required') return true
  const theirs = quotes.filter(quote => quote.supplier_id === supplier.id)
  return theirs.length === 0 || theirs.every(quote => quote.normalized_price == null)
}

export default function SupplierQuestions({
  rfq,
  actions,
  suppliers,
  quotes,
  inbound,
}: {
  rfq: RFQDetail
  actions: BuyerActionRead[]
  suppliers: SupplierRead[]
  quotes: QuoteListItem[]
  inbound: InboundMessageRead[]
}) {
  const { t } = useTranslation('rfq')
  const open = actions.filter(action => action.status === 'open')
  const resolved = actions.filter(action => action.status === 'resolved')
  const groups = useMemo(() => {
    const map = new Map<string, BuyerActionRead[]>()
    for (const action of open) {
      map.set(action.supplier_id, [...(map.get(action.supplier_id) ?? []), action])
    }
    return [...map.entries()].map(([supplierId, items]) => ({
      supplierId,
      items: [...items].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    }))
  }, [open])

  return (
    <SectionCard
      id="needs-answer"
      className="rd-sq-card"
      title={t('buyerActions.questionsTitle')}
      actions={open.length > 0 ? <span className="rd-sq-count">{t('buyerActions.openCount', { count: open.length })}</span> : undefined}
      flush
    >
      {open.length === 0 && (
        <p className="rd-sq-empty">{t('buyerActions.emptyLine')}</p>
      )}
      {groups.map(group => (
        <SupplierBlock
          key={group.supplierId}
          rfq={rfq}
          items={group.items}
          supplier={suppliers.find(s => s.id === group.supplierId)}
          quotes={quotes}
          inbound={inbound.filter(msg => msg.supplier_id === group.supplierId)}
        />
      ))}
      {resolved.length > 0 && (
        <div className="rd-resolved">
          <h3>{t('buyerActions.resolvedTitle')}</h3>
          <ul>
            {resolved.map(action => (
              <li key={action.id}>
                <span className="rd-resolved-q">{action.question}</span>
                <span className="rd-ask-meta">{action.supplier_name ?? t('buyerActions.unknownSupplier')} · {t('buyerActions.resolvedByYou')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  )
}

function SupplierBlock({
  rfq,
  items,
  supplier,
  quotes,
  inbound,
}: {
  rfq: RFQDetail
  items: BuyerActionRead[]
  supplier?: SupplierRead
  quotes: QuoteListItem[]
  inbound: InboundMessageRead[]
}) {
  const { t } = useTranslation('rfq')
  const updateRfq = useUpdateCommercialRFQ()
  const resolve = useResolveBuyerAction(rfq.id)
  const name = supplier?.name ?? items[0].supplier_name ?? t('buyerActions.unknownSupplier')
  const latest = items.reduce((max, item) => (item.created_at > max ? item.created_at : max), items[0].created_at)
  const chipsById = useMemo(
    () => Object.fromEntries(items.map(item => [item.id, quickAnswersForQuestion(item.question, rfq)])),
    [items, rfq],
  )
  const [picked, setPicked] = useState<Record<string, string>>({})
  const [other, setOther] = useState<Record<string, string>>({})
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const blocking = blocksQuote(supplier, quotes)

  const answerFor = (item: BuyerActionRead): { chip?: QuickChip, text: string } | null => {
    const choice = picked[item.id]
    if (!choice) return null
    if (choice === '__other') {
      const text = other[item.id]?.trim()
      return text ? { text } : null
    }
    const chip = chipsById[item.id]?.find(c => c.id === choice)
    return chip ? { chip, text: chip.label } : null
  }

  const saveSpec = async () => {
    const chips = items.map(item => answerFor(item)?.chip).filter((chip): chip is QuickChip => !!chip)
    const others = items.map(item => (picked[item.id] === '__other' ? other[item.id] : '')).filter(Boolean)
    if (chips.length === 0 && others.length === 0) return
    await updateRfq.mutateAsync({ id: rfq.id, data: patchFromAnswers(rfq, chips, others) })
  }

  const markResolved = async () => {
    await saveSpec()
    for (const item of items) await resolve.mutateAsync(item.id)
    toast(t('buyerActions.resolvedToast'))
  }

  const sendAnswers = async () => {
    const rows = items.map(item => ({ question: item.question, answer: answerFor(item)?.text ?? '' }))
    if (rows.some(row => !row.answer)) {
      toast(t('buyerActions.needAnswers'), 'error')
      return
    }
    setSending(true)
    try {
      await saveSpec()
      const body = composeSupplierReply(name, rows, note)
      const inboundId = items.find(item => item.inbound_message_id)?.inbound_message_id
        ?? inbound[0]?.id
      if (inboundId) {
        try {
          await replyToInbound(inboundId, body)
        } catch {
          const email = supplier?.email
          if (email) window.location.href = `mailto:${email}?subject=${encodeURIComponent(rfq.name)}&body=${encodeURIComponent(body)}`
          else throw new Error('no_channel')
        }
      } else if (supplier?.email) {
        window.location.href = `mailto:${supplier.email}?subject=${encodeURIComponent(rfq.name)}&body=${encodeURIComponent(body)}`
      }
      for (const item of items) await resolve.mutateAsync(item.id)
      toast(t('buyerActions.sentToast'))
    } catch {
      toast(t('buyerActions.sendFailed'), 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <article className="rd-sq-block">
      <header className="rd-sq-head">
        <p className="rd-sq-supplier">
          <span className="rd-sq-name">{name}</span>
          <span className="rd-ask-meta">
            {t('buyerActions.askedLine', { count: items.length, when: compactAgo(latest, t) })}
          </span>
        </p>
        {blocking && (
          <span className="rd-sq-block-flag">
            <span className="rq-dot is-warn" />
            {t('buyerActions.cantQuote')}
          </span>
        )}
      </header>

      <ul className="rd-sq-questions">
        {items.map((item) => {
          const chips = chipsById[item.id] ?? []
          const choice = picked[item.id]
          return (
            <li key={item.id}>
              <p className="rd-sq-q">{item.question}</p>
              <div className="rd-sq-chips" role="group" aria-label={t('buyerActions.quickAnswers')}>
                {chips.map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    className={choice === chip.id ? 'rd-sq-chip is-on' : 'rd-sq-chip'}
                    onClick={() => setPicked(prev => ({ ...prev, [item.id]: chip.id }))}
                  >
                    {chip.label}
                    {choice === chip.id && <span className="rd-sq-check" aria-hidden>✓</span>}
                  </button>
                ))}
                <button
                  type="button"
                  className={choice === '__other' ? 'rd-sq-chip is-on' : 'rd-sq-chip'}
                  onClick={() => setPicked(prev => ({ ...prev, [item.id]: '__other' }))}
                >
                  {t('buyerActions.other')}
                </button>
              </div>
              {choice === '__other' && (
                <input
                  className="rd-sq-other"
                  value={other[item.id] ?? ''}
                  onChange={event => setOther(prev => ({ ...prev, [item.id]: event.target.value }))}
                  placeholder={t('buyerActions.otherPlaceholder')}
                />
              )}
            </li>
          )
        })}
      </ul>

      <label className="rd-sq-note">
        <span className="sr-only">{t('buyerActions.note')}</span>
        <textarea
          rows={2}
          value={note}
          onChange={event => setNote(event.target.value)}
          placeholder={t('buyerActions.note')}
        />
      </label>

      <footer className="rd-sq-foot">
        <p>{t('buyerActions.specHelper')}</p>
        <div className="rd-sq-foot-actions">
          <Btn variant="text" loading={resolve.isPending && !sending} onClick={() => void markResolved()}>
            {t('buyerActions.resolve')}
          </Btn>
          <Btn variant="primary" loading={sending} onClick={() => void sendAnswers()}>
            {t('buyerActions.sendAnswers')}
          </Btn>
        </div>
      </footer>
    </article>
  )
}
