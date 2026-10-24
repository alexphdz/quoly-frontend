import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { BuyerActionRead } from '../../types/buyerAction'
import type { InboundMessageRead } from '../../types/inbound'
import type { QuoteListItem } from '../../types/quote'
import type { RFQDetail, SupplierRead } from '../../types/rfq'
import { patchFromAnswers, quickAnswersForQuestion, type QuickChip } from '../../lib/quickAnswers'
import { useResolveBuyerAction, useUpdateCommercialRFQ } from '../../hooks/useRFQs'
import { suggestBuyerActionReply } from '../../api/rfqs'
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
  const blocking = blocksQuote(supplier, quotes)

  const chipsById = useMemo(
    () => Object.fromEntries(items.map(item => [item.id, quickAnswersForQuestion(item.question, rfq)])),
    [items, rfq],
  )
  const allChips = useMemo(() => items.flatMap(item => chipsById[item.id] ?? []), [items, chipsById])

  // The AI reply is generated automatically when the block appears. The buyer
  // then uses it as-is, edits it, or writes their own. Nothing is auto-sent.
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [loadingSuggestion, setLoadingSuggestion] = useState(true)
  const [suggestionError, setSuggestionError] = useState(false)
  const [draft, setDraft] = useState('')
  const [mode, setMode] = useState<'choose' | 'write'>('choose')
  const [usedChips, setUsedChips] = useState<QuickChip[]>([])
  const [sending, setSending] = useState(false)
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    suggestBuyerActionReply(rfq.id, items[0].id)
      .then(res => setSuggestion(res.suggested_reply))
      .catch(() => { setSuggestionError(true); setMode('write') })
      .finally(() => setLoadingSuggestion(false))
  }, [rfq.id, items])

  const useSuggestion = () => {
    setDraft(suggestion ?? '')
    setMode('write')
  }
  const writeOwn = () => {
    setDraft('')
    setMode('write')
  }
  const addChip = (chip: QuickChip) => {
    const line = chip.technicalLine ?? chip.label
    setDraft(prev => (prev.trim() ? `${prev.trim()}\n${line}` : line))
    setUsedChips(prev => (prev.some(c => c.id === chip.id) ? prev : [...prev, chip]))
    setMode('write')
  }

  const saveSpec = async () => {
    if (usedChips.length === 0) return
    await updateRfq.mutateAsync({ id: rfq.id, data: patchFromAnswers(rfq, usedChips, []) })
  }

  const markResolved = async () => {
    await saveSpec()
    for (const item of items) await resolve.mutateAsync(item.id)
    toast(t('buyerActions.resolvedToast'))
  }

  const sendReply = async () => {
    if (!draft.trim()) return
    setSending(true)
    try {
      await saveSpec()
      const inboundId = items.find(item => item.inbound_message_id)?.inbound_message_id ?? inbound[0]?.id
      const mailto = () => {
        if (!supplier?.email) throw new Error('no_channel')
        window.location.href = `mailto:${supplier.email}?subject=${encodeURIComponent(rfq.name)}&body=${encodeURIComponent(draft)}`
      }
      if (inboundId) {
        try {
          await replyToInbound(inboundId, draft)
        } catch {
          mailto()
        }
      } else {
        mailto()
      }
      for (const item of items) await resolve.mutateAsync(item.id)
      toast(t('buyerActions.sentToast'))
    } catch {
      toast(t('buyerActions.sendFailed'), 'error')
    } finally {
      setSending(false)
    }
  }

  const textareaStyle = {
    width: '100%',
    minHeight: 120,
    padding: '8px 12px',
    border: '1px solid var(--line-strong)',
    borderRadius: 6,
    background: 'var(--bg-surface)',
    color: 'var(--tx-1)',
  } as const

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
        {items.map(item => (
          <li key={item.id}>
            <p className="rd-sq-q">{item.question}</p>
          </li>
        ))}
      </ul>

      {/* AI reply: generated automatically, used as-is / edited / replaced. */}
      <div className="rd-sq-ai">
        <p className="ds-meta rd-sq-ai-label">{t('buyerActions.suggestionLabel')}</p>

        {loadingSuggestion ? (
          <p className="ds-meta">{t('buyerActions.generatingSuggestion')}</p>
        ) : mode === 'choose' && suggestion ? (
          <div className="rd-sq-ai-card" style={{ border: '1px solid var(--line-strong)', borderRadius: 8, background: 'var(--bg-subtle)', padding: '10px 12px' }}>
            <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 10px', color: 'var(--tx-1)' }}>{suggestion}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="ds-btn ds-btn-primary" onClick={useSuggestion}>
                {t('buyerActions.useSuggestion')}
              </button>
              <button type="button" className="ds-btn ds-btn-secondary" onClick={writeOwn}>
                {t('buyerActions.writeOwn')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {suggestionError && (
              <p className="ds-meta" style={{ color: 'var(--danger-fg)', marginBottom: 6 }}>{t('buyerActions.suggestFailed')}</p>
            )}
            <p className="ds-meta" style={{ marginBottom: 6 }}>{t('buyerActions.editHint')}</p>
            <textarea
              value={draft}
              onChange={event => setDraft(event.target.value)}
              rows={5}
              style={textareaStyle}
            />
          </>
        )}
      </div>

      {allChips.length > 0 && (
        <div className="rd-sq-chips" role="group" aria-label={t('buyerActions.quickAnswers')} style={{ marginTop: 8 }}>
          {items.flatMap(item =>
            (chipsById[item.id] ?? []).map(chip => (
              <button key={`${item.id}-${chip.id}`} type="button" className="rd-sq-chip" onClick={() => addChip(chip)}>
                {chip.label}
              </button>
            )),
          )}
        </div>
      )}

      <footer className="rd-sq-foot">
        <p>{t('buyerActions.specHelper')}</p>
        <div className="rd-sq-foot-actions">
          <Btn variant="text" loading={resolve.isPending && !sending} onClick={() => void markResolved()}>
            {t('buyerActions.resolve')}
          </Btn>
          <Btn variant="primary" loading={sending} disabled={!draft.trim()} onClick={() => void sendReply()}>
            {t('buyerActions.sendReply')}
          </Btn>
        </div>
      </footer>
    </article>
  )
}
