import { useId, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormat } from '../../../lib/format'
import { cx } from '../../utils'
import { IconButton } from '../actions/IconButton'
import { Select } from '../inputs/Select'

export type TablePaginationProps = {
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  pageSizeOptions?: number[]
  onPageSizeChange?: (size: number) => void
  /** Sustantivo tras el total (por defecto "resultados"). */
  itemLabel?: string
  variant?: 'open' | 'contained'
  divider?: boolean
  className?: string
  style?: CSSProperties
}

/** Pie de paginación: rango, filas por página y anterior/siguiente. */
export function TablePagination({
  page = 1, pageSize = 25, total = 0, onPageChange, pageSizeOptions, onPageSizeChange, itemLabel,
  variant = 'open', divider = true, className, style,
}: TablePaginationProps) {
  const { t } = useTranslation('ds')
  const { number } = useFormat()
  const id = useId()
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total ? (page - 1) * pageSize + 1 : 0
  const to = Math.min(total, page * pageSize)
  return (
    <nav aria-label={t('table.pagination')} className={cx('q-table-pagination', `is-${variant}`, divider && 'has-divider', className)} style={style}>
      <span className="q-table-pagination-range">
        <span className="q-table-pagination-strong">{`${number(from)}–${number(to)}`}</span>
        {` ${t('table.of')} ${number(total)} ${itemLabel ?? t('table.results')}`}
      </span>
      {pageSizeOptions && (
        <span className="q-table-pagination-size">
          <label htmlFor={id} className="q-table-pagination-text">{t('table.rowsPerPage')}</label>
          <Select
            id={id}
            size="xs"
            value={String(pageSize)}
            options={pageSizeOptions.map(String)}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            style={{ width: 72 }}
          />
        </span>
      )}
      <span className="q-table-pagination-pages">
        <span aria-live="polite" className="q-table-pagination-text">{t('table.pageOf', { page: number(page), pages: number(pages) })}</span>
        <IconButton size="xs" icon="caret-left" label={t('table.previousPage')} disabled={page <= 1} onClick={() => onPageChange?.(page - 1)} />
        <IconButton size="xs" icon="caret-right" label={t('table.nextPage')} disabled={page >= pages} onClick={() => onPageChange?.(page + 1)} />
      </span>
    </nav>
  )
}
