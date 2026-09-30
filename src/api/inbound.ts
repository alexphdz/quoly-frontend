import { get, post, patch } from './client'
import type { InboundMessageRead, UnreadCount } from '../types/inbound'

export function suggestReply(inboundId: string): Promise<{ suggested_reply: string }> {
  return post<{ suggested_reply: string }>(`/inbound/${inboundId}/suggest-reply`)
}

export function replyToInbound(inboundId: string, body: string): Promise<InboundMessageRead> {
  return post<InboundMessageRead>(`/inbound/${inboundId}/reply`, { body })
}

export function reclassifyInbound(inboundId: string, messageType: string): Promise<InboundMessageRead> {
  return patch<InboundMessageRead>(`/inbound/${inboundId}/reclassify`, { message_type: messageType })
}

export function assignSupplier(inboundId: string, supplierId: string): Promise<InboundMessageRead> {
  return post<InboundMessageRead>(`/inbound/${inboundId}/assign-supplier`, { supplier_id: supplierId })
}

export function markInboundRead(inboundId: string): Promise<InboundMessageRead> {
  return post<InboundMessageRead>(`/inbound/${inboundId}/read`)
}

export function getUnreadCount(): Promise<UnreadCount> {
  return get<UnreadCount>('/notifications/unread-count')
}
