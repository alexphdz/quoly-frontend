export interface CommercialOfferShape {
  price_tiers?: Array<{
    quantity?: number | null
    unit?: string | null
    price?: number | null
    currency?: string | null
    source_wording?: string | null
  }>
  lead_time?: {
    production_days?: number | null
    transit_days?: number | null
    total_days?: number | null
    source_wording?: string | null
  } | null
  quote_validity?: string | null
  moq_source_wording?: string | null
  cost_lines?: Array<{
    kind: 'product' | 'plates' | 'tooling' | 'freight' | 'other'
    name: string
    amount?: number | null
    currency?: string | null
    basis?: 'per_unit' | 'lot'
    unit?: string | null
    included?: boolean
    source_wording?: string | null
  }>
  /** Supplier's own words behind each extracted field. */
  field_sources?: Record<string, string>
}

export interface QuoteRead {
  id: string
  rfq_id: string
  supplier_id: string
  supplier_name?: string | null
  status: string
  file_url: string | null
  file_type: string | null
  raw_text: string | null
  raw_price: number | null
  raw_currency: string | null
  raw_unit: string | null
  raw_quantity_moq: number | null
  raw_quantity_per_unit: number | null
  raw_delivery_lead_time_days: number | null
  raw_delivery_point: string | null
  raw_payment_terms: string | null
  raw_notes: string | null
  faithful_summary: string | null
  normalized_price: number | null
  normalized_currency: string | null
  normalized_unit: string | null
  missing_fields: string[]
  line_items?: QuoteLineItem[] | import('./quoteIntake').QuoteLineItemsV2 | null
  extraction_pass?: {
    summary?: string | null
    buyer_actions?: Array<{ question: string; context?: string | null }>
    spec_parameters?: Array<{ name: string; value: string; source?: string | null }>
    message_labels?: string[]
  } | null
  commercial_offer?: CommercialOfferShape | null
  created_at: string
  updated_at: string
}

export interface QuoteUpdate {
  raw_price?: number | null
  raw_currency?: string | null
  raw_unit?: string | null
  raw_quantity_moq?: number | null
  raw_quantity_per_unit?: number | null
  raw_delivery_lead_time_days?: number | null
  raw_delivery_point?: string | null
  raw_payment_terms?: string | null
  raw_notes?: string | null
  line_items?: QuoteLineItem[] | import('./quoteIntake').QuoteLineItemsV2 | null
}

export interface QuoteLineItem {
  line_item_id: string
  line_item_name: string
  rfq_quantity?: number | null
  rfq_unit?: string | null
  raw_price?: number | null
  raw_currency?: string | null
  raw_unit?: string | null
  raw_quantity_moq?: number | null
  raw_delivery_lead_time_days?: number | null
  raw_payment_terms?: string | null
  normalized_price?: number | null
  normalized_currency?: string | null
  normalized_unit?: string | null
  missing_fields?: string[]
}

export interface QuoteListItem {
  id: string
  rfq_id: string
  supplier_id: string
  supplier_name: string
  status: string
  normalized_price: number | null
  missing_fields_count: number
  line_items_count?: number
  created_at: string
}

export interface QuoteOverviewItem {
  id: string
  rfq_id: string
  rfq_name: string
  rfq_number?: string | null
  supplier_id: string
  supplier_name: string
  status: string
  source: 'email' | 'file' | 'manual'
  normalized_price: number | null
  normalized_currency: string | null
  normalized_unit: string | null
  raw_price: number | null
  raw_currency: string | null
  raw_unit: string | null
  raw_quantity_moq: number | null
  raw_delivery_lead_time_days: number | null
  missing_fields_count: number
  created_at: string
}
