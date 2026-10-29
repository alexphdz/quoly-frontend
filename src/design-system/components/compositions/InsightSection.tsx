import type { CSSProperties, ReactNode } from 'react'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { layoutOf } from './shared'

export type InsightPoint = { label: string, value: ReactNode, unit?: string }

export type InsightSectionProps = {
  treatment?: 'open' | 'unified'
  context?: string
  heading: string
  /** Observación que se lee directamente en los datos graficados: sin predicciones ni recomendaciones. */
  statement: ReactNode
  meta?: ReactNode
  /** Hasta 3 datos relacionados. */
  points?: InsightPoint[]
  chart: ReactNode
  legend?: ReactNode
  className?: string
  style?: CSSProperties
}

/** E · Sección editorial 5 / 7: observación factual + gráfica. */
export function InsightSection({ treatment = 'open', context, heading, statement, meta, points = [], chart, legend, className, style }: InsightSectionProps) {
  const [ref, w] = useElementWidth<HTMLElement>(1200)
  const L = layoutOf(w)
  const pts = points.slice(0, 3)
  return (
    <section ref={ref} aria-label={heading} className={cx('q-comp', `is-${treatment}`, `is-${L}`, 'q-comp-insight', className)} style={style}>
      <div className="q-comp-insight-main">
        {context && <span className="q-comp-eyebrow">{context}</span>}
        <h3 className="q-comp-h20">{heading}</h3>
        <p className="q-comp-statement">{statement}</p>
        {meta && <p className="q-comp-meta q-comp-insight-meta">{meta}</p>}
        {pts.length > 0 && (
          <dl className="q-comp-points" style={{ gridTemplateColumns: `repeat(${pts.length},minmax(0,1fr))` }}>
            {pts.map((p, i) => (
              <div key={i} className="q-comp-point">
                <dt className="q-comp-label">{p.label}</dt>
                <dd>
                  <span className="q-comp-num is-24">{p.value}</span>
                  {p.unit && <span className="q-comp-meta is-11">{p.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="q-comp-insight-chart">{chart}{legend}</div>
    </section>
  )
}
