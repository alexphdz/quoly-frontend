import { useId, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../../utils'
import type { HeadingLevel } from './SectionHeader'

export type DetailPanelProps = {
  /** Antetítulo (11/600 mayúsculas). */
  context?: ReactNode
  title: ReactNode
  children?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  bordered?: boolean
  /** Sin padding ni borde: integrado en la región que lo contiene. */
  integrated?: boolean
  /** Limita el cuerpo a 68ch. */
  measure?: boolean
  as?: HeadingLevel
  className?: string
  style?: CSSProperties
}

export function DetailPanel({
  context, title, children, meta, actions, bordered = true, integrated = false, measure = true, as: H = 'h3', className, style,
}: DetailPanelProps) {
  const id = useId()
  return (
    <article aria-labelledby={id} className={cx('q-detail-panel', integrated && 'is-integrated', bordered && !integrated && 'is-bordered', className)} style={style}>
      {context && <span className="q-eyebrow q-detail-context">{context}</span>}
      <H id={id} className="q-detail-title">{title}</H>
      <div className={cx('q-detail-body', measure && 'is-measure')}>{children}</div>
      {(meta || actions) && (
        <div className="q-detail-footer">
          <span className="q-detail-meta">{meta}</span>
          {actions && <div className="q-detail-actions">{actions}</div>}
        </div>
      )}
    </article>
  )
}
