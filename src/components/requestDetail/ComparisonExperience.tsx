import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from '../../components/ui'
import { useCloseRfq } from '../../hooks/useComparison'
import { buildComparisonModel } from '../../lib/comparisonModel'
import type { ComparisonResponse, ComparisonRow } from '../../types/comparison'
import type { RFQDetail } from '../../types/rfq'
import type { BuyerActionRead } from '../../types/buyerAction'
import type { ApiError } from '../../api/client'
import CostLineMatrix from '../comparison/CostLineMatrix'
import LineComparisonTable from '../comparison/LineComparisonTable'
import ReviewBeforeChoosing from '../comparison/ReviewBeforeChoosing'
import SpecQuickView from '../comparison/SpecQuickView'
import SupplierRanking from '../comparison/SupplierRanking'
import ExportComparisonDialog from '../comparison/ExportComparisonDialog'
import {
  Button, ContentSection, Dialog, Expandable,
  Icon, IntelligenceMark, InlineAlert, StatusBadge, Textarea,
} from '../../design-system'
import { useCmpFormat } from '../comparison/useCmpFormat'

type Props = {
  rfq: RFQDetail
  comparison: ComparisonResponse | undefined
  // `decision` ya no se usa (la adjudicación se reemplazó por cerrar + exportar);
  // se mantiene en la firma por compatibilidad con el llamador.
  decision?: unknown
  openAsks: BuyerActionRead[]
}

