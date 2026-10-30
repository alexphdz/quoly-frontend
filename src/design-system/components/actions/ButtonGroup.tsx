import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type ButtonGroupItem = {
  label?: string
  icon?: IconName
  /** Nombre accesible cuando el segmento es solo icono. */
  ariaLabel?: string
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

export type ButtonGroupProps = {
  /** attached = segmentos unidos (items); si no, agrupa children con gap de acciones. */
  attached?: boolean
  label?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  items?: ButtonGroupItem[]
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function ButtonGroup({ attached = false, label, size = 'md', items = [], children, className, style }: ButtonGroupProps) {
  if (!attached) {
    return <div role="group" aria-label={label} className={cx('q-btn-group', className)} style={style}>{children}</div>
  }
  const iconSize = size === 'lg' || size === 'xl' ? 20 : 16
  return (
    <div role="group" aria-label={label} className={cx('q-btn-group', 'is-attached', className)} style={style}>
      {items.map((it, i) => (
        <button
          key={i}
          type="button"
          disabled={it.disabled}
          aria-pressed={it.selected === undefined ? undefined : it.selected}
          aria-label={it.icon && !it.label ? it.ariaLabel : undefined}
          onClick={it.onClick}
          className={cx('q-btn', 'is-secondary', `is-${size}`, !it.label && 'is-icon-only')}
        >
          {it.icon && <Icon name={it.icon} size={iconSize} />}
          {it.label && <span className="q-btn-label">{it.label}</span>}
        </button>
      ))}
    </div>
  )
}
