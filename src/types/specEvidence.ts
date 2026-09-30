export type SpecVerdict =
  | 'match'
  | 'deviation'
  | 'missing_from_supplier'
  | 'not_comparable'
  | 'additional_supplier_parameter'
  | 'needs_review'

export interface SpecEvidenceLine {
  parameter_name: string
  reference_wording?: string | null
  supplier_wording?: string | null
  verdict?: SpecVerdict | null
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
