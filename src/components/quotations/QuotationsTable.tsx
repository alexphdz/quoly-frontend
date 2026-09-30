import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { QuoteOverviewItem } from '../../types/quote'
import { quoteHasPrice, quoteListStatus } from '../../lib/quoteDisplay'
import { useFormat } from '../../lib/format'
import { Money, Tip } from '../ds'
import { QuoteStatusChip } from '../ds/StatusChips'
import { useUnitLabel } from '../../lib/units'

export default function QuotationsTable({ rows }: { rows: QuoteOverviewItem[] }) {
  const { t } = useTranslation('quotation')
  const fmt = useFormat()
  const units = useUnitLabel()
  const navigate = useNavigate()

  return (
    <div className="ds-table-wrap">
      <table className="ds-table qt-table">
        <thead>
          <tr>
            <th>{t('table.supplier')}</th>
            <th>{t('table.request')}</th>
            <th>{t('table.status')}</th>
            <th className="qt-num">{t('table.normalized')}</th>
            <th className="qt-num">{t('table.rawPrice')}</th>
            <th className="qt-num">{t('table.moq')}</th>
            <th className="qt-num">{t('table.leadTime')}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((quote) => {
            const missingPrice = !quoteHasPrice(quote)
            return (
              <tr key={quote.id} className="is-link" onClick={() => navigate(`/quotes/${quote.id}`)}>
                <td>
                  <span className="qt-supplier">
                    <Tip content={quote.supplier_name}>
                      <Link to={`/quotes/${quote.id}`} className="ds-request-name" onClick={event => event.stopPropagation()}>
                        {quote.supplier_name}
                      </Link>
                    </Tip>
                    <span className="qt-source">{t(`source.${quote.source}`)}</span>
                  </span>
                </td>
                <td>
                  <div className="qt-request">
                    <Tip content={quote.rfq_name}>
                      <Link to={`/rfqs/${quote.rfq_id}`} className="qt-request-name" onClick={event => event.stopPropagation()}>
                        {quote.rfq_name}
                      </Link>
                    </Tip>
                    {quote.rfq_number && <span className="ds-id">{quote.rfq_number}</span>}
                  </div>
                </td>
                <td>
                  <QuoteStatusChip status={quoteListStatus(quote)} priceMissing={missingPrice} />
                </td>
                <td className="qt-num">
                  {quote.normalized_price != null ? (
                    <span className="qt-price">
                      <Money value={quote.normalized_price} currency={quote.normalized_currency} digits="unit" />
                      {quote.normalized_unit && <span className="qt-unit">/ {units.per(quote.normalized_unit)}</span>}
                    </span>
                  ) : (
                    <span className="qt-muted">{missingPrice ? t('table.noPrice') : t('table.notComparable')}</span>
                  )}
                </td>
                <td className="qt-num">
                  {quote.raw_price != null ? (
                    <span className="qt-price">
                      <Money value={quote.raw_price} currency={quote.raw_currency} digits="unit" />
                      {quote.raw_unit && <span className="qt-unit">/ {units.per(quote.raw_unit)}</span>}
                    </span>
                  ) : <span className="qt-muted" aria-label={t('table.notStated')}>—</span>}
                </td>
                <td className="qt-num">
                  {quote.raw_quantity_moq != null
                    ? <span className="qy-num">{fmt.number(quote.raw_quantity_moq)}</span>
                    : <span className="qt-muted" aria-label={t('table.notStated')}>—</span>}
                </td>
                <td className="qt-num">
                  {quote.raw_delivery_lead_time_days != null
                    ? <span className="qy-num">{t('table.leadDays', { count: quote.raw_delivery_lead_time_days })}</span>
                    : <span className="qt-muted" aria-label={t('table.notStated')}>—</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
