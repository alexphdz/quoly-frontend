import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useComparison, useDecision, useCreateDecision } from '../hooks/useComparison'
import { exportDecisionPdf } from '../api/comparisons'
import { useRFQ } from '../hooks/useRFQs'
import LineComparisonTable from '../components/comparison/LineComparisonTable'
import SpecQuickView from '../components/comparison/SpecQuickView'
import SpecPdfModal from '../components/comparison/SpecPdfModal'
import RecommendationCard from '../components/comparison/RecommendationCard'
import ReviewBeforeChoosing from '../components/comparison/ReviewBeforeChoosing'
import SupplierRanking from '../components/comparison/SupplierRanking'
import CostLineMatrix from '../components/comparison/CostLineMatrix'
import { useCmpFormat } from '../components/comparison/useCmpFormat'
import type { ComparisonResponse, ComparisonRow, DecisionRead } from '../types/comparison'
import type { ApiError } from '../api/client'
import { buildComparisonModel, comparablePrice } from '../lib/comparisonModel'
import { rfqDisplayNumber } from '../lib/rfqDisplay'
import { Breadcrumbs, Btn, ConfirmDialog, Empty, Icon, KeyFacts, Skel, type Fact } from '../components/ds'
import { RequestStatusChip } from '../components/ds/StatusChips'
import { Alert, toast } from '../components/ui'

export default function ComparisonPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation(['comparison', 'common'])
  const comparisonLocale = i18n.resolvedLanguage === 'es' ? 'es' : 'en'
  const { data: comparison, isLoading, error } = useComparison(id!, comparisonLocale)
  const { data: rfq } = useRFQ(id!)
  const { data: decision } = useDecision(id!)

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
  return <ComparisonView id={id!} comparison={comparison} rfqName={rfq?.name} rfqStatus={rfq?.status} rfqNumber={rfq ? rfqDisplayNumber(rfq) : null} supplierCount={rfq?.supplier_count} quantity={rfq?.quantity} decision={decision ?? null} />
}

function ComparisonView({
  id,
  comparison,
  rfqName,
  rfqStatus,
  rfqNumber,
  supplierCount,
  quantity,
  decision,
}: {
  id: string
  comparison: ComparisonResponse
  rfqName?: string
  rfqStatus?: string
  rfqNumber: string | null
  supplierCount?: number
  quantity?: number
  decision: DecisionRead | null
}) {
  const { t } = useTranslation(['comparison', 'common'])
  const f = useCmpFormat(comparison.base_unit, comparison.base_currency)
  const model = useMemo(() => buildComparisonModel(comparison, quantity), [comparison, quantity])
  const createDecision = useCreateDecision(id)
  const [picking, setPicking] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [specRow, setSpecRow] = useState<ComparisonRow | null>(null)
  const [specPdf, setSpecPdf] = useState<ComparisonRow | null>(null)
  const [isExporting, setIsExporting] = useState(false)

  const allIn = comparison.ranking_basis === 'all_in'
  const canSelect = !decision
  const pickedRow = comparison.rows.find(row => row.quote_id === picking)
  const pickedPrice = pickedRow ? comparablePrice(pickedRow) : null

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

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const { blob, filename } = await exportDecisionPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `quoly-decision-${id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast((err as ApiError).detail || t('export.error'), 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const confirmPick = () => {
    if (!picking || !pickedRow) return
    createDecision.mutate(
      { quote_id: picking, reasoning: reason.trim() || null },
      {
        onSuccess: () => {
          toast(t('cmp.decision.toast', { name: pickedRow.supplier_name }))
          setPicking(null)
          setReason('')
        },
        onError: err => toast((err as ApiError).detail || t('decision.failed'), 'error'),
      },
    )
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

      {decision && (
        <WinnerBanner decision={decision} rows={comparison.rows} f={f} exporting={isExporting} onExport={handleExport} />
      )}

      <RecommendationCard
        model={model}
        allIn={allIn}
        summary={comparison.summary}
        f={f}
        canSelect={canSelect}
        onSelect={setPicking}
      />

      <ReviewBeforeChoosing issues={model.issues} f={f} />

      <SupplierRanking
        rfqId={id}
        model={model}
        f={f}
        allIn={allIn}
        fxLine={fxLine}
        canSelect={canSelect}
        awardedQuoteId={decision?.quote_id}
        onSelect={setPicking}
        onViewSpec={setSpecRow}
        onViewSpecSheet={setSpecPdf}
      />

      <CostLineMatrix model={model} f={f} />

      {comparison.line_item_rows.length > 0 && (
        <LineComparisonTable rows={comparison.line_item_rows} ranking={comparison.line_item_ranking} baseCurrency={comparison.base_currency} />
      )}

      {specPdf?.spec_source_url && (
        <SpecPdfModal title={t('specPdf.title', { supplier: specPdf.supplier_name })} url={specPdf.spec_source_url} onClose={() => setSpecPdf(null)} />
      )}
      {specRow && <SpecQuickView row={specRow} onClose={() => setSpecRow(null)} />}

      <ConfirmDialog
        open={!!picking && !!pickedRow}
        onOpenChange={open => { if (!open) setPicking(null) }}
        icon="emoji_events"
        title={t('cmp.decision.title', { name: pickedRow?.supplier_name ?? '' })}
        consequence={t('cmp.decision.consequence', {
          name: pickedRow?.supplier_name ?? '',
          price: pickedPrice != null ? f.unitPrice(pickedPrice) : '—',
          unit: f.unit,
        })}
        confirmLabel={t('cmp.decision.confirm')}
        loading={createDecision.isPending}
        onConfirm={confirmPick}
      >
        <label className="field" style={{ marginTop: 16 }}>
          <span className="field-label">
            {t('cmp.decision.reason')} <span className="font-normal">{t('common:field.optional')}</span>
          </span>
          <textarea
            className="input"
            rows={3}
            value={reason}
            onChange={event => setReason(event.target.value)}
            placeholder={t('cmp.decision.reasonPlaceholder')}
          />
        </label>
      </ConfirmDialog>
    </div>
  )
}

function WinnerBanner({ decision, rows, f, exporting, onExport }: {
  decision: DecisionRead
  rows: ComparisonRow[]
  f: ReturnType<typeof useCmpFormat>
  exporting: boolean
  onExport: () => void
}) {
  const { t } = useTranslation('comparison')
  const winner = rows.find(row => row.quote_id === decision.quote_id)
  const price = winner ? comparablePrice(winner) : null
  return (
    <section className="qy-card cmp-winner" aria-label={t('decision.recordedTitle')}>
      <span className="cmp-winner-icon"><Icon name="emoji_events" size={22} filled /></span>
      <div className="cmp-winner-copy">
        <h2>{t('cmp.decision.banner', { name: winner?.supplier_name ?? t('decision.unknown') })}</h2>
        <p>
          <Icon name="event_available" size={14} />
          {t('cmp.decision.bannerMeta', {
            date: f.fmt.date(decision.decided_at, { dateStyle: 'medium' }),
            price: price != null ? f.unitPrice(price) : '—',
            unit: f.unit,
          })}
        </p>
        {decision.reasoning && <blockquote>“{decision.reasoning}”</blockquote>}
      </div>
      <Btn variant="primary" icon="download" loading={exporting} onClick={onExport}>
        {exporting ? t('export.preparing') : t('cmp.decision.download')}
      </Btn>
    </section>
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
