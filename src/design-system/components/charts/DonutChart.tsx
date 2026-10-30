import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { ChartLegend } from './ChartTooltip'
import { Live, SrTable, chartColor, useChartFormat, useInspect } from './shared'

export type DonutSegment = { label: string, value: number, color?: string }

export type DonutChartProps = {
  /** Partes de un todo con sentido; los segmentos no se solapan. */
  segments: DonutSegment[]
  size?: 'standard' | 'compact'
  centerLabel?: string
  activeIndex?: number
  ariaLabel: string
  legend?: boolean
  className?: string
  style?: CSSProperties
}

/** Anillo Ø220/22 (compacto Ø148/16), separación 2px. Al inspeccionar, el centro muestra valor y proporción. */
export function DonutChart({ segments, size = 'standard', centerLabel, activeIndex, ariaLabel, legend = true, className, style }: DonutChartProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const [ref, w] = useElementWidth<HTMLDivElement>(560)
  const compact = size === 'compact'
  const D = compact ? 148 : 220
  const T = compact ? 16 : 22
  const r = (D - T) / 2
  const C = 2 * Math.PI * r
  const total = segments.reduce((a, s) => a + (s.value || 0), 0)
  const gap = segments.filter((s) => s.value > 0).length > 1 ? 2 : 0
  const { active, set, ring, bind } = useInspect(segments.length, activeIndex)
  const pct = (v: number) => (total ? `${fmt((v / total) * 100, 0)}%` : '—')
  const below = w < D + 220
  const act = active != null ? segments[active] : undefined
  let cum = 0

  return (
    <div ref={ref} className={cx('q-chart', className)} style={style}>
      <div className={cx('q-chart-donut-layout', below && 'is-below')}>
        <div
          {...bind}
          role="group"
          aria-roledescription={t('chart.role.donut')}
          aria-label={ariaLabel}
          className={cx('q-chart-donut', ring && 'is-ring')}
          style={{ width: D, height: D }}
        >
          <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`} className="q-chart-donut-svg" aria-hidden="true">
            <circle cx={D / 2} cy={D / 2} r={r} fill="none" stroke="var(--chart-grid)" strokeWidth={T} />
            {segments.map((s, i) => {
              const len = ((s.value || 0) / Math.max(1, total)) * C
              const off = cum
              cum += len
              if (!len) return null
              const on = active === i
              return (
                <circle
                  key={i}
                  cx={D / 2}
                  cy={D / 2}
                  r={r}
                  fill="none"
                  stroke={chartColor(s.color, i)}
                  strokeWidth={on ? T + 4 : T}
                  onMouseEnter={() => set(i)}
                  onMouseLeave={() => set(null)}
                  className={cx('q-chart-donut-seg', active != null && !on && 'is-dim')}
                  style={{ strokeDasharray: `${Math.max(0.5, len - gap)} ${C}`, strokeDashoffset: -off }}
                />
              )
            })}
          </svg>
          <div aria-hidden="true" className="q-chart-donut-center" style={{ inset: T + 6 }}>
            <span className={cx('q-chart-donut-value', compact && 'is-compact')}>{act ? fmt(act.value) : fmt(total)}</span>
            <span className="q-chart-donut-label" style={{ maxWidth: D - 2 * T - 24 }}>
              {act ? `${act.label} · ${pct(act.value)}` : (centerLabel ?? t('chart.total'))}
            </span>
          </div>
        </div>
        {legend && (
          <ChartLegend
            direction="column"
            showValues
            active={active}
            onActive={set}
            items={segments.map((s, i) => ({ label: s.label, color: s.color ?? i, value: fmt(s.value) }))}
            style={{ minWidth: 180 }}
          />
        )}
      </div>
      <SrTable
        caption={ariaLabel}
        columns={[t('chart.col.category'), t('chart.col.count'), t('chart.col.share')]}
        rows={segments.map((s) => [s.label, fmt(s.value), pct(s.value)])}
      />
      <Live text={act ? `${act.label}: ${fmt(act.value)}, ${pct(act.value)}` : ''} />
    </div>
  )
}
