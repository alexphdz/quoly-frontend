import { useTranslation } from 'react-i18next'
import type { QuoteRead } from '../../types/quote'
import type { VolumeTier } from '../../types/rfq'
import { isQuoteLineItemsV2 } from '../../types/quoteIntake'
import { useFormat } from '../../lib/format'
import { useUnitLabel } from '../../lib/units'
import { Alert } from '../ui'
import CorrugatedQuoteIntakeSummary from './CorrugatedQuoteIntakeSummary'
import CommercialQuoteOffer from './CommercialQuoteOffer'

interface Props {
  quote: QuoteRead
  volumeTiers?: VolumeTier[]
}

function FieldRow({ label, value, missing, missingLabel }: { label: string; value: string | number | null; missing: boolean; missingLabel: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd style={missing ? { color: 'var(--danger-fg)' } : undefined}>
        {value != null ? String(value) : missing ? missingLabel : '—'}
      </dd>
    </div>
  )
}

export default function QuoteFields({ quote, volumeTiers }: Props) {
  const { t } = useTranslation('quote')
  const fmt = useFormat()
  const units = useUnitLabel()
  const m = new Set(quote.missing_fields)
  const missingLabel = t('fields.missing')
  const norm = (v: number | null | undefined) => v != null ? fmt.unitNumber(v) : null

  const v2 = isQuoteLineItemsV2(quote.line_items) ? quote.line_items : null

  return (
    <div>
      {quote.commercial_offer && <CommercialQuoteOffer offer={quote.commercial_offer} />}
      {v2 && (
        <CorrugatedQuoteIntakeSummary
          lineItems={v2}
          missingFields={quote.missing_fields}
          volumeTiers={volumeTiers}
        />
      )}
      <section className="ds-section">
        <h2>{t('fields.extractedFigures')}</h2>
        <dl className="ds-facts">
          <FieldRow label={t('fields.price')} value={quote.raw_price} missing={m.has('price')} missingLabel={missingLabel} />
          <FieldRow label={t('fields.currency')} value={quote.raw_currency} missing={m.has('currency')} missingLabel={missingLabel} />
          <FieldRow label={t('fields.unit')} value={units.per(quote.raw_unit) || quote.raw_unit} missing={m.has('unit')} missingLabel={missingLabel} />
          <FieldRow label={t('fields.moq')} value={quote.raw_quantity_moq} missing={false} missingLabel={missingLabel} />
          <FieldRow label={t('fields.qtyPerUnit')} value={quote.raw_quantity_per_unit} missing={false} missingLabel={missingLabel} />
          <FieldRow label={t('fields.leadTimeDays')} value={quote.raw_delivery_lead_time_days} missing={m.has('delivery_lead_time_days')} missingLabel={missingLabel} />
          <FieldRow label={t('fields.deliveryPoint')} value={quote.raw_delivery_point} missing={m.has('delivery_point')} missingLabel={missingLabel} />
          <FieldRow label={t('fields.paymentTerms')} value={quote.raw_payment_terms} missing={m.has('payment_terms')} missingLabel={missingLabel} />
          <FieldRow label={t('fields.notes')} value={quote.raw_notes} missing={false} missingLabel={missingLabel} />
        </dl>
      </section>

      <section className="ds-section">
        <h2>{t('fields.normalized')}</h2>
        <p className="ds-meta">{t('fields.normalizedNote')}</p>
        <dl className="ds-facts">
          <FieldRow label={t('fields.price')} value={norm(quote.normalized_price)} missing={false} missingLabel={missingLabel} />
          <FieldRow label={t('fields.currency')} value={quote.normalized_currency} missing={false} missingLabel={missingLabel} />
          <FieldRow label={t('fields.unit')} value={units.per(quote.normalized_unit) || quote.normalized_unit} missing={false} missingLabel={missingLabel} />
        </dl>
      </section>

      {!v2 && Array.isArray(quote.line_items) && quote.line_items.length > 0 && (
        <section className="ds-section">
          <h2>{t('fields.lineData')}</h2>
          <Alert>{t('fields.lineDataNote')}</Alert>
          <div>
            {quote.line_items.map((line, index) => {
              const missing = new Set(line.missing_fields ?? [])
              return (
                <div key={line.line_item_id || index} className="ds-section">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p style={{ fontWeight: 600, color: 'var(--tx-1)' }}>
                      <span className="ds-pill ds-pill-muted">{index + 1}</span>{' '}
                      {line.line_item_name || t('fields.line', { index: index + 1 })}
                    </p>
                    <p className="ds-meta">
                      {t('fields.rfqQty')}: {line.rfq_quantity ?? '—'} {line.rfq_unit ?? ''}
                    </p>
                  </div>
                  <dl className="ds-facts">
                    <FieldRow label={t('fields.rawPrice')} value={line.raw_price ?? null} missing={missing.has('price')} missingLabel={missingLabel} />
                    <FieldRow label={t('fields.currency')} value={line.raw_currency ?? null} missing={missing.has('currency')} missingLabel={missingLabel} />
                    <FieldRow label={t('fields.unit')} value={units.per(line.raw_unit) || line.raw_unit || null} missing={missing.has('unit')} missingLabel={missingLabel} />
                    <FieldRow label={t('fields.moq')} value={line.raw_quantity_moq ?? null} missing={false} missingLabel={missingLabel} />
                    <FieldRow label={t('fields.leadTime')} value={line.raw_delivery_lead_time_days != null ? t('fields.leadTimeDaysShort', { count: line.raw_delivery_lead_time_days }) : null} missing={missing.has('lead_time') || missing.has('delivery_lead_time_days')} missingLabel={missingLabel} />
                    <FieldRow label={t('fields.paymentTerms')} value={line.raw_payment_terms ?? null} missing={missing.has('payment_terms')} missingLabel={missingLabel} />
                    <FieldRow label={t('fields.normalizedPrice')} value={norm(line.normalized_price)} missing={false} missingLabel={missingLabel} />
                  </dl>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
