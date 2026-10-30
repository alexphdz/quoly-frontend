import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { useChartFormat } from '../charts/shared'
import { RadialGauge, type RadialGaugeProps } from '../charts/CompactCharts'
import { layoutOf, type SurfaceTreatment } from './shared'

export type ProgressItem = { label: string, value: number, kind: 'confirmed' | 'pending' | 'missing' }
export type ProgressGroup = { label: string, items: ProgressItem[] }

export type ProgressCompositionProps = {
  treatment?: SurfaceTreatment
  title: string
  value: number
  total: number
  unit?: string
  statement?: ReactNode
  gauge?: RadialGaugeProps
  /** Disponible ≠ confirmado: disponibilidad y revisión humana van en grupos separados. */
  groups: ProgressGroup[]
  className?: string
  style?: CSSProperties
}

/** D · Progreso operativo: conteo (+ gauge) junto a un desglose por grupos con marcadores semánticos. */
export function ProgressComposition({ treatment = 'contrasting', title, value, total, unit, statement, gauge, groups, className, style }: ProgressCompositionProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const [ref, w] = useElementWidth<HTMLElement>(1200)
  const L = layoutOf(w)
  return (
    <section ref={ref} aria-label={title} className={cx('q-comp', `is-${treatment}`, `is-${L}`, 'q-comp-progress', className)} style={style}>
      <div className="q-comp-progress-count">
        <div className="q-comp-progress-head">
          <h3 className="q-comp-title-sm">{title}</h3>
          <span className="q-comp-figure q-comp-progress-figure">
            <span className="q-comp-num is-32">{fmt(value)}</span>
            <span className="q-comp-unit">{t('comp.ofTotal', { total: fmt(total), unit: unit ?? '' }).trim()}</span>
          </span>
          {statement && <p className="q-comp-meta q-comp-progress-statement">{statement}</p>}
        </div>
        {gauge && <RadialGauge {...gauge} className="is-bare is-inline" />}
      </div>
      <div className="q-comp-progress-groups" style={L === 'desktop' ? { gridTemplateColumns: `repeat(${groups.length},minmax(0,1fr))` } : undefined}>
        {groups.map((g, gi) => {
          const gt = g.items.reduce((a, x) => a + x.value, 0)
          return (
            <div key={gi} className="q-comp-progress-group">
              <span className="q-comp-label q-comp-progress-glabel">
                <span>{g.label}</span>
                <span className="q-comp-tnum">{t('comp.countOf', { value: fmt(gt), total: fmt(total) })}</span>
              </span>
              <span aria-hidden="true" className="q-comp-progress-bar">
                {g.items.map((x, i) => <span key={i} className={`is-${x.kind}`} style={{ flex: `${x.value} 0 0` }} />)}
                {gt < total && <span className="is-missing" style={{ flex: `${total - gt} 0 0` }} />}
              </span>
              <ul className="q-comp-progress-items">
                {g.items.map((x, i) => (
                  <li key={i}>
                    <span aria-hidden="true" className={cx('q-comp-progress-marker', `is-${x.kind}`)} />
                    <span className="q-comp-progress-item-label">{x.label}</span>
                    <span className="q-comp-progress-item-value">{fmt(x.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </section>
  )
}
