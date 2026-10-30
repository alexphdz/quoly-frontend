import { useTranslation } from 'react-i18next'
import { useFormat } from './format'

/** «Hace 25 min», «Hace 3 h», «Ayer» o la fecha corta. */
export function useRelativeTime() {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  return (iso: string) => {
    const at = new Date(iso)
    const mins = Math.max(0, Math.round((Date.now() - at.getTime()) / 60_000))
    if (mins < 60) return t('inicio.time.minutes', { count: Math.max(1, mins) })
    const today = new Date()
    if (at.toDateString() === today.toDateString()) return t('inicio.time.hours', { count: Math.round(mins / 60) })
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (at.toDateString() === yesterday.toDateString()) return t('inicio.time.yesterday')
    return fmt.date(at, { day: 'numeric', month: 'short' })
  }
}
