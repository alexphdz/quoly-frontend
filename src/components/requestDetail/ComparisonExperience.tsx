import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from '../../components/ui'
import { exportDecisionPdf } from '../../api/comparisons'
import { useCreateDecision } from '../../hooks/useComparison'
import { buildComparisonModel, comparablePrice } from '../../lib/comparisonModel'
import type { ComparisonResponse, ComparisonRow, DecisionRead } from '../../types/comparison'
import type { RFQDetail } from '../../types/rfq'
import type { BuyerActionRead } from '../../types/buyerAction'
import CostLineMatrix from '../comparison/CostLineMatrix'
import LineComparisonTable from '../comparison/LineComparisonTable'
import ReviewBeforeChoosing from '../comparison/ReviewBeforeChoosing'
import SpecQuickView from '../comparison/SpecQuickView'
import SupplierRanking from '../comparison/SupplierRanking'
import {
  AwardConfirmation, AwardRecord, Button, ContentSection, DecisionCandidate, Expandable,
  Icon, IntelligenceMark, InlineAlert, SideSheet, StatusBadge, Textarea,
} from '../../design-system'
import { useCmpFormat } from '../comparison/useCmpFormat'

type Props = {
  rfq: RFQDetail
  comparison: ComparisonResponse | undefined
  decision: DecisionRead | null | undefined
  openAsks: BuyerActionRead[]
}

