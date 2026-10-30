import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { ChartTooltip } from './ChartTooltip'
import { Live, SrTable, axisWidth, chartColor, niceTicks, useChartFormat, useInspect, useReveal } from './shared'

const SIZES = { compact: 160, standard: 240, large: 320 }

export type BarDatum = {
  label: string
  /** Etiqueta corta para el eje. */
  short?: string
  value?: number | null
  /** Valores multiserie, en el orden de `series`. */
  values?: (number | null)[]
  context?: ReactNode
}
export type BarSeries = { name: string, /** Nombre Colorfield o color CSS. */ color?: string }

export type BarChartProps = {
  data: BarDatum[]
  series?: BarSeries[]
  size?: keyof typeof SIZES
  height?: number
  /** La moneda vive aquí, no en cada marca del eje. */
  yLabel?: ReactNode
  unit?: string
  decimals?: number
  /** Documentación: fuerza el índice inspeccionado. */
  activeIndex?: number
  /** Habilita scroll horizontal en anchos estrechos. */
  minPlotWidth?: number
  ariaLabel: string
  context?: ReactNode
  tooltipTitle?: (d: BarDatum) => ReactNode
  className?: string
  style?: CSSProperties
}

/** Barras verticales desde cero (escala de 4 intervalos). Agrupadas: hasta 4 series. */
export function BarChart({
  data, series, size = 'standard', height, yLabel, unit, decimals, activeIndex, minPlotWidth, ariaLabel, context, tooltipTitle, className, style,
}: BarChartProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const [ref, w] = useElementWidth<HTMLDivElement>(720)
  const ser = series ?? [{ name: t('chart.col.value'), color: 'violet' }]
  const H = height || SIZES[size] || 240
  const k = ser.length
  const n = data.length
  const vals = data.map((d) => d.values ?? [d.value ?? null])
  const max = Math.max(0, ...vals.flat().filter((v): v is number => v != null))
  const { top, ticks } = niceTicks(max, 4)
  const AX = axisWidth(ticks.map((tk) => fmt(tk, decimals)))
  const W = Math.max(w, minPlotWidth ? minPlotWidth + AX + 16 : 0)
  const plotW = Math.max(40, W - AX - 16)
  const gW = plotW / Math.max(1, n)
  const barW = Math.max(4, Math.min(26, k === 1 ? gW - Math.max(10, gW * 0.38) : (gW - 16 - (k - 1) * 5) / k))
  const labelStep = Math.max(1, Math.ceil(40 / gW))
  const { active, set, ring, bind } = useInspect(n, activeIndex)
  const shown = useReveal()
  const fv = (v: number | null) => (v == null ? t('chart.noData') : fmt(v, decimals))
  const act = active != null ? data[active] : undefined
  const tipY = act && active != null ? 16 + H - (Math.max(0, ...vals[active].filter((v): v is number => v != null)) / top) * H : 0
  const live = act && active != null
    ? `${act.label}: ${ser.map((s, j) => (k > 1 ? `${s.name} ` : '') + fv(vals[active][j]) + (unit ? ` ${unit}` : '')).join(', ')}`
    : ''

  const body = (
    <div className="q-chart-body" style={{ width: W }}>
      <div className="q-chart-grid" style={{ gridTemplateColumns: `${AX}px minmax(0,1fr)` }}>
        <div className="q-chart-yaxis" style={{ height: H + 16 }}>
          {ticks.map((tk) => <span key={tk} className="q-chart-axis is-y" style={{ bottom: (tk / top) * H }}>{fmt(tk, decimals)}</span>)}
        </div>
        <div
          {...bind}
          role="group"
          aria-roledescription={t('chart.role.bar')}
          aria-label={ariaLabel}
          className={cx('q-chart-plot', ring && 'is-ring')}
          style={{ height: H + 16 }}
        >
          {ticks.map((tk) => <span key={tk} aria-hidden="true" className={cx('q-chart-rule', tk === 0 && 'is-base')} style={{ bottom: (tk / top) * H }} />)}
          <div className="q-chart-bars" style={{ height: H }}>
            {data.map((_, i) => {
              const on = active === i
              const dim = active != null && !on
              return (
                <div key={i} className="q-chart-bar-group" onMouseEnter={() => set(i)}>
                  <span aria-hidden="true" className={cx('q-chart-band', on && 'is-on')} />
                  {vals[i].map((v, j) => (
                    <span
                      key={j}
                      aria-hidden="true"
                      className={cx('q-chart-bar', shown && 'is-shown', on && 'is-on', dim && 'is-dim')}
                      style={{ width: barW, height: v == null ? 0 : (v / top) * H, background: chartColor(ser[j]?.color, j) }}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="q-chart-xaxis" style={{ marginLeft: AX }}>
        {data.map((d, i) => (
          <span
            key={i}
            className={cx('q-chart-axis', 'is-x', active === i && 'is-on')}
            style={{ visibility: i % labelStep === 0 || active === i ? 'visible' : 'hidden' }}
          >
            {d.short || d.label}
          </span>
        ))}
      </div>
      {act && active != null && (
        <ChartTooltip
          x={AX + gW * (active + 0.5)}
          y={tipY}
          bounds={W}
          title={tooltipTitle ? tooltipTitle(act) : act.label}
          context={act.context || context}
          rows={ser.map((s, j) => ({
            label: k > 1 || s.name ? s.name : null,
            color: k > 1 ? (s.color ?? j) : false,
            value: fv(vals[active][j]),
            unit: vals[active][j] == null ? null : unit,
          }))}
        />
      )}
    </div>
  )

  return (
    <div ref={ref} className={cx('q-chart', className)} style={style}>
      {yLabel && <div className="q-chart-axis q-chart-ylabel">{yLabel}</div>}
      {W > w ? <div className="q-chart-scroll" tabIndex={-1}>{body}</div> : body}
      <SrTable
        caption={ariaLabel}
        columns={[t('chart.col.category'), ...ser.map((s) => s.name + (unit ? ` (${unit})` : ''))]}
        rows={data.map((d, i) => [d.label, ...vals[i].map(fv)])}
      />
      <Live text={live} />
    </div>
  )
}

export type HBarRow = {
  label: string
  value: number | null
  color?: string
  /** Texto de la columna de valor cuando no hay valor. Default “No comparable”. */
  missing?: string
  reason?: string
}

export type HBarChartProps = {
  rows: HBarRow[]
  color?: string
  unit?: string
  decimals?: number
  labelWidth?: number
  valueWidth?: number
  pitch?: number
  activeIndex?: number
  ariaLabel: string
  axisLabel?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Barras horizontales para nombres largos. Un valor nulo muestra texto, nunca una barra en cero. */
export function HBarChart({
  rows, color = 'violet', unit, decimals, labelWidth = 180, valueWidth = 96, pitch = 40, activeIndex, ariaLabel, axisLabel, className, style,
}: HBarChartProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const [ref, w] = useElementWidth<HTMLDivElement>(720)
  const narrow = w < 480
  const max = Math.max(0, ...rows.map((r) => r.value).filter((v): v is number => v != null))
  const { top, ticks } = niceTicks(max, 4)
  const { active, set, ring, bind } = useInspect(rows.length, activeIndex)
  const shown = useReveal()
  const cols = narrow ? `minmax(0,1fr) ${valueWidth}px` : `${labelWidth}px minmax(0,1fr) ${valueWidth}px`
  const missingText = (r: HBarRow) => r.missing || t('chart.noComparable')
  const act = active != null ? rows[active] : undefined
  const live = act ? `${act.label}: ${act.value == null ? missingText(act) : fmt(act.value, decimals) + (unit ? ` ${unit}` : '')}` : ''
  const ext = (pitch - 14) / 2

  return (
    <div ref={ref} className={cx('q-chart', className)} style={style}>
      <div {...bind} role="group" aria-roledescription={t('chart.role.hbar')} aria-label={ariaLabel} className={cx('q-chart-hbars', ring && 'is-ring')}>
        {rows.map((r, i) => {
          const on = active === i
          const dim = active != null && !on
          const miss = r.value == null
          return (
            <div
              key={i}
              className={cx('q-chart-hbar-row', narrow && 'is-narrow', on && 'is-on')}
              onMouseEnter={() => set(i)}
              onMouseLeave={() => set(null)}
              style={{ gridTemplateColumns: cols, minHeight: narrow ? pitch + 14 : pitch }}
            >
              <span className="q-chart-hbar-label" title={r.label}>{r.label}</span>
              <span className="q-chart-hbar-track">
                {ticks.map((tk) => (
                  <span key={tk} aria-hidden="true" className={cx('q-chart-vrule', tk === 0 && 'is-base')} style={{ top: -ext, bottom: -ext, left: `${(tk / top) * 100}%` }} />
                ))}
                {miss || r.value == null
                  ? <span className="q-chart-meta q-chart-hbar-reason">{r.reason || t('chart.noComparableValue')}</span>
                  : (
                    <span
                      aria-hidden="true"
                      className={cx('q-chart-hbar', shown && 'is-shown', on && 'is-on', dim && 'is-dim')}
                      style={{ width: `${(r.value / top) * 100}%`, background: chartColor(r.color || color) }}
                    />
                  )}
              </span>
              <span className={cx('q-chart-hbar-value', miss ? 'is-missing' : 'q-chart-value')}>
                {miss ? missingText(r) : fmt(r.value, decimals)}
                {!miss && unit && <span className="q-chart-meta q-chart-unit">{unit}</span>}
              </span>
            </div>
          )
        })}
        <div aria-hidden="true" className="q-chart-hbar-axis" style={{ gridTemplateColumns: cols }}>
          {!narrow && <span />}
          <span className="q-chart-hbar-ticks">
            {ticks.map((tk) => (
              <span
                key={tk}
                className="q-chart-axis"
                style={{ left: `${(tk / top) * 100}%`, transform: tk === 0 ? 'none' : tk === top ? 'translateX(-100%)' : 'translateX(-50%)' }}
              >
                {fmt(tk, decimals)}
              </span>
            ))}
          </span>
          <span className="q-chart-axis q-chart-hbar-axislabel">{axisLabel}</span>
        </div>
      </div>
      <SrTable
        caption={ariaLabel}
        columns={[t('chart.col.category'), t('chart.col.value') + (unit ? ` (${unit})` : '')]}
        rows={rows.map((r) => [r.label, r.value == null ? missingText(r) : fmt(r.value, decimals)])}
      />
      <Live text={live} />
    </div>
  )
}
