import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type TagProps = {
  variant?: 'subtle' | 'outline' | 'plain'
  icon?: IconName
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Metadato descriptivo (no estado). */
export function Tag({ variant = 'subtle', icon, children, className, style }: TagProps) {
  return (
    <span className={cx('q-tag', `is-${variant}`, className)} style={style}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  )
}
