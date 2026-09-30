import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { RFQRead } from '../../types/rfq'
import type { BuyerActionRead } from '../../types/buyerAction'
import type { QuoteOverviewItem } from '../../types/quote'
import { deadlineDays, rfqDisplayNumber, rfqListBucket } from '../../lib/rfqDisplay'
import { quoteListStatus } from '../../lib/quoteDisplay'
import { Icon, SectionCard } from '../ds'
import { useRelativeDays } from './RequestsLedgerTable'

type GroupKey = 'questions' | 'reviews' | 'deadlines' | 'compare'

interface AttentionItem {
  key: string
  group: GroupKey
  rfq: RFQRead
  reason: string
  at?: string
  action: string
  to: string
}

const MAX_ITEMS = 5

export default function AttentionCard({
  rfqs,
  quotes,
  actions,
}: {
  rfqs: RFQRead[]
  quotes: QuoteOverviewItem[]
  actions: BuyerActionRead[]
}) {
  const { t } = useTranslation('rfq')
  const navigate = useNavigate()
  const relative = useRelativeDays()

  const items = useMemo<AttentionItem[]>(() => {
    const byId = new Map(rfqs.map(rfq => [rfq.id, rfq]))
    const list: AttentionItem[] = []

    const asked = new Map<string, BuyerActionRead[]>()
    for (const action of actions) {
      const key = `${action.rfq_id}:${action.supplier_id}`
      asked.set(key, [...(asked.get(key) ?? []), action])
    }
    for (const [key, group] of asked) {
      const rfq = byId.get(group[0].rfq_id)
      if (!rfq) continue
      const supplier = group[0].supplier_name ?? t('dashboard.attention.aSupplier')
      list.push({
        key: `q-${key}`,
        group: 'questions',
        rfq,
        reason: group.length === 1
          ? t('dashboard.attention.asked', { supplier })
          : t('dashboard.attention.askedMany', { supplier, count: group.length }),
        at: group[group.length - 1].created_at,
        action: t('dashboard.attention.replyAction'),
        to: `/rfqs/${rfq.id}?tab=overview#needs-answer`,
      })
    }

    const drafts = new Map<string, QuoteOverviewItem[]>()
    const confirmed = new Map<string, number>()
    for (const quote of quotes) {
      if (quoteListStatus(quote) === 'draft') drafts.set(quote.rfq_id, [...(drafts.get(quote.rfq_id) ?? []), quote])
      if (quoteListStatus(quote) === 'confirmed') confirmed.set(quote.rfq_id, (confirmed.get(quote.rfq_id) ?? 0) + 1)
    }
    for (const [rfqId, pending] of drafts) {
      const rfq = byId.get(rfqId)
      if (!rfq) continue
      const oldest = [...pending].sort((a, b) => a.created_at.localeCompare(b.created_at))[0]
      list.push({
        key: `r-${rfqId}`,
        group: 'reviews',
        rfq,
        reason: t('dashboard.attention.toReview', { count: pending.length }),
        at: oldest.created_at,
        action: t('dashboard.attention.reviewAction'),
        to: `/quotes/${oldest.id}`,
      })
    }

    for (const rfq of rfqs) {
      if (rfqListBucket(rfq) !== 'open') continue
      const days = deadlineDays(rfq.response_deadline)
      if (days == null || days > 1) continue
      list.push({
        key: `d-${rfq.id}`,
        group: 'deadlines',
        rfq,
        reason: days < 0
          ? t('dashboard.attention.overdue', { count: Math.abs(days) })
          : t('dashboard.attention.deadline', { when: relative(days).toLocaleLowerCase() }),
        at: rfq.response_deadline ?? undefined,
        action: t('dashboard.attention.openAction'),
        to: `/rfqs/${rfq.id}`,
      })
    }

    for (const [rfqId, count] of confirmed) {
      const rfq = byId.get(rfqId)
      if (!rfq || rfqListBucket(rfq) !== 'open' || count < 2) continue
      list.push({
        key: `c-${rfqId}`,
        group: 'compare',
        rfq,
        reason: t('dashboard.attention.ready', { count }),
        at: rfq.updated_at,
        action: t('dashboard.attention.compareAction'),
        to: `/rfqs/${rfqId}/comparison`,
      })
    }
    return list
  }, [rfqs, quotes, actions, t, relative])

  const shown = items.slice(0, MAX_ITEMS)
  const groups = (['questions', 'reviews', 'deadlines', 'compare'] as const)
    .map(key => ({ key, items: shown.filter(item => item.group === key) }))
    .filter(group => group.items.length > 0)

  return (
    <SectionCard plain title={t('dashboard.attention.title')} flush>
      {items.length === 0 ? (
        <div className="rq-caught-up">
          <Icon name="check_circle" size={16} />
          <span>{t('dashboard.attention.caughtUp')}</span>
        </div>
      ) : (
        groups.map(group => (
          <div key={group.key}>
            <p className="rq-attention-group">
              {t(`dashboard.attention.groups.${group.key}`, { count: items.filter(item => item.group === group.key).length })}
            </p>
            <ul className="rq-attention">
              {group.items.map(item => (
                <li key={item.key} onClick={() => navigate(item.to)}>
                  <div className="rq-attention-text">
                    <div className="rq-attention-title">
                      <span className="truncate">{item.rfq.name}</span>
                      <span className="ds-id">{rfqDisplayNumber(item.rfq)}</span>
                    </div>
                    <p className="rq-attention-reason">{item.reason}</p>
                  </div>
                  {item.at && <span className="rq-attention-time">{relative(deadlineDays(item.at) ?? 0)}</span>}
                  <span className="rq-attention-action">{item.action}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
      {items.length > MAX_ITEMS && (
        <button type="button" className="ds-btn ds-btn-text" onClick={() => navigate('/requests')}>
          {t('dashboard.attention.viewAll', { count: items.length })}
        </button>
      )}
    </SectionCard>
  )
}
