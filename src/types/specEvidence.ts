export type SpecVerdict =
  | 'match'
  | 'deviation'
  | 'missing_from_supplier'
  | 'not_comparable'
  | 'additional_supplier_parameter'
  | 'needs_review'

export type SpecVerdictReason =
  | 'exact_value'
  | 'equivalent_value'
  | 'polarity_conflict'
  | 'threshold_satisfied'
  | 'threshold_not_satisfied'
  | 'unit_mismatch'
  | 'value_mismatch'
  | 'unparsed_value'
  | 'missing_supplier_value'
  | 'missing_supplier_parameter'
  | 'additional_supplier_parameter'

export interface SpecComparisonOperand {
  raw: string
  value?: number | string | null
  normalized_value?: number | null
  unit?: string | null
  normalized_unit?: string | null
  operator?: 'eq' | 'gte' | 'gt' | 'lte' | 'lt' | null
  tolerance?: number | null
  polarity?: 'affirmative' | 'negative' | null
}

export interface SpecEvidenceLine {
  parameter_name: string
  reference_wording?: string | null
  supplier_wording?: string | null
  verdict?: SpecVerdict | null
  verdict_reason?: SpecVerdictReason | null
  reference_operand?: SpecComparisonOperand | null
  supplier_operand?: SpecComparisonOperand | null
  supplier_evidence?: Array<{
    segment_id: string
    exact_text: string
    source_kind?: string | null
    original_filename?: string | null
    segment_type?: string | null
    locator?: Record<string, unknown>
  }>
  evidence_verification?: 'verified' | 'unverified' | 'unavailable'
  source_url?: string | null
}

export interface SpecEvidenceResponse {
  quote_id: string
  rfq_id: string
  supplier_name: string
  buyer_has_reference: boolean
  spec_state: string
  spec_document_name?: string | null
  spec_source_url?: string | null
  lines: SpecEvidenceLine[]
}
