import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { QuoteListItem } from '../../types/quote'
import { useEnumLabels } from '../../i18n/labels'
import { useFormat } from '../../lib/format'
import { EmptyState, StatusBadge } from '../ui'

export default function QuoteList({ quotes, baseCurrency }: { quotes: QuoteListItem[]; baseCurrency: string }) {
  const { t } = useTranslation('quote')
  const labels = useEnumLabels()
  const fmt = useFormat()
  if (quotes.length === 0) {
    return <EmptyState title={t('list.emptyTitle')} description={t('list.emptyDescription')} />
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)]">
      <table className="qtable">
        <thead>
          <tr>
            <th>{t('list.headers.supplier')}</th>
            <th>{t('list.headers.status')}</th>
            <th>{t('list.headers.normalizedPrice')}</th>
            <th>{t('list.headers.completeness')}</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map(q => (
            <tr key={q.id}>
              <td>
                <Link to={`/quotes/${q.id}`} className="font-semibold hover:text-[var(--brand)]">{q.supplier_name}</Link>
              </td>
              <td><StatusBadge status={q.status} label={labels.quoteStatus(q.status)} /></td>
              <td className="tnum font-semibold">{q.normalized_price != null ? fmt.unitMoney(q.normalized_price, baseCurrency) : '—'}</td>
              <td>
                {q.missing_fields_count > 0 ? (
                  <span className="badge badge-warning">{t('list.missing', { count: q.missing_fields_count })}</span>
                ) : (
                  <span className="badge badge-success">{t('list.complete')}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
