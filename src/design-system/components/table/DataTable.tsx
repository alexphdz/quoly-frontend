import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'
import { Checkbox } from '../selection/Checkbox'
import { TableCell, type TableCellType } from './TableCell'
import {
  EmptyRegion, NoResultsRegion, RecoveryState, SkelBar, skeletonCell,
  type EmptyRegionProps, type NoResultsRegionProps, type RecoveryStateProps,
} from './TableStates'

export type DataTableColumn<R> = {
  key: string
  header?: ReactNode
  /** Etiqueta superior de agrupación; columnas consecutivas con el mismo grupo se unen. */
  group?: string
  /** Define alineación y esqueletos. money/number/actions alinean a la derecha. */
  type?: TableCellType | 'actions'
  align?: 'start' | 'end'
  width?: number
  minWidth?: number
  /** Se oculta por debajo de este ancho de contenedor (su dato debe seguir accesible en el detalle). */
  hideBelow?: number
  sortable?: boolean
  sortValue?: (row: R) => number | string | null | undefined
  /** Contenido; por defecto <TableCell type value={row[key]} />. En actions: acciones secundarias reveladas en hover/foco. */
  render?: (row: R) => ReactNode
  /** actions: acción principal del registro, siempre visible. */
  primary?: (row: R) => ReactNode
}

export type DataTableSort = { key: string, dir: 'asc' | 'desc' } | null

export type DataTableProps<R> = {
  columns: DataTableColumn<R>[]
  rows: R[]
  rowKey?: keyof R | ((row: R) => string)
  rowLabel?: (row: R) => string
  /** open (sin caja, reglas estructurales) · contained (superficie con borde). */
  variant?: 'open' | 'contained'
  density?: 'comfortable' | 'default' | 'compact'
  /** Fuerza el tratamiento interactivo (hover + trazo). Por defecto !!onRowClick || selectable. */
  interactive?: boolean
  selectable?: boolean
  selected?: string[]
  defaultSelected?: string[]
  onSelectedChange?: (ids: string[]) => void
  sort?: DataTableSort
  defaultSort?: DataTableSort
  onSortChange?: (sort: DataTableSort) => void
  /** El padre ordena las filas (servidor). */
  manualSort?: boolean
  onRowClick?: (row: R) => void
  state?: 'ready' | 'partial' | 'loading' | 'empty' | 'no-results' | 'error'
  skeletonRows?: number
  empty?: EmptyRegionProps
  noResults?: NoResultsRegionProps
  error?: RecoveryStateProps
  toolbar?: ReactNode
  footer?: ReactNode
  maxHeight?: number | string
  stickyHeader?: boolean
  stickyFirst?: boolean
  caption?: string
  className?: string
  style?: CSSProperties
}

const DENSITY = {
  comfortable: { y: 'var(--table-pad-y-comfortable)', x: 'var(--table-pad-x-comfortable)', lh: 20 },
  default: { y: 'var(--table-pad-y-default)', x: 'var(--table-pad-x-default)', lh: 20 },
  compact: { y: 'var(--table-pad-y-compact)', x: 'var(--table-pad-x-compact)', lh: 18 },
} as const

function isEnd<R>(c: DataTableColumn<R>) {
  return c.align === 'end' || (!c.align && (c.type === 'money' || c.type === 'number' || c.type === 'actions'))
}

