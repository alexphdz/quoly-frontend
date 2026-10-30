export interface InboundAttachmentRead {
  id: string
  filename: string
  content_type: string | null
  size_bytes: number
  extraction_status: 'pending' | 'extracted' | 'unsupported' | 'failed' | string
  extraction_method: string | null
  file_url: string | null
  error_detail: string | null
  created_at: string
}

export interface InboundMessageRead {
  id: string
  rfq_id: string | null
  supplier_id: string | null
  quote_id: string | null
  gmail_message_id: string
  from_email: string
  subject: string
  body_text: string
  has_attachments: boolean
  message_type: 'quote' | 'conversation' | string
  status: 'processed' | 'unmatched' | 'error' | string
  error_detail: string | null
  received_at: string
  read_at: string | null
  processed_at: string | null
  delivered_at: string | null
  reply_text: string | null
  replied_at: string | null
  attachments: InboundAttachmentRead[]
  extraction_pass?: {
    message_labels?: string[]
    spec_parameters?: Array<{ name: string; value: string; source?: string | null; evidence?: Array<{ segment_id: string; exact_text?: string | null }> }>
    facts?: Array<{ field_name: string; raw_value?: unknown; unit?: string | null; review_state?: string; evidence?: Array<{ segment_id: string; exact_text?: string | null }> }>
    source_artifact_ids?: string[]
    source_map?: Array<{
      artifact_id: string
      segment_id: string
      source_kind: string
      original_filename?: string | null
      segment_type: string
      locator?: Record<string, unknown>
      parsing_method?: string | null
      read_status: string
      speaker: string
    }>
    buyer_actions?: Array<{ question: string; context?: string | null }>
    summary?: string | null
    processing?: {
      schema_version?: number
      status: 'pending' | 'complete' | 'partial' | 'failed' | 'unknown'
      failure_reason?: string | null
      readable_inputs?: string[]
      unreadable_inputs?: string[]
      detail?: string | null
    }
  } | null
}

export interface UnreadCount {
  total: number
  by_rfq: Record<string, number>
}

export interface InboundStreamEvent {
  rfq_id: string | null
  inbound_id: string
  message_type: string
  status: string
  subject: string
  from_email: string
  received_at: string | null
}
