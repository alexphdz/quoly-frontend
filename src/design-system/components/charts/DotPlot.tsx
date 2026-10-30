import { useRef, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { ChartTooltip } from './ChartTooltip'
import { Live, SrTable, chartColor, niceRange, useChartFormat, useInspect } from './shared'

export type DotPlotRow = {
  label: string
  value: number | null
  color?: string
  /** Texto de la columna de valor cuando no hay valor. Default “No comparable”. */
  missing?: string
  reason?: string
  note?: ReactNode
}

export type DotPlotProps = {
  rows: DotPlotRow[]
  unit?: string
  decimals?: number
  domain?: [number, number]
  color?: string
  basis?: ReactNode
  valueLabel?: string
  labelWidth?: number
  valueWidth?: number
  activeIndex?: number
  ariaLabel: string
  className?: string
  style?: CSSProperties
}

const PL = 8

/** Un proveedor por fila sobre una escala común. Sin valor → texto, nunca un punto en cero. La posición no indica ganador. */
export function DotPlot({
  rows, unit, decimals = 2, domain, color = 'blue', basis, valueLabel, labelWidth = 180, valueWidth = 100, activeIndex, ariaLabel, className, style,
}: DotPlotProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const [ref, w] = useElementWidth<HTMLDivElement>(720)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const narrow = w < 560
  const label = valueLabel ?? t('chart.col.value')
  const vs = rows.map((r) => r.value).filter((v): v is number => v != null)
  const { lo, hi, ticks } = domain
    ? { lo: domain[0], hi: domain[1], ticks: niceRange(domain[0], domain[1], 4).ticks.filter((tk) => tk >= domain[0] && tk <= domain[1]) }
    : niceRange(vs.length ? Math.min(...vs) : 0, vs.length ? Math.max(...vs) : 1, 4)
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100
  const { active, set, ring, bind } = useInspect(rows.length, activeIndex)
  const LW = narrow ? 0 : labelWidth
  const cols = narrow ? `minmax(0,1fr) ${valueWidth}px` : `${LW}px minmax(0,1fr) ${valueWidth}px`
  const missingText = (r: DotPlotRow) => r.missing || t('chart.noComparable')
  const act = active != null && rows[active] && rows[active].value != null ? rows[active] : null
  const actValue = act?.value ?? 0
  const rowTop = (i: number) => rowRefs.current[i]?.offsetTop ?? 0
  const tipX = narrow
    ? PL + ((w - valueWidth - 12 - 2 * PL) * pos(actValue)) / 100
    : LW + 12 + PL + ((w - LW - valueWidth - 24 - 2 * PL) * pos(actValue)) / 100

  return (
    <div ref={ref} className={cx('q-chart', className)} style={style}>
      <div {...bind} role="group" aria-roledescription={t('chart.role.dot')} aria-label={ariaLabel} className={cx('q-chart-dots', ring && 'is-ring')}>
        <div aria-hidden="true" className="q-chart-dot-axis" style={{ gridTemplateColumns: cols }}>
          {!narrow && <span className="q-chart-label">{t('chart.col.supplier')}</span>}
          <span className="q-chart-dot-ticks">
            {ticks.map((tk) => <span key={tk} className="q-chart-axis" style={{ left: `${pos(tk)}%` }}>{fmt(tk, decimals)}</span>)}
          </span>
          <span className="q-chart-label is-end">{label}</span>
        </div>
        {rows.map((r, i) => {
          const on = active === i
          return (
            <div
              key={i}
              ref={(el) => { rowRefs.current[i] = el }}
              className={cx('q-chart-dot-row', narrow && 'is-narrow', on && 'is-on')}
              onMouseEnter={() => set(i)}
              onMouseLeave={() => set(null)}
              style={{ gridTemplateColumns: cols }}
            >
              <span className="q-chart-dot-label" title={r.label}>{r.label}</span>
              <span className="q-chart-dot-track">
                {ticks.map((tk) => <span key={tk} aria-hidden="true" className="q-chart-dot-tick" style={{ left: `${pos(tk)}%` }} />)}
                {r.value == null
                  ? <span className="q-chart-meta q-chart-dot-reason">{r.reason || t('chart.noComparableValue')}</span>
                  : (
                    <>
                      <span aria-hidden="true" className="q-chart-dot-line" />
                      <span aria-hidden="true" className={cx('q-chart-dot', on && 'is-on')} style={{ left: `${pos(r.value)}%`, background: chartColor(r.color || color) }} />
                    </>
                  )}
              </span>
              <span className="q-chart-dot-value">
                {r.value == null ? <span className="q-chart-dot-missing">{missingText(r)}</span> : <span className="q-chart-value">{fmt(r.value, decimals)}</span>}
              </span>
            </div>
          )
        })}
        {act && active != null && (
          <ChartTooltip
            x={tipX}
            y={rowTop(active) + (narrow ? 34 : 12)}
            bounds={w}
            title={act.label}
            rows={[{ label, value: fmt(act.value, decimals), unit, color: act.color || color }]}
            context={act.note || basis}
          />
        )}
      </div>
      {unit && <div className="q-chart-meta q-chart-dot-note">{t('chart.dot.scaleNote', { label, unit })}</div>}
      <SrTable
        caption={ariaLabel}
        columns={[t('chart.col.supplier'), label + (unit ? ` (${unit})` : '')]}
        rows={rows.map((r) => [r.label, r.value == null ? missingText(r) + (r.reason ? ` · ${r.reason}` : '') : fmt(r.value, decimals)])}
      />
      <Live text={act ? `${act.label}: ${fmt(act.value, decimals)}${unit ? ` ${unit}` : ''}` : ''} />
    </div>
  )
}
