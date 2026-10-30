import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { InboundMessageRead } from '../../types/inbound'
import type { SupplierRead } from '../../types/rfq'
import { useAssignSupplier, useMarkInboundRead, useReclassifyInbound, useRetryInboundExtraction } from '../../hooks/useInboundActions'
import { useEnumLabels } from '../../i18n/labels'
import { useFormat } from '../../lib/format'
import InboundReplyPanel from './InboundReplyPanel'
import ExtractionPassSummary from '../extraction/ExtractionPassSummary'
import { Alert, SelectInput, toast } from '../ui'
import { Button, EmptySection, Icon, InlineAlert, SegmentedControl, StatusBadge, Tag, TextButton } from '../../design-system'
import { useRelativeTime } from '../../lib/relativeTime'
import OriginalDocument from '../documents/OriginalDocument'

type Filter = 'all' | 'quote' | 'conversation'

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

function InboundItem({ message, rfqId, suppliers, defaultOpen }: { message: InboundMessageRead; rfqId: string; suppliers: SupplierRead[]; defaultOpen?: boolean }) {
  const { t } = useTranslation('inbox')
  const { t: tx } = useTranslation('extraction')
  const fmt = useFormat()
  const relative = useRelativeTime()
  const [open, setOpen] = useState(!!defaultOpen)
  const [showReply, setShowReply] = useState(false)
  const reclassify = useReclassifyInbound(message.id, rfqId)
  const retryExtraction = useRetryInboundExtraction(message.id, rfqId)
  const labels = useEnumLabels()

  const supplier = suppliers.find(s => s.id === message.supplier_id)
  const oppositeType = message.message_type === 'conversation' ? 'quote' : 'conversation'
  const reclassifyLabel = message.message_type === 'quote' ? t('reclassify.toConversation') : t('reclassify.toQuote')
  const reclassifyHelper = message.message_type === 'quote' ? t('reclassify.toConversationHelper') : t('reclassify.toQuoteHelper')
  const messageLabels = message.extraction_pass?.message_labels ?? []
  const readState = message.status === 'error' ? { tone: 'error' as const, icon: 'warning-circle' as const } : message.status === 'unmatched' ? { tone: 'warning' as const, icon: 'warning' as const } : { tone: 'neutral' as const, icon: 'check' as const }
  const panelId = `rp-msg-${message.id}`

  return (
    <li className={`rp-msg${open ? ' is-open' : ''}`}>
      <button type="button" className="rp-msg-head" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(o => !o)}>
        <span className="rp-msg-who">
          <span className="rp-msg-name">{supplier?.name ?? message.from_email}</span>
          <span className="rp-msg-subject">{message.subject || t('noSubject')}</span>
        </span>
        <span className="rp-msg-when">{relative(message.received_at)}</span>
        <span className="rp-msg-caret"><Icon name="caret-down" size={16} /></span>
        <span className="rp-msg-tags">
          {messageLabels.length > 0
            ? messageLabels.map(label => <Tag key={label} variant="outline">{tx(`labels.${label}`, { defaultValue: label })}</Tag>)
            : <Tag variant="outline">{labels.messageType(message.message_type)}</Tag>}
          <StatusBadge tone={readState.tone} variant="quiet" icon={readState.icon}>{labels.messageStatus(message.status)}</StatusBadge>
          {message.has_attachments && <span className="rp-msg-att"><Icon name="paperclip" size={14} />{message.attachments?.length || 1}</span>}
        </span>
      </button>

      {open && (
        <div id={panelId} className="rp-msg-body">
          <section className="rp-msg-section">
            <h4 className="rp-msg-label">{t('original')}</h4>
            <p className="rd2-muted">{`${supplier?.contact_name ? `${supplier.contact_name} · ` : ''}${message.from_email} · ${fmt.date(message.received_at, { dateStyle: 'medium', timeStyle: 'short' })}`}</p>
            {message.body_text && <p className="rp-msg-text">{message.body_text}</p>}
          </section>

          {message.attachments && message.attachments.length > 0 && (
            <section className="rp-msg-section">
              <h4 className="rp-msg-label">{t('documents')}</h4>
              <ul className="rp-docs">
                {message.attachments.map((att) => (
                  <li key={att.id} className="inbound-document">
                    {att.file_url ? (
                      <OriginalDocument
                        endpoint={`/inbound/${message.id}/attachments/${att.id}/original`}
                        filename={att.filename}
                        fileType={att.filename.split('.').pop()}
                      />
                    ) : <span>{att.filename}</span>}
                    <StatusBadge tone={att.extraction_status === 'extracted' ? 'success' : att.extraction_status === 'failed' ? 'warning' : 'neutral'} variant="quiet" icon={false}>
                      {t(`attachmentStatus.${att.extraction_status}`, { defaultValue: att.extraction_status })}
                    </StatusBadge>
                  </li>
                ))}
              </ul>
              {message.has_attachments && message.delivered_at && <p className="rd2-muted">{t('attachmentsInGmail')}</p>}
            </section>
          )}

          {message.extraction_pass && (
            <section className="rp-msg-section">
              <ExtractionPassSummary
                data={message.extraction_pass}
                retrying={retryExtraction.isPending}
                onRetry={message.status === 'error' && message.extraction_pass.processing?.status === 'failed'
                  ? () => retryExtraction.mutate(undefined, {
                      onSuccess: result => toast(result.status === 'processed'
                        ? t('retryComplete')
                        : t('retryStillFailed'), result.status === 'processed' ? 'success' : 'error'),
                    })
                  : undefined}
              />
            </section>
          )}

          {message.replied_at && message.reply_text && (
            <section className="rp-msg-section">
              <p className="rd2-muted">{t('youReplied', { date: fmt.date(message.replied_at, { dateStyle: 'medium', timeStyle: 'short' }) })}</p>
              <p className="rp-msg-text">{message.reply_text}</p>
            </section>
          )}

          {message.error_detail && message.extraction_pass?.processing?.status !== 'failed' && (
            <InlineAlert tone={message.status === 'error' ? 'error' : 'warning'}>{message.error_detail}</InlineAlert>
          )}

          {message.status === 'unmatched' && <AssignSupplierBlock message={message} rfqId={rfqId} suppliers={suppliers} />}

          {message.status !== 'unmatched' && (
            <div className="rp-msg-actions">
              {message.quote_id && (
                <Link to={`/quotes/${message.quote_id}`} className="rp-msg-link">{t('openQuote')}<Icon name="caret-right" size={16} /></Link>
              )}
              {message.message_type === 'conversation' && !message.replied_at && (
                <Button variant="secondary" size="sm" icon={showReply ? undefined : 'arrow-bend-up-left'} onClick={() => setShowReply(!showReply)}>
                  {showReply ? t('cancelReply') : t('reply')}
                </Button>
              )}
              <TextButton size="sm" disabled={reclassify.isPending} title={reclassifyHelper} onClick={() => reclassify.mutate(oppositeType)}>
                {reclassify.isPending ? t('reclassifying') : reclassifyLabel}
              </TextButton>
            </div>
          )}

          {showReply && message.rfq_id && (
            <InboundReplyPanel inboundId={message.id} rfqId={rfqId} onClose={() => setShowReply(false)} />
          )}
        </div>
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
    return <EmptySection dense title={t('emptyTitle')} text={t('emptyDescription')} />
  }

  const attentionCount = messages.filter(m => m.status === 'unmatched' || m.status === 'error').length

  return (
    <div className="rp-messages">
      <div className="rp-toolbar">
        <SegmentedControl<Filter>
          size="sm"
          label={t('filters.all', { count: counts.all })}
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: t('filters.all', { count: counts.all }) },
            { value: 'quote', label: t('filters.quote', { count: counts.quote }) },
            { value: 'conversation', label: t('filters.conversation', { count: counts.conversation }) },
          ]}
        />
        {attentionCount > 0 && <StatusBadge tone="warning" variant="quiet">{t('needAttention', { count: attentionCount })}</StatusBadge>}
      </div>

      {filtered.length === 0 ? (
        <p className="rd2-muted">{t('noFilterMessages')}</p>
      ) : (
        <ul className="rp-msg-list">
          {filtered.map((message, index) => (
            <InboundItem key={message.id} message={message} rfqId={rfqId} suppliers={suppliers} defaultOpen={index === 0} />
          ))}
        </ul>
      )}
    </div>
  )
}
