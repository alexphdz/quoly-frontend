import type { CSSProperties, ReactNode } from 'react'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { layoutOf, type SurfaceTreatment } from './shared'

export type MetricChartProps = {
  treatment?: SurfaceTreatment
  heading: string
  description?: ReactNode
  value: ReactNode
  unit?: string
  comparison?: ReactNode
  /** Cualquier gráfica 06A a 220 de alto. */
  chart: ReactNode
  legend?: ReactNode
  className?: string
  style?: CSSProperties
}

/** B · Métrica + gráfica 35 / 65: la cifra se ancla a la línea base de la gráfica. */
export function MetricChart({ treatment = 'open', heading, description, value, unit, comparison, chart, legend, className, style }: MetricChartProps) {
  const [ref, w] = useElementWidth<HTMLElement>(1200)
  const L = layoutOf(w)
  return (
    <section ref={ref} aria-label={heading} className={cx('q-comp', `is-${treatment}`, `is-${L}`, 'q-comp-metric', className)} style={style}>
      <div className="q-comp-metric-main">
        <h3 className="q-comp-h18">{heading}</h3>
        {description && <p className="q-comp-meta q-comp-metric-desc">{description}</p>}
        <div className="q-comp-metric-value">
          <span className="q-comp-figure is-gap-8">
            <span className="q-comp-num is-44">{value}</span>
            {unit && <span className="q-comp-unit">{unit}</span>}
          </span>
          {comparison && <span className="q-comp-meta is-strong">{comparison}</span>}
        </div>
      </div>
      <div className="q-comp-metric-chart">{chart}{legend}</div>
    </section>
  )
}
