import { useMemo, useState } from 'react'
import { useParams, Link, Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useComparison, useCloseRfq } from '../hooks/useComparison'
import { useRFQ } from '../hooks/useRFQs'
import LineComparisonTable from '../components/comparison/LineComparisonTable'
import SpecQuickView from '../components/comparison/SpecQuickView'
import RecommendationCard from '../components/comparison/RecommendationCard'
import ReviewBeforeChoosing from '../components/comparison/ReviewBeforeChoosing'
import SupplierRanking from '../components/comparison/SupplierRanking'
import CostLineMatrix from '../components/comparison/CostLineMatrix'
import ExportComparisonDialog from '../components/comparison/ExportComparisonDialog'
import { useCmpFormat } from '../components/comparison/useCmpFormat'
import type { ComparisonResponse, ComparisonRow } from '../types/comparison'
import type { ApiError } from '../api/client'
import { buildComparisonModel } from '../lib/comparisonModel'
import { rfqDisplayNumber } from '../lib/rfqDisplay'
import { Breadcrumbs, Btn, ConfirmDialog, Empty, Icon, KeyFacts, Skel, type Fact } from '../components/ds'
import { RequestStatusChip } from '../components/ds/StatusChips'
import { Alert, toast } from '../components/ui'

export default function ComparisonPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const { t, i18n } = useTranslation(['comparison', 'common'])
  const comparisonLocale = i18n.resolvedLanguage === 'es' ? 'es' : 'en'
  const { data: comparison, isLoading, error } = useComparison(id!, comparisonLocale)
  const { data: rfq } = useRFQ(id!)

  if (rfq?.request_kind === 'commercial') return <Navigate to={`/rfqs/${id}?tab=comparison${location.search}`} replace />
  if (isLoading) return <ComparisonSkeleton />

  if (error) {
    const apiError = error as ApiError
    return (
      <div className="ds-page cmp-page">
        <Breadcrumbs backTo={`/rfqs/${id}`} items={[{ label: t('breadcrumb.rfqs'), to: '/' }, { label: rfq?.name ?? '…', to: `/rfqs/${id}` }, { label: t('breadcrumb.comparison') }]} />
        {apiError.status === 400 ? (
          <div className="qy-card">
            <Empty
              icon="balance"
              title={t('noConfirmed.title')}
              description={t('noConfirmed.description')}
              action={<Link to={`/rfqs/${id}`} className="ds-btn ds-btn-primary ds-btn-md">{t('noConfirmed.action')}</Link>}
            />
          </div>
        ) : (
          <Alert tone="error">{apiError.detail || t('loadFailed')}</Alert>
        )}
      </div>
    )
  }

  if (!comparison) return null
  return <ComparisonView
    id={id!}
    comparison={comparison}
    rfqName={rfq?.name}
    rfqStatus={rfq?.status}
    rfqNumber={rfq ? rfqDisplayNumber(rfq) : null}
    supplierCount={rfq?.supplier_count}
    quantity={rfq?.quantity}
    closedAt={rfq?.closed_at ?? null}
    closedReason={rfq?.closed_reason ?? null}
  />
}

