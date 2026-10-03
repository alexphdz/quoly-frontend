import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ComparisonRow } from '../../types/comparison'
import { formatLeadTimeParts, formatPriceTierSummary } from '../../lib/comparisonCommercial'
import { useFormat } from '../../lib/format'
import { useUnitLabel } from '../../lib/units'
import { EmptyState } from '../ui'

interface Props {
  rows: ComparisonRow[]
  ranking: string[]
  baseCurrency: string
  baseUnit: string
  rfqQuantity?: number
  fxAsOf?: string | null
  fxSource?: string | null
  fxNote?: string | null
  onPick?: (quoteId: string) => void
  showPick: boolean
  onViewSpec?: (row: ComparisonRow) => void
  awardedQuoteId?: string | null
}

const CONVERSION_FLAGS = ['currency_conversion', 'unit_conversion']

type CurrencyView = 'normalized' | 'original'

export default function ComparisonTable({
  rows,
  ranking,
  baseCurrency,
  baseUnit,
  rfqQuantity,
  fxAsOf,
  fxSource,
  fxNote,
  onPick,
  showPick,
  onViewSpec,
  awardedQuoteId = null,
}: Props) {
  const { t } = useTranslation('comparison')
  const fmt = useFormat()
  const [currencyView, setCurrencyView] = useState<CurrencyView>('normalized')
  const bestId = ranking[0] ?? null

  const sorted = [...rows].sort((a, b) => {
    const ai = ranking.indexOf(a.quote_id)
    const bi = ranking.indexOf(b.quote_id)
    const ar = ai === -1 ? Number.MAX_SAFE_INTEGER : ai
    const br = bi === -1 ? Number.MAX_SAFE_INTEGER : bi
    if (ar !== br) return ar - br
    return (a.normalized_price ?? Number.MAX_SAFE_INTEGER) - (b.normalized_price ?? Number.MAX_SAFE_INTEGER)
  })

  const priced = sorted.filter(row => row.normalized_price != null)
  const maxPrice = priced.reduce((max, row) => Math.max(max, row.normalized_price ?? 0), 0)

  if (rows.length === 0) {
    return <EmptyState title={t('table.emptyTitle')} description={t('table.emptyDescription')} />
  }

  const priceLabel = rfqQuantity
    ? t('table.priceAt', { quantity: fmt.number(rfqQuantity), unit: baseUnit })
    : t('table.headers.unitPrice')

  return (
    <div>
      <div className="ds-matrix-controls">
        <div className="ds-segmented" role="group" aria-label={t('table.currencyGroup')}>
          <button
            type="button"
            aria-pressed={currencyView === 'normalized'}
            onClick={() => setCurrencyView('normalized')}
          >
            {t('table.currencyNormalized', { currency: baseCurrency })}
          </button>
          <button
            type="button"
            aria-pressed={currencyView === 'original'}
            onClick={() => setCurrencyView('original')}
          >
            {t('table.currencyOriginal')}
          </button>
        </div>
        {rfqQuantity != null && (
          <span className="ds-pill ds-pill-muted">
            {t('table.quantityBasis', { quantity: fmt.number(rfqQuantity), unit: baseUnit })}
          </span>
        )}
        {fxSource && fxAsOf && (
          <p className="ds-meta">{t('table.fxProvenance', { source: fxSource, date: fmt.date(fxAsOf) })}{fxNote ? ` · ${fxNote}` : ''}</p>
        )}
      </div>

      <div className="ds-table-wrap">
        <table className="ds-table ds-matrix">
          <thead>
            <tr>
              <th scope="col" />
              {sorted.map(row => (
                <th key={row.quote_id} scope="col" className={row.quote_id === bestId ? 'is-recommended' : undefined}>
                  <div className="ds-matrix-name">{row.supplier_name}</div>
                  <div className="ds-request-meta">
                    {row.quote_id === awardedQuoteId ? (
                      <span className="ds-pill ds-pill-success">{t('badges.awarded')}</span>
                    ) : row.quote_id === bestId ? (
                      <span className="ds-pill">{t('badges.recommended')}</span>
                    ) : null}
                    <Link to={`/quotes/${row.quote_id}`} className="ds-link">{t('table.openQuotation')}</Link>
                  </div>
                  {showPick && onPick && (
                    <button type="button" className="ds-btn ds-btn-secondary" style={{ marginTop: 8 }} onClick={() => onPick(row.quote_id)}>
                      {t('table.select')}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <MatrixRow label={priceLabel} className="ds-matrix-price">
              {sorted.map(row => (
                <td key={row.quote_id} className={row.quote_id === bestId ? 'is-recommended' : undefined}>
                  <PriceCell
                    row={row}
                    view={currencyView}
                    baseCurrency={baseCurrency}
                    maxPrice={maxPrice}
                    showMeter={currencyView === 'normalized' && priced.length > 1 && maxPrice > 0}
                    rfqQuantity={rfqQuantity}
                  />
                </td>
              ))}
            </MatrixRow>
            <MatrixRow label={t('table.headers.moq')}>
              {sorted.map(row => (
                <td key={row.quote_id} className={row.quote_id === bestId ? 'is-recommended' : undefined}>
                  <div className="ds-matrix-value tnum">
                    {row.raw_quantity_moq != null ? fmt.number(row.raw_quantity_moq) : t('table.notProvided')}
                  </div>
                  {row.commercial_offer?.moq_source_wording && (
                    <div className="ds-matrix-sub">{row.commercial_offer.moq_source_wording}</div>
                  )}
                </td>
              ))}
            </MatrixRow>
            <MatrixRow label={t('table.headers.leadTime')}>
              {sorted.map(row => {
                const lead = formatLeadTimeParts(row.commercial_offer, row.raw_delivery_lead_time_days, t)
                const missing = lead.primary === '—'
                return (
                  <td key={row.quote_id} className={row.quote_id === bestId ? 'is-recommended' : undefined}>
                    <div className="ds-matrix-value tnum">{missing ? t('table.notProvided') : lead.primary}</div>
                    {lead.wording && <div className="ds-matrix-sub">{lead.wording}</div>}
                  </td>
                )
              })}
            </MatrixRow>
            <MatrixRow label={t('table.incoterm')}>
              {sorted.map(row => (
                <td key={row.quote_id} className={row.quote_id === bestId ? 'is-recommended' : undefined}>
                  <div className="ds-matrix-value">{row.raw_delivery_point || t('table.notProvided')}</div>
                </td>
              ))}
            </MatrixRow>
            <MatrixRow label={t('table.payment')}>
              {sorted.map(row => (
                <td key={row.quote_id} className={row.quote_id === bestId ? 'is-recommended' : undefined}>
                  <div className="ds-matrix-value">{row.raw_payment_terms || t('table.notProvided')}</div>
                </td>
              ))}
            </MatrixRow>
            <MatrixRow label={t('table.validity')}>
              {sorted.map(row => (
                <td key={row.quote_id} className={row.quote_id === bestId ? 'is-recommended' : undefined}>
                  <div className="ds-matrix-value">{row.commercial_offer?.quote_validity || t('table.notProvided')}</div>
                </td>
              ))}
            </MatrixRow>
            <MatrixRow label={t('table.headers.specification')}>
              {sorted.map(row => (
                <td key={row.quote_id} className={row.quote_id === bestId ? 'is-recommended' : undefined}>
                  {row.spec_state && row.spec_state !== 'not_received' ? (
                    <span>{t(`table.specStatus.${row.spec_state}`)}</span>
                  ) : (
                    <span className="ds-muted">{t('table.specStatus.not_received')}</span>
                  )}
                  {row.spec_summary_line && row.spec_state !== 'not_received' && (
                    <div className="ds-matrix-sub">{row.spec_summary_line}</div>
                  )}
                </td>
              ))}
            </MatrixRow>
            <MatrixRow label={t('table.headers.specSheet')}>
              {sorted.map(row => (
                <td key={row.quote_id} className={row.quote_id === bestId ? 'is-recommended' : undefined}>
                  {row.spec_source_url || row.spec_evidence_lines?.length || row.extracted_parameters?.length || (row.spec_state && row.spec_state !== 'not_received') ? (
                    <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" onClick={() => onViewSpec?.(row)}>
                      {t('table.viewSpec')}
                    </button>
                  ) : (
                    <span className="ds-muted">{t('table.noSpecification')}</span>
                  )}
                </td>
              ))}
            </MatrixRow>
          </tbody>
        </table>
      </div>
      <p className="ds-meta" style={{ marginTop: 10 }}>
        {t('table.normalizedNote', { currency: baseCurrency, unit: baseUnit })}
      </p>
    </div>
  )
}

function MatrixRow({ label, className, children }: { label: string, className?: string, children: ReactNode }) {
  return (
    <tr className={className}>
      <th scope="row">{label}</th>
      {children}
    </tr>
  )
}

function PriceCell({
  row,
  view,
  baseCurrency,
  maxPrice,
  showMeter,
  rfqQuantity,
}: {
  row: ComparisonRow
  view: CurrencyView
  baseCurrency: string
  maxPrice: number
  showMeter: boolean
  rfqQuantity?: number
}) {
  const { t } = useTranslation('comparison')
  const fmt = useFormat()
  const units = useUnitLabel()
  const tiers = formatPriceTierSummary(row.commercial_offer, fmt, units.per)
  const extended = row.normalized_price != null && rfqQuantity
    ? fmt.money(row.normalized_price * rfqQuantity, baseCurrency, { maximumFractionDigits: 0 })
    : null

  if (view === 'original') {
    return (
      <div>
        <div className="ds-matrix-value tnum">
          {row.raw_price != null
            ? `${fmt.unitNumber(row.raw_price)} ${row.raw_currency ?? ''}`.trim()
            : tiers.length > 0
              ? tiers[0]
              : t('table.notProvided')}
        </div>
        {row.raw_unit && row.raw_price != null && <div className="ds-matrix-sub">{units.per(row.raw_unit)}</div>}
        {tiers.length > 0 && <div className="ds-matrix-sub">{tiers.join(' · ')}</div>}
      </div>
    )
  }

  const blocked = row.missing_fields.some(field => CONVERSION_FLAGS.includes(field))
  return (
    <div>
      <div className="ds-matrix-value tnum">
        {row.normalized_price != null
          ? fmt.unitMoney(row.normalized_price, baseCurrency)
          : tiers.length > 0
            ? tiers[0]
            : blocked
              ? t('table.notComparable')
              : t('table.notProvided')}
      </div>
      {tiers.length > 0 && row.normalized_price != null && (
        <div className="ds-matrix-sub">{tiers.join(' · ')}</div>
      )}
      {tiers.length > 1 && row.normalized_price == null && (
        <div className="ds-matrix-sub">{tiers.slice(1).join(' · ')}</div>
      )}
      {showMeter && row.normalized_price != null && (
        <div className="ds-price-meter" aria-hidden="true">
          <span style={{ width: `${Math.max(8, (row.normalized_price / maxPrice) * 100)}%` }} />
        </div>
      )}
      {row.raw_price != null && (
        <div className="ds-matrix-sub">{row.raw_price} {row.raw_currency ?? ''}/{units.per(row.raw_unit) || row.raw_unit || ''}</div>
      )}
      {extended && <div className="ds-matrix-sub">{t('table.totalLine', { amount: extended })}</div>}
    </div>
  )
}
