import type { BuyerActionRead } from '../types/buyerAction'
import type { QuoteOverviewItem } from '../types/quote'
import type { RFQRead } from '../types/rfq'
import { responseDeadlineDays } from './dashboardMetrics'
import { quoteHasPrice, quoteListStatus } from './quoteDisplay'
import { rfqListBucket } from './rfqDisplay'

/* Derivaciones de solo lectura para Inicio (01). No cambian datos: ordenan y agrupan lo que la app ya carga. */

export type HomeQuoteItem = { id: string, supplier: string, rfqName: string, noPrice: boolean, to: string }
export type HomeAskItem = { key: string, supplier?: string, rfqName: string, question?: string, count: number, to: string }
export type HomeDateItem = { key: string, rfqId: string, rfqName: string, date: string, days: number, kind: 'response' | 'delivery' }
export type HomeEvent = {
  key: string
  kind: 'review' | 'quote' | 'ask' | 'awarded' | 'created'
  at: string
  to: string
  supplier?: string
  rfqName: string
  question?: string
  noPrice?: boolean
  missing?: number
}

const askTo = (rfqId: string) => `/rfqs/${rfqId}?tab=replies#needs-answer`

/** Cotizaciones pendientes de revisión, más recientes primero. */
export function quotesToReview(quotes: QuoteOverviewItem[]): HomeQuoteItem[] {
  return quotes
    .filter(q => quoteListStatus(q) === 'draft')
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map(q => ({ id: q.id, supplier: q.supplier_name, rfqName: q.rfq_name, noPrice: !quoteHasPrice(q), to: `/quotes/${q.id}` }))
}

/** Proveedores que esperan al comprador: preguntas abiertas y, si no hay detalle, la etapa «requiere acción» de la solicitud. */
export function suppliersAwaiting(rfqs: RFQRead[], actions: BuyerActionRead[]) {
  const byId = new Map(rfqs.map(r => [r.id, r]))
  const items: HomeAskItem[] = []
  const covered = new Set<string>()
  const bySupplier = new Map<string, BuyerActionRead[]>()
  for (const a of actions) {
    if (a.status !== 'open' || !byId.has(a.rfq_id)) continue
    const k = `${a.rfq_id}:${a.supplier_id}`
    bySupplier.set(k, [...(bySupplier.get(k) ?? []), a])
  }
  for (const [k, group] of bySupplier) {
    const latest = [...group].sort((a, b) => a.created_at.localeCompare(b.created_at)).at(-1)!
    const rfq = byId.get(latest.rfq_id)!
    covered.add(rfq.id)
    items.push({ key: k, supplier: latest.supplier_name?.trim() || undefined, rfqName: rfq.name, question: latest.question?.trim() || undefined, count: group.length, to: askTo(rfq.id) })
  }
  let total = items.length
  for (const rfq of rfqs) {
    if (rfqListBucket(rfq) !== 'open' || covered.has(rfq.id)) continue
    const need = rfq.supplier_stage_counts?.buyer_action_required ?? 0
    if (need <= 0) continue
    total += need
    items.push({ key: `need-${rfq.id}`, rfqName: rfq.name, count: need, to: askTo(rfq.id) })
  }
  return { items, total }
}

/** Conteo por estado documentado: Borrador · Abierta · Cerrada. */
export function statusCounts(rfqs: RFQRead[]) {
  const c = { draft: 0, open: 0, closed: 0 }
  for (const r of rfqs) c[rfqListBucket(r)] += 1
  return c
}

/** Fechas de solicitudes abiertas (plazo de respuesta y entrega deseada), por fecha; y las que no tienen ninguna. */
export function upcomingDates(rfqs: RFQRead[], limit = 4, now = new Date()) {
  const rows: HomeDateItem[] = []
  const undated: string[] = []
  for (const r of rfqs) {
    if (rfqListBucket(r) !== 'open') continue
    const resp = responseDeadlineDays(r.response_deadline, now)
    const deliv = responseDeadlineDays(r.requested_delivery_date, now)
    if (resp != null && r.response_deadline) rows.push({ key: `r-${r.id}`, rfqId: r.id, rfqName: r.name, date: r.response_deadline, days: resp, kind: 'response' })
    if (deliv != null && deliv >= 0 && r.requested_delivery_date) rows.push({ key: `d-${r.id}`, rfqId: r.id, rfqName: r.name, date: r.requested_delivery_date, days: deliv, kind: 'delivery' })
    if (resp == null && deliv == null) undated.push(r.name)
  }
  rows.sort((a, b) => a.days - b.days)
  return { rows: rows.slice(0, limit), undated }
}

/** Actividad del flujo documentado: respuestas, revisión pendiente, preguntas, solicitudes creadas y adjudicaciones. */
export function homeActivity(rfqs: RFQRead[], quotes: QuoteOverviewItem[], actions: BuyerActionRead[], limit = 7): HomeEvent[] {
  const byId = new Map(rfqs.map(r => [r.id, r]))
  const events: HomeEvent[] = []
  for (const q of quotes) {
    const review = quoteListStatus(q) === 'draft'
    events.push({
      key: `q-${q.id}`, kind: review ? 'review' : 'quote', at: q.created_at, to: `/quotes/${q.id}`,
      supplier: q.supplier_name, rfqName: q.rfq_name, noPrice: !quoteHasPrice(q), missing: q.missing_fields_count,
    })
  }
  for (const a of actions) {
    const rfq = byId.get(a.rfq_id)
    if (a.status !== 'open' || !rfq) continue
    events.push({ key: `a-${a.id}`, kind: 'ask', at: a.created_at, to: askTo(rfq.id), supplier: a.supplier_name?.trim() || undefined, rfqName: rfq.name, question: a.question?.trim() || undefined })
  }
  for (const r of rfqs) {
    if (r.status === 'decided') events.push({ key: `w-${r.id}`, kind: 'awarded', at: r.updated_at, to: `/rfqs/${r.id}/comparison`, rfqName: r.name })
    else if (r.status === 'draft') events.push({ key: `c-${r.id}`, kind: 'created', at: r.created_at, to: `/rfqs/${r.id}`, rfqName: r.name })
  }
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit)
}
