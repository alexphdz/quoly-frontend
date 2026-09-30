export interface BuyerActionRead {
  id: string
  rfq_id: string
  supplier_id: string
  supplier_name?: string | null
  inbound_message_id?: string | null
  quote_id?: string | null
  question: string
  context?: string | null
  status: 'open' | 'resolved' | string
  resolved_at?: string | null
  created_at: string
}
