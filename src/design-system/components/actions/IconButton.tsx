import type { ComponentPropsWithRef } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type IconButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'children' | 'aria-pressed'> & {
  icon: IconName
  /** Nombre accesible obligatorio (aria-label + title). */
  label: string
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive'
  /** xs 32 · sm 36 · md 40 · lg 44 */
  size?: IconButtonSize
  selected?: boolean
  loading?: boolean
}

/** Acción cuadrada solo-icono. Tertiary por defecto. */
export function IconButton({
  icon,
  label,
  variant = 'tertiary',
  size = 'md',
  selected,
  loading = false,
  disabled,
  type = 'button',
  className,
  ...rest
}: IconButtonProps) {
  const iconSize = size === 'lg' ? 20 : 16
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-pressed={selected === undefined ? undefined : selected}
      className={cx('q-icon-btn', `is-${variant}`, `is-${size}`, className)}
      {...rest}
    >
      {loading
        ? <span className="q-spin"><Icon name="circle-notch" size={iconSize} /></span>
        : <Icon name={icon} size={iconSize} weight={selected ? 'fill' : undefined} />}
    </button>
  )
}
