import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { CmpStatus, useAmount, type ReviewStatus } from '../comparison/shared'
import { KeyValueGroup, type KeyValueItem } from '../structure/KeyValueGroup'
import { SelectionIndicator, type SelectionState } from './SelectionIndicator'
import type { DecisionPrice } from './shared'

export type DecisionSummaryProps = {
  supplier: string
  reference?: string
  status?: ReviewStatus
  selection?: SelectionState | null
  price?: DecisionPrice | null
  original?: string
  priceReason?: string
  facts?: KeyValueItem[]
  className?: string
  style?: CSSProperties
}

/** Resumen de la decisión: proveedor seleccionado (60) + precio de referencia (40). */
export function DecisionSummary({ supplier, reference, status = 'reviewed', selection = 'pending', price, original, priceReason, facts = [], className, style }: DecisionSummaryProps) {
  const { t } = useTranslation('ds')
  const fmt = useAmount()
  const [ref, width] = useElementWidth<HTMLElement>(900)
  const stack = width < 600
  return (
    <section ref={ref} aria-label={t('dec.summary.label')} className={cx('q-dec-summary', stack && 'is-stacked', className)} style={style}>
      <div className="q-dec-summary-grid">
        <div className="q-dec-summary-main">
          <span className="q-dec-eyebrow">{t('dec.summary.selected')}</span>
          <span className="q-dec-summary-supplier">{supplier}</span>
          {reference && <span className="q-dec-meta is-numeric q-dec-summary-ref">{reference}</span>}
          <div className="q-dec-summary-states">
            <CmpStatus status={status} />
            {selection && <SelectionIndicator state={selection} />}
          </div>
        </div>
        <div className="q-dec-summary-side">
          <span className="q-dec-eyebrow">{t('dec.summary.referencePrice')}</span>
          {price
            ? (
                <span className="q-dec-summary-price">
                  <span className="q-dec-summary-price-value">{fmt(price.amount)}</span>
                  <span className="q-dec-summary-price-unit">{[price.currency, price.unit].filter(Boolean).join(' ')}</span>
                </span>
              )
            : (
                <span className="q-dec-summary-nc">
                  <span>{t('cmp.notComparable')}</span>
                  {priceReason && <span className="q-dec-meta">{priceReason}</span>}
                </span>
              )}
          {original && <span className="q-dec-meta is-numeric q-dec-summary-base">{t('dec.base', { value: original })}</span>}
        </div>
      </div>
      {facts.length > 0 && <KeyValueGroup columns={stack ? 2 : 3} items={facts} />}
    </section>
  )
}
