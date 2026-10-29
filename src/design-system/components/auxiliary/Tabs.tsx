import { useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type TabItem<T extends string = string> = {
  value: T
  label: ReactNode
  icon?: IconName
  count?: number
  disabled?: boolean
}

export type TabsProps<T extends string = string> = {
  label?: string
  /** primary = pestañas de página con regla inferior · secondary = sub-vistas compactas. */
  variant?: 'primary' | 'secondary'
  items?: Array<T | TabItem<T>>
  value?: T
  defaultValue?: T
  onChange?: (value: T) => void
  /** Prefijo para enlazar con paneles: tab = `${idPrefix}-tab-${value}`, panel = `${idPrefix}-panel-${value}`. */
  idPrefix?: string
  className?: string
  style?: CSSProperties
}

export function Tabs<T extends string = string>({
  label, variant = 'primary', items = [], value, defaultValue, onChange, idPrefix, className, style,
}: TabsProps<T>) {
  const list: TabItem<T>[] = items.map((i) => (typeof i === 'string' ? { value: i, label: i } : i))
  const [inner, setInner] = useState<T | undefined>(defaultValue ?? list[0]?.value)
  const current = value ?? inner
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  const select = (v: T) => {
    setInner(v)
    onChange?.(v)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return
    const enabled = list.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0)
    const at = enabled.indexOf(list.findIndex((it) => it.value === current))
    let next = at
    if (e.key === 'ArrowLeft') next = (at - 1 + enabled.length) % enabled.length
    if (e.key === 'ArrowRight') next = (at + 1) % enabled.length
    if (e.key === 'Home') next = 0
    if (e.key === 'End') next = enabled.length - 1
    const idx = enabled[next]
    if (idx === undefined) return
    e.preventDefault()
    select(list[idx].value)
    refs.current[idx]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className={cx('q-tabs', `is-${variant}`, className)} style={style}>
      {list.map((it, i) => {
        const on = it.value === current
        return (
          <button
            key={it.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            id={idPrefix ? `${idPrefix}-tab-${it.value}` : undefined}
            aria-controls={idPrefix ? `${idPrefix}-panel-${it.value}` : undefined}
            type="button"
            role="tab"
            aria-selected={on}
            disabled={it.disabled}
            tabIndex={on ? 0 : -1}
            onClick={() => select(it.value)}
            className="q-tab"
          >
            {it.icon && <Icon name={it.icon} size={16} />}
            <span>{it.label}</span>
            {it.count != null && <span className="q-tab-count">{it.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
