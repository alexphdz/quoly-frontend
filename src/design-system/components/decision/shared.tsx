import { cx } from '../../utils'

export type DecisionPrice = { amount: number, currency: string, unit?: string }
export type DecisionFact = { label: string, value?: string | null, note?: string }

/** Línea de selección de marca 28×2. */
export function DecUnderline({ on, width = 28 }: { on: boolean, width?: number }) {
  return <span aria-hidden="true" className={cx('q-dec-underline', on && 'is-on')} style={{ width }} />
}
