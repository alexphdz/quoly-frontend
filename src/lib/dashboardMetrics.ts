import type { BuyerActionRead } from '../types/buyerAction'
import type { QuoteOverviewItem } from '../types/quote'
import type { RFQRead } from '../types/rfq'
import { deadlineDays, journeyIndex, rfqListBucket } from './rfqDisplay'
import { quoteListStatus } from './quoteDisplay'

export type RequestKpiKey = 'needsYou' | 'toReview' | 'awaiting' | 'dueWeek'

export function openAskRfqIds(actions: BuyerActionRead[]): Set<string> {
  return new Set(actions.filter(action => action.status === 'open').map(action => action.rfq_id))
}

export function draftQuoteRfqIds(quotes: QuoteOverviewItem[]): Set<string> {
  return new Set(quotes.filter(quote => quote.status === 'draft').map(quote => quote.rfq_id))
}

export function dueThisWeek(rfq: RFQRead, now = new Date()): boolean {
  if (rfqListBucket(rfq) !== 'open') return false
  const days = deadlineDays(rfq.response_deadline, now)
  return days != null && days >= 0 && days <= 7
}

export function matchesRequestKpi(
  rfq: RFQRead,
  key: RequestKpiKey,
  asked: Set<string>,
  drafts: Set<string>,
): boolean {
  if (key === 'needsYou') {
    return asked.has(rfq.id) || (rfq.supplier_stage_counts?.buyer_action_required ?? 0) > 0
  }
  if (key === 'toReview') return drafts.has(rfq.id)
  if (key === 'awaiting') return (rfq.supplier_stage_counts?.awaiting_response ?? 0) > 0
  return dueThisWeek(rfq)
}

export function requestKpiCounts(
  rfqs: RFQRead[],
  quotes: QuoteOverviewItem[],
  actions: BuyerActionRead[],
) {
  const asked = openAskRfqIds(actions)
  const drafts = new Set(quotes.filter(quote => quoteListStatus(quote) === 'draft').map(quote => quote.rfq_id))
  const due = rfqs.filter(rfq => dueThisWeek(rfq))
  const soonest = [...due].sort((a, b) => {
    const left = deadlineDays(a.response_deadline) ?? 99
    const right = deadlineDays(b.response_deadline) ?? 99
    return left - right
  })[0]
  const awaitingRfqs = rfqs.filter(rfq => matchesRequestKpi(rfq, 'awaiting', asked, drafts))
  return {
    needsYou: rfqs.filter(rfq => matchesRequestKpi(rfq, 'needsYou', asked, drafts)).length,
    toReview: rfqs.filter(rfq => matchesRequestKpi(rfq, 'toReview', asked, drafts)).length,
    awaiting: awaitingRfqs.length,
    awaitingSuppliers: awaitingRfqs.reduce((sum, rfq) => sum + (rfq.supplier_stage_counts?.awaiting_response ?? 0), 0),
    dueWeek: due.length,
    nextDue: soonest ?? null,
    asked,
    drafts,
  }
}

/** Calendar-day distance for a stored `YYYY-MM-DD` reply-by, without shifting the date. */
export function responseDeadlineDays(iso: string | null | undefined, now = new Date()): number | null {
  if (!iso) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return deadlineDays(iso, now)
  const start = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const end = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Math.round((end - start) / 86_400_000)
}

export interface RequestAttentionEvent {
  key: string
  kind: 'ask' | 'review'
  rfq: RFQRead
  at?: string
  to: string
  supplierName?: string
  question?: string
  askCount: number
  supplierNames: string[]
}

