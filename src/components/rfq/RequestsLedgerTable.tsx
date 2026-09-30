import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { RFQRead } from '../../types/rfq'
import { useFormat } from '../../lib/format'
import { deadlineDays, rfqDisplayNumber, rfqListBucket } from '../../lib/rfqDisplay'
import { useUnitLabel } from '../../lib/units'
import { Icon, Menu } from '../ds'
import { RequestStatus } from '../ds/StatusChips'

export function requestDestination(rfq: RFQRead): string {
  return rfqListBucket(rfq) === 'draft' && rfq.request_kind === 'commercial'
    ? `/rfqs/${rfq.id}/edit`
    : `/rfqs/${rfq.id}`
}

function asksDestination(rfq: RFQRead): string {
  return `/rfqs/${rfq.id}?tab=overview#needs-answer`
}

/** "Tomorrow", "In 5 days", "Today" — capitalised output of Intl.RelativeTimeFormat. */
export function useRelativeDays() {
  const fmt = useFormat()
  const rtf = new Intl.RelativeTimeFormat(fmt.locale, { numeric: 'auto' })
  return (days: number) => {
    const text = rtf.format(days, 'day')
    return text.charAt(0).toLocaleUpperCase(fmt.locale) + text.slice(1)
  }
}

function StatusCell({ rfq }: { rfq: RFQRead }) {
  const { t } = useTranslation('rfq')
  const need = rfq.supplier_stage_counts?.buyer_action_required ?? 0
  const showNeed = rfqListBucket(rfq) === 'open' && need > 0
  return (
    <div className="rq-status-cell">
      <RequestStatus status={rfq.status} />
      {showNeed && (
        <Link
          to={asksDestination(rfq)}
          className="rq-need-you"
          onClick={event => event.stopPropagation()}
        >
          <Icon name="warning" size={12} filled />
          {t('dashboard.table.needYou', { count: need })}
        </Link>
      )}
    </div>
  )
}

function QuotesCell({ rfq }: { rfq: RFQRead }) {
  const { t } = useTranslation('rfq')
  if (rfq.supplier_count <= 0) {
    return <span className="rq-muted" aria-label={t('dashboard.table.noSuppliersYet')}>{'\u2014'}</span>
  }
  const ready = rfq.confirmed_count
  if (ready <= 0) {
    return <span className="rq-muted">{t('dashboard.table.noneInComparison')}</span>
  }
  return (
    <Link
      to={`/rfqs/${rfq.id}/comparison`}
      className="rq-compare"
      aria-label={t('dashboard.table.compare', { count: ready })}
      onClick={event => event.stopPropagation()}
    >
      {t('dashboard.table.inComparison', { count: ready })}
    </Link>
  )
}

function DeadlineCell({ rfq }: { rfq: RFQRead }) {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const relative = useRelativeDays()
  const days = deadlineDays(rfq.response_deadline)
  if (days == null || !rfq.response_deadline) {
    return <span className="rq-muted" aria-label={t('dashboard.deadline.none')}>{'\u2014'}</span>
  }
  const exact = fmt.date(rfq.response_deadline, { dateStyle: 'medium' })
  const live = rfqListBucket(rfq) === 'open'
  if (days < 0 && live) {
    return (
      <span className="rq-overdue" title={exact}>
        <Icon name="warning" size={14} filled />
        {t('dashboard.deadline.overdueShort', { count: Math.abs(days) })}
      </span>
    )
  }
  return <span className={days < 0 ? 'rq-muted' : days <= 1 && live ? 'rq-soon' : undefined} title={exact}>{relative(days)}</span>
}

export default function RequestsLedgerTable({ rfqs }: { rfqs: RFQRead[] }) {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const units = useUnitLabel()
  const navigate = useNavigate()

  return (
    <div className="ds-table-wrap">
      <table className="ds-table qt-table rq-table">
        <thead>
          <tr>
            <th>{t('dashboard.table.request')}</th>
            <th>{t('dashboard.table.status')}</th>
            <th className="qt-num">{t('dashboard.table.quantity')}</th>
            <th>{t('dashboard.table.replies')}</th>
            <th>{t('dashboard.table.deadline')}</th>
            <th className="qt-num">{t('dashboard.table.updated')}</th>
            <th className="qt-actions"><span className="sr-only">{t('dashboard.table.actions')}</span></th>
          </tr>
        </thead>
        <tbody>
          {rfqs.map((rfq) => {
            const unitLabel = rfq.request_kind === 'commercial'
              ? units.count(rfq.base_unit)
              : rfq.base_unit
            const destination = requestDestination(rfq)
            const needYou = (rfq.supplier_stage_counts?.buyer_action_required ?? 0) > 0
              && rfqListBucket(rfq) === 'open'
            return (
              <tr
                key={rfq.id}
                className={needYou ? 'is-link is-attention' : 'is-link'}
                onClick={() => navigate(destination)}
              >
                <td>
                  <div className="qt-request">
                    <Link to={destination} className="qt-request-name rq-name" title={rfq.name} onClick={event => event.stopPropagation()}>
                      {rfq.name}
                    </Link>
                    <span className="ds-id">{rfqDisplayNumber(rfq)}</span>
                  </div>
                </td>
                <td><StatusCell rfq={rfq} /></td>
                <td className="qt-num">
                  <span className="qy-num">{fmt.number(rfq.quantity)}</span>
                  <span className="qt-unit"> {unitLabel}</span>
                </td>
                <td><QuotesCell rfq={rfq} /></td>
                <td><DeadlineCell rfq={rfq} /></td>
                <td className="qt-num rq-muted-text">
                  {fmt.date(rfq.updated_at, { day: 'numeric', month: 'short' })}
                </td>
                <td className="qt-actions" onClick={event => event.stopPropagation()}>
                  <Menu
                    label={t('dashboard.table.actions')}
                    items={[
                      { label: t('dashboard.row.open'), icon: 'open_in_new', onSelect: () => navigate(destination) },
                      ...(rfq.confirmed_count > 0
                        ? [{ label: t('dashboard.row.compare'), icon: 'balance', onSelect: () => navigate(`/rfqs/${rfq.id}/comparison`) }]
                        : []),
                      ...(rfqListBucket(rfq) === 'draft' && rfq.request_kind === 'commercial'
                        ? [{ label: t('dashboard.row.edit'), icon: 'edit', onSelect: () => navigate(`/rfqs/${rfq.id}/edit`) }]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
