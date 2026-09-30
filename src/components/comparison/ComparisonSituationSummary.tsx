import { useMemo } from 'react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import type { BuyerActionRead } from '../../types/buyerAction'
import type { ComparisonRow } from '../../types/comparison'
import { useFormat } from '../../lib/format'
import { MetricCard } from '../ds'
import FaithfulSummary from './FaithfulSummary'

interface Props {
  rows: ComparisonRow[]
  baseCurrency: string
  ranking?: string[]
  summary?: string
  onPick?: (quoteId: string) => void
  showPick?: boolean
  buyerActions?: BuyerActionRead[]
}

export default function ComparisonSituationSummary({
  rows,
  baseCurrency,
  ranking = [],
  summary = '',
  onPick,
  showPick = false,
  buyerActions = [],
}: Props) {
  const { t } = useTranslation('comparison')
  const fmt = useFormat()

  const view = useMemo(() => {
    const ranked = (ranking.length > 0
      ? ranking.map(id => rows.find(row => row.quote_id === id)).filter((row): row is ComparisonRow => row != null)
      : rows.slice())
    const priced = rows.filter(row => row.normalized_price != null)
    const prices = priced.map(row => row.normalized_price!)
    const leads = rows
      .map(row => row.raw_delivery_lead_time_days)
      .filter((value): value is number => value != null)
    return {
      ranked,
      recommended: ranked[0] ?? null,
      low: prices.length ? Math.min(...prices) : null,
      high: prices.length ? Math.max(...prices) : null,
      leadMin: leads.length ? Math.min(...leads) : null,
      leadMax: leads.length ? Math.max(...leads) : null,
      deviations: rows.reduce(
        (count, row) => count + (row.spec_evidence_lines?.filter(line => line.verdict === 'deviation').length ?? 0),
        0,
      ),
      openAsks: buyerActions.filter(action => action.status === 'open'),
    }
  }, [ranking, rows, buyerActions])

  if (!view.recommended) return null

  return (
    <section aria-label={t('ai.section')}>
      <div className="ds-kpis">
        <MetricCard compact tone="review" icon="receipt_long" label={t('situation.quotes')} value={rows.length} />
        <MetricCard
          compact
          tone="idle"
          icon="payments"
          label={t('situation.priceRange')}
          value={view.low != null && view.high != null
            ? `${fmt.unitMoney(view.low, baseCurrency)} – ${fmt.unitMoney(view.high, baseCurrency)}`
            : '—'}
        />
        <MetricCard
          compact
          tone="week"
          icon="schedule"
          label={t('situation.leadRange')}
          value={view.leadMin != null && view.leadMax != null
            ? t('situation.leadDaysRange', { min: view.leadMin, max: view.leadMax })
            : '—'}
        />
        <MetricCard
          compact
          tone={view.deviations > 0 ? 'warn' : 'idle'}
          icon="warning"
          label={t('situation.deviations')}
          value={view.deviations}
        />
        <MetricCard
          compact
          tone={view.openAsks.length > 0 ? 'warn' : 'idle'}
          icon="chat"
          label={t('situation.openAsks')}
          value={view.openAsks.length}
        />
      </div>

      <div className="ds-ai">
        <div>
          <span className="ds-pill">{t('badges.recommended')}</span>
          {t('ai.caption') ? <p className="ds-ai-kicker">{t('ai.caption')}</p> : null}
          <h2 className="ds-ai-name">{view.recommended.supplier_name}</h2>
          <ul className="ds-ai-scan">
            {scanLines(view.recommended, view.low, view.openAsks, baseCurrency, fmt, t).map(line => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          {summary ? (
            <FaithfulSummary text={summary} />
          ) : (
            <p className="ds-ai-summary">{t('ai.fallback')}</p>
          )}
          {showPick && onPick && (
            <div className="ds-ai-action">
              <button type="button" className="ds-btn ds-btn-primary" onClick={() => onPick(view.recommended!.quote_id)}>
                {t('ai.recordAward', { name: view.recommended.supplier_name })}
              </button>
            </div>
          )}
          <p className="ds-ai-note">{t('ai.youDecide')}</p>
        </div>

        <ol className="ds-rank">
          <li className="ds-rank-row ds-rank-head">
            <span>{t('table.headers.rank')}</span>
            <span>{t('table.headers.supplier')}</span>
            <span>{t('table.headers.unitPrice')}</span>
            <span>{t('table.headers.terms')}</span>
            <span>{t('situation.openAsks')}</span>
          </li>
          {view.ranked.map((row, index) => (
            <li key={row.quote_id} className={`ds-rank-row ${index === 0 ? 'is-recommended' : ''}`}>
              <span className="ds-muted">{index + 1}</span>
              <span className="ds-rank-name">{row.supplier_name}</span>
              <span>
                {row.normalized_price != null ? fmt.unitMoney(row.normalized_price, baseCurrency) : t('table.noPriceYet')}
              </span>
              <span className="ds-muted">
                {row.missing_fields.length > 0
                  ? t('situation.termsMissing', { count: row.missing_fields.length })
                  : t('situation.termsComplete')}
              </span>
              <span className={view.openAsks.some(action => action.supplier_id === row.supplier_id) ? 'ds-kpi-warn' : 'ds-muted'}>
                {view.openAsks.filter(action => action.supplier_id === row.supplier_id).length}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function scanLines(
  row: ComparisonRow,
  low: number | null,
  openAsks: BuyerActionRead[],
  currency: string,
  fmt: ReturnType<typeof useFormat>,
  t: TFunction<'comparison'>,
): string[] {
  const lines: string[] = []
  if (row.normalized_price != null) {
    lines.push(fmt.unitMoney(row.normalized_price, currency))
    if (low != null && row.normalized_price - low > 0.0001) {
      lines.push(t('ai.aboveLowest', { amount: fmt.unitMoney(row.normalized_price - low, currency) }))
    }
  }
  lines.push(
    row.missing_fields.length > 0
      ? t('situation.termsMissing', { count: row.missing_fields.length })
      : t('situation.termsComplete'),
  )
  const deviations = row.spec_evidence_lines?.filter(line => line.verdict === 'deviation').length ?? 0
  lines.push(deviations > 0 ? t('ai.deviations', { count: deviations }) : t('ai.noDeviations'))
  const asks = openAsks.filter(action => action.supplier_id === row.supplier_id).length
  lines.push(asks > 0 ? t('ai.openAsks', { count: asks }) : t('ai.noOpenAsks'))
  return lines
}
