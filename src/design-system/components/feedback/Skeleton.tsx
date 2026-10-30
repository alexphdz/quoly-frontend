import type { CSSProperties } from 'react'
import { cx } from '../../utils'

export type SkeletonProps = {
  shape?: 'text' | 'block' | 'control' | 'circle'
  width?: number | string
  height?: number
  /** Solo text: número de líneas (la última al 60%). */
  lines?: number
  className?: string
  style?: CSSProperties
}

export function Skeleton({ shape = 'text', width, height, lines = 1, className, style }: SkeletonProps) {
  if (shape === 'text') {
    return (
      <span aria-hidden="true" className={cx('q-skeleton-lines', className)} style={{ width: width ?? '100%', ...style }}>
        {Array.from({ length: lines }, (_, i) => (
          <span key={i} className="q-skeleton is-text" style={{ height: height ?? 10, width: lines > 1 && i === lines - 1 ? '60%' : '100%' }} />
        ))}
      </span>
    )
  }
  const circle = shape === 'circle'
  return (
    <span
      aria-hidden="true"
      className={cx('q-skeleton', `is-${shape}`, className)}
      style={{ width: width ?? (circle ? 32 : '100%'), height: height ?? (circle ? 32 : 40), ...style }}
    />
  )
}
