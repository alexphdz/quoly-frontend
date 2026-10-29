import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'

function Fact({ label, value, detail, error, missing }: { label: ReactNode, value: ReactNode, detail?: ReactNode, error?: boolean, missing?: boolean }) {
  return (
    <div className="q-rfq-fact">
      <dt className="q-rfq-label">{label}</dt>
      <dd>
        <span className={cx('q-rfq-fact-value', missing && 'is-missing')}>{value}</span>
        {detail && (
          <span className={cx('q-rfq-fact-detail', error && 'is-error')}>
            {error && <Icon name="warning-circle" size={14} />}
            {detail}
          </span>
        )}
      </dd>
    </div>
  )
}

export type RfqSummaryProps = {
  quantity?: string | number | null
  unit?: string
  /** Plazo ya formateado. */
  deadline?: string
  deadlineDetail?: string
  overdue?: boolean
  currency?: string
  currencyDetail?: string
  suppliersResponded?: number
  suppliersTotal?: number
  leading?: { price: ReactNode, supplier?: ReactNode } | null
  label?: string
  className?: string
  style?: CSSProperties
}

/** Resumen comercial: 5 columnas ≥880, 3 ≥560, 2 ≥340, 1 debajo. */
export function RfqSummary({
  quantity, unit, deadline, deadlineDetail, overdue = false, currency, currencyDetail,
  suppliersResponded = 0, suppliersTotal, leading, label, className, style,
}: RfqSummaryProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLDListElement>()
  const columns = width >= 880 ? 5 : width >= 560 ? 3 : width >= 340 ? 2 : 1
  return (
    <dl ref={ref} aria-label={label ?? t('rfq.summary.label')} className={cx('q-rfq-summary', className)} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, ...style }}>
      <Fact label={t('rfq.summary.quantity')} value={quantity != null ? `${quantity}${unit ? ` ${unit}` : ''}` : '—'} missing={quantity == null} />
      <Fact
        label={t('rfq.summary.deadline')}
        value={deadline || '—'}
        missing={!deadline}
        detail={overdue ? deadlineDetail ?? t('rfq.summary.overdue') : deadlineDetail}
        error={overdue}
      />
      <Fact label={t('rfq.summary.currency')} value={currency || '—'} missing={!currency} detail={currencyDetail} />
      <Fact
        label={t('rfq.summary.suppliers')}
        value={suppliersTotal ? t('rfq.summary.responded', { responded: suppliersResponded, total: suppliersTotal }) : t('rfq.summary.noSuppliers')}
        missing={!suppliersTotal}
      />
      {leading
        ? <Fact label={t('rfq.summary.leading')} value={leading.price} detail={leading.supplier} />
        : <Fact label={t('rfq.summary.leading')} value={t('rfq.summary.noComparable')} missing />}
    </dl>
  )
}
