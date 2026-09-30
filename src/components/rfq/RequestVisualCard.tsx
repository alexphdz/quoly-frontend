import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { RFQRead } from '../../types/rfq'
import { useEnumLabels } from '../../i18n/labels'
import { useFormat } from '../../lib/format'
import { rfqDisplayNumber, rfqListBucket, stageSpreadSegments } from '../../lib/rfqDisplay'
import { StatusBadge } from '../ui'
import DonutChart from '../charts/DonutChart'
import { STAGE_COLORS } from '../charts/stagePalette'

export default function RequestVisualCard({ rfq }: { rfq: RFQRead }) {
  const { t } = useTranslation('rfq')
  const labels = useEnumLabels()
  const fmt = useFormat()
  const bucket = rfqListBucket(rfq)
  const statusToken = bucket === 'closed' ? 'decided' : bucket === 'draft' ? 'draft' : 'open'
  const statusLabel = bucket === 'closed' ? t('dashboard.status.closed') : labels.rfqStatus(statusToken)
  const segments = stageSpreadSegments(rfq.supplier_stage_counts)
  const supplierTotal = segments.reduce((sum, segment) => sum + segment.count, 0)
  const needYou = rfq.supplier_stage_counts?.buyer_action_required ?? 0
  const unit =
    rfq.request_kind === 'commercial'
      ? t(`commercial.units.${rfq.base_unit}`, { defaultValue: rfq.base_unit })
      : rfq.base_unit

  const slices = segments.map(segment => ({
    key: segment.stage,
    value: segment.count,
    color: STAGE_COLORS[segment.stage] ?? '#c8c8ce',
    label: t(`dashboard.stageSummary.${segment.stage}`, { count: segment.count }),
  }))

  return (
    <article className="visual-card">
      <div className="visual-card-top">
        <DonutChart
          slices={slices}
          size={84}
          thickness={12}
          center={supplierTotal > 0 ? String(supplierTotal) : '0'}
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={statusToken} label={statusLabel} />
            <span className="ledger-request-id">{rfqDisplayNumber(rfq)}</span>
          </div>
          <Link to={`/rfqs/${rfq.id}`} className="visual-card-title">{rfq.name}</Link>
          <p className="visual-card-meta tnum">
            {fmt.number(rfq.quantity)} {unit}
            {rfq.internal_reference ? ` · ${rfq.internal_reference}` : ''}
          </p>
        </div>
      </div>

      {slices.length > 0 ? (
        <ul className="visual-legend">
          {slices.map(slice => (
            <li key={slice.key}>
              <span className="visual-swatch" style={{ background: slice.color }} />
              <span>{slice.label}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="visual-card-empty">{t('dashboard.table.noSuppliersYet')}</p>
      )}

      <div className="visual-card-actions">
        {needYou > 0 && (
          <Link to={`/rfqs/${rfq.id}`} className="ledger-attention-link">
            {t('dashboard.table.needYou', { count: needYou })}
          </Link>
        )}
        {rfq.quoted_count > 0 && (
          <Link to={`/rfqs/${rfq.id}/comparison`} className="ledger-compare-link">
            {t('dashboard.table.compare', { count: rfq.quoted_count })}
          </Link>
        )}
        <span className="visual-card-updated tnum">{fmt.date(rfq.updated_at)}</span>
      </div>
    </article>
  )
}
