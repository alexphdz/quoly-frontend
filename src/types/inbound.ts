export interface InboundAttachmentRead {
  id: string
  filename: string
  content_type: string | null
  size_bytes: number
  extraction_status: 'pending' | 'extracted' | 'unsupported' | 'failed' | string
  extraction_method: string | null
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
    spec_parameters?: Array<{ name: string; value: string; source?: string | null }>
    buyer_actions?: Array<{ question: string; context?: string | null }>
    summary?: string | null
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
