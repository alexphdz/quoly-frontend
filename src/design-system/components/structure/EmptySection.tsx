import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'
import type { HeadingLevel } from './SectionHeader'

export type EmptySectionProps = {
  title: ReactNode
  text?: ReactNode
  action?: ReactNode
  dense?: boolean
  as?: HeadingLevel
  className?: string
  style?: CSSProperties
}

/** Sección sin contenido todavía: título, explicación y siguiente acción. */
export function EmptySection({ title, text, action, dense = false, as: H = 'h3', className, style }: EmptySectionProps) {
  return (
    <div role="status" className={cx('q-empty-section', dense && 'is-dense', className)} style={style}>
      <H className="q-empty-section-title">{title}</H>
      {text && <p className="q-empty-section-text">{text}</p>}
      {action && <div className="q-empty-section-action">{action}</div>}
    </div>
  )
}
