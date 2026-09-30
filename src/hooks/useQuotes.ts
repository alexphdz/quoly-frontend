import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as quotesApi from '../api/quotes'
import type {
  QuoteRead,
  QuoteListItem,
  QuoteOverviewItem,
  QuoteUpdate,
} from '../types/quote'

export function useAllQuotes() {
  return useQuery<QuoteOverviewItem[]>({
    queryKey: ['quotes', 'all'],
    queryFn: () => quotesApi.listAllQuotes(),
    refetchInterval: 60_000,
  })
}

export function useQuotes(rfqId: string) {
  return useQuery<QuoteListItem[]>({
    queryKey: ['quotes', rfqId],
    queryFn: () => quotesApi.listQuotes(rfqId),
    enabled: !!rfqId,
    refetchInterval: 60_000,
  })
}

export function useQuote(id: string) {
  return useQuery<QuoteRead>({
    queryKey: ['quote', id],
    queryFn: () => quotesApi.getQuote(id),
    enabled: !!id,
  })
}

export function useCreateQuote(rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ supplierId, file, rawText }: { supplierId: string; file?: File | null; rawText?: string | null }) =>
      quotesApi.createQuote(rfqId, supplierId, file, rawText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
    },
  })
}

export function useUpdateQuote(quoteId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: QuoteUpdate) => quotesApi.updateQuote(quoteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] })
    },
  })
}

export function useDeleteQuote(quoteId: string, rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => quotesApi.deleteQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
    },
  })
}

export function useConfirmQuote(quoteId: string, rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => quotesApi.confirmQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] })
      queryClient.invalidateQueries({ queryKey: ['quotes', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['quotes', 'all'] })
      queryClient.invalidateQueries({ queryKey: ['comparison', rfqId], exact: false })
      queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
    },
  })
}

export function useRejectQuote(quoteId: string, rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => quotesApi.rejectQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] })
      queryClient.invalidateQueries({ queryKey: ['quotes', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['quotes', 'all'] })
    },
  })
}

export function useRestoreQuote(quoteId: string, rfqId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => quotesApi.restoreQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote', quoteId] })
      queryClient.invalidateQueries({ queryKey: ['quotes', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['quotes', 'all'] })
    },
  })
}
