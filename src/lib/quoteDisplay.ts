export function quoteHasPrice(quote: { raw_price?: number | null, normalized_price?: number | null }) {
  return quote.raw_price != null || quote.normalized_price != null
}

/** Quotes without a price never count as included. */
export function quoteListStatus(quote: { status: string, raw_price?: number | null, normalized_price?: number | null }) {
  if (!quoteHasPrice(quote)) return 'draft'
  return quote.status
}
