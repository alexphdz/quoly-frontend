import { useQuery } from '@tanstack/react-query'
import * as agentApi from '../api/agent'
import type { SupplierCandidatesResponse } from '../types/agent'

export function useSupplierCandidates(conversationId: string | undefined, enabled = false) {
  return useQuery<SupplierCandidatesResponse>({
    queryKey: ['agent-supplier-candidates', conversationId],
    queryFn: () => agentApi.getSupplierCandidates(conversationId!),
    enabled: !!conversationId && enabled,
    staleTime: 60_000,
  })
}
