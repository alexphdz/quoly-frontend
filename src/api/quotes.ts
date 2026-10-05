import { get, patch, post, postFormData, del } from './client'
import type {
  QuoteRead,
  QuoteListItem,
  QuoteOverviewItem,
  QuoteUpdate,
} from '../types/quote'
import type { SpecEvidenceResponse } from '../types/specEvidence'

export function createQuote(
  rfqId: string,
  supplierId: string,
  file?: File | null,
  rawText?: string | null,
): Promise<QuoteRead> {
  const fd = new FormData()
  fd.append('supplier_id', supplierId)
  if (file) fd.append('file', file)
  if (rawText) fd.append('raw_text', rawText)
  return postFormData<QuoteRead>(`/rfqs/${rfqId}/quotes`, fd)
}

export function listQuotes(rfqId: string): Promise<QuoteListItem[]> {
  return get<QuoteListItem[]>(`/rfqs/${rfqId}/quotes`)
}

export function getQuote(id: string): Promise<QuoteRead> {
  return get<QuoteRead>(`/quotes/${id}`)
}

export function getSpecEvidence(quoteId: string): Promise<SpecEvidenceResponse> {
  return get<SpecEvidenceResponse>(`/quotes/${quoteId}/spec-evidence`)
}

export function updateQuote(id: string, data: QuoteUpdate): Promise<QuoteRead> {
  return patch<QuoteRead>(`/quotes/${id}`, data)
}

export function deleteQuote(id: string): Promise<void> {
  return del(`/quotes/${id}`)
}

export function confirmQuote(id: string): Promise<QuoteRead> {
  return post<QuoteRead>(`/quotes/${id}/confirm`)
}

export function retryQuoteExtraction(id: string): Promise<QuoteRead> {
  return post<QuoteRead>(`/quotes/${id}/retry-extraction`)
}

export function rejectQuote(id: string): Promise<QuoteRead> {
  return post<QuoteRead>(`/quotes/${id}/reject`)
}

export function restoreQuote(id: string): Promise<QuoteRead> {
  return post<QuoteRead>(`/quotes/${id}/restore`)
}

export function listAllQuotes(): Promise<QuoteOverviewItem[]> {
  return get<QuoteOverviewItem[]>('/quotes')
}
