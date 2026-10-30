import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { ChartTooltip } from './ChartTooltip'
import { Live, SrTable, axisWidth, chartColor, niceTicks, useChartFormat, useInspect, useReveal } from './shared'

export type LinePeriod = string | { label: string, short?: string, context?: ReactNode }
export type LineSeries = {
  name: string
  color?: string
  /** null = periodo sin dato; la línea se corta, nunca interpola. */
  values: (number | null)[]
  /** Principal 2.5px, secundaria 2px. Default: la primera serie es principal. */
  primary?: boolean
  dim?: boolean
}

export type LineChartProps = {
  periods: LinePeriod[]
  series: LineSeries[]
  area?: boolean
  height?: number
  yLabel?: ReactNode
  unit?: string
  decimals?: number
  /** Marcadores visibles. Default: solo con ≤ 8 periodos. */
  markers?: boolean
  activeIndex?: number
  minPlotWidth?: number
  ariaLabel: string
  context?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Líneas (y área) sobre escala desde cero. Periodos sin ningún dato muestran una banda “Sin datos”. */
export function LineChart({
  periods, series, area = false, height = 240, yLabel, unit, decimals, markers, activeIndex, minPlotWidth, ariaLabel, context, className, style,
}: LineChartProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const [ref, w] = useElementWidth<HTMLDivElement>(720)
  const H = height
  const n = periods.length
  const P = periods.map((p) => (typeof p === 'string' ? { label: p } as Exclude<LinePeriod, string> : p))
  const max = Math.max(0, ...series.flatMap((s) => s.values.filter((v): v is number => v != null)))
  const { top, ticks } = niceTicks(max, 4)
  const AX = axisWidth(ticks.map((tk) => fmt(tk, decimals)))
  const W = Math.max(w, minPlotWidth ? minPlotWidth + AX + 16 : 0)
  const plotW = Math.max(40, W - AX - 16)
  const pad = 12
  const step = n > 1 ? (plotW - 2 * pad) / (n - 1) : 0
  const X = (i: number) => pad + i * step
  const Y = (v: number) => 16 + H - (v / top) * H
  const showMarkers = markers ?? n <= 8
  const labelStep = Math.max(1, Math.ceil(44 / Math.max(1, step)))
  const { active, set, ring, bind } = useInspect(n, activeIndex)
  const shown = useReveal()

  const segs = (s: LineSeries) => {
    const out: [number, number][][] = []
    let cur: [number, number][] = []
    s.values.forEach((v, i) => {
      if (v == null) { if (cur.length) out.push(cur); cur = [] } else cur.push([X(i), Y(v)])
    })
    if (cur.length) out.push(cur)
    return out
  }
  const gaps = P.map((_, i) => series.every((s) => s.values[i] == null))
  const move = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    set(Math.max(0, Math.min(n - 1, Math.round((e.clientX - r.left - pad) / Math.max(1, step)))))
  }
  const fv = (v: number | null | undefined) => (v == null ? t('chart.noData') : fmt(v, decimals))
  const live = active != null && P[active] ? `${P[active].label}: ${series.map((s) => `${s.name} ${fv(s.values[active])}`).join(', ')}` : ''
  const tipY = active != null
    ? Math.min(...series.map((s) => s.values[active]).filter((v): v is number => v != null).map(Y).concat([16 + H * 0.4]))
    : 0

  const body = (
    <div className="q-chart-body" style={{ width: W }}>
      <div className="q-chart-grid" style={{ gridTemplateColumns: `${AX}px minmax(0,1fr)` }}>
        <div className="q-chart-yaxis" style={{ height: H + 16 }}>
          {ticks.map((tk) => <span key={tk} className="q-chart-axis is-y-top" style={{ top: Y(tk) }}>{fmt(tk, decimals)}</span>)}
        </div>
        <div
          {...bind}
          onMouseMove={move}
          role="group"
          aria-roledescription={t('chart.role.line')}
          aria-label={ariaLabel}
          className={cx('q-chart-plot', ring && 'is-ring')}
          style={{ height: H + 16 }}
        >
          {gaps.map((g, i) => g && (
            <span key={i} aria-hidden="true" className="q-chart-gap" style={{ left: X(i) - step / 2, width: step }}>
              <span className="q-chart-meta">{t('chart.noData')}</span>
            </span>
          ))}
          <svg width={plotW} height={H + 16} className="q-chart-svg" aria-hidden="true">
            {ticks.map((tk) => (
              <line key={tk} x1={0} x2={plotW} y1={Y(tk)} y2={Y(tk)} stroke={tk === 0 ? 'var(--chart-baseline)' : 'var(--chart-grid)'} strokeWidth={1} shapeRendering="crispEdges" />
            ))}
            {series.map((s, j) => {
              const c = chartColor(s.color, j)
              const sw = s.primary === false || (s.primary == null && j > 0) ? 2 : 2.5
              const parts = segs(s)
              return (
                <g key={j}>
                  {area && parts.map((sg, q) => sg.length > 1 && (
                    <path
                      key={`a${q}`}
                      d={`M${sg[0][0]},${16 + H}${sg.map((p) => ` L${p[0]},${p[1]}`).join('')} L${sg[sg.length - 1][0]},${16 + H} Z`}
                      fill={c}
                      className={cx('q-chart-area', shown && 'is-shown')}
                    />
                  ))}
                  {parts.map((sg, q) => (sg.length > 1
                    ? (
                      <path
                        key={q}
                        d={sg.map((p, m) => `${m ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')}
                        pathLength={1}
                        fill="none"
                        stroke={c}
                        strokeWidth={sw}
                        strokeLinejoin="round"
                        strokeLinecap="round"
                        className={cx('q-chart-line', shown && 'is-shown')}
                        style={{ opacity: active != null && s.dim ? 0.5 : 1 }}
                      />
                    )
                    : <circle key={q} cx={sg[0][0]} cy={sg[0][1]} r={2.5} fill={c} />))}
                </g>
              )
            })}
          </svg>
          <span
            aria-hidden="true"
            className="q-chart-guide"
            style={{ transform: `translateX(${active != null ? X(active) : 0}px)`, opacity: active != null ? 1 : 0 }}
          />
          {series.map((s, j) => s.values.map((v, i) => {
            if (v == null) return null
            const on = active === i
            if (!on && !showMarkers) return null
            return (
              <span
                key={`${j}-${i}`}
                aria-hidden="true"
                className={cx('q-chart-marker', on && 'is-on')}
                style={{ left: X(i), top: Y(v), background: chartColor(s.color, j) }}
              />
            )
          }))}
        </div>
      </div>
      <div aria-hidden="true" className="q-chart-xaxis is-positioned" style={{ marginLeft: AX }}>
        {P.map((p, i) => (i % labelStep === 0 || active === i) && (
          <span
            key={i}
            className={cx('q-chart-axis', 'is-period', active === i && 'is-on')}
            style={{
              left: X(i),
              transform: i === 0 ? `translateX(-${pad}px)` : i === n - 1 ? `translateX(calc(-100% + ${pad}px))` : 'translateX(-50%)',
            }}
          >
            {p.short || p.label}
          </span>
        ))}
      </div>
      {active != null && P[active] && (
        <ChartTooltip
          x={AX + X(active)}
          y={tipY}
          bounds={W}
          title={P[active].label}
          context={P[active].context || context}
          rows={series.map((s, j) => ({ label: s.name, color: s.color ?? j, value: fv(s.values[active]), unit: s.values[active] == null ? null : unit }))}
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
        columns={[t('chart.col.period'), ...series.map((s) => s.name)]}
        rows={P.map((p, i) => [p.label, ...series.map((s) => fv(s.values[i]))])}
      />
      <Live text={live} />
    </div>
  )
}
