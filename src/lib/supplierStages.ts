import type { SupplierRead } from '../types/rfq'

const LEGACY: Record<string, string> = {
  pending: 'not_contacted',
  requested: 'awaiting_response',
  quoted: 'quote_received',
}

export function normalizeSupplierStage(status: string): string {
  return LEGACY[status] ?? status
}

export function summarizeSupplierStages(suppliers: SupplierRead[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const s of suppliers) {
    const stage = normalizeSupplierStage(s.status)
    counts[stage] = (counts[stage] ?? 0) + 1
  }
  return Object.fromEntries(Object.entries(counts).filter(([, n]) => n > 0))
}
