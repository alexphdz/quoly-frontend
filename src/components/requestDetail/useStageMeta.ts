import { useTranslation } from 'react-i18next'
import { useFormat } from '../../lib/format'
import { useRelativeTime } from '../../lib/relativeTime'
import type { SupplierRead } from '../../types/rfq'
import type { CommercialRequestDetailProps } from './CommercialRequestDetail'
import { stageOf } from './stages'

/** Línea de contexto bajo la etapa: cotización, pregunta abierta o envío, con su fecha. */
export function useStageMeta({ quotes, openAsks }: Pick<CommercialRequestDetailProps, 'quotes' | 'openAsks'>) {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const relative = useRelativeTime()
  const short = (iso: string) => fmt.date(iso, { day: 'numeric', month: 'short' })
  return (s: SupplierRead) => {
    const stage = stageOf(s.status).key
    const ask = openAsks.filter(a => a.supplier_id === s.id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
    if (stage === 'buyer_action_required' && ask) return `${ask.question.trim()} · ${relative(ask.created_at)}`
    const quote = quotes.filter(q => q.supplier_id === s.id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
    if (quote) {
      return quote.status === 'draft'
        ? t('detalle.meta.quoteToReview', { when: relative(quote.created_at) })
        : t('detalle.meta.quoteConfirmed', { date: short(quote.created_at) })
    }
    if (stage === 'not_contacted') return t('detalle.meta.notSent')
    if (s.requested_at) return t('detalle.meta.sent', { date: short(s.requested_at) })
    return ''
  }
}
