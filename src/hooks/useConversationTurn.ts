import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as agentApi from '../api/agent'
import type { TurnResponse, ConversationDetail, AgentMessage } from '../types/agent'

interface TurnVars { message: string; attachments?: string[] }
interface TurnContext { previous?: ConversationDetail }

export function useConversationTurn(conversationId: string) {
  const queryClient = useQueryClient()
  const key = ['agent-conversation', conversationId] as const

  return useMutation<TurnResponse, Error, TurnVars, TurnContext>({
    mutationKey: ['agent-turn', conversationId],
    mutationFn: ({ message, attachments = [] }) =>
      agentApi.sendTurn(conversationId, message, attachments),
    // Show the user's message immediately so the chat feels instant (no waiting
    // on the round-trip, no "loading conversation" flash on a new conversation).
    onMutate: async ({ message }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<ConversationDetail>(key)
      const optimistic: AgentMessage = {
        id: `optimistic-${Date.now()}`,
        conversation_id: conversationId,
        role: 'user',
        content: message,
        attachments: null,
        card: null,
        card_state: null,
        card_result: null,
        created_at: new Date().toISOString(),
      }
      queryClient.setQueryData<ConversationDetail>(key, old => {
        const base: ConversationDetail = old ?? {
          id: conversationId, phase: 'armando', rfq_id: null, draft_data: null,
          messages: [], turns_count: 0, turns_remaining: 40,
        }
        return { ...base, messages: [...base.messages, optimistic] }
      })
      return { previous }
    },
    // On error keep the user's message visible ("tu mensaje sigue aquí"); the
    // retry UI handles resending. Refetch on success to swap in the real data.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key })
      queryClient.invalidateQueries({ queryKey: ['agent-conversations'] })
    },
  })
}

export function useResolveAction(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['agent-action', conversationId],
    mutationFn: (payload: Parameters<typeof agentApi.resolveAction>[1]) =>
      agentApi.resolveAction(conversationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-conversation', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['agent-conversations'] })
      queryClient.invalidateQueries({ queryKey: ['rfqs'] })
    },
  })
}
