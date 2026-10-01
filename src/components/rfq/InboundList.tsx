import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { InboundMessageRead } from '../../types/inbound'
import type { SupplierRead } from '../../types/rfq'
import { useAssignSupplier, useMarkInboundRead, useReclassifyInbound } from '../../hooks/useInboundActions'
import { useEnumLabels } from '../../i18n/labels'
import { useFormat } from '../../lib/format'
import InboundReplyPanel from './InboundReplyPanel'
import ExtractionPassSummary from '../extraction/ExtractionPassSummary'
import { Alert, EmptyState, SelectInput } from '../ui'

type Filter = 'all' | 'quote' | 'conversation'

function statusClass(status: string) {
  if (status === 'error') return 'ds-pill ds-pill-danger'
  if (status === 'unmatched') return 'ds-pill ds-pill-warn'
  return 'ds-pill ds-pill-muted'
}

function attachmentClass(status: string) {
  if (status === 'extracted') return 'ds-pill ds-pill-success'
  if (status === 'failed') return 'ds-pill ds-pill-warn'
  return 'ds-pill ds-pill-muted'
}

function AssignSupplierBlock({ message, rfqId, suppliers }: { message: InboundMessageRead; rfqId: string; suppliers: SupplierRead[] }) {
  const { t } = useTranslation('inbox')
  const [supplierId, setSupplierId] = useState('')
  const assign = useAssignSupplier(message.id, rfqId)
  const description = message.message_type === 'conversation' ? t('assign.descriptionConversation') : t('assign.description')

  return (
    <Alert tone="warning">
      <p><strong>{t('assign.title')}</strong></p>
      <p>{description}</p>
      {suppliers.length === 0 ? (
        <p className="ds-meta">{t('assign.noSuppliers')}</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <SelectInput value={supplierId} onChange={e => setSupplierId(e.target.value)} className="max-w-xs">
            <option value="">{t('assign.placeholder')}</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
            ))}
          </SelectInput>
          <button
            type="button"
            className="ds-btn ds-btn-secondary"
            onClick={() => assign.mutate(supplierId)}
            disabled={!supplierId || assign.isPending}
          >
            {assign.isPending ? t('assign.assigning') : t('assign.action')}
          </button>
        </div>
      )}
      {assign.isError && <p className="ds-meta" style={{ color: 'var(--danger-fg)' }}>{t('assign.failed')}</p>}
    </Alert>
  )
}

