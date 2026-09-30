import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as inboundApi from '../api/inbound'

export function useSuggestReply(inboundId: string) {
  return useMutation({
    mutationFn: () => inboundApi.suggestReply(inboundId),
  })
}

export function useReplyToInbound(inboundId: string, rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: string) => inboundApi.replyToInbound(inboundId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound', rfqId] })
    },
  })
}

export function useReclassifyInbound(inboundId: string, rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (messageType: string) => inboundApi.reclassifyInbound(inboundId, messageType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['quotes', rfqId] })
    },
  })
}

export function useAssignSupplier(inboundId: string, rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (supplierId: string) => inboundApi.assignSupplier(inboundId, supplierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['quotes', rfqId] })
    },
  })
}

export function useMarkInboundRead(rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (inboundId: string) => inboundApi.markInboundRead(inboundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inbound', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })
}
