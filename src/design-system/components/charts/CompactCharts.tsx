import { useEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { ChartTooltip } from './ChartTooltip'
import { Live, SrTable, chartColor, sharePct, useChartFormat, useInspect } from './shared'

export type CompactSegment = {
  label: string
  value: number
  /** Nombre Colorfield; mantener el mismo mapeo categoría → color entre tiles. */
  color?: string
}

type TileProps = {
  title: ReactNode
  label?: string
  children: ReactNode
  bind?: HTMLAttributes<HTMLDivElement>
  ring?: boolean
  className?: string
  style?: CSSProperties
}

/** Tile analítico compartido: padding 16, radio 8, superficie, sin borde ni sombra. */
function Tile({ title, label, children, bind, ring, className, style }: TileProps) {
  return (
    <section aria-label={label ?? (typeof title === 'string' ? title : undefined)} className={cx('q-chart-tile', className)} style={style}>
      <h3 className="q-chart-tile-title">{title}</h3>
      <div {...bind} role="group" className={cx('q-chart-tile-body', ring && 'is-ring')}>{children}</div>
    </section>
  )
}

const Dot = ({ color }: { color: string }) => <span aria-hidden="true" className="q-chart-dot-key" style={{ background: color }} />

export type CompactDonutProps = {
  title?: string
  segments: CompactSegment[]
  centerIndex?: number
  centerLabel?: string
  caption?: ReactNode
  unitLabel?: string
  activeIndex?: number
  className?: string
  style?: CSSProperties
}

/** Patrón A — anillo compacto Ø112 + leyenda analítica (porcentajes por resto mayor). */
export function CompactDonut({ title, segments, centerIndex = 0, centerLabel, caption, unitLabel, activeIndex, className, style }: CompactDonutProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const ttl = title ?? t('chart.compact.donutTitle')
  const D = 112
  const TH = 17
  const r = (D - TH) / 2
  const C = 2 * Math.PI * r
  const GAP = (C * 2) / 360
  const total = segments.reduce((a, s) => a + (s.value || 0), 0)
  const pct = sharePct(segments.map((s) => s.value))
  const { active, set, ring, bind } = useInspect(segments.length, activeIndex)
  const ci = active ?? centerIndex
  const cs = segments[ci]
  const n = segments.filter((s) => s.value > 0).length
  let cum = 0
  return (
    <Tile title={ttl} className={className} style={style} ring={ring} bind={{ ...bind, 'aria-roledescription': t('chart.role.donut'), 'aria-label': ttl }}>
      <div className="q-chart-cdonut">
        <div className="q-chart-cdonut-ring" style={{ width: D, height: D }}>
          <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`} aria-hidden="true" className="q-chart-donut-svg">
            <circle cx={D / 2} cy={D / 2} r={r} fill="none" stroke="var(--color-surface-elevated)" strokeWidth={TH} />
            {segments.map((s, i) => {
              const len = ((s.value || 0) / Math.max(1, total)) * C
              const off = cum
              cum += len
              if (!len) return null
              return (
                <circle
                  key={i}
                  cx={D / 2}
                  cy={D / 2}
                  r={r}
                  fill="none"
                  stroke={chartColor(s.color, i)}
                  strokeWidth={TH}
                  onMouseEnter={() => set(i)}
                  onMouseLeave={() => set(null)}
                  className={cx('q-chart-cdonut-seg', active != null && active !== i && 'is-dim')}
                  style={{ strokeDasharray: `${Math.max(0.5, len - (n > 1 ? GAP : 0))} ${C}`, strokeDashoffset: -off }}
                />
              )
            })}
          </svg>
          <div aria-hidden="true" className="q-chart-cdonut-center" style={{ inset: TH + 4 }}>
            <span className="q-chart-cdonut-value">{cs ? `${pct[ci]}%` : '—'}</span>
            <span className="q-chart-cdonut-label">{active != null ? cs?.label : (centerLabel ?? cs?.label)}</span>
          </div>
        </div>
        <ul className="q-chart-cdonut-legend">
          {segments.map((s, i) => {
            const on = active === i
            const c = chartColor(s.color, i)
            return (
              <li key={i} className={cx('q-chart-cdonut-item', on && 'is-on', active != null && !on && 'is-dim')} onMouseEnter={() => set(i)} onMouseLeave={() => set(null)}>
                <span className="q-chart-cdonut-key">
                  <Dot color={c} />
                  <span className="q-chart-cdonut-name">{s.label}</span>
                  <span className="q-chart-cdonut-count">{fmt(s.value)}</span>
                </span>
                <span aria-hidden="true" className="q-chart-cdonut-track"><span style={{ width: `${pct[i]}%`, background: c }} /></span>
              </li>
            )
          })}
        </ul>
      </div>
      {caption && <p className="q-chart-tile-caption">{caption}</p>}
      <SrTable
        caption={ttl}
        columns={[t('chart.col.category'), t('chart.col.count'), t('chart.col.share')]}
        rows={segments.map((s, i) => [s.label, fmt(s.value), `${pct[i]}%`])}
      />
      <Live text={active != null && cs ? `${cs.label}: ${fmt(cs.value)} ${unitLabel ?? t('chart.compact.unitLabel')}, ${pct[ci]}%` : ''} />
    </Tile>
  )
}

/** Alias de CompactDonut (entrada del archivo de referencia). */
export const CompactCharts = CompactDonut

export type SegmentedDistributionProps = {
  title?: string
  /** Default: suma de las categorías. */
  value?: ReactNode
  unit?: string
  categories: CompactSegment[]
  decimals?: number
  activeIndex?: number
  className?: string
  style?: CSSProperties
}

/** Patrón B — total destacado + barra segmentada de 9px (huecos de 4px, sin pista). */
export function SegmentedDistribution({ title, value, unit, categories, decimals = 0, activeIndex, className, style }: SegmentedDistributionProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const ttl = title ?? t('chart.compact.segmentedTitle')
  const [ref, w] = useElementWidth<HTMLDivElement>(360)
  const total = categories.reduce((a, c) => a + (c.value || 0), 0)
  const pct = sharePct(categories.map((c) => c.value))
  const { active, set, ring, bind } = useInspect(categories.length, activeIndex)
  const visible = categories.filter((c) => c.value > 0).length
  const GAP = 4
  const usable = Math.max(0, w - GAP * (visible - 1))
  let x = 0
  const pos = categories.map((c) => {
    const ww = ((c.value || 0) / Math.max(1, total)) * usable
    const p = { x, w: ww }
    if (c.value > 0) x += ww + GAP
    return p
  })
  const act = active != null ? categories[active] : undefined
  const u = unit ? ` ${unit}` : ''
  return (
    <Tile title={ttl} className={className} style={style} ring={ring} bind={{ ...bind, 'aria-roledescription': t('chart.role.segmented'), 'aria-label': ttl }}>
      <span className="q-chart-tile-figure">
        <span className="q-chart-tile-number">{value ?? fmt(total, decimals)}</span>
        {unit && <span className="q-chart-tile-unit">{unit}</span>}
      </span>
      <div className="q-chart-seg">
        <ul className="q-chart-seg-cats" style={{ gridTemplateColumns: `repeat(${categories.length},minmax(0,1fr))` }}>
          {categories.map((c, i) => {
            const on = active === i
            return (
              <li key={i} className={cx('q-chart-seg-cat', on && 'is-on', active != null && !on && 'is-dim')} onMouseEnter={() => set(i)} onMouseLeave={() => set(null)}>
                <span className="q-chart-seg-key"><Dot color={chartColor(c.color, i)} /><span className="q-chart-seg-name">{c.label}</span></span>
                <span className="q-chart-seg-pct">{`${pct[i]}%`}</span>
              </li>
            )
          })}
        </ul>
        <div ref={ref} className="q-chart-seg-bar">
          {categories.map((c, i) => c.value > 0 && (
            <span
              key={i}
              aria-hidden="true"
              onMouseEnter={() => set(i)}
              onMouseLeave={() => set(null)}
              className={cx('q-chart-seg-part', active === i && 'is-on', active != null && active !== i && 'is-dim')}
              style={{ left: pos[i].x, width: Math.max(2, pos[i].w), background: chartColor(c.color, i) }}
            />
          ))}
          {act && active != null && (
            <ChartTooltip
              x={pos[active].x + pos[active].w / 2}
              y={-2}
              bounds={w}
              title={act.label}
              rows={[{ value: fmt(act.value, decimals), unit, color: false }]}
              context={t('chart.compact.ofTotal', { pct: pct[active] })}
            />
          )}
        </div>
      </div>
      <SrTable
        caption={ttl}
        columns={[t('chart.col.category'), t('chart.col.value'), t('chart.col.share')]}
        rows={categories.map((c, i) => [c.label, fmt(c.value, decimals) + u, `${pct[i]}%`])}
      />
      <Live text={act && active != null ? `${act.label}: ${fmt(act.value, decimals)}${u}, ${pct[active]}%` : ''} />
    </Tile>
  )
}

export type RadialGaugeProps = {
  title?: string
  /** Porcentaje 0–100, o un conteo cuando se da `total`. */
  value: number
  total?: number
  descriptor?: string
  color?: string
  segments?: number
  /** Solo para una escala con sentido. */
  startLabel?: string
  endLabel?: string
  caption?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Patrón C — medidor radial de 28 segmentos (180°). Activos = round(% / 100 × segmentos); activación secuencial ≤ 420ms. */
export function RadialGauge({ title, value = 0, total, descriptor, color = 'mint', segments = 28, startLabel, endLabel, caption, className, style }: RadialGaugeProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const ttl = title ?? t('chart.compact.gaugeTitle')
  const desc = descriptor ?? t('chart.compact.gaugeDescriptor')
  const p = total ? Math.max(0, Math.min(100, (value / total) * 100)) : Math.max(0, Math.min(100, value))
  const shown = Math.round(p)
  const on = Math.round((p / 100) * segments)
  const prev = useRef(on)
  const from = prev.current
  useEffect(() => { prev.current = on }, [on])
  const W = 190
  const cx0 = 95
  const cy = 82
  const R1 = 58
  const R2 = 72
  const CAPR = 2.5
  const step = Math.max(0, (420 - 140) / Math.max(1, Math.abs(on - from)))
  const ofTotal = total != null ? t('chart.compact.countOf', { value: fmt(value), total: fmt(total) }) : null
  const segs = Array.from({ length: segments }, (_, i) => {
    const th = Math.PI - ((i + 0.5) * Math.PI) / segments
    const c = Math.cos(th)
    const s = Math.sin(th)
    const a = R1 + CAPR
    const b = R2 - CAPR
    const d = on >= from ? Math.max(0, i - from) : Math.max(0, from - 1 - i)
    const moving = i >= Math.min(on, from) && i < Math.max(on, from)
    return (
      <line
        key={i}
        x1={cx0 + a * c}
        y1={cy - a * s}
        x2={cx0 + b * c}
        y2={cy - b * s}
        strokeWidth={5}
        strokeLinecap="round"
        className="q-chart-gauge-seg"
        style={{ stroke: i < on ? chartColor(color) : 'var(--color-surface-elevated)', transitionDelay: `${moving ? d * step : 0}ms` }}
      />
    )
  })
  return (
    <section aria-label={ttl} className={cx('q-chart-tile', className)} style={style}>
      <h3 className="q-chart-tile-title">{ttl}</h3>
      <div role="img" aria-label={`${ttl}: ${shown}% ${desc.toLowerCase()}${ofTotal ? ` (${ofTotal})` : ''}`} className="q-chart-gauge" style={{ width: W }}>
        <svg width={W} height={110} viewBox={`0 0 ${W} 110`} aria-hidden="true">{segs}</svg>
        <div aria-hidden="true" className="q-chart-gauge-center" style={{ left: cx0 - 50, top: cy - 34 }}>
          <span className="q-chart-gauge-value">{`${shown}%`}</span>
          <span className="q-chart-gauge-desc">{desc}</span>
        </div>
        {(startLabel || endLabel) && (
          <div aria-hidden="true" className="q-chart-gauge-ends" style={{ top: cy + 8, left: cx0 - R2, width: R2 * 2 }}>
            <span style={{ width: R2 - R1 }}>{startLabel}</span>
            <span style={{ width: R2 - R1 }}>{endLabel}</span>
          </div>
        )}
      </div>
      {caption && <p className="q-chart-tile-caption is-gauge">{caption}</p>}
    </section>
  )
}

export type CompactBarsProps = {
  title: string
  value: ReactNode
  unit?: string
  comparison?: ReactNode
  data: { label: string, short?: string, value: number | null, color?: string }[]
  color?: string
  height?: number
  activeIndex?: number
  className?: string
  style?: CSSProperties
}

/** Tile de barras compactas: valor clave Outfit 28 + barras de 64px (≤ 18 de ancho). */
export function CompactBars({ title, value, unit, comparison, data, color = 'mint', height = 64, activeIndex, className, style }: CompactBarsProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const [ref, w] = useElementWidth<HTMLDivElement>(320)
  const max = Math.max(1, ...data.map((d) => d.value || 0))
  const { active, set, ring, bind } = useInspect(data.length, activeIndex)
  const n = data.length
  const gw = w / Math.max(1, n)
  const bw = Math.max(6, Math.min(18, gw - 10))
  const act = active != null ? data[active] : undefined
  const fv = (v: number | null) => (v == null ? t('chart.noData') : fmt(v))
  return (
    <Tile title={title} className={className} style={style} ring={ring} bind={{ ...bind, 'aria-roledescription': t('chart.role.compactBars'), 'aria-label': title }}>
      <span className="q-chart-tile-figure is-wrap">
        <span className="q-chart-tile-number">{value}</span>
        {unit && <span className="q-chart-tile-unit">{unit}</span>}
      </span>
      {comparison && <span className="q-chart-tile-caption is-comparison">{comparison}</span>}
      <div className="q-chart-cbars">
        <div ref={ref} className="q-chart-cbars-plot" style={{ height }}>
          {data.map((d, i) => (
            <div key={i} className="q-chart-cbars-slot" onMouseEnter={() => set(i)} onMouseLeave={() => set(null)}>
              <span
                aria-hidden="true"
                className={cx('q-chart-cbar', active != null && active !== i && 'is-dim')}
                style={{ width: bw, height: d.value == null ? 0 : Math.max(2, (d.value / max) * height), background: chartColor(d.color || color) }}
              />
            </div>
          ))}
          {act && active != null && (
            <ChartTooltip
              x={gw * (active + 0.5)}
              y={height - ((act.value || 0) / max) * height}
              bounds={w}
              title={act.label}
              rows={[{ value: fv(act.value), unit: act.value == null ? null : unit, color: false }]}
            />
          )}
        </div>
        <div aria-hidden="true" className="q-chart-cbars-x">
          {data.map((d, i) => <span key={i} className={cx(active === i && 'is-on')}>{d.short || d.label}</span>)}
        </div>
      </div>
      <SrTable caption={title} columns={[t('chart.col.period'), t('chart.col.value')]} rows={data.map((d) => [d.label, fv(d.value)])} />
      <Live text={act ? `${act.label}: ${act.value == null ? t('chart.noData') : fmt(act.value) + (unit ? ` ${unit}` : '')}` : ''} />
    </Tile>
  )
}
