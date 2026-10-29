import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormat } from '../../../lib/format'
import { cx } from '../../utils'
import { useAmount } from './shared'

export type PriceDifferenceProps = {
  /** Precio normalizado de esta cotización; null = no comparable. */
  amount?: number | null
  currency?: string
  unit?: string
  /** Precios normalizados comparables del conjunto. */
  set?: Array<number | null | undefined>
  reason?: string
  showPrice?: boolean
  className?: string
  style?: CSSProperties
}

/** Diferencia respecto al menor precio comparable ("Base" para el menor). No es ahorro ni ranking. */
export function PriceDifference({ amount, currency, unit, set = [], reason, showPrice = true, className, style }: PriceDifferenceProps) {
  const { t } = useTranslation('ds')
  const { locale } = useFormat()
  const fmt = useAmount()
  const values = set.filter((n): n is number => typeof n === 'number')

  if (amount == null) {
    return (
      <div className={cx('q-cmp-diff', 'is-noncomparable', className)} style={style}>
        <span className="q-cmp-diff-nc">{t('cmp.notComparable')}</span>
        {reason && <span className="q-cmp-meta">{reason}</span>}
      </div>
    )
  }
  if (values.length < 2) {
    return (
      <div className={cx('q-cmp-diff', 'is-single', className)} style={style}>
        <span className="q-cmp-diff-amount">{`${fmt(amount)} ${currency ?? ''}`.trim()}</span>
        <span className="q-cmp-meta">{t('cmp.diff.noSet')}</span>
      </div>
    )
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const delta = amount - min
  const base = Math.abs(delta) < 0.005
  const pct = min ? (delta / min) * 100 : 0
  const width = Math.round((amount / max) * 100)
  return (
    <div className={cx('q-cmp-diff', className)} style={style}>
      <span className="q-cmp-diff-value">{base ? t('cmp.diff.base') : `+${fmt(delta)} ${currency ?? ''}`.trim()}</span>
      <span className="q-cmp-meta">
        {base
          ? t('cmp.diff.baseDetail')
          : t('cmp.diff.percent', { pct: new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(pct) })}
      </span>
      <span role="img" aria-label={t('cmp.diff.barLabel', { pct: width })} className="q-cmp-diff-bar">
        <span style={{ width: `${width}%` }} />
      </span>
      {showPrice && <span className="q-cmp-meta">{t('cmp.diff.normalized', { value: `${fmt(amount)} ${currency ?? ''}${unit ? ` ${unit}` : ''}`.trim() })}</span>}
    </div>
  )
}
