import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'
import { TONE_ICON, type FeedbackTone } from './ValidationMessage'

export type InlineAlertProps = {
  /** notice (línea) · contextual (banda con trazo) · blocking (marco de error/atención). */
  prominence?: 'notice' | 'contextual' | 'blocking'
  tone?: FeedbackTone
  title?: ReactNode
  children?: ReactNode
  /** Solo blocking: cómo resolverlo. */
  resolution?: ReactNode
  actions?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  /** Solo notice: divisor superior. */
  divider?: boolean
  className?: string
  style?: CSSProperties
}

export function InlineAlert({
  prominence = 'notice', tone = 'info', title, children, resolution, actions, onDismiss, dismissLabel, divider = false, className, style,
}: InlineAlertProps) {
  const { t } = useTranslation('ds')
  const role = prominence === 'blocking' || tone === 'error' ? 'alert' : 'status'
  const icon = (
    <span className="q-alert-icon">
      <Icon name={TONE_ICON[tone]} size={16} weight={prominence === 'blocking' && tone !== 'ai' ? 'fill' : 'regular'} />
    </span>
  )
  const close = onDismiss && (
    <button type="button" aria-label={dismissLabel ?? t('alert.dismiss')} onClick={onDismiss} className="q-dismiss">
      <Icon name="x" size={16} />
    </button>
  )
  const classes = cx('q-alert', `is-${prominence}`, `is-${tone}`, divider && 'has-divider', className)

  if (prominence === 'notice') {
    return (
      <div role={role} className={classes} style={style}>
        {icon}
        <div className="q-alert-inline">
          <span className="q-alert-text">
            {title && <span className="q-alert-title-inline">{title}</span>}
            {title && ' '}
            {children}
          </span>
          {actions}
        </div>
        {close}
      </div>
    )
  }

  if (prominence === 'contextual') {
    return (
      <div role={role} className={classes} style={style}>
        <span aria-hidden="true" className="q-alert-rule" />
        {icon}
        <div className="q-alert-body">
          {title && <div className="q-alert-title">{title}</div>}
          {children && <div className={title ? 'q-alert-description' : 'q-alert-text'}>{children}</div>}
          {actions && <div className="q-alert-actions is-text">{actions}</div>}
        </div>
        {close}
      </div>
    )
  }

  return (
    <div role={role} className={classes} style={style}>
      <div className="q-alert-row">
        {icon}
        <div className="q-alert-body">
          <div className="q-alert-title">{title}</div>
          {children && <div className="q-alert-description is-prose">{children}</div>}
        </div>
        {close}
      </div>
      {resolution && (
        <div className="q-alert-resolution">
          <span className="q-alert-resolution-label">{t('alert.howToResolve')}</span>
          <span>{resolution}</span>
        </div>
      )}
      {actions && <div className="q-alert-actions">{actions}</div>}
    </div>
  )
}
