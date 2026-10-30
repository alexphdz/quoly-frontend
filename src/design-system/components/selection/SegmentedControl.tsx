import { useState, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type SegmentedOption<T extends string = string> = {
  value: T
  label: ReactNode
  icon?: IconName
  count?: number
  disabled?: boolean
}

export type SegmentedControlProps<T extends string = string> = {
  label?: string
  options?: SegmentedOption<T>[]
  value?: T
  defaultValue?: T
  size?: 'sm' | 'md'
  fullWidth?: boolean
  onChange?: (value: T) => void
  className?: string
  style?: CSSProperties
}

/** Alterna entre vistas o filtros excluyentes (radiogroup). */
export function SegmentedControl<T extends string = string>({
  label, options = [], value, defaultValue, size = 'md', fullWidth = false, onChange, className, style,
}: SegmentedControlProps<T>) {
  const [inner, setInner] = useState<T | undefined>(defaultValue ?? options[0]?.value)
  const current = value ?? inner
  return (
    <div role="radiogroup" aria-label={label} className={cx('q-segmented', `is-${size}`, fullWidth && 'is-full', className)} style={style}>
      {options.map((o) => {
        const on = o.value === current
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            onClick={() => {
              setInner(o.value)
              onChange?.(o.value)
            }}
            className="q-segment"
          >
            {o.icon && <Icon name={o.icon} size={16} weight={on ? 'fill' : undefined} />}
            {o.label}
            {o.count != null && <span className="q-segment-count">{o.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
