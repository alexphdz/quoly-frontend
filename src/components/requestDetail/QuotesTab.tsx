import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, EmptySection, SideSheet, Skeleton, StatusBadge, type IconName, type StatusTone } from '../../design-system'
import { useAllQuotes, useQuote } from '../../hooks/useQuotes'
import { useFormat } from '../../lib/format'
import { useUnitLabel } from '../../lib/units'
import QuoteReview from '../quoteReview/QuoteReview'
import QuoteUploadForm from '../quotes/QuoteUploadForm'
import type { CommercialRequestDetailProps } from './CommercialRequestDetail'

const STATUS: Record<string, { tone: StatusTone, icon: IconName }> = {
  draft: { tone: 'ai', icon: 'quoly-proposed' },
  confirmed: { tone: 'success', icon: 'check-circle' },
  rejected: { tone: 'neutral', icon: 'prohibit' },
}

/** 06 · Cotizaciones de la solicitud: índice horizontal y la cotización elegida para revisar. */
export default function QuotesTab(props: CommercialRequestDetailProps) {
  const { rfq, quotes } = props
  const { t } = useTranslation('rfq')
  const { t: tq } = useTranslation('quote')
  const fmt = useFormat()
  const units = useUnitLabel()
  const [params, setParams] = useSearchParams()
  const { data: overview } = useAllQuotes()

  const ordered = useMemo(() => {
    const order: Record<string, number> = { draft: 0, confirmed: 1, rejected: 2 }
    return [...quotes].sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3) || a.created_at.localeCompare(b.created_at))
  }, [quotes])
  const requested = params.get('quote')
  const selectedId = requested ?? ordered[0]?.id ?? ''
  const { data: selected, isLoading: selectedLoading } = useQuote(selectedId)
  const select = (id: string) => setParams(prev => {
    const next = new URLSearchParams(prev)
    next.set('tab', 'quotations')
    next.set('quote', id)
    return next
  }, { replace: true })

  const original = (id: string) => overview?.find(o => o.id === id)
  const toReview = quotes.filter(q => q.status === 'draft').length
  const readOnly = rfq.status === 'decided' || rfq.status === 'closed'

  return (
    <div className="rd2-quotes">
      <div className="rd2-block-head is-top">
        <div className="rd2-head-text">
          <h2 className="rd2-h2">{t('cotizaciones.title')}</h2>
          <p className="rd2-lead">{t('cotizaciones.lead')}</p>
          {quotes.length > 0 && (
            <p className="rd2-muted qt3-counts">
              {t('cotizaciones.count', { count: quotes.length })}
              {toReview > 0 && <span className="qt3-review">{` · ${t('cotizaciones.toReview', { count: toReview })}`}</span>}
            </p>
          )}
        </div>
        {!readOnly && (
          <div className="rd2-head-actions">
            <Button variant="secondary" icon="upload-simple" onClick={() => props.setShowUpload(true)}>{t('detail.addQuoteManually')}</Button>
          </div>
        )}
      </div>

      {props.quotesLoading && <Skeleton shape="block" height={84} />}

      {!props.quotesLoading && quotes.length === 0 && (
        <div className="rd2-rule-top">
          <EmptySection dense title={t('cotizaciones.emptyTitle')} text={t('cotizaciones.emptyText')} />
        </div>
      )}

      {quotes.length > 0 && (
        <div role="tablist" aria-label={t('cotizaciones.indexLabel')} className="qt3-index">
          {ordered.map(q => {
            const s = STATUS[q.status] ?? STATUS.draft
            const o = original(q.id)
            const on = q.id === selectedId
            const unit = o?.raw_unit ? (units.per(o.raw_unit) || o.raw_unit) : ''
            return (
              <button
                key={q.id}
                type="button"
                role="tab"
                aria-selected={on}
                className={`qt3-item${on ? ' is-on' : ''}`}
                onClick={() => select(q.id)}
              >
                <span className="qt3-item-name">{q.supplier_name}</span>
                <StatusBadge tone={s.tone} variant="quiet" icon={s.icon}>{tq(`v2.status.${q.status}`, { defaultValue: q.status })}</StatusBadge>
                {o?.raw_price != null
                  ? <span className="qt3-item-price">{`${o.raw_currency ?? ''} ${fmt.number(o.raw_price, { maximumFractionDigits: 4 })}${unit ? ` / ${unit}` : ''}`.trim()}</span>
                  : <span className="qt3-item-price is-missing">{t('cotizaciones.noPrice')}</span>}
                {q.missing_fields_count > 0 && <span className="qt3-item-meta">{t('cotizaciones.missing', { count: q.missing_fields_count })}</span>}
                <span aria-hidden="true" className="qt3-item-trace" />
              </button>
            )
          })}
        </div>
      )}

      {selectedId && (selectedLoading || !selected)
        ? <Skeleton shape="text" lines={6} />
        : selected && <div role="tabpanel"><QuoteReview key={selected.id} quote={selected} rfq={rfq} embedded /></div>}

      <SideSheet
        open={props.showUpload}
        onClose={() => props.setShowUpload(false)}
        title={t('detail.addQuoteManually')}
        description={t('cotizaciones.uploadNote')}
        width={520}
      >
        <QuoteUploadForm suppliers={props.suppliers} onSubmit={props.onCreateQuote} isPending={props.createQuotePending} error={props.createQuoteError} />
      </SideSheet>
    </div>
  )
}
