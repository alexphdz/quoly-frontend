export function quoteHasPrice(quote: { raw_price?: number | null, normalized_price?: number | null }) {
  return quote.raw_price != null || quote.normalized_price != null
}

/** Quotes without a price never count as included. */
export function quoteListStatus(quote: { status: string, raw_price?: number | null, normalized_price?: number | null }) {
  if (!quoteHasPrice(quote)) return 'draft'
  return quote.status
}

export type QuoteReview = 'review' | 'confirmed' | 'partial' | 'rejected'

type QuoteReviewInput = { status: string, raw_price?: number | null, normalized_price?: number | null }

/**
 * Estado de revisión canónico de una cotización. Única fuente de verdad que
 * comparten Inicio, la barra lateral y la vista de Cotizaciones, para que
 * «por revisar» signifique lo mismo en toda la app.
 * - rejected: descartada por el comprador.
 * - partial: llegó sin precio; no hay nada que comparar todavía.
 * - confirmed: el comprador ya validó sus datos.
 * - review: tiene precio y espera la decisión del comprador.
 */
export function quoteReview(quote: QuoteReviewInput): QuoteReview {
  if (quote.status === 'rejected') return 'rejected'
  if (!quoteHasPrice(quote)) return 'partial'
  return quote.status === 'confirmed' ? 'confirmed' : 'review'
}

/** Cotización que espera la revisión del comprador (con precio, sin confirmar ni rechazar). */
export function quoteNeedsReview(quote: QuoteReviewInput): boolean {
  return quoteReview(quote) === 'review'
}
