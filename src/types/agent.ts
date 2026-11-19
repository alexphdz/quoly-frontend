export type ConversationPhase =
  | 'armando'
  | 'por_enviar'
  | 'en_espera'
  | 'por_decidir'
  | 'decidida'
  | 'archivada'

export type CardState = 'pending' | 'resolved' | 'outdated' | 'dismissed'

export interface AgentCard {
  // 'undo' is legacy (the undo window was removed): old conversations may still
  // hold one, and it renders as a static "sent" line.
  type: 'rfq_summary' | 'supplier_picker' | 'quick_options' | 'mailbox_required' | 'undo' | 'approval'
  payload: Record<string, unknown>
  version: string
  state: CardState
  card_result?: unknown
}

export interface AgentMessage {
  id: string
  conversation_id: string
  role: 'user' | 'agent' | 'system_event'
  content: string | null
  attachments: unknown[] | null
  card: AgentCard | null
  card_state: CardState | null
  card_result: unknown | null
  created_at: string
}

export interface ConversationSummary {
  id: string
  phase: ConversationPhase
  rfq_id: string | null
  rfq_name: string | null
  last_activity_at: string
  turns_count: number
  supplier_count?: number
  responded_count?: number
  sent?: boolean
  pending_action: 'question_pending' | 'summary_ready' | 'approval_needed' | null
}

export interface ConversationDetail {
  id: string
  phase: ConversationPhase
  rfq_id: string | null
  draft_data: Record<string, unknown> | null
  messages: AgentMessage[]
  turns_count: number
  turns_remaining: number
}

export interface TurnResponse {
  conversation_id: string
  messages: AgentMessage[]
  rfq_patch: Record<string, unknown> | null
  phase: ConversationPhase
  turns_remaining: number
  warning?: string
}

export interface ConversationUpdates {
  messages: AgentMessage[]
  phase: ConversationPhase
}

export interface ActionResponse {
  rfq_id?: string
  // 'eligiendo_buzon': the supplier picker was accepted but the request is not
  // queued yet — the backend answers with the `send_channel` quick_options card.
  phase: ConversationPhase | 'eligiendo_buzon'
  card?: AgentCard
  message?: string
  status?: string
  // Final send (phase 'en_espera'): how many suppliers it went to and from which address.
  sent_to?: number
  sent_from?: string
}

export interface RfqSummaryCard {
  fields: Record<string, unknown>
  assumed_fields: string[]
  confirm_token: string
}

export interface SupplierCandidateFactors {
  fit_score: number
  history_score: number
  response_rate: number
  proximity_score: number
  recency_score: number
}

export interface SupplierCandidate {
  supplier_id: string
  company_name: string
  score: number
  preselected: boolean
  reason: string
  factors: SupplierCandidateFactors
}

export interface SupplierCandidatesResponse {
  candidates: SupplierCandidate[]
  has_preselection: boolean
}

export interface AttachmentResult {
  attachment_id: string
  filename: string
  type: 'pdf' | 'docx' | 'image'
  text_extracted: boolean
  page_count: number | null
}

export type AttachmentUploadState = 'idle' | 'uploading' | 'done' | 'error'

export interface PendingAttachment {
  id: string              // local temporary id before upload
  attachment_id?: string  // set after upload succeeds
  filename: string
  fileType: 'pdf' | 'docx' | 'image'
  state: AttachmentUploadState
  objectUrl?: string      // for image thumbnails
}

export interface QuickOption {
  value: string
  label: string
  default?: boolean
}

export interface QuickOptionsCardPayload {
  // 'send_channel' = which connected mailbox the request goes out from.
  field?: string
  label?: string
  options: QuickOption[]
  // Only on the 'send_channel' card: how many suppliers the send goes to.
  supplier_count?: number
}

export interface SupplierPickerCardPayload {
  candidates: SupplierCandidate[]
  confirm_token: string
}

/** Posted instead of the supplier picker when the request is ready but there is no usable mailbox. */
export interface MailboxRequiredCardPayload {
  rfq_id: string
  /** none = no mailbox connected; address_unknown = connected but its address isn't stored. */
  reason: 'none' | 'address_unknown'
}

/** Legacy: undo cards from before the undo window was removed. */
export interface UndoCardPayload {
  sent_to: number
  expires_at?: string
  idempotency_key?: string
}

export interface GroundingEntry {
  sentence: string
  source_field: string
  source_value?: string
}

export interface ApprovalCardPayload {
  supplier_name: string
  question: string
  draft_body: string
  grounding: GroundingEntry[]
  reply_draft_id: string
  confirm_token: string
  question_type?: 'rfq_data_answerable' | 'buyer_info_needed' | 'sensitive_commitment'
}
