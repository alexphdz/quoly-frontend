import type { RFQRead } from '../types/rfq'
import { useFormat } from './format'
import { rfqListBucket } from './rfqDisplay'

/** Destino al abrir una solicitud: un borrador comercial se abre en edición; el resto, en su detalle. */
export function requestDestination(rfq: RFQRead): string {
  return rfqListBucket(rfq) === 'draft' && rfq.request_kind === 'commercial'
    ? `/rfqs/${rfq.id}/edit`
    : `/rfqs/${rfq.id}`
}

/** "Tomorrow", "In 5 days", "Today" — capitalised output of Intl.RelativeTimeFormat. */
export function useRelativeDays() {
  const fmt = useFormat()
  const rtf = new Intl.RelativeTimeFormat(fmt.locale, { numeric: 'auto' })
  return (days: number) => {
    const text = rtf.format(days, 'day')
    return text.charAt(0).toLocaleUpperCase(fmt.locale) + text.slice(1)
  }
}
