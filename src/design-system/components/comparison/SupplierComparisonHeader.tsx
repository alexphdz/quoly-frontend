import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { CmpStatus, type ReviewStatus } from './shared'

export type SupplierComparisonHeaderProps = {
  name: string
  reference?: string
  status?: ReviewStatus
  statusLabel?: string
  /** Moneda original de la cotización. */
  currency?: string
  marker?: ReactNode
  selected?: boolean
  onSelect?: () => void
  className?: string
  style?: CSSProperties
}

/** Cabecera de columna de proveedor; seleccionada = línea coral 28×2. */
export function SupplierComparisonHeader({ name, reference, status = 'pending', statusLabel, currency, marker, selected = false, onSelect, className, style }: SupplierComparisonHeaderProps) {
  const { t } = useTranslation('ds')
  const inner = (
    <>
      <span className="q-cmp-head-name-wrap">
        <span className="q-cmp-head-name" title={name}>{name}</span>
        <span aria-hidden="true" className="q-cmp-head-line" />
      </span>
      {reference && <span className="q-cmp-meta is-numeric">{reference}</span>}
      <span className="q-cmp-head-row">
        <CmpStatus status={status} label={statusLabel} />
        {currency && <span className="q-cmp-meta">{t('cmp.originalCurrency', { currency })}</span>}
      </span>
      {marker && <span className="q-cmp-head-marker">{marker}</span>}
    </>
  )
  const classes = cx('q-cmp-head', selected && 'is-selected', onSelect && 'is-interactive', className)
  if (!onSelect) return <div className={classes} style={style}>{inner}</div>
  return <button type="button" aria-pressed={selected} onClick={onSelect} className={classes} style={style}>{inner}</button>
}
