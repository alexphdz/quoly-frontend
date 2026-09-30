import { useTranslation } from 'react-i18next'
import { SectionCard } from '../ds'
import { cn } from '../ui'
import type { DonutSegment } from './QuoteStatusDonut'

export interface RfqBar {
  rfqId: string
  rfqName: string
  rfqNumber: string | null
  counts: Record<string, number>
  total: number
}

const MAX_BARS = 6

/**
 * Stacked horizontal bars of quotes per request, split by status. Clicking a bar
 * filters the table to that request; clicking the active bar clears it.
 */
export default function QuotationsByRfq({
  bars,
  segments,
  selectedRfqId,
  onSelect,
}: {
  bars: RfqBar[]
  segments: Array<Pick<DonutSegment, 'key' | 'label' | 'color'>>
  selectedRfqId: string | null
  onSelect: (rfqId: string | null) => void
}) {
  const { t } = useTranslation('quotation')
  const shown = bars.slice(0, MAX_BARS)
  const max = shown.reduce((m, bar) => Math.max(m, bar.total), 0) || 1

  return (
    <SectionCard
      icon="bar_chart"
      title={t('byRfq.title')}
      actions={<span className="qt-hint">{t('byRfq.hint')}</span>}
    >
      <ul className="qt-bars">
        {shown.map((bar) => {
          const active = selectedRfqId === bar.rfqId
          const summary = segments
            .filter(seg => bar.counts[seg.key])
            .map(seg => `${bar.counts[seg.key]} ${seg.label.toLowerCase()}`)
            .join(', ')
          return (
            <li key={bar.rfqId}>
              <button
                type="button"
                onClick={() => onSelect(active ? null : bar.rfqId)}
                aria-pressed={active}
                aria-label={t('byRfq.barLabel', { name: bar.rfqName, summary })}
                className={cn('qt-bar-row', active && 'is-active', selectedRfqId && !active && 'is-dim')}
              >
                <span className="qt-bar-name">
                  <span className="truncate">{bar.rfqName}</span>
                  {bar.rfqNumber && <span className="ds-id">{bar.rfqNumber}</span>}
                </span>
                <span className="qt-bar-track" aria-hidden>
                  <span className="qt-bar-stack" style={{ width: `${(bar.total / max) * 100}%` }}>
                    {segments.map(seg => bar.counts[seg.key]
                      ? <span key={seg.key} style={{ flex: bar.counts[seg.key], background: seg.color }} />
                      : null)}
                  </span>
                </span>
                <span className="qy-num qt-bar-count">{bar.total}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {bars.length > MAX_BARS && (
        <p className="qt-hint qt-bars-more">{t('byRfq.more', { count: bars.length - MAX_BARS })}</p>
      )}
    </SectionCard>
  )
}
