import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type EmptyStateProps = {
  icon?: IconName
  title: ReactNode
  children?: ReactNode
  actions?: ReactNode
  size?: 'sm' | 'md'
  align?: 'center' | 'start'
  className?: string
  style?: CSSProperties
}

/** Vacío: qué falta y la siguiente acción. Sin ilustraciones. */
export function EmptyState({ icon = 'tray-arrow-down', title, children, actions, size = 'md', align = 'center', className, style }: EmptyStateProps) {
  const small = size === 'sm'
  return (
    <div className={cx('q-empty', `is-${size}`, `is-${align}`, className)} style={style}>
      <span className="q-empty-icon"><Icon name={icon} size={small ? 24 : 32} /></span>
      <div className="q-empty-text">
        <div className="q-empty-title">{title}</div>
        {children && <div className="q-empty-description">{children}</div>}
      </div>
      {actions && <div className="q-empty-actions">{actions}</div>}
    </div>
  )
}
