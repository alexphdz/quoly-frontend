import type { CSSProperties, ReactNode } from 'react'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { RadialGauge, SegmentedDistribution, type RadialGaugeProps, type SegmentedDistributionProps } from '../charts/CompactCharts'
import { layoutOf } from './shared'

export type OverviewStripProps = {
  treatment?: 'open' | 'unified'
  metric: { label: string, value: ReactNode, unit?: string, detail?: ReactNode }
  distribution?: SegmentedDistributionProps
  gauge?: RadialGaugeProps
  /** Alternativa al gauge (cualquier nodo de tendencia). */
  trend?: ReactNode
  className?: string
  style?: CSSProperties
}

/** A · Franja de resumen: 3 / 5 / 4 sobre una sola superficie, con divisores internos (no tarjetas). */
export function OverviewStrip({ treatment = 'unified', metric, distribution, gauge, trend, className, style }: OverviewStripProps) {
  const [ref, w] = useElementWidth<HTMLElement>(1200)
  const L = layoutOf(w)
  return (
    <section ref={ref} aria-label={metric.label} className={cx('q-comp', `is-${treatment}`, `is-${L}`, 'q-comp-strip', className)} style={style}>
      <div className="q-comp-strip-grid">
        <div className="q-comp-strip-metric">
          <h3 className="q-comp-title-sm">{metric.label}</h3>
          <span className="q-comp-figure">
            <span className="q-comp-num is-36">{metric.value}</span>
            {metric.unit && <span className="q-comp-unit">{metric.unit}</span>}
          </span>
          {metric.detail && <span className="q-comp-meta q-comp-strip-detail">{metric.detail}</span>}
        </div>
        {distribution && <div className="q-comp-strip-r2"><SegmentedDistribution {...distribution} className="is-bare" /></div>}
        <div className="q-comp-strip-r3">{gauge ? <RadialGauge {...gauge} className="is-bare" /> : trend}</div>
      </div>
    </section>
  )
}
