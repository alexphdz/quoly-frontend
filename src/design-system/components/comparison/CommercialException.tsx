import type { CSSProperties, MouseEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { TextButton } from '../actions/TextButton'
import { IntelligenceMark } from '../core/IntelligenceMark'
import type { IconName } from '../core/Icon'
import { ContextPanel } from '../structure/ContextPanel'
import { CmpIcon, TONE_ICON, type ExceptionTone } from './shared'

export type CommercialExceptionProps = {
  tone?: ExceptionTone
  icon?: IconName
  text: ReactNode
  onDetail?: (e: MouseEvent<HTMLButtonElement>) => void
  expanded?: boolean
  controls?: string
  className?: string
  style?: CSSProperties
}

/** Excepción comercial en una celda (advertencia · información · IA · neutra). */
export function CommercialException({ tone = 'warning', icon, text, onDetail, expanded = false, controls, className, style }: CommercialExceptionProps) {
  const { t } = useTranslation('ds')
  const body = (
    <>
      <span className="q-cmp-exc-icon"><CmpIcon name={icon ?? TONE_ICON[tone]} size={15} /></span>
      <span className="q-cmp-exc-text">{text}</span>
    </>
  )
  const classes = cx('q-cmp-exc', `is-${tone}`, expanded && 'is-expanded', className)
  if (!onDetail) return <span className={classes} style={style}>{body}</span>
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={(e) => {
        e.stopPropagation()
        onDetail(e)
      }}
      className={cx(classes, 'is-interactive')}
      style={style}
    >
      {body}
      <span className="q-sr-only">{` · ${t('cmp.exception.seeDetail')}`}</span>
    </button>
  )
}

export type CommercialExceptionDetailProps = {
  id?: string
  title: ReactNode
  description?: ReactNode
  related?: Array<[ReactNode, ReactNode]>
  /** Valor propuesto por IA aún sin confirmar. */
  unconfirmed?: boolean
  evidence?: ReactNode
  onClose?: () => void
  className?: string
  style?: CSSProperties
}

/** Detalle de una excepción en un ContextPanel de 320. */
export function CommercialExceptionDetail({ id, title, description, related = [], unconfirmed = false, evidence, onClose, className, style }: CommercialExceptionDetailProps) {
  const { t } = useTranslation('ds')
  return (
    <div id={id} role="region" aria-label={typeof title === 'string' ? title : undefined} className={cx('q-cmp-exc-detail', className)} style={style}>
      <ContextPanel width={320} title={title} footer={onClose && <TextButton icon="x" onClick={onClose}>{t('actions.close')}</TextButton>}>
        {description && <p className="q-cmp-exc-description">{description}</p>}
        {related.length > 0 && (
          <dl className="q-cmp-exc-related">
            {related.map(([k, v], i) => (
              <div key={i}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {unconfirmed && (
          <span className="q-cmp-exc-unconfirmed">
            <IntelligenceMark size={14} color="currentColor" />
            {t('cmp.exception.unconfirmed')}
          </span>
        )}
        {evidence}
      </ContextPanel>
    </div>
  )
}
