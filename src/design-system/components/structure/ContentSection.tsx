import { useId, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../../utils'
import { SectionHeader, type HeadingLevel } from './SectionHeader'

export type ContentSectionProps = {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  meta?: ReactNode
  divider?: boolean
  /** standard (sin contenedor) · delimited (superficie con borde, solo si la función lo requiere). */
  variant?: 'standard' | 'delimited'
  density?: 'default' | 'dense'
  as?: HeadingLevel
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Región de contenido: composición controlada, no contenedores decorativos. */
export function ContentSection({
  title, description, actions, meta, divider = false, variant = 'standard', density = 'default', as = 'h2', children, className, style,
}: ContentSectionProps) {
  const id = useId()
  return (
    <section aria-labelledby={title ? id : undefined} className={cx('q-content-section', `is-${variant}`, `is-${density}`, className)} style={style}>
      {title && <SectionHeader id={id} as={as} title={title} description={description} actions={actions} meta={meta} divider={divider} />}
      <div className="q-content-section-body">{children}</div>
    </section>
  )
}
