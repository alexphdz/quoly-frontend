import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { EmptySection } from '../structure/EmptySection'
import { ChartTooltip } from './ChartTooltip'
import { Live, SrTable, axisWidth, chartColor, niceTicks, useChartFormat, useInspect, useReveal } from './shared'

const quantile = (s: number[], p: number) => {
  const i = (s.length - 1) * p
  const lo = Math.floor(i)
  const hi = Math.ceil(i)
  return s[lo] + (s[hi] - s[lo]) * (i - lo)
}

export type DistributionChartProps = {
  /** Valores crudos; el histograma se calcula aquí. */
  values: (number | null)[]
  binWidth?: number
  start?: number
  unit?: string
  countLabel?: string
  color?: string
  height?: number
  showMedian?: boolean
  showQuartiles?: boolean
  /** Con menos valores se muestra una región vacía. Default 5. */
  minCount?: number
  activeIndex?: number
  ariaLabel: string
  emptyTitle?: string
  emptyText?: string
  className?: string
  style?: CSSProperties
}

/** Histograma compacto: intervalos [a, b) de binWidth; el último incluye el máximo. Mediana y cuartiles como guías discontinuas. */
export function DistributionChart({
  values, binWidth = 5, start, unit = '', countLabel, color = 'teal', height = 220, showMedian = true, showQuartiles = false, minCount = 5,
  activeIndex, ariaLabel, emptyTitle, emptyText, className, style,
}: DistributionChartProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const [ref, w] = useElementWidth<HTMLDivElement>(720)
  const v = values.filter((x): x is number => x != null && !Number.isNaN(x)).sort((a, b) => a - b)
  const ok = v.length >= minCount
  const s0 = start ?? (ok ? Math.floor(v[0] / binWidth) * binWidth : 0)
  const nb = ok ? Math.max(1, Math.floor((v[v.length - 1] - s0) / binWidth) + 1) : 0
  const bins = Array.from({ length: nb }, (_, i) => ({ a: s0 + i * binWidth, b: s0 + (i + 1) * binWidth, c: 0 }))
  v.forEach((x) => {
    const i = Math.min(nb - 1, Math.floor((x - s0) / binWidth))
    if (bins[i]) bins[i].c++
  })
  const maxC = Math.max(1, ...bins.map((b) => b.c))
  const { top, ticks } = niceTicks(maxC, Math.min(4, maxC))
  const AX = axisWidth(ticks.map(String), 20)
  const plotW = Math.max(40, w - AX - 16)
  const bw = plotW / Math.max(1, nb)
  const H = height
  const { active, set, ring, bind } = useInspect(nb, activeIndex)
  const shown = useReveal()
  const count = countLabel ?? t('chart.dist.records')

  if (!ok) {
    return (
      <div ref={ref} className={className} style={style}>
        <EmptySection dense title={emptyTitle ?? t('chart.dist.emptyTitle')} text={emptyText ?? t('chart.dist.emptyText', { min: minCount, count: v.length })} />
      </div>
    )
  }

  const end = s0 + nb * binWidth
  const xp = (x: number) => ((x - s0) / (end - s0)) * plotW
  const med = quantile(v, 0.5)
  const q1 = quantile(v, 0.25)
  const q3 = quantile(v, 0.75)
  const u = unit ? ` ${unit}` : ''
  const rng = (b: { a: number, b: number }) => `${fmt(b.a)}–${fmt(b.b)}${u}`
  const act = active != null ? bins[active] : undefined
  const labelStep = Math.max(1, Math.ceil(30 / bw))
  const guide = (x: number, label: string, strong?: boolean) => (
    <span aria-hidden="true" className={cx('q-chart-dist-guide', strong && 'is-strong')} style={{ left: xp(x) }}>
      <span className="q-chart-axis">{label}</span>
    </span>
  )

  return (
    <div ref={ref} className={cx('q-chart', className)} style={style}>
      <div className="q-chart-body">
        <div className="q-chart-grid" style={{ gridTemplateColumns: `${AX}px minmax(0,1fr)` }}>
          <div className="q-chart-yaxis" style={{ height: H + 16 }}>
            {ticks.map((tk) => <span key={tk} className="q-chart-axis is-y" style={{ bottom: (tk / top) * H }}>{fmt(tk)}</span>)}
          </div>
          <div
            {...bind}
            role="group"
            aria-roledescription={t('chart.role.histogram')}
            aria-label={ariaLabel}
            className={cx('q-chart-plot', ring && 'is-ring')}
            style={{ height: H + 16 }}
          >
            {ticks.map((tk) => <span key={tk} aria-hidden="true" className={cx('q-chart-rule', tk === 0 && 'is-base')} style={{ bottom: (tk / top) * H }} />)}
            <div className="q-chart-bars is-bins" style={{ height: H }}>
              {bins.map((b, i) => {
                const on = active === i
                return (
                  <div key={i} className="q-chart-bin" onMouseEnter={() => set(i)} onMouseLeave={() => set(null)}>
                    <span
                      aria-hidden="true"
                      className={cx('q-chart-bar', 'is-bin', shown && 'is-shown', on && 'is-on', active != null && !on && 'is-dim')}
                      style={{ height: (b.c / top) * H, background: chartColor(color) }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="q-chart-dist-guides">
              {showQuartiles && guide(q1, `Q1 · ${fmt(q1, 1)}`)}
              {showQuartiles && guide(q3, `Q3 · ${fmt(q3, 1)}`)}
              {showMedian && guide(med, `${t('chart.dist.median')} · ${fmt(med, 1)}${u}`, true)}
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="q-chart-xaxis is-positioned" style={{ marginLeft: AX }}>
          {[...bins.map((b) => b.a), end].map((a, i) => i % labelStep === 0 && (
            <span key={i} className="q-chart-axis is-tick" style={{ left: xp(a), transform: i === 0 ? 'none' : i === nb ? 'translateX(-100%)' : 'translateX(-50%)' }}>
              {fmt(a)}
            </span>
          ))}
        </div>
        {act && active != null && (
          <ChartTooltip
            x={AX + bw * (active + 0.5)}
            y={16 + H - (act.c / top) * H}
            bounds={w}
            title={rng(act)}
            rows={[{ value: fmt(act.c), unit: count, color: false }]}
            context={t('chart.dist.shareOf', { pct: fmt((act.c / v.length) * 100, 0), count: v.length })}
          />
        )}
      </div>
      <SrTable
        caption={t('chart.dist.caption', { caption: ariaLabel, value: fmt(med, 1) + u })}
        columns={[t('chart.col.interval'), t('chart.col.count')]}
        rows={bins.map((b) => [rng(b), fmt(b.c)])}
      />
      <Live text={act ? `${rng(act)}: ${act.c} ${count}` : ''} />
    </div>
  )
}
