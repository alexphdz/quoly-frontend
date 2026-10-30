import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4'

export type SectionHeaderProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
  divider?: boolean
  as?: HeadingLevel
  id?: string
  className?: string
  style?: CSSProperties
}

/** Encabezado de sección: Outfit 20 + descripción; meta y acciones a la derecha. */
export function SectionHeader({ title, description, actions, meta, divider = false, as: H = 'h2', id, className, style }: SectionHeaderProps) {
  return (
    <header className={cx('q-section-header', divider && 'has-divider', className)} style={style}>
      <div className="q-section-header-text">
        <H id={id} className="q-section-title">{title}</H>
        {description && <p className="q-section-description">{description}</p>}
      </div>
      {(meta || actions) && (
        <div className="q-section-header-side">
          {meta && <span className="q-section-meta">{meta}</span>}
          {actions && <div className="q-section-actions">{actions}</div>}
        </div>
      )}
    </header>
  )
}
