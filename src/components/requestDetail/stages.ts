import type { IconName, StatusTone } from '../../design-system'
import { normalizeSupplierStage } from '../../lib/supplierStages'
import type { RFQDetail } from '../../types/rfq'
import type { RfqStatus } from '../../design-system'
import { rfqListBucket } from '../../lib/rfqDisplay'

/** Etapas del proveedor (vocabulario §10): tono y ícono; el texto siempre visible. */
export const STAGE: Record<string, { tone: StatusTone, icon: IconName }> = {
  quote_received: { tone: 'success', icon: 'check-circle' },
  partial_response: { tone: 'info', icon: 'file-text' },
  buyer_action_required: { tone: 'warning', icon: 'chat-text' },
  awaiting_response: { tone: 'neutral', icon: 'clock' },
  not_contacted: { tone: 'neutral', icon: 'circle-dashed' },
  declined: { tone: 'neutral', icon: 'x-circle' },
  closed: { tone: 'neutral', icon: 'lock-simple' },
}

export const stageOf = (status: string) => {
  const key = normalizeSupplierStage(status)
  return { key, ...(STAGE[key] ?? STAGE.awaiting_response) }
}

/** Etapas que aún pueden cerrarse desde la fila. */
export const CLOSABLE = new Set(['not_contacted', 'awaiting_response', 'buyer_action_required', 'partial_response', 'quote_received'])

/** Estado de la solicitud con los tres documentados: Borrador · Abierta · Cerrada. */
export function headerStatus(rfq: RFQDetail): { status: RfqStatus, key: 'draft' | 'open' | 'closed' } {
  const bucket = rfqListBucket(rfq)
  return { status: bucket === 'draft' ? 'draft' : bucket === 'closed' ? 'closed' : 'sent', key: bucket }
}
