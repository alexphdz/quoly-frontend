import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'
import { MissingValue, gridColumns } from './shared'

export type InfoItem = { label: ReactNode, value?: ReactNode, detail?: ReactNode }

export type InfoGroupProps = {
  items: InfoItem[]
  /** Columnas (por defecto min(n, 4)); colapsan por ancho. */
  columns?: number
  label?: string
  className?: string
  style?: CSSProperties
}

/** Hechos clave en fila: etiqueta 12 + valor 15/500. */
export function InfoGroup({ items, columns, label, className, style }: InfoGroupProps) {
  const n = columns ?? Math.min(items.length || 1, 4)
  return (
    <dl aria-label={label} className={cx('q-info-group', className)} style={{ ...gridColumns(n, 150), ...style }}>
      {items.map((it, i) => (
        <div key={i} className="q-info-item">
          <dt className="q-struct-label">{it.label}</dt>
          <dd>
            {it.value == null ? <MissingValue /> : <span className="q-info-value">{it.value}</span>}
            {it.detail && it.value != null && <span className="q-info-detail">{it.detail}</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
