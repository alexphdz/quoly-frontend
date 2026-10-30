import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormat } from '../../../lib/format'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'
import { StatusBadge, type StatusTone } from '../indicators/StatusBadge'

export type TableCellType = 'identity' | 'text' | 'money' | 'number' | 'date' | 'status'

export type TableCellProps = {
  type?: TableCellType
  value?: ReactNode
  secondary?: ReactNode
  currency?: string
  unit?: string
  decimals?: number
  /** money: peso 600 (por defecto). */
  highlight?: boolean
  tone?: 'soon' | 'overdue' | StatusTone
  note?: ReactNode
  /** status: text (por defecto) · icon (listas densas) · badge (excepcional). */
  prominence?: 'text' | 'icon' | 'badge'
  /** money: false = "No comparable" + motivo. */
  comparable?: boolean
  truncate?: boolean
  /** Motivo bajo "—" cuando falta el dato. */
  reason?: ReactNode
  missingLabel?: string
  compact?: boolean
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

function Missing({ primary, reason, label, end }: { primary: string, reason?: ReactNode, label?: string, end?: boolean }) {
  const dash = primary === '—'
  return (
    <span className={cx('q-cell-missing', end && 'is-end')}>
      <span aria-label={dash ? label ?? (typeof reason === 'string' ? reason : undefined) : undefined} className="q-cell-missing-value">{primary}</span>
      {reason && <span aria-hidden={dash && !label ? true : undefined} className="q-cell-reason">{reason}</span>}
    </span>
  )
}

/** Contenido tipado de celda. Dato ausente = "—" + motivo; nunca 0. */
export function TableCell({
  type = 'text', value, secondary, currency, unit, decimals, highlight = true, tone, note, prominence = 'text',
  comparable = true, truncate = false, reason, missingLabel, compact = false, children, className, style,
}: TableCellProps) {
  const { t } = useTranslation('ds')
  const { locale } = useFormat()
  const classes = cx('q-cell', `is-${type}`, compact && 'is-compact', className)
  const num = (v: number, d: number) => new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }).format(v)

  if (type === 'money' && !comparable) return <Missing primary={t('table.notComparable')} reason={reason} end />
  if (type !== 'status' && type !== 'identity' && value == null && children == null) {
    return <Missing primary="—" reason={reason ?? t('table.notProvided')} label={missingLabel} end={type === 'money' || type === 'number'} />
  }

  if (type === 'identity') {
    return (
      <span className={classes} style={style}>
        <span title={truncate && typeof value === 'string' ? value : undefined} className={cx('q-cell-name', truncate && 'is-truncate')}>{value ?? children}</span>
        {secondary && <span className="q-cell-id">{secondary}</span>}
      </span>
    )
  }

  if (type === 'money' || type === 'number') {
    const formatted = typeof value === 'number' ? num(value, decimals ?? (type === 'money' ? 2 : 0)) : value ?? children
    return (
      <span className={classes} style={style}>
        <span className="q-cell-figure">
          <span className={cx('q-cell-value', type === 'money' && highlight && 'is-strong')}>{formatted}</span>
          {type === 'money' && currency && <span className="q-cell-currency">{currency}</span>}
          {unit && <span className="q-cell-unit">{type === 'money' ? `/ ${unit}` : unit}</span>}
        </span>
        {secondary && <span className="q-cell-secondary">{secondary}</span>}
      </span>
    )
  }

  if (type === 'date') {
    const d = value instanceof Date ? value : typeof value === 'string' ? new Date(value.length === 10 ? `${value}T00:00:00` : value) : null
    const shown = d && !Number.isNaN(d.getTime())
      ? new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(d).replace('.', '')
      : value ?? children
    return (
      <span className={cx(classes, tone && `is-${tone}`)} style={style}>
        <span className="q-cell-date">{shown}</span>
        {note && (
          <span className="q-cell-note">
            {tone === 'overdue' && <Icon name="warning" size={12} weight="fill" />}
            {tone === 'soon' && <Icon name="clock" size={12} />}
            {note}
          </span>
        )}
      </span>
    )
  }

  if (type === 'status') {
    const text = value ?? children
    const statusTone: StatusTone = tone && tone !== 'soon' && tone !== 'overdue' ? tone : 'neutral'
    const head = prominence === 'badge'
      ? <StatusBadge tone={statusTone}>{text}</StatusBadge>
      : prominence === 'icon'
        ? <StatusBadge tone={statusTone} variant="quiet" className="q-cell-status-icon">{text}</StatusBadge>
        : <span className={cx('q-cell-status', `is-${statusTone}`)}>{text}</span>
    return (
      <span className={classes} style={style}>
        {head}
        {note && <span className="q-cell-reason">{note}</span>}
      </span>
    )
  }

  return (
    <span className={classes} style={style}>
      <span className="q-cell-text">{value ?? children}</span>
      {secondary && <span className="q-cell-secondary">{secondary}</span>}
    </span>
  )
}
