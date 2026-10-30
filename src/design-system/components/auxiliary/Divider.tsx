import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'

export type DividerProps = {
  orientation?: 'horizontal' | 'vertical'
  /** default (divisor) · strong (borde) · structural (regla de máximo contraste). */
  tone?: 'default' | 'strong' | 'structural'
  label?: ReactNode
  /** Margen en px a ambos lados. */
  spacing?: number
  className?: string
  style?: CSSProperties
}

export function Divider({ orientation = 'horizontal', tone = 'default', label, spacing = 0, className, style }: DividerProps) {
  const classes = cx('q-divider', `is-${tone}`, className)
  if (orientation === 'vertical') {
    return <span role="separator" aria-orientation="vertical" className={cx(classes, 'is-vertical')} style={{ margin: `0 ${spacing}px`, ...style }} />
  }
  if (label) {
    return (
      <div role="separator" className={cx(classes, 'is-labelled')} style={{ margin: `${spacing}px 0`, ...style }}>
        <span className="q-divider-line" />
        <span className="q-divider-label">{label}</span>
        <span className="q-divider-line" />
      </div>
    )
  }
  return <hr className={classes} style={{ margin: `${spacing}px 0`, ...style }} />
}
