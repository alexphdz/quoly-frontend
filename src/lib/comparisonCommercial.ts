import type { CommercialOfferShape } from '../types/quote'

/** Days used for fastest-lead ranking — total only when supplier stated it. */
export function leadTimeRankDays(
  offer: CommercialOfferShape | null | undefined,
  rawDays: number | null | undefined,
): number | null {
  const total = offer?.lead_time?.total_days
  if (total != null) return total
  if (rawDays != null) return rawDays
  return null
}

export function formatLeadTimeParts(
  offer: CommercialOfferShape | null | undefined,
  rawDays: number | null | undefined,
  t: (key: string, opts?: Record<string, unknown>) => string,
): { primary: string; wording?: string | null } {
  const lead = offer?.lead_time
  if (lead) {
    const parts: string[] = []
    if (lead.production_days != null) {
      parts.push(t('table.leadProduction', { count: lead.production_days }))
    }
    if (lead.transit_days != null) {
      parts.push(t('table.leadTransit', { count: lead.transit_days }))
    }
    if (lead.total_days != null) {
      parts.push(t('table.leadTotal', { count: lead.total_days }))
    }
    if (parts.length > 0) {
      return { primary: parts.join(' · '), wording: lead.source_wording ?? null }
    }
  }
  if (rawDays != null) {
    return { primary: t('table.leadTimeDays', { count: rawDays }) }
  }
  return { primary: '—' }
}

export function formatPriceTierSummary(
  offer: CommercialOfferShape | null | undefined,
  fmt: { number: (n: number) => string; unitNumber: (n: number) => string },
  unitLabel?: (raw: string) => string,
): string[] {
  const tiers = offer?.price_tiers ?? []
  return tiers.map((tier) => {
    const qty = tier.quantity != null ? fmt.number(tier.quantity) : '—'
    const unit = tier.unit ? (unitLabel?.(tier.unit) ?? tier.unit) : ''
    const price = tier.price != null ? fmt.unitNumber(tier.price) : '—'
    const cur = tier.currency ?? ''
    return `${qty} ${unit} @ ${price} ${cur}`.trim()
  })
}
