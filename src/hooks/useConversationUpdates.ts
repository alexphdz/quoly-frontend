import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as agentApi from '../api/agent'
import type { AgentMessage, ConversationPhase } from '../types/agent'

export function useConversationUpdates(
  conversationId: string | undefined,
  isMutating: boolean,
) {
  const queryClient = useQueryClient()
  // Track the timestamp of the latest message we've seen
  const [since, setSince] = useState(() => new Date(0).toISOString())
  // After an async action (send to suppliers), temporarily increase poll rate
  const [fastPollUntil, setFastPollUntil] = useState<number | null>(null)
  const intervalRef = useRef<number | null>(null)

  const isFastPoll = fastPollUntil != null && Date.now() < fastPollUntil
  const refetchInterval = isFastPoll ? 3_000 : 25_000

  const query = useQuery({
    queryKey: ['agent-conversation-updates', conversationId, since],
    queryFn: () => agentApi.getConversationUpdates(conversationId!, since),
    enabled: !!conversationId && !isMutating,
    refetchInterval,
    refetchIntervalInBackground: false,
    staleTime: 0,
  })

  useEffect(() => {
    if (!query.data) return
    const messages: AgentMessage[] = query.data.messages
    if (messages.length === 0) return

    const latest = messages.reduce(
      (max, m) => (m.created_at > max ? m.created_at : max),
      since,
    )
    if (latest !== since) {
      setSince(latest)
      queryClient.invalidateQueries({ queryKey: ['agent-conversation', conversationId] })
    }
  }, [query.data, conversationId, queryClient, since])

  // Clean up fast poll timer
  useEffect(() => {
    if (fastPollUntil == null) return
    const remaining = fastPollUntil - Date.now()
    if (remaining <= 0) {
      setFastPollUntil(null)
      return
    }
    const id = window.setTimeout(() => setFastPollUntil(null), remaining)
    intervalRef.current = id
    return () => window.clearTimeout(id)
  }, [fastPollUntil])

  function triggerFastPoll() {
    setFastPollUntil(Date.now() + 60_000)
  }

  return { phase: query.data?.phase as ConversationPhase | undefined, triggerFastPoll }
}
