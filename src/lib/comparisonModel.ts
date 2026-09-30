import type { ComparisonResponse, ComparisonRow, CostKind } from '../types/comparison'
import { leadTimeRankDays } from './comparisonCommercial'

const CONVERSION_FLAGS = ['currency_conversion', 'unit_conversion']
const EXTRA_KINDS: CostKind[] = ['plates', 'tooling', 'freight', 'other']
const FX_SWING = 0.02

export interface RankedRow {
  row: ComparisonRow
  /** 1-based; null when the quote has no comparable price. */
  rank: number | null
  comparable: number | null
  total: number | null
  deltaUnit: number | null
  deltaTotal: number | null
  leadDays: number | null
  fastest: boolean
  moqExcess: { units: number, cost: number | null } | null
  advancePercent: number | null
  /** Separately charged lines other suppliers quoted that this one did not mention. */
  unquotedKinds: CostKind[]
  unquotedEstimate: number | null
  /** Issues that affect completeness: missing fields plus unquoted lines. */
  gaps: number
  blocked: boolean
}

export type IssueKind = 'unquoted_lines' | 'moq' | 'advance' | 'missing_fields' | 'not_comparable' | 'fx'

export interface ReviewIssue {
  id: string
  kind: IssueKind
  quoteId: string
  supplier: string
  /** Money at stake for the requested quantity, in base currency. */
  impact: number | null
  kinds?: CostKind[]
  fields?: string[]
  moq?: number
  extraUnits?: number
  percent?: number
  currency?: string
  rate?: number
}

export interface ComparisonModel {
  rows: RankedRow[]
  leader: RankedRow | null
  runnerUp: RankedRow | null
  quantity: number | null
  kinds: CostKind[]
  issues: ReviewIssue[]
  priceMax: number
}

export function comparablePrice(row: ComparisonRow): number | null {
  return row.all_in_price ?? row.normalized_price ?? null
}

export function advancePercent(terms: string | null | undefined): number | null {
  if (!terms) return null
  const after = terms.match(/(\d{1,3})\s*%[^.;\n]{0,40}?(advance|anticipo|anticipad|adelant|upfront|prepag|por adelantado)/i)
  const before = terms.match(/(advance|anticipo|adelanto|upfront|prepago)[^\d.;\n]{0,20}(\d{1,3})\s*%/i)
  const value = after ? Number(after[1]) : before ? Number(before[2]) : null
  return value != null && value > 0 && value <= 100 ? value : null
}

function quotedKinds(row: ComparisonRow): Set<CostKind> {
  return new Set((row.cost_breakdown ?? []).map(line => line.kind))
}

