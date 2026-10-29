import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type SidebarItemProps = {
  label: string
  icon?: IconName
  count?: number
  countLabel?: string
  /** Atajo a la derecha (p. ej. ⌘K) en lugar de un contador. */
  shortcut?: string
  /** Valor para aria-keyshortcuts. */
  keyShortcuts?: string
  active?: boolean
  disabled?: boolean
  collapsed?: boolean
  /** drawer = filas táctiles de 48px sin animación de hover. */
  variant?: 'sidebar' | 'drawer'
  /** Tooltip en modo contraído (por defecto label). */
  tooltip?: string
  /** Ruta interna; si no, es un botón. */
  to?: string
  onClick?: () => void
  className?: string
  style?: CSSProperties
}

/** Fila de navegación: icono 20 + label 15; activo = línea de marca + icono relleno + 600. */
export function SidebarItem({
  label, icon, count, countLabel, shortcut, keyShortcuts, active = false, disabled = false, collapsed = false,
  variant = 'sidebar', tooltip, to, onClick, className, style,
}: SidebarItemProps) {
  const classes = cx('q-nav-item', `is-${variant}`, active && 'is-active', disabled && 'is-disabled', collapsed && 'is-collapsed')
  const content = (
    <>
      {icon && <span className="q-nav-item-icon"><Icon name={icon} size={20} weight={active ? 'fill' : 'regular'} /></span>}
      <span aria-hidden={collapsed || undefined} className="q-nav-item-body">
        <span className="q-nav-item-label">
          <span aria-hidden="true" className="q-nav-item-reserve">{label}</span>
          <span className="q-nav-item-text">{label}</span>
          <span aria-hidden="true" className="q-nav-line is-hover" />
          <span aria-hidden="true" className="q-nav-line is-active" />
        </span>
        <span className="q-nav-item-spacer" />
        {count != null && <span aria-label={countLabel} className="q-nav-item-meta">{count}</span>}
        {shortcut && <span aria-hidden="true" className="q-nav-item-meta">{shortcut}</span>}
      </span>
      <span aria-hidden="true" className="q-nav-line is-hover is-mini" />
      <span aria-hidden="true" className="q-nav-line is-active is-mini" />
    </>
  )
  const common = {
    'aria-current': active ? ('page' as const) : undefined,
    'aria-disabled': disabled || undefined,
    'aria-label': collapsed ? tooltip ?? label : undefined,
    'aria-keyshortcuts': keyShortcuts,
    className: 'q-nav-item-hit',
  }
  return (
    <div className={cx(classes, className)} style={style}>
      {to && !disabled
        ? <Link to={to} onClick={onClick} {...common}>{content}</Link>
        : <button type="button" onClick={disabled ? undefined : onClick} {...common}>{content}</button>}
      {collapsed && <span role="tooltip" className="q-nav-tip">{tooltip ?? label}</span>}
    </div>
  )
}