/** Buyer work already loaded for the requests page: open asks, then quotes still to review. */
export function requestAttentionEvents(
  rfqs: RFQRead[],
  quotes: QuoteOverviewItem[],
  actions: BuyerActionRead[],
): RequestAttentionEvent[] {
  const byId = new Map(rfqs.map(rfq => [rfq.id, rfq]))
  const events: RequestAttentionEvent[] = []
  const askedRfqs = new Set<string>()

  const asked = new Map<string, BuyerActionRead[]>()
  for (const action of actions) {
    if (action.status !== 'open') continue
    const key = `${action.rfq_id}:${action.supplier_id}`
    asked.set(key, [...(asked.get(key) ?? []), action])
  }
  for (const [key, group] of asked) {
    const rfq = byId.get(group[0].rfq_id)
    if (!rfq) continue
    askedRfqs.add(rfq.id)
    const ordered = [...group].sort((a, b) => a.created_at.localeCompare(b.created_at))
    const latest = ordered[ordered.length - 1]
    events.push({
      key: `ask-${key}`,
      kind: 'ask',
      rfq,
      at: latest.created_at,
      to: `/rfqs/${rfq.id}?tab=replies#needs-answer`,
      supplierName: latest.supplier_name?.trim() || undefined,
      question: latest.question?.trim() || undefined,
      askCount: group.length,
      supplierNames: [],
    })
  }

  for (const rfq of rfqs) {
    if (askedRfqs.has(rfq.id)) continue
    const need = rfq.supplier_stage_counts?.buyer_action_required ?? 0
    if (need <= 0) continue
    events.push({
      key: `need-${rfq.id}`,
      kind: 'ask',
      rfq,
      to: `/rfqs/${rfq.id}?tab=replies#needs-answer`,
      askCount: need,
      supplierNames: [],
    })
  }

  const drafts = new Map<string, QuoteOverviewItem[]>()
  for (const quote of quotes) {
    if (quoteListStatus(quote) !== 'draft') continue
    drafts.set(quote.rfq_id, [...(drafts.get(quote.rfq_id) ?? []), quote])
  }
  for (const [rfqId, pending] of drafts) {
    const rfq = byId.get(rfqId)
    if (!rfq) continue
    const ordered = [...pending].sort((a, b) => a.created_at.localeCompare(b.created_at))
    events.push({
      key: `review-${rfqId}`,
      kind: 'review',
      rfq,
      at: ordered[0].created_at,
      to: `/quotes/${ordered[0].id}`,
      askCount: 0,
      supplierNames: [...new Set(ordered.map(quote => quote.supplier_name?.trim()).filter((name): name is string => !!name))],
    })
  }

  return events.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'ask' ? -1 : 1
    return (a.at ?? '9999').localeCompare(b.at ?? '9999')
  })
}

export function dashboardStats(rfqs: RFQRead[], quotes: QuoteOverviewItem[]) {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  let open = 0
  let decidedMonth = 0
  let invited = 0
  let responded = 0
  const pipeline = [0, 0, 0, 0]
  for (const rfq of rfqs) {
    pipeline[journeyIndex(rfq)] += 1
    if (rfqListBucket(rfq) === 'open') open += 1
    if (rfq.status === 'decided' && new Date(rfq.updated_at) >= monthStart) decidedMonth += 1
    if (rfq.status !== 'draft') {
      invited += rfq.supplier_count
      responded += rfq.quoted_count
    }
  }
  return {
    open,
    toReview: quotes.filter(quote => quoteListStatus(quote) === 'draft').length,
    responseRate: invited > 0 ? responded / invited : null,
    decidedMonth,
    pipeline,
    invited,
    responded,
    inQuotes: pipeline[2],
  }
}

export type OpenSliceKey = 'quotes' | 'waiting' | 'attention' | 'other'

export interface HomeBoard {
  open: number
  readyToCompare: number
  slices: Array<{ key: OpenSliceKey, count: number }>
  toReview: number
  newToday: number
  queue: Array<{ key: string, name: string, count: number, to: string }>
  responseRate: number | null
  responded: number
  invited: number
  decidedMonth: number
  approaching: number
  latestAward: { id: string, name: string, at: string } | null
}