export function buildComparisonModel(cmp: ComparisonResponse, requestedQuantity?: number | null): ComparisonModel {
  const quantity = cmp.requested_quantity ?? requestedQuantity ?? null
  const order = new Map(cmp.ranking.map((id, index) => [id, index]))
  const sorted = [...cmp.rows].sort((a, b) => (order.get(a.quote_id) ?? 1e9) - (order.get(b.quote_id) ?? 1e9))

  const leadValues = sorted
    .map(row => leadTimeRankDays(row.commercial_offer, row.raw_delivery_lead_time_days))
    .filter((value): value is number => value != null)
  const fastestDays = leadValues.length > 1 ? Math.min(...leadValues) : null

  // Cheapest normalized total each extra kind was quoted at, to estimate what a supplier left out.
  const cheapestByKind = new Map<CostKind, number>()
  for (const row of sorted) {
    for (const line of row.cost_breakdown ?? []) {
      if (!EXTRA_KINDS.includes(line.kind) || line.included || line.normalized_total == null) continue
      const current = cheapestByKind.get(line.kind)
      if (current === undefined || line.normalized_total < current) cheapestByKind.set(line.kind, line.normalized_total)
    }
  }
  const kindsQuoted = EXTRA_KINDS.filter(kind => sorted.some(row => quotedKinds(row).has(kind)))

  let rank = 0
  const ranked: RankedRow[] = sorted.map(row => {
    const comparable = comparablePrice(row)
    const blocked = row.missing_fields.some(field => CONVERSION_FLAGS.includes(field))
    const itemized = (row.cost_breakdown ?? []).length > 0
    const mine = quotedKinds(row)
    const unquotedKinds = kindsQuoted.filter(kind => !mine.has(kind) && (itemized || kind !== 'other'))
    const estimates = unquotedKinds.map(kind => cheapestByKind.get(kind)).filter((v): v is number => v != null)
    const moq = row.raw_quantity_moq
    const surplus = moq != null && quantity != null && moq > quantity ? moq - quantity : null
    const leadDays = leadTimeRankDays(row.commercial_offer, row.raw_delivery_lead_time_days)
    const missingFields = row.missing_fields.filter(field => !CONVERSION_FLAGS.includes(field))
    return {
      row,
      rank: comparable != null ? ++rank : null,
      comparable,
      total: comparable != null && quantity ? comparable * quantity : null,
      deltaUnit: null,
      deltaTotal: null,
      leadDays,
      fastest: fastestDays != null && leadDays === fastestDays,
      moqExcess: surplus != null
        ? { units: surplus, cost: row.normalized_price != null ? surplus * row.normalized_price : null }
        : null,
      advancePercent: advancePercent(row.raw_payment_terms),
      unquotedKinds,
      unquotedEstimate: estimates.length ? estimates.reduce((sum, value) => sum + value, 0) : null,
      gaps: missingFields.length + unquotedKinds.length,
      blocked,
    }
  })

  const leader = ranked.find(item => item.rank === 1) ?? null
  const runnerUp = ranked.find(item => item.rank === 2) ?? null
  for (const item of ranked) {
    if (leader?.comparable != null && item.comparable != null) {
      item.deltaUnit = item.comparable - leader.comparable
      item.deltaTotal = quantity ? item.deltaUnit * quantity : null
    }
  }

  const issues: ReviewIssue[] = []
  for (const item of ranked) {
    const { row } = item
    const base = { quoteId: row.quote_id, supplier: row.supplier_name }
    if (item.blocked) {
      issues.push({ ...base, id: `${row.quote_id}-conv`, kind: 'not_comparable', impact: null })
    }
    if (item.unquotedKinds.length > 0) {
      issues.push({ ...base, id: `${row.quote_id}-lines`, kind: 'unquoted_lines', impact: item.unquotedEstimate, kinds: item.unquotedKinds })
    }
    if (item.moqExcess) {
      issues.push({ ...base, id: `${row.quote_id}-moq`, kind: 'moq', impact: item.moqExcess.cost, moq: row.raw_quantity_moq ?? undefined, extraUnits: item.moqExcess.units })
    }
    if (item.advancePercent != null && item.advancePercent >= 30) {
      issues.push({
        ...base,
        id: `${row.quote_id}-adv`,
        kind: 'advance',
        impact: item.total != null ? (item.total * item.advancePercent) / 100 : null,
        percent: item.advancePercent,
      })
    }
    const missing = row.missing_fields.filter(field => !CONVERSION_FLAGS.includes(field))
    if (missing.length > 0) {
      issues.push({ ...base, id: `${row.quote_id}-fields`, kind: 'missing_fields', impact: null, fields: missing })
    }
    const currency = row.raw_currency?.toUpperCase()
    const rate = currency ? cmp.fx_rates?.[currency] : undefined
    if (currency && currency !== cmp.base_currency.toUpperCase() && rate && item.rank != null && item.rank <= 2) {
      issues.push({
        ...base,
        id: `${row.quote_id}-fx`,
        kind: 'fx',
        impact: item.total != null ? item.total * FX_SWING : null,
        currency,
        rate,
      })
    }
  }
  issues.sort((a, b) => (b.impact ?? -1) - (a.impact ?? -1))

  const kinds: CostKind[] = ranked.some(item => (item.row.cost_breakdown ?? []).length > 0)
    ? (['product', ...kindsQuoted] as CostKind[])
    : []

  return {
    rows: ranked,
    leader,
    runnerUp,
    quantity,
    kinds,
    issues,
    priceMax: Math.max(0, ...ranked.map(item => item.comparable ?? 0)),
  }
}

export const FX_SWING_PERCENT = FX_SWING * 100
