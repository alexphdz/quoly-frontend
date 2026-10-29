import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { TextButton } from '../actions/TextButton'
import { Icon, type IconName } from '../core/Icon'
import { EmptySection } from '../structure/EmptySection'
import { NoResultsRegion, RecoveryState } from '../table/TableStates'
import { useChartFormat } from './shared'

const HB = [0.46, 0.72, 0.58, 0.88, 0.64, 0.4, 0.78, 0.52, 0.68, 0.44]

type Shape = 'bar' | 'line' | 'donut' | 'hbar'

/** Marcadores neutros que conservan la geometría de la gráfica. */
function ChartLoading({ shape, height }: { shape: Shape, height: number }) {
  const [ref, w] = useElementWidth<HTMLDivElement>(600)
  const n = Math.max(4, Math.min(10, Math.floor(w / 64)))
  if (shape === 'donut') {
    return (
      <div ref={ref} className="q-chart-load-donut">
        <span className="q-chart-ph q-chart-load-ring" />
        <span className="q-chart-load-lines">{[120, 96, 140, 80].map((x, i) => <span key={i} className="q-chart-ph is-text" style={{ width: x }} />)}</span>
      </div>
    )
  }
  if (shape === 'hbar') {
    return (
      <div ref={ref} className="q-chart-load-hbars">
        {[0.8, 0.62, 0.92, 0.5].map((x, i) => (
          <div key={i} className="q-chart-load-hbar">
            <span className="q-chart-ph is-text" style={{ width: 120 + (i % 2) * 30 }} />
            <span className="q-chart-ph is-hbar" style={{ width: `${x * 100}%` }} />
            <span className="q-chart-ph is-text is-end" style={{ width: 56 }} />
          </div>
        ))}
      </div>
    )
  }
  const cols = shape === 'line' ? 8 : n
  return (
    <div ref={ref} className="q-chart-load">
      <div className="q-chart-load-y" style={{ height: height + 16 }}>
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className="q-chart-ph is-tick" style={{ bottom: (i * height) / 4 - 4 }} />)}
      </div>
      <div className="q-chart-load-plot" style={{ height: height + 16 }}>
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className={cx('q-chart-rule', i === 0 && 'is-base')} style={{ bottom: (i * height) / 4 }} />)}
        {shape === 'line'
          ? (
            <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="q-chart-load-line">
              <polyline
                points={HB.slice(0, 8).map((h, i) => `${(i * 100) / 7},${height - h * height * 0.8}`).join(' ')}
                fill="none"
                stroke="var(--chart-placeholder)"
                strokeWidth="2.5"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )
          : (
            <div className="q-chart-load-bars" style={{ height }}>
              {Array.from({ length: n }, (_, i) => <span key={i}><span className="q-chart-ph is-bar" style={{ height: HB[i % HB.length] * height }} /></span>)}
            </div>
          )}
      </div>
      <span />
      <div className="q-chart-load-x">
        {Array.from({ length: cols }, (_, i) => <span key={i}><span className="q-chart-ph is-xtick" /></span>)}
      </div>
    </div>
  )
}

export type ChartStateProps = {
  state?: 'loading' | 'empty' | 'noresults' | 'error'
  /** Geometría del placeholder de carga. */
  shape?: Shape
  height?: number
  title?: string
  text?: string
  action?: ReactNode
  onRetry?: () => Promise<unknown> | void
  onClear?: () => void
  clearLabel?: string
  narrow?: boolean
  className?: string
  style?: CSSProperties
}

/** Estados de gráfica: carga (geometría neutra), vacío, sin resultados y error con reintento. Datos parciales → la gráfica + ChartNote. */
export function ChartState({ state = 'loading', shape = 'bar', height = 240, title, text, action, onRetry, onClear, clearLabel, narrow, className, style }: ChartStateProps) {
  const { t } = useTranslation('ds')
  let body: ReactNode
  if (state === 'loading') {
    body = <div role="status" aria-label={t('chart.state.loading')}><ChartLoading shape={shape} height={height} /></div>
  } else if (state === 'empty') {
    body = <EmptySection title={title ?? t('chart.state.emptyTitle')} text={text ?? t('chart.state.emptyText')} action={action} />
  } else if (state === 'noresults') {
    body = (
      <NoResultsRegion
        label={t('chart.state.noResultsLabel')}
        title={title ?? t('chart.state.noResultsTitle')}
        text={text ?? t('chart.state.noResultsText')}
        onClear={onClear}
        clearLabel={clearLabel ?? t('chart.state.clear')}
        narrow={narrow}
      />
    )
  } else {
    body = (
      <RecoveryState
        label={t('chart.state.errorLabel')}
        title={title ?? t('chart.state.errorTitle')}
        text={text ?? t('chart.state.errorText')}
        onRetry={onRetry}
        retryLabel={t('chart.state.retry')}
        narrow={narrow}
      />
    )
  }
  return <div className={cx('q-chart', className)} style={style}>{body}</div>
}

/** Nota explicativa bajo la gráfica (datos parciales, base de la escala). */
export function ChartNote({ children, icon = 'info', className, style }: { children: ReactNode, icon?: IconName, className?: string, style?: CSSProperties }) {
  return (
    <p className={cx('q-chart-note', className)} style={style}>
      <span className="q-chart-note-icon"><Icon name={icon} size={14} /></span>
      <span>{children}</span>
    </p>
  )
}

export type ChartDataTableProps = {
  caption: string
  columns: string[]
  rows: (string | number | null)[][]
  defaultOpen?: boolean
  className?: string
  style?: CSSProperties
}

/** Alternativa tabular visible: acción “Ver como tabla” + tabla simple. */
export function ChartDataTable({ caption, columns, rows, defaultOpen = false, className, style }: ChartDataTableProps) {
  const { t } = useTranslation('ds')
  const fmt = useChartFormat()
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <div className={cx('q-chart-datatable', className)} style={style}>
      <TextButton icon={open ? 'eye-slash' : 'eye'} aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        {open ? t('chart.table.hide') : t('chart.table.show')}
      </TextButton>
      {open && (
        <div id={id} className="q-chart-datatable-wrap">
          <table>
            <caption className="q-chart-meta">{caption}</caption>
            <thead><tr>{columns.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {r.map((v, j) => (j
                    ? <td key={j}>{typeof v === 'number' ? fmt(v) : (v ?? '—')}</td>
                    : <th key={j} scope="row">{v}</th>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
