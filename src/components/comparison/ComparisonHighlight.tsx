import { Icon } from '../ds'
import { useTranslation } from 'react-i18next'
import type { ComparisonRow } from '../../types/comparison'
import { useFormat } from '../../lib/format'
import FaithfulSummary from './FaithfulSummary'

interface Props {
  rows: ComparisonRow[]
  ranking: string[]
  baseCurrency: string
  baseUnit: string
  rfqQuantity?: number
  summary: string
  onPick?: (quoteId: string) => void
  showPick: boolean
}

type ChipTone = 'brand' | 'neutral' | 'warning'

interface Chip {
  key: string
  icon: string
  label: string
  tone: ChipTone
}

export default function ComparisonHighlight({
  rows,
  ranking,
  baseCurrency,
  baseUnit,
  rfqQuantity,
  summary,
  onPick,
  showPick,
}: Props) {
  const { t } = useTranslation('comparison')
  const fmt = useFormat()

  const winner = rows.find(r => r.quote_id === ranking[0]) ?? rows[0]
  if (!winner) return null

  // Superlatives are computed against every included quote — never hardcoded.
  const priced = rows.filter(r => r.normalized_price != null)
  const withLeadTime = rows.filter(r => r.raw_delivery_lead_time_days != null)
  const cheapestId = priced.length > 0
    ? priced.reduce((min, r) => (r.normalized_price! < min.normalized_price! ? r : min)).quote_id
    : null
  const fastestId = withLeadTime.length > 0
    ? withLeadTime.reduce((min, r) => (r.raw_delivery_lead_time_days! < min.raw_delivery_lead_time_days! ? r : min)).quote_id
    : null

  const chips: Chip[] = []
  // Achievement chips: only meaningful when the winner beats at least one rival.
  if (fastestId === winner.quote_id && withLeadTime.length > 1) {
    chips.push({ key: 'fastest', icon: 'bolt', label: t('highlight.chips.fastest'), tone: 'brand' })
  }
  if (cheapestId === winner.quote_id && priced.length > 1) {
    chips.push({ key: 'cheapest', icon: 'trending_down', label: t('highlight.chips.cheapest'), tone: 'brand' })
  }
  // Attribute chips: drawn straight from the winner's own extracted fields.
  if (winner.missing_fields.length === 0) {
    chips.push({ key: 'complete', icon: 'check_circle', label: t('highlight.chips.complete'), tone: 'neutral' })
  } else {
    chips.push({
      key: 'incomplete',
      icon: 'warning',
      label: t('highlight.chips.missing', { count: winner.missing_fields.length }),
      tone: 'warning',
    })
  }
  if (winner.raw_delivery_lead_time_days != null) {
    chips.push({
      key: 'leadTime',
      icon: 'schedule',
      label: t('highlight.chips.leadTime', { count: winner.raw_delivery_lead_time_days }),
      tone: 'neutral',
    })
  }
  if (winner.raw_payment_terms) {
    chips.push({ key: 'payment', icon: 'account_balance_wallet', label: winner.raw_payment_terms, tone: 'neutral' })
  }
  if (winner.raw_delivery_point) {
    chips.push({ key: 'delivery', icon: 'location_on', label: winner.raw_delivery_point, tone: 'neutral' })
  }
  if (winner.raw_quantity_moq != null) {
    chips.push({
      key: 'moq',
      icon: 'inventory_2',
      label: t('highlight.chips.moq', { count: winner.raw_quantity_moq }),
      tone: 'neutral',
    })
  }

  const extendedTotal = winner.normalized_price != null && rfqQuantity
    ? winner.normalized_price * rfqQuantity
    : null

  return (
    <div className="comparison-highlight">
      {t('highlight.eyebrow') ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--brand)]">
          <Icon name="auto_awesome" size={16} />
          {t('highlight.eyebrow')}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="qy-heading text-2xl font-bold text-[var(--text-primary)]">{winner.supplier_name}</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('highlight.leads', { count: rows.length })}</p>
        </div>
        <div className="text-right">
          <div className="tnum text-2xl font-bold text-[var(--text-primary)]">
            {winner.normalized_price != null ? fmt.unitMoney(winner.normalized_price, baseCurrency) : '—'}
          </div>
          {extendedTotal != null && rfqQuantity != null && (
            <div className="mt-1 text-sm text-[var(--text-muted)]">
              {t('highlight.totalLine', {
                total: fmt.money(extendedTotal, baseCurrency, { maximumFractionDigits: 0 }),
                quantity: fmt.number(rfqQuantity),
                unit: baseUnit,
              })}
            </div>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {chips.map(chip => {
            return (
              <span key={chip.key} className={`highlight-chip highlight-chip-${chip.tone}`}>
                <Icon name={chip.icon} size={14} />
                {chip.label}
              </span>
            )
          })}
        </div>
      )}

      {summary && (
        <div className="mt-4">
          <FaithfulSummary text={summary} />
        </div>
      )}

      {showPick && onPick && (
        <>
          <hr className="my-4 border-[var(--border-subtle)]" />
          <div className="flex justify-end">
            <button type="button" onClick={() => onPick(winner.quote_id)} className="btn btn-gradient">
              <Icon name="check_circle" size={16} />
              {t('highlight.select')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
