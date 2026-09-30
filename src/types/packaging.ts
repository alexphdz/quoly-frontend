export interface Measurement {
  value: number
  unit: string
}

export interface PackagingSpecification {
  version: 1
  rfq_number?: string
  buyer_company?: string
  buyer_contact_name?: string
  buyer_contact_email?: string
  issue_date?: string
  packaging_category?: string
  material_family?: string
  material_detail?: string
  recycled_content_percent?: number | null
  food_contact_required?: boolean | null
  dimensions?: Record<string, Measurement>
  color?: string
  finish?: string
  printing?: string
  artwork_required?: boolean
  tolerance_notes?: string
  target_moq?: number | null
  quote_validity_days?: number | null
  incoterm?: string
  incoterm_place?: string
  target_delivery_date?: string
  max_lead_time_days?: number | null
  requested_payment_terms?: string
  required_response_fields?: string[]
  optional_response_fields?: string[]
  preferred_response_format?: string
  evaluation_criteria?: {
    price?: number
    lead_time?: number
    quality?: number
    logistics?: number
  }
}

export interface TechnicalSpecification extends PackagingSpecification {
  template?: string
  certifications?: string[]
  compliance_requirements?: string[]
  storage_handling?: string
  shelf_life?: string
  sds_required?: boolean
}
