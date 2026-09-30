import type { QuoteRead } from '../types/quote'

/** Mirrors PIECE/THOUSAND/BOX synonyms in Backend/app/services/normalization.py. */
const PIECE = new Set(['piece', 'pieces', 'pieza', 'piezas', 'unit', 'units', 'unidad', 'unidades', 'each', 'ea', 'pcs', 'pc', 'u', 'pza', 'pzas', 'pz'])
const THOUSAND = new Set(['thousand', 'thousands', 'millar', 'millares', 'mil', 'm', 'k'])
const BOX = new Set(['box', 'boxes', 'caja', 'cajas', 'carton', 'cartón', 'cartons', 'case', 'cases'])

export function piecesPerUnit(unit: string | null | undefined, quantityPerUnit: number | null | undefined): number | null {
  const key = (unit ?? '').trim().toLowerCase().replace(/\.$/, '')
  if (PIECE.has(key)) return 1
  if (THOUSAND.has(key)) return 1000
  if (BOX.has(key)) return quantityPerUnit ?? null
  return null
}

export interface NormalizationSteps {
  raw: { price: number, currency: string, unit: string }
  /** Base-currency value of one unit of the quoted currency, implied by the stored result. */
  rate: number | null
  /** Pieces in one quoted unit, when it isn't 1. */
  divisor: number | null
  result: { price: number, currency: string, unit: string }
}

/** Reconstruct how the stored normalized price was derived from the quoted one. */
export function normalizationSteps(quote: QuoteRead, baseUnit?: string | null): NormalizationSteps | null {
  const { raw_price: price, raw_currency: currency, raw_unit: unit, normalized_price: result } = quote
  if (price == null || !currency || result == null || !quote.normalized_currency) return null
  const quoted = piecesPerUnit(unit, quote.raw_quantity_per_unit) ?? 1
  const base = piecesPerUnit(baseUnit ?? quote.normalized_unit, null) ?? 1
  const divisor = quoted / base
  const sameCurrency = currency.toUpperCase() === quote.normalized_currency.toUpperCase()
  const rate = sameCurrency || price === 0 ? null : (result * divisor) / price
  return {
    raw: { price, currency: currency.toUpperCase(), unit: unit ?? '' },
    rate,
    divisor: divisor !== 1 ? divisor : null,
    result: { price: result, currency: quote.normalized_currency, unit: quote.normalized_unit ?? baseUnit ?? '' },
  }
}

export type ReviewFieldKey =
  | 'price'
  | 'currency'
  | 'unit'
  | 'quantity_per_unit'
  | 'quantity_moq'
  | 'delivery_lead_time_days'
  | 'payment_terms'
  | 'delivery_point'

export const REVIEW_FIELD_TO_QUOTE: Record<ReviewFieldKey, keyof QuoteRead> = {
  price: 'raw_price',
  currency: 'raw_currency',
  unit: 'raw_unit',
  quantity_per_unit: 'raw_quantity_per_unit',
  quantity_moq: 'raw_quantity_moq',
  delivery_lead_time_days: 'raw_delivery_lead_time_days',
  payment_terms: 'raw_payment_terms',
  delivery_point: 'raw_delivery_point',
}

/** What the extraction pass originally read, before any buyer edit. */
export function extractedValue(quote: QuoteRead, key: ReviewFieldKey): string | number | null {
  const commercial = (quote.extraction_pass as { commercial?: Record<string, unknown> } | null | undefined)?.commercial
  if (!commercial) return null
  const value = commercial[key]
  return typeof value === 'string' || typeof value === 'number' ? value : null
}

export function sameValue(a: unknown, b: unknown): boolean {
  const norm = (v: unknown) => (v == null || v === '' ? null : typeof v === 'string' ? v.trim().toLowerCase() : Number(v))
  return norm(a) === norm(b)
}

/** Locate the supplier's wording in the source text, tolerant of spacing and table separators. */
export function findSnippet(text: string, snippet: string | null | undefined): [number, number] | null {
  if (!text || !snippet) return null
  const tokens = snippet.split(/[\s|]+/).filter(Boolean).map(token => token.replace(/[.*+?^${}()[\]\\]/g, '\\$&'))
  for (const size of [tokens.length, Math.min(tokens.length, 6), Math.min(tokens.length, 3)]) {
    if (size === 0) break
    const match = new RegExp(tokens.slice(0, size).join('[\\s|]+'), 'i').exec(text)
    if (match) return [match.index, match.index + match[0].length]
  }
  return null
}
