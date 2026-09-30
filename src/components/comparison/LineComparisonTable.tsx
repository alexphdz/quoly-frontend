import { useTranslation } from 'react-i18next'
import type { LineComparisonRow } from '../../types/comparison'
import { useEnumLabels } from '../../i18n/labels'
import { useFormat } from '../../lib/format'
import { useUnitLabel } from '../../lib/units'

export default function LineComparisonTable({
  rows,
  ranking,
  baseCurrency,
}: {
  rows: LineComparisonRow[]
  ranking: Record<string, string[]>
  baseCurrency: string
}) {
  const { t } = useTranslation('comparison')
  const labels = useEnumLabels()
  const fmt = useFormat()
  const units = useUnitLabel()
  if (rows.length === 0) return null

  const groups = rows.reduce<Record<string, LineComparisonRow[]>>((acc, row) => {
    acc[row.line_item_id] = acc[row.line_item_id] ?? []
    acc[row.line_item_id].push(row)
    return acc
  }, {})

  return (
    <section className="ds-section">
      <h2>{t('line.title')}</h2>
      <p className="ds-meta">{t('line.subtitle')}</p>
      <p className="ds-meta">{t('line.splitAward')}</p>
      {Object.entries(groups).map(([lineItemId, lineRows]) => {
        const rankedQuoteIds = ranking[lineItemId] ?? []
        const sorted = [...lineRows].sort((a, b) => {
          const ai = rankedQuoteIds.indexOf(a.quote_id)
          const bi = rankedQuoteIds.indexOf(b.quote_id)
          const ar = ai === -1 ? Number.MAX_SAFE_INTEGER : ai
          const br = bi === -1 ? Number.MAX_SAFE_INTEGER : bi
          if (ar !== br) return ar - br
          return (a.normalized_price ?? Number.MAX_SAFE_INTEGER) - (b.normalized_price ?? Number.MAX_SAFE_INTEGER)
        })
        const bestQuoteId = rankedQuoteIds[0]
        return (
          <div key={lineItemId} style={{ marginTop: 16 }}>
            <h3 className="ds-matrix-name">{lineRows[0]?.line_item_name ?? t('line.lineItem')}</h3>
            <div className="ds-table-wrap">
              <table className="ds-table">
                <thead>
                  <tr>
                    <th>{t('line.headers.supplier')}</th>
                    <th>{t('line.headers.normalized')}</th>
                    <th>{t('line.headers.raw')}</th>
                    <th>{t('line.headers.moq')}</th>
                    <th>{t('line.headers.leadTime')}</th>
                    <th>{t('line.headers.payment')}</th>
                    <th>{t('line.headers.completeness')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(row => {
                    const isBest = row.quote_id === bestQuoteId && row.normalized_price != null
                    return (
                      <tr key={`${row.quote_id}-${lineItemId}`} className={isBest ? 'is-open' : ''}>
                        <td>
                          {row.supplier_name}
                          {isBest && <span className="ds-pill" style={{ marginLeft: 8 }}>{t('line.bestForLine')}</span>}
                        </td>
                        <td className="tnum">
                          {row.normalized_price != null ? fmt.unitMoney(row.normalized_price, baseCurrency) : '—'}
                        </td>
                        <td className="tnum text-[var(--text-secondary)]">
                          {row.raw_price != null ? `${row.raw_price} ${row.raw_currency ?? ''}/${units.per(row.raw_unit) || row.raw_unit || ''}` : '\u2014'}
                        </td>
                        <td className="tnum text-[var(--text-secondary)]">{row.raw_quantity_moq ?? '—'}</td>
                        <td className="tnum text-[var(--text-secondary)]">{row.raw_delivery_lead_time_days != null ? t('table.leadTimeDays', { count: row.raw_delivery_lead_time_days }) : '—'}</td>
                        <td className="text-[var(--text-secondary)]">{row.raw_payment_terms ?? '—'}</td>
                        <td>
                          {row.missing_fields.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {row.missing_fields.map(field => (
                                <span key={field} className="ds-pill ds-pill-warn">{labels.missingField(field)}</span>
                              ))}
                            </div>
                          ) : <span className="ds-pill ds-pill-success">{t('table.complete')}</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </section>
  )
}
