import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'
import { MissingValue, gridColumns } from './shared'

export type KeyValueItem = {
  label: ReactNode
  value?: ReactNode
  /** Ocupa todo el ancho. */
  span?: boolean
  /** Texto largo (400, medida de prosa). */
  long?: boolean
}

export type KeyValueGroupProps = {
  items: KeyValueItem[]
  columns?: number
  /** Regla superior en cada par. */
  rules?: boolean
  label?: string
  className?: string
  style?: CSSProperties
}

export function KeyValueGroup({ items, columns = 2, rules = true, label, className, style }: KeyValueGroupProps) {
  return (
    <dl aria-label={label} className={cx('q-kv-group', rules && 'has-rules', className)} style={{ ...gridColumns(columns, 220), ...style }}>
      {items.map((it, i) => (
        <div key={i} className={cx('q-kv-item', it.span && 'is-span')}>
          <dt className="q-struct-label">{it.label}</dt>
          <dd className={cx('q-kv-value', it.long && 'is-long')}>{it.value == null ? <MissingValue /> : it.value}</dd>
        </div>
      ))}
    </dl>
  )
}
