import type { CSSProperties, ReactNode } from 'react'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'

export type ChartHeaderProps = {
  context?: ReactNode
  title: ReactNode
  description?: ReactNode
  /** Estadístico real, no el mayor valor graficado. */
  value?: ReactNode
  unit?: ReactNode
  comparison?: ReactNode
  as?: 'h2' | 'h3' | 'h4'
  /** Separación con la gráfica. Default 24. */
  gap?: number
  className?: string
  style?: CSSProperties
}

/** Encabezado de gráfica con valor analítico. < 520px el valor baja bajo el título. */
export function ChartHeader({ context, title, description, value, unit, comparison, as: H = 'h3', gap = 24, className, style }: ChartHeaderProps) {
  const [ref, w] = useElementWidth<HTMLElement>(800)
  return (
    <header ref={ref} className={cx('q-chart-header', w < 520 && 'is-narrow', className)} style={{ marginBottom: gap, ...style }}>
      <div className="q-chart-header-main">
        {context && <span className="q-chart-header-context">{context}</span>}
        <H className="q-chart-header-title">{title}</H>
        {description && <p className="q-chart-header-desc">{description}</p>}
      </div>
      {value != null && (
        <div className="q-chart-header-value">
          <span className="q-chart-header-figure">
            <span className="q-chart-header-number">{value}</span>
            {unit && <span className="q-chart-header-unit">{unit}</span>}
          </span>
          {comparison && <span className="q-chart-header-comparison">{comparison}</span>}
        </div>
      )}
    </header>
  )
}
