import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as agentApi from '../api/agent'
import type { ConversationSummary, ConversationDetail } from '../types/agent'

export function useConversations() {
  return useQuery<ConversationSummary[]>({
    queryKey: ['agent-conversations'],
    queryFn: () => agentApi.listConversations(),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  })
}

export function useConversation(id: string | undefined) {
  return useQuery<ConversationDetail>({
    queryKey: ['agent-conversation', id],
    queryFn: () => agentApi.getConversation(id!),
    enabled: !!id,
    // Avoid an immediate background refetch right after the cache is seeded /
    // optimistically updated, which would wipe the just-sent user message.
    // Freshness comes from the updates poll and explicit invalidation on success.
    staleTime: 15_000,
  })
}

export function useInvalidateConversations() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['agent-conversations'] })
    queryClient.invalidateQueries({ queryKey: ['agent-conversation'] })
  }
}
