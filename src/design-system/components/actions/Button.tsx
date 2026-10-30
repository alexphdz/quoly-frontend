import type { ComponentPropsWithRef } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'destructive-strong'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const ICON_SIZE: Record<ButtonSize, number> = { xs: 16, sm: 16, md: 16, lg: 20, xl: 20 }

export type ButtonProps = Omit<ComponentPropsWithRef<'button'>, 'aria-pressed'> & {
  /** primary = coral (una por zona de decisión) · secondary · tertiary · destructive (inicia) · destructive-strong (confirma). */
  variant?: ButtonVariant
  /** xs 32 · sm 36 · md 40 · lg 44 · xl 48 */
  size?: ButtonSize
  icon?: IconName
  iconEnd?: IconName
  loading?: boolean
  /** Solo para botones de alternancia (aria-pressed). */
  selected?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconEnd,
  loading = false,
  selected,
  fullWidth = false,
  disabled,
  type = 'button',
  className,
  children,
  onClick,
  ...rest
}: ButtonProps) {
  const iconSize = ICON_SIZE[size]
  return (
    <button
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-pressed={selected === undefined ? undefined : selected}
      onClick={loading ? undefined : onClick}
      className={cx(
        'q-btn',
        `is-${variant}`,
        `is-${size}`,
        (icon || loading) && 'has-icon',
        iconEnd && 'has-icon-end',
        fullWidth && 'is-full',
        loading && 'is-loading',
        className,
      )}
      {...rest}
    >
      {loading
        ? <span className="q-spin"><Icon name="circle-notch" size={iconSize} /></span>
        : icon && <Icon name={icon} size={iconSize} />}
      {children != null && <span className="q-btn-label">{children}</span>}
      {iconEnd && !loading && <Icon name={iconEnd} size={iconSize} />}
    </button>
  )
}
