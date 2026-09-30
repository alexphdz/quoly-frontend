import { useTranslation } from 'react-i18next'
import { stageSpreadSegments } from '../../lib/rfqDisplay'

const STAGE_CLASS: Record<string, string> = {
  buyer_action_required: 'ds-stage-warn',
  partial_response: 'ds-stage-partial',
  quote_received: 'ds-stage-quoted',
  awaiting_response: 'ds-stage-await',
  not_contacted: 'ds-stage-muted',
  declined: 'ds-stage-closed',
  closed: 'ds-stage-closed',
}

export default function SupplierStageSpread({
  counts,
  compact = false,
}: {
  counts: Record<string, number> | undefined
  compact?: boolean
}) {
  const { t } = useTranslation('rfq')
  const segments = stageSpreadSegments(counts)

  if (segments.length === 0) {
    if (compact) return null
    return <span className="ds-muted">{t('dashboard.table.noSuppliersYet')}</span>
  }

  const summaryParts = segments.map(({ stage, count }) =>
    t(`dashboard.stageSummary.${stage}`, { count }),
  )
  const summary = summaryParts.join(' · ')

  return (
    <div className={compact ? 'ds-stage is-compact' : 'ds-stage'}>
      <div className="ds-stage-bar" role="img" aria-label={summary}>
        {segments.map(({ stage, pct }) => (
          <span
            key={stage}
            className={STAGE_CLASS[stage] ?? 'ds-stage-muted'}
            style={{ width: `${pct}%` }}
          />
        ))}
      </div>
      {!compact && <p className="ds-stage-caption">{summary}</p>}
    </div>
  )
}
