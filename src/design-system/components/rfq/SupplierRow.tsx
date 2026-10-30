import type { CSSProperties, KeyboardEvent, SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type SupplierParticipation = 'invited' | 'viewed' | 'question' | 'responded' | 'declined'
type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'error'

const STATUS: Record<SupplierParticipation, [Tone, IconName]> = {
  invited: ['neutral', 'circle-dashed'],
  viewed: ['neutral', 'clock'],
  question: ['warning', 'chat-text'],
  responded: ['success', 'check-circle'],
  declined: ['neutral', 'x'],
}

export type SupplierRowProps = {
  name: string
  contact?: string
  status?: SupplierParticipation
  statusLabel?: string
  /** Última actividad ya formateada. */
  activity?: string
  /** Solo con cotización válida. */
  price?: string
  priceDetail?: string
  onClick?: (e: SyntheticEvent) => void
  last?: boolean
  className?: string
  style?: CSSProperties
}

/** Fila de proveedor invitado: identidad · participación · actividad · cotización. */
export function SupplierRow({ name, contact, status = 'invited', statusLabel, activity, price, priceDetail, onClick, last = false, className, style }: SupplierRowProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const narrow = width < 640
  const [tone, icon] = STATUS[status]
  const interactive = !!onClick
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (interactive && e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault()
      onClick(e)
    }
  }

  const identity = (
    <div className="q-supplier-identity">
      <span className="q-supplier-name">{name}</span>
      <span className="q-supplier-contact">{contact || t('rfq.supplier.noContact')}</span>
    </div>
  )
  const state = (
    <span className={cx('q-supplier-status', `is-${tone}`)}>
      <Icon name={icon} size={14} />
      {statusLabel ?? t(`rfq.supplier.status.${status}`)}
    </span>
  )
  const activityText = <span className="q-supplier-activity">{activity || t('rfq.supplier.noActivity')}</span>
  const priceBlock = price
    ? (
        <span className="q-supplier-price">
          <span className="q-supplier-price-value">{price}</span>
          {priceDetail && <span className="q-supplier-price-detail">{priceDetail}</span>}
        </span>
      )
    : <span aria-hidden="true" />

  return (
    <div
      ref={ref}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={cx('q-supplier-row', narrow && 'is-narrow', interactive && 'is-interactive', last && 'is-last', className)}
      style={style}
    >
      {interactive && <span aria-hidden="true" className="q-supplier-trace" />}
      {narrow
        ? (
            <>
              {identity}
              <div className="q-supplier-status-cell">{state}</div>
              <div className="q-supplier-second-line">
                {activityText}
                {price && priceBlock}
              </div>
            </>
          )
        : (
            <>
              {identity}
              {state}
              {activityText}
              {priceBlock}
            </>
          )}
    </div>
  )
}

/** Encabezado de columnas para una lista de SupplierRow (≥640px). */
export function SupplierRowHeader({ className }: { className?: string }) {
  const { t } = useTranslation('ds')
  return (
    <div aria-hidden="true" className={cx('q-supplier-row-header', className)}>
      <span>{t('rfq.supplier.header.supplier')}</span>
      <span>{t('rfq.supplier.header.participation')}</span>
      <span>{t('rfq.supplier.header.activity')}</span>
      <span className="is-end">{t('rfq.supplier.header.quote')}</span>
    </div>
  )
}
