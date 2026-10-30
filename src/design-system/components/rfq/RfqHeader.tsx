import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { StatusBadge, type StatusTone } from '../indicators/StatusBadge'

export type RfqStatus = 'draft' | 'sent' | 'quotes' | 'closed'

const STATUS_TONE: Record<RfqStatus, StatusTone> = { draft: 'neutral', sent: 'info', quotes: 'info', closed: 'neutral' }

export type RfqHeaderProps = {
  title: ReactNode
  reference?: string
  status?: RfqStatus
  /** Sustituye la etiqueta por defecto del estado. */
  statusLabel?: string
  /** Fecha de creación ya formateada. */
  created?: string
  /** Una acción de 05A, solo cuando el estado la permite. */
  action?: ReactNode
  as?: 'h1' | 'h2'
  className?: string
  style?: CSSProperties
}

/** Cabecera de solicitud: título Outfit 28 + referencia, estado y fecha. */
export function RfqHeader({ title, reference, status = 'draft', statusLabel, created, action, as: H = 'h1', className, style }: RfqHeaderProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLElement>()
  return (
    <header ref={ref} className={cx('q-rfq-header', width < 768 && 'is-narrow', className)} style={style}>
      <div className="q-rfq-header-main">
        <H className="q-rfq-title">{title}</H>
        <div className="q-rfq-meta">
          {reference && <span className="q-rfq-reference">{reference}</span>}
          <StatusBadge tone={STATUS_TONE[status]}>{statusLabel ?? t(`rfq.stage.${status}`)}</StatusBadge>
          {created && <span className="q-rfq-created">{t('rfq.created', { date: created })}</span>}
        </div>
      </div>
      {action && <div className="q-rfq-header-action">{action}</div>}
    </header>
  )
}
