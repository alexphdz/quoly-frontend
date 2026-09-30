import { useTranslation } from 'react-i18next'
import { Icon } from '../ds'
import { SectionCard } from '../ds'
import { cn } from '../ui'

export interface DonutSegment {
  key: string
  label: string
  count: number
  color: string
  icon: string
}

/**
 * Quote counts by status. Pure SVG: each status is a stroked arc whose length is
 * its share of the total. Legend rows carry an icon and a count, so status never
 * depends on colour; clicking a row filters the table.
 */
export default function QuoteStatusDonut({
  segments,
  total,
  active,
  onSelect,
}: {
  segments: DonutSegment[]
  total: number
  active: string
  onSelect: (key: string) => void
}) {
  const { t } = useTranslation('quotation')
  const radius = 52
  const stroke = 8
  const circumference = 2 * Math.PI * radius
  const gap = segments.filter(seg => seg.count > 0).length > 1 ? 3 : 0

  let consumed = 0
  const arcs = segments
    .filter(seg => seg.count > 0)
    .map((seg) => {
      const fraction = total > 0 ? seg.count / total : 0
      const dash = Math.max(fraction * circumference - gap, 0)
      const rotation = (consumed / (total || 1)) * 360 - 90
      consumed += seg.count
      return { key: seg.key, color: seg.color, dash, rest: circumference - dash, rotation }
    })

  return (
    <SectionCard icon="donut_small" title={t('statusCard.title')}>
      <div className="qt-donut">
        <div className="qt-donut-chart">
          <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden>
            <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--bg-band)" strokeWidth={stroke} />
            {arcs.map(arc => (
              <circle
                key={arc.key}
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeDasharray={`${arc.dash} ${arc.rest}`}
                transform={`rotate(${arc.rotation} 64 64)`}
              />
            ))}
          </svg>
          <div className="qt-donut-center">
            <span className="qy-num">{total}</span>
            <span>{t('statusCard.total', { count: total })}</span>
          </div>
        </div>
        <ul className="qt-legend">
          {segments.map(seg => (
            <li key={seg.key}>
              <button
                type="button"
                aria-pressed={active === seg.key}
                className={cn('qt-legend-row', active === seg.key && 'is-active')}
                onClick={() => onSelect(active === seg.key ? 'all' : seg.key)}
              >
                <span className="qt-swatch" style={{ background: seg.color }} aria-hidden />
                <Icon name={seg.icon} size={16} />
                <span className="qt-legend-label">{seg.label}</span>
                <span className="qy-num">{seg.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  )
}
