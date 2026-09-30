import type { RFQRead } from '../types/rfq'

export function rfqDisplayNumber(rfq: RFQRead): string {
  const fromHeader = rfq.header_data?.rfq_number?.trim()
  if (fromHeader) return fromHeader
  return `RFQ-${rfq.id.slice(0, 8).toUpperCase()}`
}

export type RfqListBucket = 'draft' | 'open' | 'closed'

export function rfqListBucket(rfq: RFQRead): RfqListBucket {
  if (rfq.status === 'draft') return 'draft'
  if (rfq.status === 'decided') return 'closed'
  return 'open'
}

/** 0 draft, 1 sent, 2 quotes in, 3 decided. */
export function journeyIndex(rfq: RFQRead): number {
  if (rfq.status === 'decided') return 3
  if (rfq.quoted_count > 0) return 2
  if (rfq.status !== 'draft' && rfq.supplier_count > 0) return 1
  return 0
}

export function deadlineDays(iso: string | null | undefined, now = new Date()): number | null {
  if (!iso) return null
  const due = new Date(iso)
  if (Number.isNaN(due.getTime())) return null
  const start = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const end = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate())
  return Math.round((end - start) / 86_400_000)
}

const SPREAD_STAGES = [
  'buyer_action_required',
  'partial_response',
  'quote_received',
  'awaiting_response',
  'not_contacted',
  'declined',
  'closed',
] as const

export function stageSpreadSegments(counts: Record<string, number> | undefined) {
  if (!counts) return []
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  if (total === 0) return []
  return SPREAD_STAGES.filter(stage => (counts[stage] ?? 0) > 0).map(stage => ({
    stage,
    count: counts[stage] ?? 0,
    pct: ((counts[stage] ?? 0) / total) * 100,
  }))
}

export function computeListMetrics(rfqs: RFQRead[], quotationsToReview: number) {
  let draftCount = 0
  let openCount = 0
  let closedCount = 0
  let suppliersNeedYou = 0
  let requestsWithNeeds = 0
  let suppliersAwaiting = 0

  for (const rfq of rfqs) {
    const bucket = rfqListBucket(rfq)
    if (bucket === 'draft') draftCount += 1
    else if (bucket === 'closed') closedCount += 1
    else openCount += 1

    if (bucket !== 'open') continue
    const need = rfq.supplier_stage_counts?.buyer_action_required ?? 0
    if (need > 0) {
      suppliersNeedYou += need
      requestsWithNeeds += 1
    }
    suppliersAwaiting += rfq.supplier_stage_counts?.awaiting_response ?? 0
  }

  return {
    draftCount,
    openCount,
    closedCount,
    total: rfqs.length,
    suppliersNeedYou,
    requestsWithNeeds,
    suppliersAwaiting,
    quotationsToReview,
  }
}

export function aggregateStageCounts(rfqs: RFQRead[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const rfq of rfqs) {
    for (const [stage, count] of Object.entries(rfq.supplier_stage_counts ?? {})) {
      if (count > 0) counts[stage] = (counts[stage] ?? 0) + count
    }
  }
  return counts
}

export function rfqSearchHaystack(rfq: RFQRead): string {
  return [
    rfq.name,
    rfq.description,
    rfq.internal_reference,
    rfq.header_data?.rfq_number,
    rfq.id,
    rfqDisplayNumber(rfq),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}
