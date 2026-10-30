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
import { Button, Chip, IntelligenceMark, StatusBadge, TextButton, Textarea } from '../../design-system'
import { useRelativeTime } from '../../lib/relativeTime'
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
    <section id="needs-answer" aria-labelledby="rd2-h-questions" className="rd2-block rp-questions">
      <h3 id="rd2-h-questions" className="rd2-h2 is-sm">
        {t('respuestas.questions.title')}
        <span className="rd2-count">{actions.length}</span>
      </h3>
      {actions.length === 0 && <p className="rd2-muted rp-empty-line">{t('buyerActions.emptyLine')}</p>}
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
      {resolved.map(action => <ResolvedQuestion key={action.id} action={action} inbound={inbound} />)}
    </section>
  )
}

function ResolvedQuestion({ action, inbound }: { action: BuyerActionRead, inbound: InboundMessageRead[] }) {
  const { t } = useTranslation('rfq')
  const relative = useRelativeTime()
  const message = inbound.find(msg => msg.id === action.inbound_message_id)
  return (
    <article className="rp-q is-resolved">
      <header className="rp-q-head">
        <span className="rp-q-name">{action.supplier_name ?? t('buyerActions.unknownSupplier')}</span>
        <StatusBadge tone="success" variant="quiet" icon="check-circle">{t('respuestas.questions.resolved')}</StatusBadge>
        <span className="rp-q-when">{relative(action.resolved_at ?? action.created_at)}</span>
      </header>
      <p className="rp-q-text">{`«${action.question}»`}</p>
      {message?.reply_text && <p className="rp-q-answer">{message.reply_text}</p>}
      <p className="rp-q-foot"><span>{message?.replied_at ? t('respuestas.questions.replySent') : t('buyerActions.resolvedByYou')}</span></p>
    </article>
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

  return (
    <article className="rp-q">
      <header className="rp-q-head">
        <span className="rp-q-name">{name}</span>
        <StatusBadge tone="warning" variant="quiet" icon="chat-text">{t('respuestas.questions.open')}</StatusBadge>
        {blocking && <span className="rp-q-flag">{t('buyerActions.cantQuote')}</span>}
        <span className="rp-q-when">{compactAgo(latest, t)}</span>
      </header>

      {items.map(item => <p key={item.id} className="rp-q-text">{`«${item.question}»`}</p>)}

      {allChips.length > 0 && (
        <div className="rp-q-quick">
          <span className="rp-q-label">{t('respuestas.questions.quick')}</span>
          <div className="rp-q-chips" role="group" aria-label={t('buyerActions.quickAnswers')}>
            {items.flatMap(item => (chipsById[item.id] ?? []).map(chip => (
              <Chip key={`${item.id}-${chip.id}`} selected={usedChips.some(c => c.id === chip.id)} onClick={() => addChip(chip)}>{chip.label}</Chip>
            )))}
          </div>
        </div>
      )}

      {loadingSuggestion
        ? <p className="rd2-muted">{t('buyerActions.generatingSuggestion')}</p>
        : mode === 'choose' && suggestion
          ? (
            <div className="rp-suggestion">
              <span className="rp-suggestion-label">
                <IntelligenceMark size={14} />
                {t('respuestas.questions.suggestion')}
                <span className="rp-suggestion-review">{t('respuestas.questions.toReview')}</span>
              </span>
              <p className="rp-suggestion-text">{suggestion}</p>
              <div className="rp-suggestion-actions">
                <Button variant="secondary" size="sm" icon="pencil-simple" onClick={useSuggestion}>{t('buyerActions.useSuggestion')}</Button>
                <TextButton size="sm" onClick={writeOwn}>{t('buyerActions.writeOwn')}</TextButton>
              </div>
            </div>
          )
          : (
            <Textarea
              label={t('respuestas.questions.yourReply')}
              description={suggestionError ? t('buyerActions.suggestFailed') : t('buyerActions.editHint')}
              value={draft}
              onChange={event => setDraft(event.target.value)}
              rows={5}
            />
          )}

      <footer className="rp-q-actions">
        <p className="rd2-muted">{t('respuestas.questions.resolveNote')}</p>
        <div className="rp-q-buttons">
          <Button variant="secondary" icon="check" loading={resolve.isPending && !sending} onClick={() => void markResolved()}>
            {t('buyerActions.resolve')}
          </Button>
          {mode === 'write' && (
            <Button icon="paper-plane-tilt" loading={sending} disabled={!draft.trim()} onClick={() => void sendReply()}>
              {t('buyerActions.sendReply')}
            </Button>
          )}
        </div>
      </footer>
    </article>
  )
}
