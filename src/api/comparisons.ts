import { ApiError, get, getBlob, post } from './client'
import type { ComparisonResponse, DecisionCreate, DecisionRead } from '../types/comparison'
import type { RFQRead } from '../types/rfq'

export function getComparison(rfqId: string, locale: string): Promise<ComparisonResponse> {
  return get<ComparisonResponse>(`/rfqs/${rfqId}/comparison?locale=${encodeURIComponent(locale)}`)
}

export function createDecision(rfqId: string, data: DecisionCreate): Promise<DecisionRead> {
  return post<DecisionRead>(`/rfqs/${rfqId}/decision`, data)
}

export async function getDecision(rfqId: string): Promise<DecisionRead | null> {
  // A 404 just means no decision has been recorded yet — treat it as "none"
  // rather than surfacing it as an error on the comparison page.
  try {
    return await get<DecisionRead>(`/rfqs/${rfqId}/decision`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}

export function exportDecisionPdf(
  rfqId: string,
): Promise<{ blob: Blob; filename: string | null }> {
  return getBlob(`/rfqs/${rfqId}/decision/export?format=pdf`)
}

/** Cerrar la solicitud sin adjudicar (dar por terminada la comparación). */
export function closeRfq(rfqId: string, reason?: string | null): Promise<RFQRead> {
  return post<RFQRead>(`/rfqs/${rfqId}/close`, { reason: reason ?? null })
}

/** Exportar el cuadro comparativo a Excel con columnas/proveedores seleccionables. */
export function exportComparisonXlsx(
  rfqId: string,
  opts: { columns?: string[]; suppliers?: string[]; locale?: string } = {},
): Promise<{ blob: Blob; filename: string | null }> {
  const params = new URLSearchParams()
  if (opts.columns?.length) params.set('columns', opts.columns.join(','))
  if (opts.suppliers?.length) params.set('suppliers', opts.suppliers.join(','))
  if (opts.locale) params.set('locale', opts.locale)
  const qs = params.toString()
  return getBlob(`/rfqs/${rfqId}/comparison/export.xlsx${qs ? `?${qs}` : ''}`)
}
