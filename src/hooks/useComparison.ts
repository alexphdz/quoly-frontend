import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as compApi from '../api/comparisons'
import type { ComparisonResponse, DecisionCreate, DecisionRead } from '../types/comparison'

export function useComparison(rfqId: string, locale: string, enabled = true) {
  return useQuery<ComparisonResponse>({
    queryKey: ['comparison', rfqId, locale],
    queryFn: () => compApi.getComparison(rfqId, locale),
    enabled: !!rfqId && enabled,
  })
}

export function useDecision(rfqId: string) {
  return useQuery<DecisionRead | null>({
    queryKey: ['decision', rfqId],
    queryFn: () => compApi.getDecision(rfqId),
    enabled: !!rfqId,
    retry: false,
  })
}

export function useCreateDecision(rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: DecisionCreate) => compApi.createDecision(rfqId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['decision', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
    },
  })
}
