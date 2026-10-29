import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'

export type NotificationIndicatorProps = {
  /** Nombre accesible (p. ej. "3 respuestas nuevas"). */
  label: string
  /** Sin count = punto; 0 = oculto. */
  count?: number
  tone?: 'brand' | 'info' | 'warning' | 'ai'
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Punto o contador sobre un elemento (icono, avatar). */
export function NotificationIndicator({ label, count, tone = 'brand', children, className, style }: NotificationIndicatorProps) {
  const show = count === undefined || count > 0
  return (
    <span className={cx('q-notify', `is-${tone}`, className)} style={style}>
      {children}
      {show && (count == null
        ? <span role="status" aria-label={label} className="q-notify-dot" />
        : <span role="status" aria-label={label} className="q-notify-count">{count > 99 ? '99+' : count}</span>)}
    </span>
  )
}
