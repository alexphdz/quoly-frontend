import type { RFQRead } from '../types/rfq'
import { useFormat } from './format'
import { rfqListBucket } from './rfqDisplay'

/**
 * Destino al abrir una solicitud: un borrador comercial creado por FORMULARIO se
 * abre en su editor (está a medio llenar); todo lo demás —incluidos los borradores
 * creados por el CHAT, que ya están completos y listos para enviar— se abre en su
 * detalle, no en el formulario de creación.
 */
export function requestDestination(rfq: RFQRead): string {
  return rfqListBucket(rfq) === 'draft'
    && rfq.request_kind === 'commercial'
    && rfq.created_via !== 'chat'
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
