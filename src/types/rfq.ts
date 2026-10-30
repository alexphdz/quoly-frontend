import type { PackagingSpecification } from './packaging'
import type { TechnicalSpecification } from './packaging'
import type {
  CorrugatedProductSpec,
  RFQAttachmentV2,
  RFQHeaderDataV2,
  VolumeTier,
} from './corrugated'

export type { VolumeTier }

export interface RFQHeaderData {
  rfq_number?: string
  buyer_company?: string
  buyer_contact_name?: string
  buyer_contact_email?: string
  owner?: string
  source_document?: string
  requested_delivery_date?: string
  payment_terms?: string
  /** Legacy key; corrugated wizard uses quote_validity_days_requested. */
  quote_validity_days?: number | null
  quote_validity_days_requested?: number | null
  payment_terms_requested?: string
  terms_and_conditions?: string
  supplier_notes?: string
}

export interface IncotermsTerms {
  rule?: string
  named_place?: string
  place_role?: string
  transport_mode?: string
  origin_location?: string
  destination_location?: string
}

export interface CommercialRFQWrite {
  request_kind: 'commercial'
  name: string
  quantity: number
  base_unit: string
  status: 'draft' | 'open'
  internal_reference?: string | null
  share_internal_reference?: boolean
  incoterms?: { rule: string; named_place: string } | null
  technical_requirements?: string | null
  requested_delivery_date?: string | null
  response_deadline?: string | null
  base_currency?: string
  email_locale?: 'en' | 'es' | null
}

export interface RFQAttachment {
  id?: string
  file_name: string
  kind: string
  scope?: 'rfq' | 'line'
  line_item_id?: string
  file_url?: string
  content_type?: string
  size_bytes?: number
  uploaded_at?: string
}

export interface SupplierResponseChecklist {
  required_fields: string[]
  optional_fields: string[]
  preferred_response_format?: string
}

export interface RFQLineItem {
  id: string
  product_name: string
  sku?: string
  description?: string
  quantity: number
  unit: string
  target_unit_price?: number | null
  requested_delivery_date?: string
  template?: string
  notes?: string
  technical_specification?: TechnicalSpecification
  attachments?: RFQAttachment[]
  required_response_fields?: string[]
  optional_response_fields?: string[]
}

export interface RFQCreate {
  name: string
  description: string
  quantity: number
  base_unit: string
  base_currency: string
  delivery_point: string
  response_deadline: string // "YYYY-MM-DD"
  specification?: PackagingSpecification | null
  header_data?: RFQHeaderData | null
  line_items?: RFQLineItem[]
  incoterms?: IncotermsTerms | null
  attachments?: RFQAttachment[]
  response_checklist?: SupplierResponseChecklist | null
  email_locale?: 'en' | 'es' | null
}

export interface RFQRead {
  id: string
  name: string
  description: string
  quantity: number
  base_unit: string
  base_currency: string
  delivery_point: string
  response_deadline: string | null
  request_kind?: 'commercial' | 'packaging'
  internal_reference?: string | null
  share_internal_reference?: boolean
  technical_requirements?: string | null
  requested_delivery_date?: string | null
  specification: PackagingSpecification | null
  header_data?: (RFQHeaderData | RFQHeaderDataV2) | null
  line_items?: RFQLineItem[]
  incoterms?: IncotermsTerms | null
  attachments?: Array<RFQAttachment | RFQAttachmentV2>
  response_checklist?: SupplierResponseChecklist | null
  email_locale: 'en' | 'es'
  email_address: string
  status: string
  packaging_type?: string | null
  volume_tiers?: VolumeTier[] | null
  corrugated_spec?: CorrugatedProductSpec | null
  supplier_count: number
  response_count: number
  quoted_count: number
  confirmed_count: number
  supplier_stage_counts?: Record<string, number>
  created_at: string
  updated_at: string
}

export interface RFQDetail extends RFQRead {
  suppliers: SupplierRead[]
}

export interface SupplierCreate {
  /** Company name — the primary supplier identity (required). */
  company_name: string
  email: string
  /** Optional contact person; never replaces the company name. */
  contact_name?: string | null
}

export interface SupplierRead {
  id: string
  rfq_id: string
  supplier_company_id?: string | null
  /** Company name — the identity shown everywhere. */
  name: string
  /** Optional contact person for this request. */
  contact_name?: string | null
  email: string
  status: string
  requested_at: string | null
  gmail_message_id?: string | null
  gmail_thread_id?: string | null
  created_at: string
}

export interface EmailPayload {
  to: string
  subject: string
  body: string
  reply_to: string
}

export interface GmailSendResult {
  to: string
  supplier_name: string
  gmail_message_id: string
}

export interface OutlookSendResult {
  to: string
  supplier_name: string
  outlook_message_id: string
}

export type SendRequestsResponse = EmailPayload[] | GmailSendResult[] | OutlookSendResult[]