/** Open-request mix, review queue, response rate, and this month's awards. Counts come from loaded requests and quotes. */
export function homeBoard(rfqs: RFQRead[], quotes: QuoteOverviewItem[], now = new Date()): HomeBoard {
  const stats = dashboardStats(rfqs, quotes)
  let readyToCompare = 0
  let waiting = 0
  let attention = 0
  let other = 0
  for (const rfq of rfqs) {
    if (rfqListBucket(rfq) !== 'open') continue
    const needsBuyer = (rfq.supplier_stage_counts?.buyer_action_required ?? 0) > 0
    const hasQuotes = rfq.confirmed_count > 0 || rfq.quoted_count > 0
    const awaiting = (rfq.supplier_stage_counts?.awaiting_response ?? 0) > 0
    if (needsBuyer) attention += 1
    else if (hasQuotes) readyToCompare += 1
    else if (awaiting) waiting += 1
    else other += 1
  }
  const slices = (
    [
      { key: 'quotes' as const, count: readyToCompare },
      { key: 'waiting' as const, count: waiting },
      { key: 'attention' as const, count: attention },
      { key: 'other' as const, count: other },
    ]
  ).filter(slice => slice.count > 0)

  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const drafts = quotes.filter(quote => quoteListStatus(quote) === 'draft')
  const newToday = drafts.filter(quote => new Date(quote.created_at) >= dayStart).length
  const grouped = new Map<string, { name: string, count: number, to: string, at: string }>()
  for (const quote of drafts) {
    const current = grouped.get(quote.rfq_id)
    if (!current) {
      grouped.set(quote.rfq_id, { name: quote.rfq_name, count: 1, to: `/quotes/${quote.id}`, at: quote.created_at })
    } else {
      current.count += 1
      if (quote.created_at > current.at) {
        current.at = quote.created_at
        current.to = `/quotes/${quote.id}`
      }
    }
  }
  const queue = [...grouped.entries()]
    .sort((a, b) => b[1].at.localeCompare(a[1].at))
    .slice(0, 3)
    .map(([key, item]) => ({ key, name: item.name, count: item.count, to: item.to }))

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const latest = rfqs
    .filter(rfq => rfq.status === 'decided' && new Date(rfq.updated_at) >= monthStart)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0]
  const approaching = rfqs.filter(rfq => rfqListBucket(rfq) === 'open' && rfq.confirmed_count > 0).length

  return {
    open: stats.open,
    readyToCompare,
    slices,
    toReview: stats.toReview,
    newToday,
    queue,
    responseRate: stats.responseRate,
    responded: stats.responded,
    invited: stats.invited,
    decidedMonth: stats.decidedMonth,
    approaching,
    latestAward: latest ? { id: latest.id, name: latest.name, at: latest.updated_at } : null,
  }
}

export function upcomingDeadlines(rfqs: RFQRead[], limit = 4): RFQRead[] {
  return rfqs
    .filter(rfq => rfqListBucket(rfq) === 'open' && deadlineDays(rfq.response_deadline) != null)
    .sort((a, b) => (deadlineDays(a.response_deadline) ?? 99) - (deadlineDays(b.response_deadline) ?? 99))
    .slice(0, limit)
}

export function recentActivity(rfqs: RFQRead[], quotes: QuoteOverviewItem[], limit = 8) {
  const items: Array<{ key: string, kind: 'quote' | 'decided' | 'sent', at: string, title: string, to: string, detail?: string }> = []
  for (const quote of quotes) {
    items.push({
      key: `q-${quote.id}`,
      kind: 'quote',
      at: quote.created_at,
      title: quote.supplier_name,
      detail: quote.rfq_name,
      to: `/quotes/${quote.id}`,
    })
  }
  for (const rfq of rfqs) {
    if (rfq.status === 'decided') {
      items.push({
        key: `d-${rfq.id}`,
        kind: 'decided',
        at: rfq.updated_at,
        title: rfq.name,
        to: `/rfqs/${rfq.id}/comparison`,
      })
    } else if (rfq.status !== 'draft' && rfq.supplier_count > 0 && rfq.quoted_count === 0) {
      items.push({
        key: `s-${rfq.id}`,
        kind: 'sent',
        at: rfq.updated_at,
        title: rfq.name,
        to: `/rfqs/${rfq.id}`,
      })
    }
  }
  return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit)
}