export default function ComparisonExperience({ rfq, comparison, openAsks }: Props) {
  const { t, i18n } = useTranslation(['comparison', 'rfq', 'common', 'specEvidence'])
  const navigate = useNavigate()
  const closeRfq = useCloseRfq(rfq.id)
  const [closeOpen, setCloseOpen] = useState(false)
  const [closeReason, setCloseReason] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const model = useMemo(() => comparison ? buildComparisonModel(comparison, rfq.quantity) : null, [comparison, rfq.quantity])
  const format = useCmpFormat(comparison?.base_unit ?? rfq.base_unit, comparison?.base_currency ?? 'USD')
  const locale = i18n.resolvedLanguage === 'es' ? 'es' : 'en'

  // Una solicitud "cerrada" (status decided) da por terminada la comparación.
  const closed = rfq.status === 'decided' || !!rfq.closed_at
  const closedAtText = rfq.closed_at
    ? new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(rfq.closed_at))
    : null

  const confirmClose = async () => {
    try {
      await closeRfq.mutateAsync(closeReason.trim() || null)
      setCloseOpen(false)
      setCloseReason('')
      toast(t('redesign.closedToast'))
    } catch (err) {
      toast((err as ApiError).detail || t('redesign.closeFailed'), 'error')
    }
  }

  if (!comparison || !model) {
    return <div className="cx-empty"><ContentSection title={t('detail.comparisonEmptyTitle', { ns: 'rfq' })} description={t('detail.comparisonEmptyDescription', { ns: 'rfq' })}>
      <Button variant="secondary" onClick={() => navigate(`/rfqs/${rfq.id}?tab=quotations`)}>{t('detail.tabs.quotations', { ns: 'rfq' })}</Button>
    </ContentSection></div>
  }

  const prices = model.rows.filter(item => item.comparable != null)
  const suggested = model && prices.length > 1 && prices.some(item => !item.row.spec_evidence_lines?.some(line => line.verdict === 'deviation')) ? model.leader : null
  const statusTone = (row: ComparisonRow) => row.spec_evidence_lines?.some(line => line.verdict === 'deviation')
    ? 'warning' as const
    : row.spec_evidence_lines?.some(line => line.verdict === 'needs_review') ? 'info' as const : 'success' as const

  return (
    <div className="cx-page">
      <header className="cx-heading">
        <div>
          <h2>{t('title')}</h2>
          <p>{t('redesign.subtitle')}</p>
        </div>
        <Expandable title={t('redesign.requestData')}>
          <dl className="cx-request-facts">
            <div><dt>{t('redesign.quantity')}</dt><dd>{rfq.quantity} {rfq.base_unit}</dd></div>
            <div><dt>{t('redesign.delivery')}</dt><dd>{rfq.delivery_point || t('redesign.notProvided')}</dd></div>
            <div><dt>{t('redesign.incoterm')}</dt><dd>{rfq.incoterms ? `${rfq.incoterms.rule} · ${rfq.incoterms.named_place}` : t('redesign.notProvided')}</dd></div>
            <div><dt>{t('redesign.requirements')}</dt><dd>{rfq.technical_requirements || t('redesign.notProvided')}</dd></div>
          </dl>
        </Expandable>
      </header>

      {closed && <div className="cx-closed-banner">
        <span className="cx-closed-icon"><Icon name="check-circle" size={22} weight="fill" /></span>
        <div className="cx-closed-copy">
          <h3>{t('redesign.closedTitle')}</h3>
          {closedAtText && <p>{t('redesign.closedAt', { date: closedAtText })}</p>}
          {rfq.closed_reason && <blockquote>“{rfq.closed_reason}”</blockquote>}
        </div>
        <Button icon="file-xls" onClick={() => setExportOpen(true)}>{t('redesign.exportExcel')}</Button>
      </div>}

      <div className="cx-counts" aria-label={t('redesign.countLabel')}>
        <span>{t('redesign.included', { count: comparison.rows.length })}</span>
        <span>{t('redesign.comparable', { count: prices.length })}</span>
        <span>{t('redesign.pending', { count: openAsks.length })}</span>
        {model.rows.filter(item => item.comparable == null).length > 0 && <span>{t('redesign.noPrice', { count: model.rows.filter(item => item.comparable == null).length })}</span>}
      </div>

      {openAsks.length > 0 && <section className="cx-questions" aria-labelledby="cx-questions-title">
        <h3 id="cx-questions-title">{t('redesign.openQuestions', { count: openAsks.length })}</h3>
        {openAsks.map(ask => <div className="cx-question" key={ask.id}>
          <span><strong>{ask.supplier_name || t('redesign.supplier')}</strong><span>{ask.question}</span></span>
          <Button size="sm" variant="tertiary" iconEnd="caret-right" onClick={() => navigate(`/rfqs/${rfq.id}?tab=replies#needs-answer`)}>{t('redesign.viewAnswer')}</Button>
        </div>)}
      </section>}

      {prices.length === 0 ? <InlineAlert tone="info" title={t('redesign.noComparableTitle')}>{t('redesign.noComparableText')}</InlineAlert> : <>
        <ContentSection title={t('redesign.essentialTitle')} description={t('redesign.essentialDescription')}>
          <div className="cx-matrix-scroll"><table className="cx-matrix"><thead><tr><th scope="col">{t('redesign.parameter')}</th>{model.rows.map(item => <th scope="col" key={item.row.quote_id} className={suggested?.row.quote_id === item.row.quote_id ? 'is-suggested' : undefined}>
            {suggested?.row.quote_id === item.row.quote_id && <span className="cx-suggested-label"><IntelligenceMark size={14} variant="proposed" />{t('redesign.suggestedShort')}</span>}
            <span>{item.row.supplier_name}</span>
            <small>{item.row.quote_id.slice(0, 8)}</small>
          </th>)}</tr></thead><tbody>
            <tr><th scope="row">{t('redesign.price')}</th>{model.rows.map(item => <td key={item.row.quote_id} className={suggested?.row.quote_id === item.row.quote_id ? 'is-suggested' : undefined}>
              <strong className="cx-price">{item.comparable == null ? t('redesign.notComparable') : format.unitPrice(item.comparable)}</strong>
              {item.rank === 1 && prices.length > 1 && <small>{t('redesign.bestPrice')}</small>}
              {item.comparable == null && item.row.raw_price != null && <small>{t('redesign.quotedPrice', { price: `${item.row.raw_currency ?? ''} ${item.row.raw_price} / ${item.row.raw_unit ?? ''}` })}</small>}
            </td>)}</tr>
            <tr><th scope="row">{t('redesign.leadTime')}</th>{model.rows.map(item => <td key={item.row.quote_id} className={suggested?.row.quote_id === item.row.quote_id ? 'is-suggested' : undefined}>{item.leadDays == null ? t('redesign.notProvided') : t('redesign.days', { count: item.leadDays })}{item.fastest && model.rows.filter(row => row.leadDays != null).length > 1 && <small>{t('redesign.fastest')}</small>}</td>)}</tr>
            <tr><th scope="row">MOQ</th>{model.rows.map(item => <td key={item.row.quote_id} className={suggested?.row.quote_id === item.row.quote_id ? 'is-suggested' : undefined}>{item.row.raw_quantity_moq == null ? t('redesign.notProvided') : item.row.raw_quantity_moq.toLocaleString(i18n.resolvedLanguage)}{item.moqExcess && <small>{t('redesign.moqExceeds')}</small>}</td>)}</tr>
            <tr><th scope="row">{t('redesign.payment')}</th>{model.rows.map(item => <td key={item.row.quote_id} className={suggested?.row.quote_id === item.row.quote_id ? 'is-suggested' : undefined}>{item.row.raw_payment_terms || t('redesign.notProvided')}</td>)}</tr>
            <tr><th scope="row">{t('redesign.technical')}</th>{model.rows.map(item => <td key={item.row.quote_id} className={suggested?.row.quote_id === item.row.quote_id ? 'is-suggested' : undefined}>{item.row.spec_evidence_lines?.length ? <StatusBadge tone={statusTone(item.row)} variant="quiet">{t('redesign.technicalCount', { count: item.row.spec_evidence_lines.length })}</StatusBadge> : t('redesign.notProvided')}</td>)}</tr>
          </tbody></table></div>
        </ContentSection>

        <Expandable title={t('redesign.detailsTitle')} meta={t('redesign.detailsMeta')}>
          <div className="cx-detail-grid">
            {model.rows.map(item => <article key={item.row.quote_id} className="cx-detail-supplier">
              <h4>{item.row.supplier_name}</h4>
              <dl>
                <div><dt>{t('redesign.originalPrice')}</dt><dd>{item.row.raw_price == null ? t('redesign.notProvided') : `${item.row.raw_currency ?? ''} ${item.row.raw_price} / ${item.row.raw_unit ?? ''}`}</dd></div>
                <div><dt>{t('redesign.validity')}</dt><dd>{item.row.commercial_offer?.quote_validity || t('redesign.notProvided')}</dd></div>
                <div><dt>{t('redesign.incoterm')}</dt><dd>{item.row.raw_delivery_point || t('redesign.notProvided')}</dd></div>
                {(item.row.commercial_offer?.price_tiers ?? []).map((tier, index) => <div key={index}><dt>{t('redesign.tier', { quantity: tier.quantity ?? '—' })}</dt><dd>{tier.price == null ? t('redesign.notProvided') : `${tier.currency ?? item.row.raw_currency ?? ''} ${tier.price}`}</dd></div>)}
              </dl>
              {item.row.spec_evidence_lines?.length ? <div className="cx-tech-list"><h5>{t('redesign.technical')}</h5>{item.row.spec_evidence_lines.map((line, index) => <div key={`${line.parameter_name}-${index}`}>
                <strong>{line.parameter_name}</strong><span>{line.reference_wording || t('redesign.notProvided')}</span><span>{line.supplier_wording || t('redesign.notProvided')}</span>
                {line.verdict && <StatusBadge variant="quiet" tone={line.verdict === 'match' ? 'success' : line.verdict === 'deviation' ? 'warning' : line.verdict === 'needs_review' ? 'info' : 'neutral'}>{t(`specEvidence:verdict.${line.verdict}`, { defaultValue: line.verdict })}</StatusBadge>}
              </div>)}</div> : null}
            </article>)}
          </div>
          <CostLineMatrix model={model} f={format} />
          {comparison.line_item_rows.length > 0 && <LineComparisonTable rows={comparison.line_item_rows} ranking={comparison.line_item_ranking} baseCurrency={comparison.base_currency} />}
          <SupplierRanking
            rfqId={rfq.id}
            model={model}
            f={format}
            allIn={comparison.ranking_basis === 'all_in'}
            fxLine={null}
            canSelect={false}
            onSelect={() => {}}
            onViewSpec={row => { const next = new URLSearchParams(searchParams); next.set('spec', row.quote_id); setSearchParams(next, { replace: true }) }}
          />
        </Expandable>
      </>}
      <ReviewBeforeChoosing issues={model.issues} f={format} />

      <div className="cx-analysis">
        <ContentSection title={<span className="cx-analysis-title"><IntelligenceMark size={20} variant="proposed" />{t('redesign.analysisTitle')}</span>}>
          <p>{comparison.summary || t('redesign.noAnalysis')}</p>
          <ul>{model.issues.slice(0, 3).map(issue => <li key={issue.id}><Icon name="warning-circle" size={16} /><span><strong>{issue.supplier}</strong> · {t(`cmp.issues.${issue.kind}`, { defaultValue: issue.kind })}</span></li>)}</ul>
          <small>{t('redesign.analysisBasis')}</small>
        </ContentSection>
        <aside className="cx-suggestion">
          <span className="cx-suggestion-eyebrow"><IntelligenceMark size={14} variant="proposed" />{t('redesign.suggested')}</span>
          {suggested ? <><h3>{suggested.row.supplier_name}</h3><p>{t('redesign.suggestionReason', { price: format.unitPrice(suggested.comparable!), unit: format.unit })}</p>
          </> : <><h3>{t('redesign.noSuggestion')}</h3><p>{t('redesign.noSuggestionReason')}</p></>}
          <small>{t('redesign.suggestionDisclaimer')}</small>
        </aside>
      </div>

      <section id="cx-decision" className="cx-close-export" aria-labelledby="cx-close-title">
        <h3 id="cx-close-title">{t('redesign.closeExportTitle')}</h3>
        <p>{closed ? t('redesign.closeExportDoneIntro') : t('redesign.closeExportIntro')}</p>
        <div className="cx-close-actions">
          <Button icon="file-xls" onClick={() => setExportOpen(true)}>{t('redesign.exportExcel')}</Button>
          {!closed && <Button variant="secondary" icon="check-circle" onClick={() => setCloseOpen(true)}>{t('redesign.closeRequest')}</Button>}
        </div>
        <small>{t('redesign.closeExportFootnote')}</small>
      </section>

      <Dialog
        open={closeOpen}
        onClose={closeRfq.isPending ? undefined : () => { setCloseOpen(false); setCloseReason('') }}
        title={t('redesign.closeConfirmTitle')}
        description={t('redesign.closeConfirmDescription')}
        size="sm"
        footer={
          <div className="cx-close-dialog-actions">
            <Button variant="secondary" disabled={closeRfq.isPending} onClick={() => { setCloseOpen(false); setCloseReason('') }}>
              {t('common:cancel', { defaultValue: 'Cancelar' })}
            </Button>
            <Button icon="check-circle" loading={closeRfq.isPending} onClick={confirmClose}>
              {t('redesign.closeConfirm')}
            </Button>
          </div>
        }
      >
        <Textarea
          label={t('redesign.closeReasonLabel')}
          optionalLabel={t('common:field.optional')}
          rows={3}
          value={closeReason}
          onChange={event => setCloseReason(event.target.value)}
          placeholder={t('redesign.closeReasonPlaceholder')}
        />
      </Dialog>

      <ExportComparisonDialog
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        rfqId={rfq.id}
        locale={locale}
        rows={comparison.rows.map(row => ({ quote_id: row.quote_id, supplier_name: row.supplier_name }))}
      />

      {searchParams.get('spec') && comparison.rows.find(row => row.quote_id === searchParams.get('spec')) && <SpecQuickView row={comparison.rows.find(row => row.quote_id === searchParams.get('spec'))!} onClose={() => { const next = new URLSearchParams(searchParams); next.delete('spec'); setSearchParams(next, { replace: true }) }} />}
    </div>
  )
}
