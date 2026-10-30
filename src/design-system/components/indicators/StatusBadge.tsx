import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName, type IconWeight } from '../core/Icon'

export type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'ai' | 'neutral'

const TONE_ICON: Record<StatusTone, [IconName, IconWeight] | null> = {
  success: ['check-circle', 'fill'],
  warning: ['warning', 'fill'],
  error: ['x-circle', 'fill'],
  info: ['info', 'fill'],
  ai: ['quoly-proposed', 'bold'],
  neutral: null,
}

export type StatusBadgeProps = {
  tone?: StatusTone
  /** subtle (fondo suave) · strong (relleno) · quiet (solo texto e icono). */
  variant?: 'subtle' | 'strong' | 'quiet'
  /** Icono propio, o false para ocultar el del tono. */
  icon?: IconName | false
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Estado de un objeto. Siempre texto + icono; el color nunca es el único portador. */
export function StatusBadge({ tone = 'neutral', variant = 'subtle', icon, children, className, style }: StatusBadgeProps) {
  const fallback = TONE_ICON[tone]
  const name = icon === false ? null : icon ?? fallback?.[0] ?? null
  const weight = icon ? undefined : variant === 'quiet' && tone !== 'ai' ? 'fill' : fallback?.[1]
  return (
    <span className={cx('q-status', `is-${tone}`, `is-${variant}`, className)} style={style}>
      {name && <Icon name={name} size={12} weight={weight} />}
      <span className="q-status-label">{children}</span>
    </span>
  )
}
