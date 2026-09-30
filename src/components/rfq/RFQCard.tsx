import { Icon } from '../ds'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { RFQRead } from '../../types/rfq'
import { useEnumLabels } from '../../i18n/labels'
import { useFormat } from '../../lib/format'
import { Badge, ProgressBar, StatusBadge } from '../ui'
import SupplierStageChips from './SupplierStageChips'

function daysUntil(date: string, t: TFunction<'rfq'>) {
  const today = new Date()
  const due = new Date(`${date}T00:00:00`)
  const diff = Math.ceil((due.getTime() - today.getTime()) / 86400000)
  if (!Number.isFinite(diff)) return date
  if (diff < 0) return t('card.overdue', { count: Math.abs(diff) })
  if (diff === 0) return t('card.dueToday')
  return t('card.toDeadline', { count: diff })
}

function rfqNumber(rfq: RFQRead) {
  return rfq.header_data?.rfq_number || `RFQ-${rfq.id.slice(0, 8)}`
}

export default function RFQCard({ rfq }: { rfq: RFQRead }) {
  const { t } = useTranslation('rfq')
  const labels = useEnumLabels()
  const fmt = useFormat()
  const responseCount = rfq.response_count ?? rfq.quoted_count
  const pendingCount = Math.max(0, rfq.supplier_count - rfq.quoted_count)
  const progress = rfq.supplier_count > 0 ? (rfq.quoted_count / rfq.supplier_count) * 100 : 0
  const isComparable = rfq.quoted_count > 0
  const isDecided = rfq.status === 'decided'
  const statusToken = isDecided ? 'decided' : rfq.status || 'open'
  const actionTo = isComparable || isDecided ? `/rfqs/${rfq.id}/comparison` : `/rfqs/${rfq.id}`

  return (
    <div className="interactive-card card card-pad relative">
      <Link to={`/rfqs/${rfq.id}`} className="absolute inset-0 rounded-[var(--radius-card)]" aria-label={rfq.name} />
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_300px_auto] md:items-center">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={statusToken} label={labels.rfqStatus(statusToken)} />
            <span className="text-xs font-semibold text-[var(--text-muted)]">{rfqNumber(rfq)}</span>
          </div>

          <h3 className="qy-heading truncate text-lg font-semibold text-[var(--text-primary)]">{rfq.name}</h3>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Icon name="inventory_2" size={14} /> {fmt.number(rfq.quantity)}{' '}
              {rfq.request_kind === 'commercial'
                ? t(`commercial.units.${rfq.base_unit}`, { defaultValue: rfq.base_unit })
                : rfq.base_unit}
            </span>
            {rfq.delivery_point && (
              <span className="inline-flex items-center gap-1"><Icon name="location_on" size={14} /> {rfq.delivery_point}</span>
            )}
            {rfq.response_deadline && (
              <span className="inline-flex items-center gap-1"><Icon name="calendar_today" size={14} /> {daysUntil(rfq.response_deadline, t)}</span>
            )}
            {rfq.request_kind === 'commercial' && rfq.requested_delivery_date && (
              <span className="inline-flex items-center gap-1">
                <Icon name="calendar_today" size={14} /> {t('card.requestedDelivery', { date: fmt.date(rfq.requested_delivery_date) })}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]">
            <span>{t('card.confirmedQuotes')}</span>
            <span className="tnum">{t('card.confirmedOf', { confirmed: rfq.quoted_count, total: rfq.supplier_count })}</span>
          </div>
          <ProgressBar value={progress} />
          <SupplierStageChips counts={rfq.supplier_stage_counts} compact />
          {(!rfq.supplier_stage_counts || Object.keys(rfq.supplier_stage_counts).length === 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {responseCount > 0 && <Badge tone="brand">{t('card.responses', { count: responseCount })}</Badge>}
              {rfq.quoted_count > 0 && <Badge tone="success">{t('card.confirmed', { count: rfq.quoted_count })}</Badge>}
              {pendingCount > 0 && <Badge tone="warning">{t('card.pending', { count: pendingCount })}</Badge>}
            </div>
          )}
        </div>

        <div className="relative z-10 justify-self-start md:justify-self-end">
          <Link to={actionTo} className={`btn ${isComparable ? 'btn-primary' : 'btn-secondary'}`}>
            {isDecided ? t('card.viewDecision') : isComparable ? t('card.compareDecide') : t('card.openRfq')}
            {isComparable ? <Icon name="balance" size={16} /> : <Icon name="arrow_forward" size={16} />}
          </Link>
        </div>
      </div>
    </div>
  )
}
