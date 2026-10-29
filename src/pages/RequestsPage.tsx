import { useMemo, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Button, Chip, DataTable, IconButton, SearchInput, Skeleton, StatusBadge, TextButton,
  type DataTableColumn, type IconName, type StatusTone,
} from '../design-system'
import { useElementWidth } from '../design-system/hooks'
import { useShellLayout } from '../components/layout/useShellLayout'
import { useRFQs } from '../hooks/useRFQs'
import { useFormat } from '../lib/format'
import { requestDestination } from '../lib/requestNav'
import { rfqListBucket, rfqSearchHaystack, type RfqListBucket } from '../lib/rfqDisplay'
import { useUnitLabel } from '../lib/units'
import type { RFQRead } from '../types/rfq'

type StatusFilter = 'all' | RfqListBucket

const STATUS: Record<RfqListBucket, { tone: StatusTone, icon: IconName }> = {
  draft: { tone: 'neutral', icon: 'note-pencil' },
  open: { tone: 'info', icon: 'paper-plane-tilt' },
  closed: { tone: 'neutral', icon: 'lock-simple' },
}

/* La tabla de la lista usa el lienzo como fondo y filas cómodas de 84px (ajuste local del prototipo; no cambia el DS). */
const TABLE_STYLE = {
  '--table-bg': 'var(--color-canvas)',
  '--table-row-hover': 'var(--color-surface)',
  '--table-row-comfortable': '84px',
  '--table-pad-y-comfortable': '21px',
  '--table-pad-x-comfortable': '16px',
} as CSSProperties

/** Minúsculas y sin acentos, para buscar sin distinguirlos. */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

const waitingOf = (rfq: RFQRead) => (rfqListBucket(rfq) === 'open' ? rfq.supplier_stage_counts?.buyer_action_required ?? 0 : 0)

