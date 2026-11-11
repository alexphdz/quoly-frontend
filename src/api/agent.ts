import { get, post, postFormData } from './client'
import type {
  ConversationDetail,
  ConversationSummary,
  TurnResponse,
  ConversationUpdates,
  ActionResponse,
  AttachmentResult,
  SupplierCandidatesResponse,
} from '../types/agent'

export function createConversation(rfqId?: string): Promise<ConversationDetail> {
  return post('/agent/conversations', rfqId ? { rfq_id: rfqId } : {})
}

export function listConversations(params?: { phase?: string; limit?: number; offset?: number }): Promise<ConversationSummary[]> {
  const qs = new URLSearchParams()
  if (params?.phase) qs.set('phase', params.phase)
  if (params?.limit != null) qs.set('limit', String(params.limit))
  if (params?.offset != null) qs.set('offset', String(params.offset))
  const query = qs.toString()
  return get(`/agent/conversations${query ? `?${query}` : ''}`)
}

export function getConversation(id: string): Promise<ConversationDetail> {
  return get(`/agent/conversations/${id}`)
}

export function sendTurn(conversationId: string, message: string, attachments: string[] = []): Promise<TurnResponse> {
  // El turno agéntico puede tardar (hasta 5 llamadas al LLM). 90 s de tope:
  // pasado eso el request aborta y la UI ofrece reintentar — nunca un
  // "Pensando…" eterno.
  return post(`/agent/conversations/${conversationId}/turns`, { message, attachments }, { signal: AbortSignal.timeout(90_000) })
}

export function getConversationUpdates(conversationId: string, since: string): Promise<ConversationUpdates> {
  return get(`/agent/conversations/${conversationId}/updates?since=${encodeURIComponent(since)}`)
}

export function uploadAttachment(conversationId: string, file: File): Promise<AttachmentResult> {
  const form = new FormData()
  form.append('file', file)
  return postFormData(`/agent/conversations/${conversationId}/attachments`, form)
}

export function getSupplierCandidates(conversationId: string): Promise<SupplierCandidatesResponse> {
  return get(`/agent/conversations/${conversationId}/supplier-candidates`)
}

export function resolveAction(
  conversationId: string,
  payload: {
    card_id: string
    card_version: string
    action: 'confirm' | 'edit' | 'dismiss' | 'discard' | 'submit' | 'undo' | 'approve'
    confirm_token?: string
    payload?: Record<string, unknown>
  },
): Promise<ActionResponse> {
  return post(`/agent/conversations/${conversationId}/actions`, payload, { signal: AbortSignal.timeout(45_000) })
}
