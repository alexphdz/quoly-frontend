/** Packaging types for buyer-owned provider records (matches Backend allow-list). */
export const PACKAGING_CATEGORIES = [
  'corrugated',
  'folding_carton',
  'flexible',
  'rigid',
  'labels',
  'other',
] as const

export type PackagingCategory = (typeof PACKAGING_CATEGORIES)[number]