export default function RequestsPage() {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const units = useUnitLabel()
  const navigate = useNavigate()
  const layout = useShellLayout()
  const [contentRef, contentW] = useElementWidth<HTMLDivElement>(1248)
  const [params, setParams] = useSearchParams()
  const { data: rfqs, isLoading, error, refetch } = useRFQs()

  const q = params.get('q') ?? ''
  const rawStatus = params.get('status')
  const status: StatusFilter = rawStatus === 'draft' || rawStatus === 'open' || rawStatus === 'closed' ? rawStatus : 'all'
  const attnOnly = params.get('attention') === '1'
  const setParam = (key: string, value: string | null) => setParams(prev => {
    const next = new URLSearchParams(prev)
    if (value) next.set(key, value)
    else next.delete(key)
    return next
  }, { replace: true })

  const all = useMemo(
    () => [...(rfqs ?? [])].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [rfqs],
  )
  const total = all.length
  const attnCount = all.filter(r => waitingOf(r) > 0).length
  const nq = norm(q.trim())
  const rows = all
    .filter(r => status === 'all' || rfqListBucket(r) === status)
    .filter(r => !attnOnly || waitingOf(r) > 0)
    .filter(r => !nq || norm(rfqSearchHaystack(r)).includes(nq))
  const filtered = status !== 'all' || attnOnly || !!nq
  const firstUse = !!rfqs && total === 0

  const mobile = layout === 'mobile'
  const listView = mobile || contentW < 812
  const compact = contentW < 1090
  const tableState = isLoading ? 'loading' : error ? 'error' : firstUse ? 'empty' : rows.length === 0 ? 'no-results' : 'ready'
  const ready = tableState === 'ready'

  const statusLabel = (r: RFQRead) => t(`solicitudes.status.${rfqListBucket(r)}`)
  const unitOf = (r: RFQRead) => (r.request_kind === 'commercial' ? units.count(r.base_unit) : r.base_unit)
  const openComparison = (r: RFQRead) => navigate(`/rfqs/${r.id}/comparison`)
  const goCreate = () => navigate('/rfqs/new')
  const clearSearch = () => setParam('q', null)
  const clearFilters = () => setParams(prev => {
    const next = new URLSearchParams(prev)
    next.delete('status')
    next.delete('attention')
    return next
  }, { replace: true })

  const attention = (r: RFQRead) => {
    const n = waitingOf(r)
    return n > 0
      ? (
        <span className="rq2-attn">
          <span className="rq2-attn-flag">{t('solicitudes.attention.required')}</span>
          <span className="rq2-attn-note">{t('solicitudes.attention.waiting', { count: n })}</span>
        </span>
      )
      : <span className="rq2-attn-none">{t('solicitudes.attention.none')}</span>
  }
  const badge = (r: RFQRead) => {
    const s = STATUS[rfqListBucket(r)]
    return <StatusBadge tone={s.tone} variant="quiet" icon={s.icon}>{statusLabel(r)}</StatusBadge>
  }

  const columns: DataTableColumn<RFQRead>[] = [
    {
      key: 'product',
      header: t('solicitudes.columns.request'),
      type: 'identity',
      minWidth: compact ? 200 : 240,
      render: r => (
        <span className="rq2-identity">
          <span className="rq2-product">{r.name}</span>
          {r.internal_reference && <span data-q-idsec="" className="rq2-ref">{r.internal_reference}</span>}
        </span>
      ),
    },
    { key: 'status', header: t('solicitudes.columns.status'), type: 'status', width: compact ? 112 : 136, render: badge },
    {
      key: 'qty',
      header: t('solicitudes.columns.quantity'),
      type: 'number',
      width: compact ? 116 : 148,
      render: r => (
        <span className="rq2-qty">
          <span className="rq2-qty-value">{fmt.number(r.quantity)}</span>
          <span className="rq2-unit">{unitOf(r)}</span>
        </span>
      ),
    },
    {
      key: 'quotes',
      header: t('solicitudes.columns.quotes'),
      type: 'number',
      width: compact ? 112 : 148,
      render: r => (
        <span className="rq2-quotes">
          <span className="rq2-quotes-value">{r.confirmed_count}</span>
          <span className="rq2-quotes-label">{t('solicitudes.inComparison')}</span>
        </span>
      ),
    },
    { key: 'attn', header: t('solicitudes.columns.attention'), type: 'text', width: compact ? 168 : 200, render: attention },
    {
      key: 'actions',
      header: t('solicitudes.columns.actions'),
      type: 'actions',
      width: compact ? 56 : 168,
      primary: r => {
        if (r.confirmed_count <= 0) return null
        return compact
          ? <IconButton size="xs" icon="columns" label={t('solicitudes.compareAria', { name: r.name })} onClick={() => openComparison(r)} />
          : (
            <span className="rq2-nowrap">
              <TextButton size="sm" iconEnd="caret-right" className="rq2-cmp" aria-label={t('solicitudes.compareAria', { name: r.name })} onClick={() => openComparison(r)}>
                {t('solicitudes.compare')}
              </TextButton>
            </span>
          )
      },
    },
  ]

  const chips: { key: StatusFilter, count: number }[] = [
    { key: 'all', count: total },
    { key: 'draft', count: all.filter(r => rfqListBucket(r) === 'draft').length },
    { key: 'open', count: all.filter(r => rfqListBucket(r) === 'open').length },
    { key: 'closed', count: all.filter(r => rfqListBucket(r) === 'closed').length },
  ]

  return (
    <div className={`rq2-page is-${layout}`}>
      <div ref={contentRef} className="rq2-content">
        <header className="rq2-head">
          <div className="rq2-head-text">
            <h1 className="rq2-h1">{t('solicitudes.title')}</h1>
            <p className="rq2-lead">{t('solicitudes.lead')}</p>
          </div>
          <div className="rq2-head-action">
            <Button icon="plus" onClick={goCreate}>{t('solicitudes.create')}</Button>
          </div>
        </header>

        {!firstUse && !error && (
          <div className="rq2-summary">
            <div className="rq2-summary-main">
              <span className="rq2-total">
                {isLoading ? <Skeleton shape="block" width="28px" height={40} /> : <span className="rq2-total-value">{total}</span>}
                <span className="rq2-muted">{t('solicitudes.summary.total', { count: total })}</span>
              </span>
              {!isLoading && attnCount > 0 && (
                <span className="rq2-muted">
                  <span className="rq2-attn-count">{attnCount}</span>
                  {' '}
                  {t('solicitudes.summary.attention', { count: attnCount })}
                </span>
              )}
            </div>
            <span aria-live="polite" className="rq2-muted rq2-showing">
              {ready && filtered ? t('solicitudes.summary.showing', { count: rows.length, total }) : ''}
            </span>
          </div>
        )}

        {!firstUse && (
          <div role="search" className="rq2-toolbar">
            <div className="rq2-search">
              <SearchInput
                value={q}
                onChange={e => setParam('q', e.target.value || null)}
                onClear={clearSearch}
                placeholder={t('solicitudes.search')}
                aria-label={t('solicitudes.searchLabel')}
              />
            </div>
            <div className="rq2-filters">
              <div role="group" aria-label={t('solicitudes.filterLabel')} className="rq2-chips">
                {chips.map(c => (
                  <Chip key={c.key} selected={status === c.key} count={c.count} onClick={() => setParam('status', c.key === 'all' ? null : c.key)}>
                    {t(`solicitudes.filters.${c.key}`)}
                  </Chip>
                ))}
              </div>
              <span aria-hidden="true" className="rq2-filter-rule" />
              <Chip selected={attnOnly} count={attnCount} onClick={() => setParam('attention', attnOnly ? null : '1')}>
                {t('solicitudes.filters.attention')}
              </Chip>
            </div>
          </div>
        )}

        {firstUse && <div className="rq2-gap" />}

        {(!listView || !ready) && (
          <div style={TABLE_STYLE} className="rq2-table">
            <DataTable
              columns={columns}
              rows={rows}
              rowKey="id"
              rowLabel={r => t('solicitudes.openAria', { name: r.name })}
              density="comfortable"
              onRowClick={r => navigate(requestDestination(r))}
              state={tableState}
              skeletonRows={6}
              caption={t('solicitudes.title')}
              empty={{
                label: t('solicitudes.empty.label'),
                title: t('solicitudes.empty.title'),
                text: t('solicitudes.empty.text'),
                action: <Button icon="plus" onClick={goCreate}>{t('solicitudes.create')}</Button>,
              }}
              noResults={nq
                ? { label: t('solicitudes.noResults.label'), title: t('solicitudes.noResults.searchTitle'), text: t('solicitudes.noResults.searchText'), onClear: clearSearch, clearLabel: t('solicitudes.noResults.clearSearch') }
                : { label: t('solicitudes.noResults.label'), title: t('solicitudes.noResults.filterTitle'), text: t('solicitudes.noResults.filterText'), onClear: clearFilters, clearLabel: t('solicitudes.noResults.clearFilters') }}
              error={{
                label: t('solicitudes.error.label'),
                title: t('solicitudes.error.title'),
                text: t('solicitudes.error.text'),
                retryLabel: t('solicitudes.error.retry'),
                pendingLabel: t('solicitudes.error.retrying'),
                onRetry: () => refetch(),
              }}
            />
          </div>
        )}

        {listView && ready && (
          <ul aria-label={t('solicitudes.title')} className="rq2-list">
            {rows.map(r => {
              const n = waitingOf(r)
              return (
                <li key={r.id} className="rq2-list-item">
                  <button type="button" className="rq2-card" aria-label={t('solicitudes.openStatusAria', { name: r.name, status: statusLabel(r) })} onClick={() => navigate(requestDestination(r))}>
                    <span className="rq2-card-top">
                      <span className="rq2-identity">
                        <span className="rq2-product">{r.name}</span>
                        {r.internal_reference && <span className="rq2-ref">{r.internal_reference}</span>}
                      </span>
                      <span className="rq2-card-badge">{badge(r)}</span>
                    </span>
                    <span className="rq2-card-figures">
                      <span className="rq2-qty">
                        <span className="rq2-qty-value">{fmt.number(r.quantity)}</span>
                        <span className="rq2-unit">{unitOf(r)}</span>
                      </span>
                      <span className="rq2-qty">
                        <span className="rq2-card-quotes">{r.confirmed_count}</span>
                        <span className="rq2-unit">{t('solicitudes.inComparison')}</span>
                      </span>
                    </span>
                    <span className="rq2-card-attn">
                      {n > 0
                        ? (
                          <>
                            <span className="rq2-attn-flag">{t('solicitudes.attention.required')}</span>
                            <span className="rq2-attn-note">{t('solicitudes.attention.waiting', { count: n })}</span>
                          </>
                        )
                        : <span className="rq2-attn-none">{t('solicitudes.attention.none')}</span>}
                    </span>
                  </button>
                  {r.confirmed_count > 0 && (
                    <div className="rq2-card-cmp">
                      <TextButton size="sm" iconEnd="caret-right" className="rq2-cmp" aria-label={t('solicitudes.compareAria', { name: r.name })} onClick={() => openComparison(r)}>
                        {t('solicitudes.compare')}
                      </TextButton>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
