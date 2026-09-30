import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { QuoteOverviewItem } from '../../types/quote'
import type { RFQRead } from '../../types/rfq'
import { deadlineDays, rfqDisplayNumber } from '../../lib/rfqDisplay'
import { quoteListStatus } from '../../lib/quoteDisplay'
import { Btn } from '../ds'
import { useFormat } from '../../lib/format'

const STATUS_COLOR = {
  confirmed: 'var(--success-mark)',
  draft: 'var(--warn-mark)',
  rejected: 'var(--tx-3)',
} as const

type Counts = { confirmed: number, draft: number, rejected: number, total: number }

function countsOf(quotes: QuoteOverviewItem[]): Counts {
  const counts: Counts = { confirmed: 0, draft: 0, rejected: 0, total: quotes.length }
  for (const quote of quotes) {
    const status = quoteListStatus(quote)
    if (status === 'confirmed' || status === 'draft' || status === 'rejected') counts[status] += 1
  }
  return counts
}

function MiniBar({ counts }: { counts: Counts }) {
  const parts = (['confirmed', 'draft', 'rejected'] as const).filter(key => counts[key] > 0)
  if (parts.length === 0 || counts.total === 0) return <span className="rq-mini-bar" aria-hidden />
  return (
    <span className="rq-mini-bar" aria-hidden>
      {parts.map(key => (
        <span key={key} style={{ flex: counts[key], background: STATUS_COLOR[key] }} />
      ))}
    </span>
  )
}

export default function ReviewQueue({
  quotes,
  rfqs,
  nextQuoteId,
}: {
  quotes: QuoteOverviewItem[]
  rfqs: RFQRead[]
  nextQuoteId?: string
}) {
  const { t } = useTranslation('quotation')
  const fmt = useFormat()
  const navigate = useNavigate()
  const totals = countsOf(quotes)
  const headline = totals.draft === 0
    ? t('queue.allReviewed', { count: totals.total })
    : t('queue.needReview', { count: totals.draft, draft: totals.draft, total: totals.total })

  const byRfq = new Map<string, QuoteOverviewItem[]>()
  for (const quote of quotes) {
    byRfq.set(quote.rfq_id, [...(byRfq.get(quote.rfq_id) ?? []), quote])
  }
  const rfqById = new Map(rfqs.map(rfq => [rfq.id, rfq]))

  const upNext = [...byRfq.entries()]
    .map(([rfqId, group]) => {
      const rfq = rfqById.get(rfqId)
      const counts = countsOf(group)
      const oldestDraft = [...group].filter(q => quoteListStatus(q) === 'draft').sort((a, b) => a.created_at.localeCompare(b.created_at))[0]
      const name = rfq?.name ?? group[0].rfq_name
      const number = rfq ? rfqDisplayNumber(rfq) : group[0].rfq_number
      const days = deadlineDays(rfq?.response_deadline)
      const ready = counts.draft === 0 && counts.confirmed >= 2
      const hasWork = counts.draft > 0 || ready
      return { rfqId, name, number, counts, days, deadline: rfq?.response_deadline ?? null, oldestDraft, ready, hasWork }
    })
    .filter(row => row.hasWork)
    .sort((a, b) => {
      if (a.days == null && b.days == null) return 0
      if (a.days == null) return 1
      if (b.days == null) return -1
      return a.days - b.days
    })

  const shown = upNext.slice(0, 5)
  const more = upNext.length - shown.length

  const dueLabel = (days: number | null, iso: string | null) => {
    if (days == null || !iso) return null
    const weekday = fmt.date(iso, { weekday: 'short' })
    if (days < 0) return t('queue.overdue')
    if (days === 0) return t('queue.dueToday')
    return t('queue.dueWeekday', { day: weekday })
  }

  return (
    <section className="qy-card rq-queue">
      <header className="rq-queue-head">
        <div>
          <p className="rq-queue-kicker">{t('queue.label')}</p>
          <h2 className="rq-queue-title">{headline}</h2>
        </div>
        <Btn
          variant="primary"
          disabled={!nextQuoteId}
          disabledReason={t('reviewNextNone')}
          onClick={() => nextQuoteId && navigate(`/quotes/${nextQuoteId}`)}
        >
          {t('reviewNext')}
        </Btn>
      </header>

      <div className="rq-queue-track" aria-hidden>
        {(['confirmed', 'draft', 'rejected'] as const).filter(key => totals[key] > 0).map(key => (
          <span key={key} style={{ flex: totals[key], background: STATUS_COLOR[key] }} />
        ))}
      </div>
      <ul className="rq-queue-legend">
        {(['confirmed', 'draft', 'rejected'] as const).map(key => (
          <li key={key}>
            <span className="rq-dot" style={{ background: STATUS_COLOR[key] }} />
            {t(`queue.${key}`)}
            <span className="qy-num">{totals[key]}</span>
          </li>
        ))}
      </ul>

      {shown.length > 0 && (
        <>
          <h3 className="rq-queue-sub">{t('queue.upNext')}</h3>
          <ul className="rq-queue-list">
            {shown.map((row) => {
              const to = row.oldestDraft ? `/quotes/${row.oldestDraft.id}` : `/rfqs/${row.rfqId}/comparison`
              const action = row.oldestDraft ? t('queue.review') : t('queue.compare')
              const due = dueLabel(row.days, row.deadline)
              const summary = row.counts.draft > 0
                ? [
                    t('queue.toReviewLine', { count: row.counts.draft }),
                    row.counts.confirmed > 0 ? t('queue.includedLine', { count: row.counts.confirmed }) : null,
                    due,
                  ].filter(Boolean).join(' · ')
                : [t('queue.allIncluded', { count: row.counts.confirmed }), t('queue.ready')].join(' · ')
              return (
                <li key={row.rfqId}>
                  <Link to={to} className="rq-queue-row">
                    <span className="rq-queue-main">
                      <span className="rq-queue-name">
                        <span className="truncate">{row.name}</span>
                        {row.number && <span className="ds-id">{row.number}</span>}
                      </span>
                      <span className="rq-queue-meta">{summary}</span>
                    </span>
                    <MiniBar counts={row.counts} />
                    <span className="rq-queue-go">{action}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
          {more > 0 && (
            <Link to="/requests" className="rq-queue-more">{t('queue.viewAll', { count: upNext.length })}</Link>
          )}
        </>
      )}
    </section>
  )
}
