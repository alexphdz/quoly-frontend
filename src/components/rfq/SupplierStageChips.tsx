import { useTranslation } from 'react-i18next'
import { useEnumLabels } from '../../i18n/labels'
import { Badge } from '../ui'

const STAGE_ORDER = [
  'buyer_action_required',
  'partial_response',
  'quote_received',
  'awaiting_response',
  'not_contacted',
  'declined',
  'closed',
  'pending',
  'requested',
  'quoted',
] as const

export default function SupplierStageChips({
  counts,
  compact,
}: {
  counts: Record<string, number> | undefined
  compact?: boolean
}) {
  const { t } = useTranslation('rfq')
  const labels = useEnumLabels()
  if (!counts || Object.keys(counts).length === 0) return null

  const entries = STAGE_ORDER.filter((stage) => (counts[stage] ?? 0) > 0).map((stage) => ({
    stage,
    count: counts[stage] ?? 0,
  }))
  const extras = Object.entries(counts).filter(
    ([stage, count]) => count > 0 && !STAGE_ORDER.includes(stage as (typeof STAGE_ORDER)[number]),
  )

  const toneFor = (stage: string) => {
    if (stage === 'buyer_action_required') return 'warning' as const
    if (stage === 'quote_received' || stage === 'quoted') return 'success' as const
    if (stage === 'declined' || stage === 'closed') return 'neutral' as const
    return 'brand' as const
  }

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? '' : 'mt-2'}`}>
      {[...entries, ...extras.map(([stage, count]) => ({ stage, count }))].map(({ stage, count }) => (
        <Badge key={stage} tone={toneFor(stage)}>
          {labels.supplierStatus(stage)} · {t('stageChips.count', { count })}
        </Badge>
      ))}
    </div>
  )
}
