import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { chartColor } from './shared'

export type ChartTooltipRow = {
  label?: ReactNode
  value: ReactNode
  unit?: ReactNode
  /** Nombre Colorfield, color CSS o índice de serie; false oculta la muestra. */
  color?: string | number | false | null
}

export type ChartTooltipProps = {
  /** Posición en px dentro del contenedor relativo de la gráfica. */
  x?: number
  y?: number
  /** Ancho del contenedor: el tooltip se ajusta a sus bordes. */
  bounds?: number
  title?: ReactNode
  rows?: ChartTooltipRow[]
  context?: ReactNode
  /** Render estático (documentación). */
  inline?: boolean
  style?: CSSProperties
}

function TooltipBody({ title, rows, context }: Pick<ChartTooltipProps, 'title' | 'rows' | 'context'>) {
  return (
    <>
      {title && <span className="q-chart-tip-title">{title}</span>}
      {rows?.map((r, i) => (
        <span key={i} className="q-chart-tip-row">
          {r.label && (
            <span className="q-chart-tip-label">
              {r.color !== false && r.color != null && <span aria-hidden="true" className="q-chart-swatch" style={{ background: chartColor(r.color) }} />}
              {r.label}
            </span>
          )}
          <span className="q-chart-tip-value">
            {r.value}
            {r.unit && <span className="q-chart-tip-unit">{r.unit}</span>}
          </span>
        </span>
      ))}
      {context && <span className="q-chart-tip-context">{context}</span>}
    </>
  )
}

/** Tooltip de gráfica: 10px sobre la marca, ajustado a los bordes; baja si no cabe arriba. */
export function ChartTooltip({ x = 0, y = 0, bounds, title, rows = [], context, inline = false, style }: ChartTooltipProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [sz, setSz] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (el && (el.offsetWidth !== sz.w || el.offsetHeight !== sz.h)) setSz({ w: el.offsetWidth, h: el.offsetHeight })
  }, [title, rows, context, sz.w, sz.h])
  if (inline) {
    return <div role="presentation" className="q-chart-tip" style={style}><TooltipBody title={title} rows={rows} context={context} /></div>
  }
  const left = bounds ? Math.max(0, Math.min(bounds - sz.w, x - sz.w / 2)) : x - sz.w / 2
  const below = y - sz.h - 10 < 0
  return (
    <div
      aria-hidden="true"
      className="q-chart-tip-anchor"
      style={{ left, top: below ? y + 14 : y - sz.h - 10, visibility: sz.w ? 'visible' : 'hidden', ...style }}
    >
      <div ref={ref} className="q-chart-tip is-floating"><TooltipBody title={title} rows={rows} context={context} /></div>
    </div>
  )
}

export type ChartLegendItem = { label: ReactNode, color?: string | number, value?: ReactNode, shape?: 'square' | 'line' }

export type ChartLegendProps = {
  items: ChartLegendItem[]
  direction?: 'row' | 'column'
  active?: number | null
  onActive?: (i: number | null) => void
  showValues?: boolean
  className?: string
  style?: CSSProperties
}

/** Leyenda: muestra 8px, Inter 12. Énfasis en hover si se pasa onActive; no alterna series. */
export function ChartLegend({ items, direction = 'row', active, onActive, showValues, className, style }: ChartLegendProps) {
  const { t } = useTranslation('ds')
  return (
    <ul aria-label={t('chart.legend')} className={cx('q-chart-legend', `is-${direction}`, showValues && 'has-values', className)} style={style}>
      {items.map((it, i) => (
        <li
          key={i}
          className={cx('q-chart-legend-item', active != null && active !== i && 'is-dim')}
          onMouseEnter={onActive ? () => onActive(i) : undefined}
          onMouseLeave={onActive ? () => onActive(null) : undefined}
        >
          <span className="q-chart-legend-key">
            <span aria-hidden="true" className={cx('q-chart-swatch', it.shape === 'line' && 'is-line')} style={{ background: chartColor(it.color, i) }} />
            <span>{it.label}</span>
          </span>
          {showValues && it.value != null && <span className="q-chart-legend-value">{it.value}</span>}
        </li>
      ))}
    </ul>
  )
}
