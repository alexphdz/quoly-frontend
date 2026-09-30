import { useTranslation } from 'react-i18next'
import type { ComparisonRow, DecisionRead } from '../../types/comparison'
import { useFormat } from '../../lib/format'

interface Props {
  rfqId: string
  rows: ComparisonRow[]
  ranking: string[]
  baseCurrency: string
  baseUnit: string
  rfqQuantity?: number
  decision?: DecisionRead | null
}

export default function ComparisonPreview({
  rows,
  ranking,
  baseCurrency,
  decision,
}: Props) {
  const { t } = useTranslation('comparison')
  const fmt = useFormat()

  const ranked = ranking.length > 0
    ? ranking.map(id => rows.find(row => row.quote_id === id)).filter((row): row is ComparisonRow => row != null)
    : rows
  if (ranked.length < 1) return null

  const decided = decision ? ranked.find(row => row.quote_id === decision.quote_id) ?? null : null
  const lead = decided ?? ranked[0]

  return (
    <section className="ds-ai" aria-label={t('ai.section')} style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
      <div>
        <span className="ds-pill">{decided ? t('preview.awarded') : t('badges.recommended')}</span>
        <h2 className="ds-ai-name">{lead.supplier_name}</h2>
        <p className="ds-ai-kicker">
          {lead.normalized_price != null ? fmt.unitMoney(lead.normalized_price, baseCurrency) : t('table.noPriceYet')}
        </p>
        <p className="ds-ai-note">{t('ai.youDecide')}</p>
      </div>
      <ol className="ds-rank">
        {ranked.map((row, index) => (
          <li key={row.quote_id} className={`ds-rank-row ${row.quote_id === lead.quote_id ? 'is-recommended' : ''}`}>
            <span className="ds-muted">{index + 1}</span>
            <span className="ds-rank-name">{row.supplier_name}</span>
            <span>
              {row.normalized_price != null ? fmt.unitMoney(row.normalized_price, baseCurrency) : t('table.noPriceYet')}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
