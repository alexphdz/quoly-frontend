import type { CommercialOfferShape } from './quote'
import type { SpecEvidenceLine } from './specEvidence'

export interface ComparisonRow {
  quote_id: string
  supplier_id: string
  supplier_name: string
  normalized_price: number | null
  raw_price: number | null
  raw_currency: string | null
  raw_unit: string | null
  raw_quantity_moq: number | null
  raw_delivery_lead_time_days: number | null
  raw_delivery_point: string | null
  raw_payment_terms: string | null
  missing_fields: string[]
  line_items?: Record<string, unknown>[] | null
  buyer_has_reference?: boolean
  spec_state?: 'not_received' | 'received' | 'pending_analysis' | string
  spec_document_name?: string | null
  spec_source_url?: string | null
  spec_summary_line?: string | null
  extracted_parameters?: Array<{ name: string; value: string }>
  spec_evidence_lines?: SpecEvidenceLine[]
  commercial_offer?: CommercialOfferShape | null
  source?: 'email' | 'file' | 'manual'
  file_type?: string | null
  raw_quantity_per_unit?: number | null
  received_at?: string | null
  /** Unit price plus separately charged lines spread over the requested quantity. */
  all_in_price?: number | null
  cost_breakdown?: CostBreakdownLine[]
}

export type CostKind = 'product' | 'plates' | 'tooling' | 'freight' | 'other'

export interface CostBreakdownLine {
  kind: CostKind
  name: string
  raw_amount: number | null
  raw_currency: string | null
  basis: 'per_unit' | 'lot'
  included: boolean
  normalized_per_unit: number | null
  normalized_total: number | null
  source_wording: string | null
}

export interface LineComparisonRow {
  quote_id: string
  supplier_id: string
  supplier_name: string
  line_item_id: string
  line_item_name: string
  normalized_price: number | null
  raw_price: number | null
  raw_currency: string | null
  raw_unit: string | null
  raw_quantity_moq: number | null
  raw_delivery_lead_time_days: number | null
  raw_payment_terms: string | null
  missing_fields: string[]
}

export interface Alert {
  type: string
  message: string
  quote_id: string | null
}

export interface ComparisonResponse {
  rfq_id: string
  rfq_name: string
  base_currency: string
  base_unit: string
  rows: ComparisonRow[]
  line_item_rows: LineComparisonRow[]
  line_item_ranking: Record<string, string[]>
  ranking: string[]
  alerts: Alert[]
  summary: string
  fx_as_of: string | null
  fx_source: string | null
  fx_note: string | null
  /** Base-currency value of one unit of each quoted currency. */
  fx_rates?: Record<string, number>
  requested_quantity?: number | null
  ranking_basis?: 'all_in' | 'unit_price'
}

export interface DecisionCreate {
  quote_id: string
  reasoning?: string | null
}

export interface DecisionRead {
  id: string
  rfq_id: string
  quote_id: string
  supplier_id: string
  reasoning: string | null
  comparison_snapshot: Record<string, unknown> | null
  decided_at: string
}
