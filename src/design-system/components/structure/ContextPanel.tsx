import { useId, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'
import type { HeadingLevel } from './SectionHeader'

export type ContextPanelProps = {
  title?: ReactNode
  icon?: IconName
  children?: ReactNode
  footer?: ReactNode
  /** Acoplado al lateral (solo borde izquierdo). */
  docked?: boolean
  width?: number | string
  /** secondary = superficie de contexto · primary = superficie principal. */
  surface?: 'primary' | 'secondary'
  as?: HeadingLevel
  className?: string
  style?: CSSProperties
}

/** Panel lateral de contexto (información de apoyo a la tarea principal). */
export function ContextPanel({ title, icon, children, footer, docked = false, width = 320, surface = 'secondary', as: H = 'h3', className, style }: ContextPanelProps) {
  const id = useId()
  return (
    <aside aria-labelledby={title ? id : undefined} className={cx('q-context-panel', `is-${surface}`, docked && 'is-docked', className)} style={{ width, ...style }}>
      {title && (
        <H id={id} className="q-context-title">
          {icon && <Icon name={icon} size={16} className="q-context-title-icon" />}
          {title}
        </H>
      )}
      <div className="q-context-body">{children}</div>
      {footer && <div className="q-context-footer">{footer}</div>}
    </aside>
  )
}

export function PanelSection({ title, children, divider = true }: { title?: ReactNode, children?: ReactNode, divider?: boolean }) {
  return (
    <div className={cx('q-panel-section', divider && 'has-divider')}>
      {title && <span className="q-panel-section-title">{title}</span>}
      {children}
    </div>
  )
}
