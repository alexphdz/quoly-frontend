/** Corrugated quote intake — stored in `quotes.line_items` when `version === 1`. */

export type PriceBasis = 'per_piece' | 'per_thousand'

export interface QuoteTierLine {
  volume_tier_id: string
  unit_price?: number | null
  currency?: string | null
  price_basis?: PriceBasis | null
  moq?: number | null
}

export interface MoneyAmount {
  amount: number
  currency: string
}

export interface FreightBreakdown {
  included: boolean
  amount?: number | null
  currency?: string | null
}

export interface OtherOneTimeCost {
  amount: number
  currency: string
  label?: string | null
}

export interface QuoteCostBreakdown {
  tooling_die?: MoneyAmount | null
  freight?: FreightBreakdown | null
  other_one_time?: OtherOneTimeCost | null
  lead_time_days?: number | null
  incoterm_quoted?: string | null
  payment_terms?: string | null
  quote_validity?: string | null
  board_spec_quoted?: string | null
  no_substitution_ack?: boolean | null
  price_basis?: PriceBasis | null
  sample_cost_time?: string | null
  certifications?: string | null
  test_report?: string | null
  capacity_per_month?: string | null
  master_carton?: string | null
}

export interface QuoteLineItemsV2 {
  version: 1
  tiers: QuoteTierLine[]
  cost_breakdown?: QuoteCostBreakdown | null
}

export function isQuoteLineItemsV2(
  value: unknown,
): value is QuoteLineItemsV2 {
  return (
    typeof value === 'object'
    && value !== null
    && 'version' in value
    && (value as QuoteLineItemsV2).version === 1
    && Array.isArray((value as QuoteLineItemsV2).tiers)
  )
}
