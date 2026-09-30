export type DayPart = 'morning' | 'afternoon' | 'evening'

/**
 * Greeting bucket from the user's local clock.
 * 05:00–11:59 morning, 12:00–18:59 afternoon, 19:00–04:59 evening/night.
 */
export function dayPart(now = new Date()): DayPart {
  const hour = now.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 19) return 'afternoon'
  return 'evening'
}