function ComparisonView({
  id,
  comparison,
  rfqName,
  rfqStatus,
  rfqNumber,
  supplierCount,
  quantity,
  closedAt,
  closedReason,
}: {
  id: string
  comparison: ComparisonResponse
  rfqName?: string
  rfqStatus?: string
  rfqNumber: string | null
  supplierCount?: number
  quantity?: number
  closedAt?: string | null
  closedReason?: string | null
}) {
  const { t, i18n } = useTranslation(['comparison', 'common'])
  const comparisonLocale = i18n.resolvedLanguage === 'es' ? 'es' : 'en'
  const f = useCmpFormat(comparison.base_unit, comparison.base_currency)
  const model = useMemo(() => buildComparisonModel(comparison, quantity), [comparison, quantity])
  const closeRfq = useCloseRfq(id)
  const [searchParams, setSearchParams] = useSearchParams()
  const specRow = comparison.rows.find(row => row.quote_id === searchParams.get('spec'))
  const setSpecRow = (row: ComparisonRow | null) => {
    const next = new URLSearchParams(searchParams)
    if (row) next.set('spec', row.quote_id)
    else next.delete('spec')
    setSearchParams(next, { replace: true, preventScrollReset: true })
  }
  const [closeOpen, setCloseOpen] = useState(false)
  const [closeReason, setCloseReason] = useState('')
  const [exportOpen, setExportOpen] = useState(false)

  const allIn = comparison.ranking_basis === 'all_in'
  const closed = rfqStatus === 'decided' || !!closedAt
  const closedAtText = closedAt
    ? new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(closedAt))
    : null

  const rates = Object.entries(comparison.fx_rates ?? {})
  const fxLine = rates.length > 0 && comparison.fx_as_of
    ? t('cmp.table.footFx', {
      rates: rates.map(([cur, rate]) => `1 ${cur} = ${f.fmt.number(rate, { maximumFractionDigits: 4 })} ${comparison.base_currency}`).join(' · '),
      source: comparison.fx_source ?? '',
      date: f.fmt.date(comparison.fx_as_of),
    })
    : null

  const facts = useMemo(() => {
    const list: Fact[] = []
    list.push({
      icon: 'group',
      label: t('cmp.facts.included'),
      value: supplierCount ? t('cmp.facts.includedValue', { count: comparison.rows.length, total: supplierCount }) : comparison.rows.length,
    })
    const prices = model.rows.map(item => item.comparable).filter((value): value is number => value != null)
    if (prices.length > 0) {
      const low = Math.min(...prices)
      const high = Math.max(...prices)
      list.push({ icon: 'payments', label: t('cmp.facts.range'), value: low === high ? f.unitPrice(low) : `${f.fmt.unitNumber(low)} – ${f.unitPrice(high)}` })
    }
    const leads = model.rows.map(item => item.leadDays).filter((value): value is number => value != null)
    if (leads.length > 0) {
      const min = Math.min(...leads)
      const max = Math.max(...leads)
      list.push({ icon: 'inventory_2', label: t('cmp.facts.lead'), value: min === max ? t('cmp.facts.leadSingle', { count: min }) : t('cmp.facts.leadValue', { min, max }) })
    }
    if (model.quantity != null) {
      list.push({ icon: 'inventory_2', label: t('cmp.facts.quantity'), value: `${f.qty(model.quantity)} ${f.units}` })
    }
    if (rates.length > 0) {
      const [cur, rate] = rates[0]
      list.push({ icon: 'bar_chart', label: t('cmp.facts.fx'), value: `1 ${cur} = ${f.fmt.number(rate, { maximumFractionDigits: 2 })} ${comparison.base_currency}` })
    }
    return list
  }, [comparison, model, f, rates, supplierCount, t])

  const confirmClose = () => {
    closeRfq.mutate(closeReason.trim() || null, {
      onSuccess: () => {
        toast(t('redesign.closedToast'))
        setCloseOpen(false)
        setCloseReason('')
      },
      onError: err => toast((err as ApiError).detail || t('redesign.closeFailed'), 'error'),
    })
  }

  const title = rfqName ?? comparison.rfq_name
  const quantityText = model.quantity != null ? f.qty(model.quantity) : '—'

  return (
    <div className="ds-page cmp-page">
      <Breadcrumbs
        backTo={`/rfqs/${id}`}
        items={[{ label: t('breadcrumb.rfqs'), to: '/' }, { label: title, to: `/rfqs/${id}` }, { label: t('breadcrumb.comparison') }]}
      />

      <header className="cmp-head">
        <div className="cmp-title-row">
          <h1 className="ds-detail-title">{t('title')}</h1>
          {rfqStatus && <RequestStatusChip status={rfqStatus} />}
          {rfqNumber && <span className="ds-id" title={t('cmp.idPill')}>{rfqNumber}</span>}
        </div>
        <p className="cmp-basis">
          <span className="cmp-basis-name">{title}</span>
          <span aria-hidden> · </span>
          {t(allIn ? 'cmp.basisAllIn' : 'cmp.basis', { currency: comparison.base_currency, unit: f.unit, quantity: quantityText, units: f.units })}
        </p>
      </header>

      <KeyFacts facts={facts} label={t('cmp.facts.label')} />

      {closed && (
        <section className="qy-card cmp-closed" aria-label={t('redesign.closedTitle')}>
          <span className="cmp-closed-icon"><Icon name="check_circle" size={22} /></span>
          <div className="cmp-closed-copy">
            <h2>{t('redesign.closedTitle')}</h2>
            {closedAtText && <p>{t('redesign.closedAt', { date: closedAtText })}</p>}
            {closedReason && <blockquote>“{closedReason}”</blockquote>}
          </div>
          <Btn variant="primary" icon="download" onClick={() => setExportOpen(true)}>{t('redesign.exportExcel')}</Btn>
        </section>
      )}

      <RecommendationCard
        model={model}
        allIn={allIn}
        summary={comparison.summary}
        f={f}
        canSelect={false}
        onSelect={() => {}}
      />

      <ReviewBeforeChoosing issues={model.issues} f={f} />

      <SupplierRanking
        rfqId={id}
        model={model}
        f={f}
        allIn={allIn}
        fxLine={fxLine}
        canSelect={false}
        onSelect={() => {}}
        onViewSpec={setSpecRow}
      />

      <CostLineMatrix model={model} f={f} />

      {comparison.line_item_rows.length > 0 && (
        <LineComparisonTable rows={comparison.line_item_rows} ranking={comparison.line_item_ranking} baseCurrency={comparison.base_currency} />
      )}

      <section className="qy-card cmp-close-export" aria-labelledby="cmp-close-title">
        <h2 id="cmp-close-title">{t('redesign.closeExportTitle')}</h2>
        <p>{closed ? t('redesign.closeExportDoneIntro') : t('redesign.closeExportIntro')}</p>
        <div className="cmp-close-actions">
          <Btn variant="primary" icon="download" onClick={() => setExportOpen(true)}>{t('redesign.exportExcel')}</Btn>
          {!closed && <Btn variant="secondary" icon="check_circle" onClick={() => setCloseOpen(true)}>{t('redesign.closeRequest')}</Btn>}
        </div>
        <small>{t('redesign.closeExportFootnote')}</small>
      </section>

      {specRow && <SpecQuickView row={specRow} onClose={() => setSpecRow(null)} />}

      <ConfirmDialog
        open={closeOpen}
        onOpenChange={open => { if (!open) { setCloseOpen(false); setCloseReason('') } }}
        icon="check_circle"
        title={t('redesign.closeConfirmTitle')}
        consequence={t('redesign.closeConfirmDescription')}
        confirmLabel={t('redesign.closeConfirm')}
        loading={closeRfq.isPending}
        onConfirm={confirmClose}
      >
        <label className="field" style={{ marginTop: 16 }}>
          <span className="field-label">
            {t('redesign.closeReasonLabel')} <span className="font-normal">{t('common:field.optional')}</span>
          </span>
          <textarea
            className="input"
            rows={3}
            value={closeReason}
            onChange={event => setCloseReason(event.target.value)}
            placeholder={t('redesign.closeReasonPlaceholder')}
          />
        </label>
      </ConfirmDialog>

      <ExportComparisonDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        rfqId={id}
        locale={comparisonLocale}
        rows={comparison.rows.map(row => ({ quote_id: row.quote_id, supplier_name: row.supplier_name }))}
      />
    </div>
  )
}

function ComparisonSkeleton() {
  return (
    <div className="ds-page cmp-page" aria-busy="true">
      <Skel w={240} h={14} />
      <Skel w={320} h={28} />
      <div className="qy-facts">{[0, 1, 2, 3].map(i => <Skel key={i} h={40} r={8} />)}</div>
      {[220, 120, 320].map(height => <Skel key={height} h={height} r={12} />)}
    </div>
  )
}
