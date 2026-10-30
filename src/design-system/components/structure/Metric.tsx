import { Children, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../../utils'

export type MetricProps = {
  label: ReactNode
  value: ReactNode
  unit?: ReactNode
  detail?: ReactNode
  /** standard (Outfit 32) · hero (Outfit 44). */
  size?: 'standard' | 'hero'
  /** Color del marcador categórico (solo datos). */
  marker?: string
  className?: string
  style?: CSSProperties
}

/** Cifra destacada sin contenedor. */
export function Metric({ label, value, unit, detail, size = 'standard', marker, className, style }: MetricProps) {
  return (
    <div className={cx('q-metric', `is-${size}`, className)} style={style}>
      <span className="q-struct-label q-metric-label">
        {marker && <span aria-hidden="true" className="q-metric-marker" style={{ background: marker }} />}
        {label}
      </span>
      <span className="q-metric-figure">
        <span className="q-metric-value">{value}</span>
        {unit && <span className="q-metric-unit">{unit}</span>}
      </span>
      {detail && <span className="q-metric-detail">{detail}</span>}
    </div>
  )
}

export type MetricGroupProps = {
  children: ReactNode
  /** Divisores verticales entre métricas cuando caben en una fila. */
  dividers?: boolean
  /** Ancho mínimo por métrica antes de pasar a rejilla. */
  min?: number
  className?: string
  style?: CSSProperties
}

export function MetricGroup({ children, dividers = false, min = 170, className, style }: MetricGroupProps) {
  const ref = useRef<HTMLDivElement>(null)
  const kids = Children.toArray(children)
  const n = kids.length
  const [row, setRow] = useState(true)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setRow(el.clientWidth >= n * min + (n - 1) * 24))
    ro.observe(el)
    return () => ro.disconnect()
  }, [n, min])
  return (
    <div
      ref={ref}
      role="group"
      className={cx('q-metric-group', dividers && row && 'has-dividers', className)}
      style={{ gridTemplateColumns: row ? `repeat(${n}, minmax(0, 1fr))` : `repeat(auto-fit, minmax(${min}px, 1fr))`, ...style }}
    >
      {kids.map((k, i) => <div key={i} className="q-metric-cell">{k}</div>)}
    </div>
  )
}
