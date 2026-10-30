import type { ComponentPropsWithRef } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type TextButtonProps = ComponentPropsWithRef<'button'> & {
  tone?: 'default' | 'destructive'
  size?: 'sm' | 'md'
  icon?: IconName
  iconEnd?: IconName
}

/** Acción de texto: sin contenedor; subrayado coral en hover. */
export function TextButton({
  tone = 'default',
  size = 'md',
  icon,
  iconEnd,
  type = 'button',
  className,
  children,
  ...rest
}: TextButtonProps) {
  return (
    <button type={type} className={cx('q-text-btn', `is-${tone}`, `is-${size}`, className)} {...rest}>
      {icon && <Icon name={icon} size={16} />}
      <span>{children}</span>
      {iconEnd && <Icon name={iconEnd} size={16} />}
    </button>
  )
}
