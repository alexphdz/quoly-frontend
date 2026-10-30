import type { CSSProperties } from 'react'
import { cx } from '../../utils'

export type AvatarProps = {
  name: string
  /** person = círculo · organization = cuadrado redondeado. */
  kind?: 'person' | 'organization'
  size?: 20 | 24 | 32 | 40
  src?: string | null
  className?: string
  style?: CSSProperties
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase()
}

export function Avatar({ name, kind = 'person', size = 32, src, className, style }: AvatarProps) {
  return (
    <span role="img" aria-label={name} className={cx('q-avatar', `is-${kind}`, `is-${size}`, className)} style={{ width: size, height: size, ...style }}>
      {src ? <img src={src} alt="" /> : <span aria-hidden="true">{initials(name)}</span>}
    </span>
  )
}
