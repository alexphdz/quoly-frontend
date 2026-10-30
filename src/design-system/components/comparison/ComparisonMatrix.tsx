import { Fragment, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { IconButton } from '../actions/IconButton'
import { TextButton } from '../actions/TextButton'
import { Select } from '../inputs/Select'
import { EvidencePanel, type EvidencePanelProps } from '../intelligence/EvidenceReference'
import { CommercialException, CommercialExceptionDetail, type CommercialExceptionProps } from './CommercialException'
import { ComparisonEvidenceLink, type ComparisonEvidence } from './ComparisonEvidenceLink'
import { PriceDifference } from './PriceDifference'
import { CmpStatus, useAmount, type ReviewStatus } from './shared'
import { SupplierComparisonHeader, type SupplierComparisonHeaderProps } from './SupplierComparisonHeader'

export type ComparisonRowType = 'price' | 'diff' | 'qty' | 'lead' | 'incoterm' | 'terms' | 'text' | 'review' | 'evidence'

export type ComparisonException = Omit<CommercialExceptionProps, 'onDetail' | 'expanded' | 'controls' | 'className' | 'style'> & {
  title?: string
  description?: ReactNode
  related?: Array<[ReactNode, ReactNode]>
  unconfirmed?: boolean
}

export type ComparisonCell = {
  value?: ReactNode
  unit?: string
  detail?: ReactNode
  /** Fila price: precio normalizado (null = no comparable). */
  normalized?: { amount: number, currency: string, unit?: string } | null
  /** Fila price: precio original tal como lo cotizó el proveedor. */
  original?: ReactNode
  reason?: string
  /** Fila review. */
  status?: ReviewStatus
  exception?: ComparisonException
  evidence?: ComparisonEvidence
}

export type ComparisonRow = {
  key: string
  label: string
  detail?: string
  type: ComparisonRowType
  /** Fila diff: clave de la fila price de referencia. */
  of?: string
  cells?: Record<string, ComparisonCell | undefined>
}

export type ComparisonGroup = { key: string, title: string, rows: ComparisonRow[] }
export type ComparisonSupplier = Omit<SupplierComparisonHeaderProps, 'selected' | 'onSelect' | 'className' | 'style'> & { key: string }

/* `key` es identidad de React, no prop del encabezado: no se propaga con spread. */
function supplierProps({ key: _key, ...rest }: ComparisonSupplier) {
  return rest
}

export type ComparisonMatrixProps = {
  suppliers: ComparisonSupplier[]
  groups: ComparisonGroup[]
  /** Fuente original por proveedor (EvidencePanel). */
  sources?: Record<string, Omit<EvidencePanelProps, 'active' | 'activeLabel'>>
  selectedSupplier?: string | null
  defaultSelected?: string | null
  onSelectSupplier?: (key: string | null) => void
  /** Lo solicitado (cabecera del rail). */
  requested?: string
  label?: string
  /** Con altura máxima, los encabezados quedan fijos. */
  maxHeight?: number | string
  layout?: 'auto' | 'desktop' | 'mobile'
  /** Marca las cifras como datos de demostración. */
  demo?: boolean
  className?: string
  style?: CSSProperties
}

type Detail = { kind: 'exception' | 'evidence', supplier: string, row: string } | null

/** Matriz de comparación comercial: rail de atributos fijo + una columna por proveedor. Comparar no es ordenar ni adjudicar. */
export function ComparisonMatrix({
  suppliers, groups, sources, selectedSupplier, defaultSelected = null, onSelectSupplier, requested, label, maxHeight, layout = 'auto',
  demo = false, className, style,
}: ComparisonMatrixProps) {
  const { t } = useTranslation('ds')
  const fmt = useAmount()
  const [ref, width] = useElementWidth<HTMLDivElement>(1200)
  const mobile = layout === 'mobile' || (layout === 'auto' && width < 640)
  const [own, setOwn] = useState<string | null>(defaultSelected)
  const selected = selectedSupplier !== undefined ? selectedSupplier : own
  const pick = (key: string) => {
    const next = selected === key ? null : key
    setOwn(next)
    onSelectSupplier?.(next)
  }
  const [pair, setPair] = useState<[string | undefined, string | undefined]>([suppliers[0]?.key, suppliers[1]?.key])
  const [detail, setDetail] = useState<Detail>(null)
  const detailId = useId()
  const columns = mobile ? pair.map((k) => suppliers.find((s) => s.key === k)).filter((s): s is ComparisonSupplier => !!s) : suppliers

  const scroller = useRef<HTMLDivElement>(null)
  const [overflow, setOverflow] = useState({ left: false, right: false })
  const measure = () => {
    const el = scroller.current
    if (!el) return
    setOverflow({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 })
  }
  useEffect(measure, [width, columns.length, groups.length, mobile])

  const findRow = (key: string | undefined) => {
    for (const g of groups) for (const r of g.rows) if (r.key === key) return r
    return null
  }
  const sticky = maxHeight != null
  const isActive = (s: string, r: string) => detail?.supplier === s && detail.row === r
  const scrollable = overflow.left || overflow.right

  const missing = (
    <span className="q-cmp-missing">
      <span aria-label={t('qi.noValue')}>{'—'}</span>
      <span className="q-cmp-meta">{t('table.notProvided')}</span>
    </span>
  )

  const valueOf = (row: ComparisonRow, c: ComparisonCell | undefined): ReactNode => {
    if (!c) return missing
    if (row.type === 'price') {
      const n = c.normalized
      return (
        <span className="q-cmp-price">
          {n
            ? (
                <>
                  <span className="q-cmp-meta">{demo ? t('cmp.price.normalizedDemo') : t('cmp.price.normalized')}</span>
                  <span className="q-cmp-price-figure">
                    <span className="q-cmp-price-value">{fmt(n.amount)}</span>
                    <span className="q-cmp-price-currency">{n.currency}</span>
                    {n.unit && <span className="q-cmp-price-unit">{n.unit}</span>}
                  </span>
                </>
              )
            : (
                <>
                  <span className="q-cmp-meta">{t('cmp.price.noNormalized')}</span>
                  <span className="q-cmp-price-nc">{t('cmp.notComparable')}</span>
                </>
              )}
          <span className="q-cmp-price-original">
            {`${t('cmp.price.original')} `}
            <strong>{c.original}</strong>
          </span>
          {!n && c.reason && <span className="q-cmp-meta">{c.reason}</span>}
        </span>
      )
    }
    if (row.type === 'review') {
      return (
        <span className="q-cmp-value">
          <CmpStatus status={c.status} />
          {c.detail && <span className="q-cmp-meta">{c.detail}</span>}
        </span>
      )
    }
    if (row.type === 'evidence') return null
    if (c.value == null) return missing
    return (
      <span className="q-cmp-value">
        <span className={cx('q-cmp-value-text', `is-${row.type}`)}>
          {c.value}
          {c.unit && <span className="q-cmp-value-unit">{` ${c.unit}`}</span>}
        </span>
        {c.detail && <span className="q-cmp-meta">{c.detail}</span>}
      </span>
    )
  }

  const cell = (row: ComparisonRow, s: ComparisonSupplier, index: number) => {
    const c = row.cells?.[s.key]
    const active = isActive(s.key, row.key)
    let body: ReactNode
    if (row.type === 'diff') {
      const priceRow = findRow(row.of)
      const pc = priceRow?.cells?.[s.key]
      const set = suppliers.map((x) => priceRow?.cells?.[x.key]?.normalized?.amount)
      body = (
        <PriceDifference
          amount={pc?.normalized ? pc.normalized.amount : null}
          currency={pc?.normalized?.currency}
          unit={pc?.normalized?.unit}
          set={set}
          reason={pc && !pc.normalized ? t('cmp.price.noNormalizedReason') : undefined}
          showPrice={false}
        />
      )
    } else {
      body = valueOf(row, c)
    }
    return (
      <div
        role="cell"
        key={s.key}
        className={cx('q-cmp-cell', row.type === 'price' && 'is-price', active && 'is-active', mobile && 'is-mobile', (!mobile || index > 0) && 'has-rule')}
      >
        {body}
        {c?.exception && (
          <CommercialException
            {...c.exception}
            expanded={active && detail?.kind === 'exception'}
            controls={detailId}
            onDetail={() => setDetail(active && detail?.kind === 'exception' ? null : { kind: 'exception', supplier: s.key, row: row.key })}
          />
        )}
        {(c?.evidence || row.type === 'evidence') && (
          <ComparisonEvidenceLink
            evidence={c?.evidence}
            active={active && detail?.kind === 'evidence'}
            controls={detailId}
            onOpen={sources?.[s.key] ? () => setDetail({ kind: 'evidence', supplier: s.key, row: row.key }) : undefined}
          />
        )}
      </div>
    )
  }

  let detailNode: ReactNode = null
  if (detail) {
    const s = suppliers.find((x) => x.key === detail.supplier)
    const r = findRow(detail.row)
    const c = r?.cells?.[detail.supplier]
    if (detail.kind === 'exception' && c?.exception) {
      const e = c.exception
      detailNode = (
        <CommercialExceptionDetail
          id={detailId}
          title={e.title ?? e.text}
          description={e.description}
          related={e.related}
          unconfirmed={e.unconfirmed}
          onClose={() => setDetail(null)}
          evidence={c.evidence && sources?.[detail.supplier] && (
            <ComparisonEvidenceLink evidence={c.evidence} onOpen={() => setDetail({ kind: 'evidence', supplier: detail.supplier, row: detail.row })} />
          )}
        />
      )
    }
    if (detail.kind === 'evidence' && sources?.[detail.supplier]) {
      const passage = c?.evidence?.passage
      detailNode = (
        <div id={detailId} className="q-cmp-source">
          <div className="q-cmp-source-head">
            <span>{t('cmp.sourceOf', { supplier: s?.name ?? '' })}</span>
            <TextButton icon="x" onClick={() => setDetail(null)}>{t('actions.close')}</TextButton>
          </div>
          <EvidencePanel {...sources[detail.supplier]} active={passage} activeLabel={passage && r ? `${r.label} · ${s?.name ?? ''}` : undefined} />
        </div>
      )
    }
  }

  const tableLabel = label ?? t('cmp.matrix.label')
  return (
    <div ref={ref} className={cx('q-cmp-matrix', mobile && 'is-mobile', sticky && 'is-sticky', className)} style={style}>
      {mobile && suppliers.length > 2 && (
        <div className="q-cmp-pair">
          {[0, 1].map((i) => (
            <Select
              key={i}
              size="sm"
              optionalLabel=""
              label={t(i ? 'cmp.matrix.supplierB' : 'cmp.matrix.supplierA')}
              value={pair[i]}
              onChange={(e) => {
                const next: [string | undefined, string | undefined] = [...pair]
                next[i] = e.target.value
                setPair(next)
              }}
              options={suppliers.filter((s) => s.key !== pair[1 - i]).map((s) => ({ value: s.key, label: s.name }))}
            />
          ))}
        </div>
      )}
      <div
        ref={scroller}
        onScroll={measure}
        role="region"
        aria-label={scrollable ? t('cmp.matrix.scrollable', { label: tableLabel }) : tableLabel}
        tabIndex={scrollable ? 0 : undefined}
        className="q-cmp-scroll"
        style={{ maxHeight }}
      >
        <div
          role="table"
          aria-label={tableLabel}
          className="q-cmp-grid"
          style={mobile
            ? { gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }
            : { gridTemplateColumns: `var(--cmp-rail-w) repeat(${columns.length}, minmax(var(--cmp-col-w), 1fr))`, minWidth: `calc(var(--cmp-rail-w) + ${columns.length} * var(--cmp-col-w))` }}
        >
          <div role="row" className="q-cmp-row">
            {!mobile && (
              <div role="columnheader" className="q-cmp-corner">
                <span className="q-cmp-label">{t('cmp.matrix.requested')}</span>
                {requested && <span className="q-cmp-requested">{requested}</span>}
                {demo && <span className="q-cmp-meta q-cmp-demo">{t('cmp.matrix.demoData')}</span>}
              </div>
            )}
            {columns.map((s, i) => (
              <div role="columnheader" key={s.key} className={cx('q-cmp-colhead', (!mobile || i > 0) && 'has-rule')}>
                <SupplierComparisonHeader {...supplierProps(s)} selected={selected === s.key} onSelect={() => pick(s.key)} />
              </div>
            ))}
          </div>
          {groups.map((g) => (
            <Fragment key={g.key}>
              <div role="row" className="q-cmp-row">
                <div role="cell" aria-colspan={columns.length + 1} className="q-cmp-group">
                  <span>{g.title}</span>
                </div>
              </div>
              {g.rows.map((r) => (
                <div role="row" key={r.key} className="q-cmp-row">
                  <div role="rowheader" className={cx(mobile ? 'q-cmp-rowhead-mobile' : 'q-cmp-rail', r.type === 'price' && 'is-price')}>
                    <span className={cx('q-cmp-label', r.type === 'price' && 'is-strong')}>{r.label}</span>
                    {r.detail && <span className="q-cmp-meta">{r.detail}</span>}
                  </div>
                  {columns.map((s, i) => cell(r, s, i))}
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
      {scrollable && (
        <div className="q-cmp-scroll-hint">
          <span className="q-cmp-meta">{t('cmp.matrix.scrollHint', { count: suppliers.length })}</span>
          <div>
            <IconButton icon="caret-left" label={t('cmp.matrix.previous')} size="sm" disabled={!overflow.left} onClick={() => scroller.current?.scrollBy({ left: -248, behavior: 'smooth' })} />
            <IconButton icon="caret-right" label={t('cmp.matrix.next')} size="sm" disabled={!overflow.right} onClick={() => scroller.current?.scrollBy({ left: 248, behavior: 'smooth' })} />
          </div>
        </div>
      )}
      {mobile && suppliers.length > 2 && <span className="q-cmp-meta">{t('cmp.matrix.showingTwo', { count: suppliers.length })}</span>}
      {detailNode && <div className="q-cmp-detail">{detailNode}</div>}
    </div>
  )
}
