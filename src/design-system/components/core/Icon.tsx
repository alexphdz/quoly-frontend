import type { CSSProperties } from 'react'
import { cx } from '../../utils'
import { IntelligenceMark } from './IntelligenceMark'
import { QUOLY_ICONS, type QuolyIconName } from './icons'

export type IconName = QuolyIconName | 'quoly-intelligence' | 'quoly-proposed'
export type IconWeight = 'regular' | 'bold' | 'fill' | 'duotone' | 'light'

export type IconProps = {
  /** Nombre del vocabulario Quoly (p. ej. "receipt") o símbolo "quoly-intelligence" / "quoly-proposed". */
  name: IconName
  /** Escala --icon-*: 12 | 16 | 20 | 24 | 32 | 40 | 48. */
  size?: number
  /** Por defecto según tamaño: ≤12 bold, ≥32 light, resto regular. */
  weight?: IconWeight
  /** Nombre accesible; omitir si el icono es decorativo. */
  label?: string
  color?: string
  className?: string
  style?: CSSProperties
}

export function iconWeightFor(size: number): IconWeight {
  if (size <= 12) return 'bold'
  if (size >= 32) return 'light'
  return 'regular'
}

export function Icon({ name, size = 16, weight, label, color, className, style }: IconProps) {
  if (name === 'quoly-intelligence' || name === 'quoly-proposed') {
    return (
      <IntelligenceMark
        size={size}
        variant={name === 'quoly-proposed' ? 'proposed' : 'extracted'}
        color={color ?? 'currentColor'}
        label={label}
        className={cx('q-icon', className)}
        style={style}
      />
    )
  }
  const Cmp = QUOLY_ICONS[name]
  return (
    <Cmp
      size={size}
      weight={weight ?? iconWeightFor(size)}
      data-icon={name}
      className={cx('q-icon', className)}
      style={{ color, ...style }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? 'img' : undefined}
      focusable="false"
    />
  )
}
