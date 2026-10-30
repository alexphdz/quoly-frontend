import { useMemo, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Chip, DataTable, IconButton, SearchInput, Select, Skeleton, StatusBadge, TextButton,
  type DataTableColumn, type IconName, type StatusTone,
} from '../design-system'
import { useElementWidth } from '../design-system/hooks'
import { useShellLayout } from '../components/layout/useShellLayout'
import { useAllQuotes } from '../hooks/useQuotes'
import { useFormat } from '../lib/format'
import { quoteHasPrice } from '../lib/quoteDisplay'
import { useUnitLabel } from '../lib/units'
import type { QuoteOverviewItem } from '../types/quote'

type Review = 'review' | 'confirmed' | 'partial' | 'rejected'
type ReviewFilter = 'all' | Review

const REVIEW: Record<Review, { tone: StatusTone, icon: IconName }> = {
  review: { tone: 'ai', icon: 'quoly-proposed' },
  confirmed: { tone: 'success', icon: 'check-circle' },
  partial: { tone: 'neutral', icon: 'circle-half' },
  rejected: { tone: 'neutral', icon: 'x-circle' },
}

/** Estado de revisión: sin precio = parcial (nunca entra a comparar); el resto según su estado. */
function reviewOf(q: QuoteOverviewItem): Review {
  if (q.status === 'rejected') return 'rejected'
  if (!quoteHasPrice(q)) return 'partial'
  return q.status === 'confirmed' ? 'confirmed' : 'review'
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const TABLE_STYLE = {
  '--table-bg': 'var(--color-canvas)',
  '--table-row-hover': 'var(--color-surface)',
  '--table-row-comfortable': '80px',
  '--table-pad-y-comfortable': '18px',
  '--table-pad-x-comfortable': '16px',
} as CSSProperties

/** 08 · Cotizaciones de todas las solicitudes. Encuentra trabajo pendiente; no compara ni rankea. */
export default function QuotationsPage() {
  const { t } = useTranslation('quotation')
  const fmt = useFormat()
  const units = useUnitLabel()
  const navigate = useNavigate()
  const layout = useShellLayout()
  const [contentRef, contentW] = useElementWidth<HTMLDivElement>(1248)
  const [params, setParams] = useSearchParams()
  const { data: quotes, isLoading, error, refetch } = useAllQuotes()

  const q = params.get('q') ?? ''
  const rfqId = params.get('request') ?? ''
  const rawReview = params.get('review')
  const review: ReviewFilter = rawReview === 'review' || rawReview === 'confirmed' || rawReview === 'partial' || rawReview === 'rejected' ? rawReview : 'all'
  const setParam = (key: string, value: string | null) => setParams(prev => {
    const next = new URLSearchParams(prev)
    if (value) next.set(key, value)
    else next.delete(key)
    return next
  }, { replace: true })

  const all = useMemo(() => {
    const order: Record<Review, number> = { review: 0, partial: 1, confirmed: 2, rejected: 3 }
    return [...(quotes ?? [])].sort((a, b) => order[reviewOf(a)] - order[reviewOf(b)] || b.created_at.localeCompare(a.created_at))
  }, [quotes])
  const requests = useMemo(() => {
    const byId = new Map<string, { value: string, label: string }>()
    for (const quote of all) byId.set(quote.rfq_id, { value: quote.rfq_id, label: quote.rfq_name })
    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label))
  }, [all])

  const total = all.length
  const toReview = all.filter(x => reviewOf(x) === 'review').length
  const nq = norm(q.trim())
  const scoped = all
    .filter(x => !rfqId || x.rfq_id === rfqId)
    .filter(x => !nq || norm(`${x.supplier_name} ${x.rfq_name} ${x.rfq_number ?? ''}`).includes(nq))
  const rows = review === 'all' ? scoped : scoped.filter(x => reviewOf(x) === review)
  const filtered = !!nq || !!rfqId || review !== 'all'
  const firstUse = !!quotes && total === 0
  const mobile = layout === 'mobile'
  const listView = mobile || contentW < 812
  const compact = contentW < 1090
  const tableState = isLoading ? 'loading' : error ? 'error' : firstUse ? 'empty' : rows.length === 0 ? 'no-results' : 'ready'
  const ready = tableState === 'ready'

  const clearSearch = () => setParam('q', null)
  const clearFilters = () => setParams(new URLSearchParams(), { replace: true })
  const openQuote = (x: QuoteOverviewItem) => navigate(`/quotes/${x.id}`)
  const openRequest = (x: QuoteOverviewItem) => navigate(`/rfqs/${x.rfq_id}`)

  const price = (x: QuoteOverviewItem) => {
    if (x.raw_price == null) return <span className="qt2-missing">{t('v2.notStated')}</span>
    const unit = x.raw_unit ? units.per(x.raw_unit) : ''
    return (
      <span className="qt2-price">
        {x.raw_currency && <span className="qt2-cur">{x.raw_currency}</span>}
        <span className="qt2-amount">{fmt.number(x.raw_price, { maximumFractionDigits: 4 })}</span>
        {unit && <span className="qt2-unit">{`/${unit}`}</span>}
      </span>
    )
  }
  const badge = (x: QuoteOverviewItem) => {
    const r = reviewOf(x)
    return <StatusBadge tone={REVIEW[r].tone} variant="quiet" icon={REVIEW[r].icon}>{t(`v2.review.${r}`)}</StatusBadge>
  }
  const supplierCell = (x: QuoteOverviewItem) => (
    <span className="rq2-identity">
      <span className="rq2-product">{x.supplier_name}</span>
      <span className="rq2-ref">{t('v2.received', { date: fmt.date(x.created_at, { day: 'numeric', month: 'short' }) })}</span>
    </span>
  )
  const requestCell = (x: QuoteOverviewItem) => (
    <span className="qt2-request">
      <span className="qt2-request-name">{x.rfq_name}</span>
      {x.rfq_number && <span className="rq2-ref">{x.rfq_number}</span>}
    </span>
  )

  const columns: DataTableColumn<QuoteOverviewItem>[] = [
    { key: 'supplier', header: t('v2.columns.supplier'), type: 'identity', minWidth: compact ? 180 : 220, render: supplierCell },
    { key: 'request', header: t('v2.columns.request'), type: 'text', minWidth: compact ? 180 : 240, render: requestCell },
    { key: 'price', header: t('v2.columns.price'), type: 'money', width: compact ? 140 : 168, render: price },
    { key: 'review', header: t('v2.columns.review'), type: 'status', width: compact ? 150 : 176, render: badge },
    {
      key: 'actions',
      header: t('v2.columns.actions'),
      type: 'actions',
      width: compact ? 96 : 176,
      primary: x => (compact
        ? (
          <span className="rq2-nowrap">
            <IconButton size="xs" icon="file-text" label={t('v2.viewQuoteAria', { name: x.supplier_name })} onClick={() => openQuote(x)} />
            <IconButton size="xs" icon="files" label={t('v2.viewRequestAria', { name: x.rfq_name })} onClick={() => openRequest(x)} />
          </span>
        )
        : <span className="rq2-nowrap"><TextButton size="sm" iconEnd="caret-right" className="rq2-cmp" onClick={() => openQuote(x)}>{t('v2.viewQuote')}</TextButton></span>),
      render: x => (compact ? null : <TextButton size="sm" onClick={() => openRequest(x)}>{t('v2.viewRequest')}</TextButton>),
    },
  ]

  const chips: { key: ReviewFilter, count: number }[] = [
    { key: 'all', count: scoped.length },
    ...(['review', 'confirmed', 'partial', 'rejected'] as Review[])
      .map(key => ({ key, count: scoped.filter(x => reviewOf(x) === key).length }))
      .filter(c => c.key !== 'rejected' || c.count > 0),
  ]

  return (
    <div className={`rq2-page is-${layout}`}>
      <div ref={contentRef} className="rq2-content">
        <header className="rq2-head">
          <div className="rq2-head-text">
            <h1 className="rq2-h1">{t('title')}</h1>
            <p className="rq2-lead">{t('v2.lead')}</p>
          </div>
        </header>

        {!firstUse && !error && (
          <div className="rq2-summary">
            <div className="rq2-summary-main">
              <span className="rq2-total">
                {isLoading ? <Skeleton shape="block" width="28px" height={40} /> : <span className="rq2-total-value">{total}</span>}
                <span className="rq2-muted">{t('v2.total', { count: total })}</span>
              </span>
              {!isLoading && toReview > 0 && (
                <span className="rq2-muted"><span className="qt2-review-count">{toReview}</span>{' '}{t('v2.toReview', { count: toReview })}</span>
              )}
            </div>
            <span aria-live="polite" className="rq2-muted rq2-showing">
              {ready && filtered ? t('v2.showing', { count: rows.length, total }) : ''}
            </span>
          </div>
        )}

        {!firstUse && (
          <div role="search" className="rq2-toolbar qt2-toolbar">
            <div className="rq2-search">
              <SearchInput value={q} onChange={e => setParam('q', e.target.value || null)} onClear={clearSearch} placeholder={t('v2.search')} aria-label={t('filters.searchLabel')} />
            </div>
            <div className="qt2-request-filter">
              <Select
                label={t('v2.requestFilter')}
                optionalLabel=""
                size="sm"
                value={rfqId}
                onChange={e => setParam('request', e.target.value || null)}
                options={[{ value: '', label: t('v2.allRequests') }, ...requests]}
              />
            </div>
            <div role="group" aria-label={t('filters.statusLabel')} className="rq2-chips qt2-chips">
              {chips.map(c => (
                <Chip key={c.key} selected={review === c.key} count={c.count} onClick={() => setParam('review', c.key === 'all' ? null : c.key)}>
                  {t(c.key === 'all' ? 'v2.all' : `v2.chip.${c.key}`)}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {(!listView || !ready) && (
          <div style={TABLE_STYLE}>
            <DataTable
              columns={columns}
              rows={rows}
              rowKey="id"
              rowLabel={x => t('v2.viewQuoteAria', { name: x.supplier_name })}
              density="comfortable"
              onRowClick={openQuote}
              state={tableState}
              skeletonRows={6}
              caption={t('title')}
              empty={{ label: t('v2.emptyLabel'), title: t('empty.title'), text: t('v2.emptyText') }}
              noResults={nq
                ? { label: t('v2.noResultsLabel'), title: t('v2.noSearchTitle'), text: t('v2.noSearchText'), onClear: clearSearch, clearLabel: t('v2.clearSearch') }
                : { label: t('v2.noResultsLabel'), title: t('v2.noFilterTitle'), text: t('v2.noFilterText'), onClear: clearFilters, clearLabel: t('filters.clear') }}
              error={{
                label: t('v2.errorLabel'),
                title: t('v2.errorTitle'),
                text: t('v2.errorText'),
                retryLabel: t('v2.retry'),
                onRetry: () => refetch(),
              }}
            />
          </div>
        )}

        {listView && ready && (
          <ul aria-label={t('title')} className="rq2-list">
            {rows.map(x => (
              <li key={x.id} className="rq2-list-item">
                <button type="button" className="rq2-card" aria-label={t('v2.viewQuoteAria', { name: x.supplier_name })} onClick={() => openQuote(x)}>
                  <span className="rq2-card-top">
                    {supplierCell(x)}
                    <span className="rq2-card-badge">{badge(x)}</span>
                  </span>
                  {requestCell(x)}
                  <span>{price(x)}</span>
                </button>
                <div className="rq2-card-cmp">
                  <TextButton size="sm" iconEnd="caret-right" onClick={() => openRequest(x)}>{t('v2.viewRequest')}</TextButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
