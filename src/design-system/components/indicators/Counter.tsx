import type { CSSProperties } from 'react'
import { cx } from '../../utils'

export type CounterProps = {
  value: number | string
  /** Por encima se muestra "max+". */
  max?: number
  variant?: 'text' | 'subtle'
  tone?: 'neutral' | 'ai' | 'attention'
  label?: string
  className?: string
  style?: CSSProperties
}

export function Counter({ value, max = 99, variant = 'text', tone = 'neutral', label, className, style }: CounterProps) {
  const shown = typeof value === 'number' && value > max ? `${max}+` : value
  return (
    <span aria-label={label} className={cx('q-counter', `is-${variant}`, `is-${tone}`, className)} style={style}>
      {shown}
    </span>
  )
}
