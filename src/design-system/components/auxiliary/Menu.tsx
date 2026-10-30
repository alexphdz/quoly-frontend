import type { CSSProperties, ReactNode } from 'react'
import { DropdownMenu } from 'radix-ui'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type MenuProps = {
  /** Elemento disparador (botón). */
  trigger: ReactNode
  children: ReactNode
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Ancho mínimo en px. */
  minWidth?: number
  className?: string
}

/** Menú desplegable (Radix DropdownMenu) con superficie flotante Quoly. */
export function Menu({ trigger, children, align = 'end', side = 'bottom', open, onOpenChange, minWidth = 200, className }: MenuProps) {
  return (
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align={align} side={side} sideOffset={6} className={cx('q-floating', 'q-menu', className)} style={{ minWidth }}>
          {children}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export type MenuItemProps = {
  icon?: IconName
  description?: ReactNode
  shortcut?: string
  /** Si se define, el elemento es seleccionable (menuitemcheckbox) y muestra ✓. */
  selected?: boolean
  tone?: 'default' | 'destructive'
  disabled?: boolean
  density?: 'default' | 'compact'
  onSelect?: () => void
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

function ItemBody({ icon, description, shortcut, selected, children }: Pick<MenuItemProps, 'icon' | 'description' | 'shortcut' | 'selected' | 'children'>) {
  return (
    <>
      <span aria-hidden="true" className="q-menu-item-trace" />
      {icon && <span className="q-menu-item-icon"><Icon name={icon} size={16} /></span>}
      <span className="q-menu-item-text">
        <span className={selected ? 'is-selected' : undefined}>{children}</span>
        {description && <span className="q-menu-item-description">{description}</span>}
      </span>
      {shortcut && <span className="q-menu-item-shortcut">{shortcut}</span>}
      {selected && <span className="q-menu-item-check"><Icon name="check" size={16} /></span>}
    </>
  )
}

export function MenuItem({ icon, description, shortcut, selected, tone = 'default', disabled = false, density = 'default', onSelect, children, className, style }: MenuItemProps) {
  const classes = cx('q-menu-item', `is-${tone}`, `is-${density}`, description ? 'has-description' : undefined, className)
  const body = <ItemBody icon={icon} description={description} shortcut={shortcut} selected={selected}>{children}</ItemBody>
  if (selected !== undefined) {
    return (
      <DropdownMenu.CheckboxItem checked={selected} disabled={disabled} onSelect={onSelect} className={classes} style={style}>
        {body}
      </DropdownMenu.CheckboxItem>
    )
  }
  return (
    <DropdownMenu.Item disabled={disabled} onSelect={onSelect} className={classes} style={style}>
      {body}
    </DropdownMenu.Item>
  )
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="q-menu-separator" />
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return <DropdownMenu.Label className="q-menu-label">{children}</DropdownMenu.Label>
}