function InboundItem({ message, rfqId, suppliers }: { message: InboundMessageRead; rfqId: string; suppliers: SupplierRead[] }) {
  const { t } = useTranslation('inbox')
  const fmt = useFormat()
  const [showReply, setShowReply] = useState(false)
  const reclassify = useReclassifyInbound(message.id, rfqId)
  const labels = useEnumLabels()

  const oppositeType = message.message_type === 'conversation' ? 'quote' : 'conversation'
  const reclassifyLabel = message.message_type === 'quote' ? t('reclassify.toConversation') : t('reclassify.toQuote')
  const reclassifyHelper = message.message_type === 'quote' ? t('reclassify.toConversationHelper') : t('reclassify.toQuoteHelper')
  const extractedAttachments = message.attachments?.filter(a => a.extraction_status === 'extracted').length ?? 0
  const failedAttachments = message.attachments?.filter(a => a.extraction_status === 'failed').length ?? 0

  return (
    <li className="ds-section">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p style={{ fontWeight: 600, color: 'var(--tx-1)' }}>{message.subject || t('noSubject')}</p>
          <p className="ds-meta">{message.from_email} · {fmt.date(message.received_at, { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={message.message_type === 'quote' ? 'ds-pill' : 'ds-pill ds-pill-muted'}>{labels.messageType(message.message_type)}</span>
          <span className={statusClass(message.status)}>{labels.messageStatus(message.status)}</span>
          {message.has_attachments && (
            <span className={failedAttachments ? 'ds-pill ds-pill-warn' : 'ds-pill ds-pill-muted'}>
              {extractedAttachments > 0 ? t('extracted', { count: extractedAttachments }) : t('attachment')}
            </span>
          )}
          {message.delivered_at && (
            <span className="ds-pill ds-pill-success">{t('originalInGmail')}</span>
          )}
        </div>
      </div>

      {message.body_text && (
        <p style={{ marginTop: 12, color: 'var(--tx-body)', fontSize: 14, lineHeight: '22px' }}>{message.body_text}</p>
      )}

      {message.attachments && message.attachments.length > 0 && (
        <ul>
          {message.attachments.map((att) => (
            <li key={att.id} className="ds-file-row">
              <span className="truncate">{att.filename}</span>
              <span className={attachmentClass(att.extraction_status)}>
                {t(`attachmentStatus.${att.extraction_status}`, { defaultValue: att.extraction_status })}
              </span>
            </li>
          ))}
        </ul>
      )}
      {message.has_attachments && message.delivered_at && (
        <p className="ds-meta" style={{ marginTop: 8 }}>{t('attachmentsInGmail')}</p>
      )}

      {message.extraction_pass && <ExtractionPassSummary data={message.extraction_pass} />}

      {message.replied_at && message.reply_text && (
        <div style={{ marginTop: 12 }}>
          <p className="ds-meta">{t('youReplied', { date: fmt.date(message.replied_at, { dateStyle: 'medium', timeStyle: 'short' }) })}</p>
          <p style={{ marginTop: 4, color: 'var(--tx-body)' }}>{message.reply_text}</p>
        </div>
      )}

      {message.error_detail && (
        <Alert tone={message.status === 'error' ? 'error' : 'warning'} className="mt-3">{message.error_detail}</Alert>
      )}

      {message.status === 'unmatched' && (
        <div className="mt-3">
          <AssignSupplierBlock message={message} rfqId={rfqId} suppliers={suppliers} />
        </div>
      )}

      {message.status !== 'unmatched' && (
        <div className="ds-toolbar-actions" style={{ marginTop: 12 }}>
          {message.quote_id && (
            <Link to={`/quotes/${message.quote_id}`} className="ds-btn ds-btn-secondary">{t('openQuote')}</Link>
          )}
          {message.message_type === 'conversation' && !message.replied_at && (
            <button type="button" onClick={() => setShowReply(!showReply)} className="ds-btn ds-btn-secondary">
              {showReply ? t('cancelReply') : t('reply')}
            </button>
          )}
          <button
            type="button"
            onClick={() => reclassify.mutate(oppositeType)}
            disabled={reclassify.isPending}
            title={reclassifyHelper}
            className="ds-btn ds-btn-text"
          >
            {reclassify.isPending ? t('reclassifying') : reclassifyLabel}
          </button>
        </div>
      )}

      {showReply && message.rfq_id && (
        <InboundReplyPanel
          inboundId={message.id}
          rfqId={rfqId}
          onClose={() => setShowReply(false)}
        />
      )}
    </li>
  )
}

export default function InboundList({ messages, rfqId, suppliers }: { messages: InboundMessageRead[]; rfqId: string; suppliers: SupplierRead[] }) {
  const { t } = useTranslation('inbox')
  const [filter, setFilter] = useState<Filter>('all')
  const markRead = useMarkInboundRead(rfqId)
  // Mark each message read at most once. Marking invalidates the inbound query,
  // which refetches and re-runs this effect; without this guard that becomes an
  // invalidate→refetch→mark infinite loop.
  const markedRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    messages
      .filter(message => !message.read_at && !markedRef.current.has(message.id))
      .forEach(message => {
        markedRef.current.add(message.id)
        markRead.mutate(message.id)
      })
  }, [messages, markRead])

  const counts = useMemo(() => ({
    all: messages.length,
    quote: messages.filter(m => m.message_type === 'quote').length,
    conversation: messages.filter(m => m.message_type === 'conversation').length,
  }), [messages])

  const filtered = useMemo(() => {
    if (filter === 'all') return messages
    return messages.filter(m => m.message_type === filter)
  }, [messages, filter])

  if (messages.length === 0) {
    return <EmptyState title={t('emptyTitle')} description={t('emptyDescription')} />
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filters.all', { count: counts.all }) },
    { key: 'quote', label: t('filters.quote', { count: counts.quote }) },
    { key: 'conversation', label: t('filters.conversation', { count: counts.conversation }) },
  ]

  const attentionCount = messages.filter(m => m.status === 'unmatched' || m.status === 'error').length

  return (
    <div>
      <div className="ds-toolbar">
        <div className="ds-segmented" role="group" aria-label={t('filters.all', { count: counts.all })}>
          {filters.map(f => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        {attentionCount > 0 && (
          <span className="ds-pill ds-pill-warn">{t('needAttention', { count: attentionCount })}</span>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="ds-meta" style={{ marginTop: 16 }}>{t('noFilterMessages')}</p>
      ) : (
        <ul>
          {filtered.map(message => (
            <InboundItem key={message.id} message={message} rfqId={rfqId} suppliers={suppliers} />
          ))}
        </ul>
      )}
    </div>
  )
}