/** Quoly Editorial Data Grid. */
export function DataTable<R>({
  columns: allColumns, rows, rowKey = 'id' as keyof R, rowLabel, variant = 'open', density = 'default', interactive,
  selectable = false, selected, defaultSelected = [], onSelectedChange, sort, defaultSort = null, onSortChange, manualSort = false,
  onRowClick, state = 'ready', skeletonRows = 5, empty, noResults, error, toolbar, footer, maxHeight, stickyHeader, stickyFirst,
  caption, className, style,
}: DataTableProps<R>) {
  const { t, i18n } = useTranslation('ds')
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(1200)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])

  const [innerSelected, setInnerSelected] = useState<string[]>(defaultSelected)
  const sel = selected ?? innerSelected
  const setSel = (next: string[]) => {
    if (!selected) setInnerSelected(next)
    onSelectedChange?.(next)
  }
  const [innerSort, setInnerSort] = useState<DataTableSort>(defaultSort)
  const currentSort = sort !== undefined ? sort : innerSort

  const columns = allColumns.filter((c) => !c.hideBelow || width >= c.hideBelow)
  const keyOf = (r: R) => (typeof rowKey === 'function' ? rowKey(r) : String(r[rowKey]))
  const labelOf = (r: R) => (rowLabel ? rowLabel(r) : keyOf(r))
  const cellOf = (c: DataTableColumn<R>, r: R) =>
    c.render ? c.render(r) : <TableCell type={c.type === 'actions' ? 'text' : c.type ?? 'text'} value={(r as Record<string, ReactNode>)[c.key]} />

  const cycleSort = (key: string) => {
    const next: DataTableSort = !currentSort || currentSort.key !== key
      ? { key, dir: 'asc' }
      : currentSort.dir === 'asc' ? { key, dir: 'desc' } : null
    if (sort === undefined) setInnerSort(next)
    onSortChange?.(next)
  }

  const collator = i18n.resolvedLanguage ?? 'es'
  const data = useMemo(() => {
    if (!currentSort || manualSort) return rows
    const col = allColumns.find((c) => c.key === currentSort.key)
    if (!col) return rows
    const get = (r: R) => (col.sortValue ? col.sortValue(r) : (r as Record<string, unknown>)[col.key])
    return [...rows].sort((a, b) => {
      const x = get(a)
      const y = get(b)
      if (x == null && y == null) return 0
      if (x == null) return 1
      if (y == null) return -1
      const cmp = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), collator)
      return currentSort.dir === 'asc' ? cmp : -cmp
    })
  }, [rows, currentSort, allColumns, manualSort, collator])

  const d = DENSITY[density]
  const tablet = width < 900
  const narrow = width < 640
  const padX = tablet && density !== 'compact' ? 'var(--table-pad-x-compact)' : d.x
  const isInteractive = interactive ?? (!!onRowClick || selectable)
  const traceIdx = isInteractive ? columns.findIndex((c) => c.type !== 'actions') : -1
  const sticky1 = stickyFirst ?? tablet
  const grouped = columns.some((c) => c.group)
  const stickyH = stickyHeader ?? !!maxHeight
  const open = variant === 'open'

  const ids = data.map(keyOf)
  const all = ids.length > 0 && ids.every((i) => sel.includes(i))
  const some = !all && ids.some((i) => sel.includes(i))
  const toggle = (id: string) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id])
  const toggleAll = () => setSel(all ? sel.filter((x) => !ids.includes(x)) : [...new Set([...sel, ...ids])])

  const minWidth = columns.reduce((s, c) => s + (c.width ?? c.minWidth ?? 120), selectable ? 44 : 0) + (isInteractive ? 36 : 0)
  const ready = state === 'ready' || state === 'partial'
  const colCount = columns.length + (selectable ? 1 : 0)
  const edgeL = (i: number) => open && !selectable && i === 0
  const edgeR = (i: number) => open && i === columns.length - 1
  const padding = (i: number, y: string | number): CSSProperties => {
    const l = edgeL(i) ? '0px' : padX
    const r = edgeR(i) ? '0px' : padX
    return { paddingTop: y, paddingBottom: y, paddingRight: r, paddingLeft: i === traceIdx ? `calc(${l} + var(--table-trace-gutter))` : l }
  }
  const traceLeft = (i: number) => (edgeL(i) ? 0 : padX)
  const traceTop = `calc(${d.y} + ${d.lh / 2 - 1}px)`

  const groups: Array<{ g: string, n: number, i: number }> = []
  if (grouped) {
    columns.forEach((c, i) => {
      const g = c.group ?? ''
      const last = groups[groups.length - 1]
      if (last && last.g === g) last.n++
      else groups.push({ g, n: 1, i })
    })
  }

  const message = () => {
    if (state === 'error') return <RecoveryState narrow={narrow} {...error} />
    if (state === 'no-results') return <NoResultsRegion narrow={narrow} {...noResults} />
    return <EmptyRegion narrow={narrow} {...empty} />
  }

  const selBox = (checked: boolean, label: string, onChange: () => void, indeterminate = false) => (
    <div className="q-table-select" onClick={(e) => e.stopPropagation()}>
      <Checkbox checked={checked} indeterminate={indeterminate} onChange={onChange} label={<span className="q-sr-only">{label}</span>} />
    </div>
  )

  const renderBody = () => {
    if (state === 'loading') {
      return Array.from({ length: skeletonRows }, (_, ri) => (
        <tr key={ri} className="q-table-row is-skeleton">
          {selectable && <td className="q-table-select-cell"><span className="q-table-select"><SkelBar w={16} h={16} /></span></td>}
          {columns.map((c, i) => <td key={c.key} style={padding(i, d.y)}>{skeletonCell(c.type, ri, i, isEnd(c))}</td>)}
        </tr>
      ))
    }
    if (!ready || !data.length) {
      return <tr><td colSpan={colCount} className="q-table-message">{message()}</td></tr>
    }
    return data.map((r) => {
      const id = keyOf(r)
      const on = selectable && sel.includes(id)
      return (
        <tr
          key={id}
          aria-selected={selectable ? on : undefined}
          tabIndex={onRowClick ? 0 : undefined}
          aria-label={onRowClick ? labelOf(r) : undefined}
          onClick={onRowClick ? () => onRowClick(r) : undefined}
          onKeyDown={onRowClick
            ? (e) => {
                if (e.key === 'Enter' && e.target === e.currentTarget) onRowClick(r)
              }
            : undefined}
          className={cx('q-table-row', on && 'is-selected', onRowClick && 'is-clickable')}
        >
          {selectable && <td className="q-table-select-cell is-sticky-select">{selBox(on, t('table.selectRow', { label: labelOf(r) }), () => toggle(id))}</td>}
          {columns.map((c, i) => (
            <td
              key={c.key}
              className={cx(isEnd(c) && 'is-end', i === 0 && sticky1 && 'is-sticky-first', i === traceIdx && 'has-trace')}
              style={{ ...padding(i, d.y), minWidth: c.minWidth }}
            >
              {i === traceIdx && (
                <>
                  <span aria-hidden="true" className="q-table-trace is-hover" style={{ left: traceLeft(i), top: traceTop }} />
                  <span aria-hidden="true" className="q-table-trace is-selected" style={{ left: traceLeft(i), top: traceTop }} />
                </>
              )}
              {c.type === 'actions'
                ? (
                    <div className="q-table-actions" onClick={(e) => e.stopPropagation()}>
                      {c.render && <span className="q-table-actions-secondary">{c.render(r)}</span>}
                      {c.primary && <span className="q-table-actions-primary">{c.primary(r)}</span>}
                    </div>
                  )
                : i === traceIdx
                  ? <span className="q-table-focus-target">{cellOf(c, r)}</span>
                  : cellOf(c, r)}
            </td>
          ))}
        </tr>
      )
    })
  }

  const headerTop = grouped ? 'var(--table-group-h)' : 0
  return (
    <div
      ref={ref}
      className={cx('q-table', `is-${variant}`, `is-${density}`, isInteractive && 'is-interactive', sticky1 && 'is-sticky-first', scrolled && 'is-scrolled', stickyH && 'is-sticky-header', selectable && 'is-selectable', footer && 'has-footer', className)}
      style={style}
    >
      {toolbar}
      <div className="q-table-scroll" onScroll={(e) => setScrolled(e.currentTarget.scrollLeft > 0)} style={{ maxHeight }}>
        <table aria-busy={state === 'loading' || undefined} style={{ minWidth }}>
          {caption && <caption className="q-sr-only">{caption}</caption>}
          <colgroup>
            {selectable && <col style={{ width: 44 }} />}
            {columns.map((c) => <col key={c.key} style={{ width: c.width }} />)}
          </colgroup>
          <thead>
            {grouped && (
              <tr className="q-table-group-row">
                {selectable && <th aria-hidden="true" className="q-table-select-cell" />}
                {groups.map((g, gi) => {
                  const l = edgeL(g.i) ? '0px' : padX
                  const r = edgeR(g.i + g.n - 1) ? '0px' : padX
                  return (
                    <th
                      key={gi}
                      colSpan={g.n}
                      scope={g.g ? 'colgroup' : undefined}
                      className="q-table-group"
                      style={{ padding: `12px ${r} 0 ${g.i === traceIdx ? `calc(${l} + var(--table-trace-gutter))` : l}` }}
                    >
                      {g.g && <div className="q-table-group-label">{g.g}</div>}
                    </th>
                  )
                })}
              </tr>
            )}
            <tr className="q-table-head-row">
              {selectable && (
                <th scope="col" className="q-table-select-cell is-sticky-select" style={{ top: headerTop }}>
                  {ready && data.length > 0 && selBox(all, t('table.selectAll'), toggleAll, some)}
                </th>
              )}
              {columns.map((c, i) => {
                const dir = currentSort && currentSort.key === c.key ? currentSort.dir : null
                return (
                  <th
                    key={c.key}
                    scope="col"
                    aria-sort={c.sortable ? (dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none') : undefined}
                    className={cx('q-table-th', isEnd(c) && 'is-end', i === 0 && sticky1 && 'is-sticky-first')}
                    style={{ ...padding(i, 0), minWidth: c.minWidth, top: headerTop }}
                  >
                    {c.type === 'actions'
                      ? <span className="q-sr-only">{c.header ?? t('table.actions')}</span>
                      : c.sortable
                        ? (
                            <button type="button" onClick={() => cycleSort(c.key)} className={cx('q-table-sort', dir && 'is-sorted', dir === 'asc' && 'is-asc', isEnd(c) && 'is-end')}>
                              <span className="q-table-sort-label">
                                {c.header}
                                <span aria-hidden="true" className="q-table-sort-line" />
                              </span>
                              <span aria-hidden="true" className="q-table-sort-icon"><Icon name={dir ? 'arrow-down' : 'caret-up-down'} size={14} /></span>
                              {dir && <span className="q-sr-only">{dir === 'asc' ? t('table.ascending') : t('table.descending')}</span>}
                            </button>
                          )
                        : c.header}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>{renderBody()}</tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}
