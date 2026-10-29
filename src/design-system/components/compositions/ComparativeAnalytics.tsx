import { useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { SegmentedControl } from '../selection/SegmentedControl'
import { Fade, layoutOf } from './shared'

export type ComparativeFact = { label: string, value: ReactNode, unit?: string, detail?: ReactNode }
export type ComparativeView = { value: string, label: string, chart: ReactNode, facts?: ComparativeFact[], note?: ReactNode }

export type ComparativeAnalyticsProps = {
  treatment?: 'open' | 'unified'
  title: string
  description?: ReactNode
  /** Con más de una vista aparece el selector (SegmentedControl). */
  views: ComparativeView[]
  breakdown?: ReactNode
  className?: string
  style?: CSSProperties
}

/** C · Análisis comparativo: cabecera + gráfica + fila de datos factuales. Sin ranking ni “mejor”. */
export function ComparativeAnalytics({ treatment = 'unified', title, description, views, breakdown, className, style }: ComparativeAnalyticsProps) {
  const { t } = useTranslation('ds')
  const [ref, w] = useElementWidth<HTMLElement>(1200)
  const L = layoutOf(w)
  const [v, setV] = useState(views[0]?.value)
  const cur = views.find((x) => x.value === v) ?? views[0]
  const facts = cur?.facts ?? []
  return (
    <section ref={ref} aria-label={title} className={cx('q-comp', `is-${treatment}`, `is-${L}`, 'q-comp-analytics', className)} style={style}>
      <header className="q-comp-analytics-head">
        <div className="q-comp-analytics-titles">
          <h3 className="q-comp-h20">{title}</h3>
          {description && <p className="q-comp-meta q-comp-analytics-desc">{description}</p>}
        </div>
        {views.length > 1 && (
          <SegmentedControl size="sm" label={t('comp.view')} options={views.map((x) => ({ value: x.value, label: x.label }))} value={cur?.value} onChange={setV} />
        )}
      </header>
      {cur && (
        <Fade k={cur.value} className="q-comp-analytics-view">
          <div className="q-comp-analytics-chart">{cur.chart}</div>
          {facts.length > 0 && (
            <dl className="q-comp-facts" style={L === 'mobile' ? undefined : { gridTemplateColumns: `repeat(${facts.length},minmax(0,1fr))` }}>
              {facts.map((f, i) => (
                <div key={i} className="q-comp-fact">
                  <dt className="q-comp-label">{f.label}</dt>
                  <dd>
                    <span className="q-comp-fact-value">{f.value}</span>
                    {f.unit && <span className="q-comp-meta is-11">{f.unit}</span>}
                  </dd>
                  {f.detail && <span className="q-comp-meta is-11 is-tight">{f.detail}</span>}
                </div>
              ))}
            </dl>
          )}
          {cur.note && <p className="q-comp-meta q-comp-analytics-note">{cur.note}</p>}
        </Fade>
      )}
      {breakdown && <div className="q-comp-analytics-breakdown">{breakdown}</div>}
    </section>
  )
}
