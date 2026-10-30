import { useTranslation } from 'react-i18next'
import { useFormat } from '../../../lib/format'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'
import { IntelligenceMark } from '../core/IntelligenceMark'

export type ReviewStatus = 'reviewed' | 'review' | 'pending'
export type ExceptionTone = 'warning' | 'info' | 'ai' | 'neutral'

export const STATUS_ICON: Record<ReviewStatus, IconName | 'ai'> = { reviewed: 'check', review: 'ai', pending: 'circle-dashed' }
export const TONE_ICON: Record<ExceptionTone, IconName | 'ai'> = { warning: 'warning', info: 'info', ai: 'ai', neutral: 'circle-dashed' }

export function CmpIcon({ name, size = 15 }: { name: IconName | 'ai', size?: number }) {
  return name === 'ai' ? <IntelligenceMark size={size} color="currentColor" /> : <Icon name={name} size={size} />
}

/** Estado de revisión de una cotización (icono + texto). */
export function CmpStatus({ status = 'pending', label }: { status?: ReviewStatus, label?: string }) {
  const { t } = useTranslation('ds')
  return (
    <span className={cx('q-cmp-status', `is-${status}`)}>
      <CmpIcon name={STATUS_ICON[status]} size={14} />
      {label ?? t(`cmp.status.${status}`)}
    </span>
  )
}

/** Importe con 2 decimales en el locale de la app. */
export function useAmount() {
  const { locale } = useFormat()
  return (n: number) => new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
}