export default function ComparisonExperience({ rfq, comparison, decision, openAsks }: Props) {
  const { t, i18n } = useTranslation(['comparison', 'rfq', 'common', 'specEvidence'])
  const navigate = useNavigate()
  const createDecision = useCreateDecision(rfq.id)
  const [selected, setSelected] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const model = useMemo(() => comparison ? buildComparisonModel(comparison, rfq.quantity) : null, [comparison, rfq.quantity])
  const format = useCmpFormat(comparison?.base_unit ?? rfq.base_unit, comparison?.base_currency ?? 'USD')
  const selectable = comparison?.rows ?? []
  const winner = decision ? selectable.find(row => row.quote_id === decision.quote_id) : undefined
  const snapshot = decision?.comparison_snapshot as Partial<ComparisonResponse> | null | undefined
  const recordedWinner = snapshot?.rows?.find(row => row.quote_id === decision?.quote_id) ?? winner
  const recordedFormat = useCmpFormat(snapshot?.base_unit ?? comparison?.base_unit ?? rfq.base_unit, snapshot?.base_currency ?? comparison?.base_currency ?? 'USD')
  const comparableRows = model?.rows.filter(row => row.comparable != null) ?? []
  const suggested = model && comparableRows.length > 1 && comparableRows.some(item => !item.row.spec_evidence_lines?.some(line => line.verdict === 'deviation')) ? model.leader : null
  const selectedRow = selectable.find(row => row.quote_id === selected)

  const recordDecision = async () => {
    if (!selected) return
    try {
      await createDecision.mutateAsync({ quote_id: selected, reasoning: reason.trim() || null })
      setConfirmOpen(false)
      setSelected(null)
      setReason('')
      toast(t('toastRecorded'))
    } catch {
      throw new Error(t('decision.failed'))
    }
  }

  const downloadPdf = async () => {
    setExporting(true)
    try {
      const { blob, filename } = await exportDecisionPdf(rfq.id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || `quoly-decision-${rfq.id}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch {
      toast(t('export.error'), 'error')
    } finally {
      setExporting(false)
    }
  }

  if (!comparison || !model) {
    return <div className="cx-empty"><ContentSection title={t('detail.comparisonEmptyTitle', { ns: 'rfq' })} description={t('detail.comparisonEmptyDescription', { ns: 'rfq' })}>
      <Button variant="secondary" onClick={() => navigate(`/rfqs/${rfq.id}?tab=quotations`)}>{t('detail.tabs.quotations', { ns: 'rfq' })}</Button>
    </ContentSection></div>
  }

  const prices = model.rows.filter(item => item.comparable != null)
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

      {decision && recordedWinner && <div className="cx-award-record">
        <AwardRecord
          supplier={recordedWinner.supplier_name}
          quotation={recordedWinner.quote_id}
          rfq={rfq.name}
          price={comparablePrice(recordedWinner) == null ? null : { amount: comparablePrice(recordedWinner)!, currency: snapshot?.base_currency ?? comparison?.base_currency ?? 'USD', unit: recordedFormat.unit }}
          priceText={comparablePrice(recordedWinner) == null ? recordedWinner.raw_price == null ? t('redesign.notComparable') : `${recordedWinner.raw_currency ?? ''} ${recordedWinner.raw_price} · ${recordedWinner.raw_unit ?? ''}` : undefined}
          recordedAt={new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(decision.decided_at))}
          rationale={decision.reasoning ?? undefined}
          summary={t('redesign.snapshot')}
          onViewQuote={() => navigate(`/rfqs/${rfq.id}?tab=quotations&quote=${recordedWinner.quote_id}`)}
          links={<Button size="sm" variant="secondary" icon="file-pdf" onClick={() => setPreviewOpen(true)}>{t('redesign.viewPdf')}</Button>}
        />
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
            canSelect={!decision}
            awardedQuoteId={decision?.quote_id}
            onSelect={setSelected}
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
            {!decision && <Button size="sm" variant="secondary" icon="check-circle" onClick={() => { setSelected(suggested.row.quote_id); document.getElementById('cx-decision')?.scrollIntoView({ behavior: 'smooth' }) }}>{t('redesign.selectSuggested')}</Button>}
          </> : <><h3>{t('redesign.noSuggestion')}</h3><p>{t('redesign.noSuggestionReason')}</p></>}
          <small>{t('redesign.suggestionDisclaimer')}</small>
        </aside>
      </div>

      <section id="cx-decision" className="cx-decision" aria-labelledby="cx-decision-title">
        <h3 id="cx-decision-title">{t('redesign.decisionTitle')}</h3>
        <p>{decision ? t('redesign.decisionRecorded') : t('redesign.decisionIntro')}</p>
        {!decision && model.rows.map(item => <DecisionCandidate
          key={item.row.quote_id}
          name={item.row.supplier_name}
          reference={item.row.quote_id}
          price={item.comparable == null ? null : { amount: item.comparable, currency: comparison.base_currency, unit: format.unit }}
          original={item.row.raw_price == null ? undefined : `${item.row.raw_currency ?? ''} ${item.row.raw_price} / ${item.row.raw_unit ?? ''}`}
          priceReason={item.row.missing_fields.join(', ')}
          facts={[{ label: t('redesign.leadTime'), value: item.leadDays == null ? null : t('redesign.days', { count: item.leadDays }) }, { label: 'MOQ', value: item.row.raw_quantity_moq?.toLocaleString(i18n.resolvedLanguage) ?? null }, { label: t('redesign.payment'), value: item.row.raw_payment_terms }]}
          selection={selected === item.row.quote_id ? 'selected' : 'none'}
          onSelect={() => setSelected(item.row.quote_id)}
          onChangeSelection={() => setSelected(null)}
          onViewQuote={() => navigate(`/rfqs/${rfq.id}?tab=quotations&quote=${item.row.quote_id}`)}
        />)}
        {selectedRow && !decision && <div className="cx-award-form">
          <Textarea label={t('redesign.reason')} optionalLabel={t('common:field.optional')} rows={3} value={reason} onChange={event => setReason(event.target.value)} placeholder={t('redesign.reasonPlaceholder')} />
          <div><Button onClick={() => setConfirmOpen(true)}>{t('redesign.award')}</Button><Button variant="secondary" onClick={() => { setSelected(null); setReason('') }}>{t('common:cancel')}</Button></div>
          <small>{t('redesign.awardFootnote')}</small>
        </div>}
      </section>

      <AwardConfirmation open={confirmOpen} onCancel={() => setConfirmOpen(false)} onConfirm={recordDecision} supplier={selectedRow?.supplier_name ?? ''} reference={selectedRow?.quote_id} price={selectedRow && comparablePrice(selectedRow) != null ? { amount: comparablePrice(selectedRow)!, currency: comparison.base_currency, unit: format.unit } : null} original={selectedRow?.raw_price == null ? undefined : `${selectedRow.raw_currency ?? ''} ${selectedRow.raw_price}`} context={[t('redesign.awardFootnote')]} />
      {searchParams.get('spec') && comparison.rows.find(row => row.quote_id === searchParams.get('spec')) && <SpecQuickView row={comparison.rows.find(row => row.quote_id === searchParams.get('spec'))!} onClose={() => { const next = new URLSearchParams(searchParams); next.delete('spec'); setSearchParams(next, { replace: true }) }} />}
      <SideSheet open={previewOpen} onClose={() => setPreviewOpen(false)} title={t('redesign.pdfTitle')} description={t('redesign.pdfDescription')} footer={<Button onClick={downloadPdf} loading={exporting}>{t('redesign.downloadPdf')}</Button>}>
        <div className="cx-pdf-preview"><span>{'QUOLY · '}{t('redesign.pdfTitle')}</span><h3>{rfq.name}</h3><p>{t('redesign.snapshot')}</p>{recordedWinner && <strong>{recordedWinner.supplier_name}</strong>}<div>{recordedWinner && comparablePrice(recordedWinner) != null ? recordedFormat.unitPrice(comparablePrice(recordedWinner)!) : t('redesign.notComparable')}</div>{decision?.reasoning && <blockquote>{decision.reasoning}</blockquote>}<small>{decision?.decided_at ? new Date(decision.decided_at).toLocaleString(i18n.resolvedLanguage) : ''}</small></div>
      </SideSheet>
    </div>
  )
}
