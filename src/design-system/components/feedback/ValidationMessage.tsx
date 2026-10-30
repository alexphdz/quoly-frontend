import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type FeedbackTone = 'success' | 'warning' | 'error' | 'info' | 'ai' | 'neutral'

export const TONE_ICON: Record<FeedbackTone, IconName> = {
  success: 'check-circle',
  warning: 'warning',
  error: 'x-circle',
  info: 'info',
  ai: 'quoly-intelligence',
  neutral: 'info',
}

export type ValidationMessageProps = {
  id?: string
  tone?: FeedbackTone
  icon?: boolean
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Mensaje bajo un control. Solo error usa role="alert" y color de error en el texto. */
export function ValidationMessage({ id, tone = 'error', icon = true, children, className, style }: ValidationMessageProps) {
  const strong = tone === 'error'
  return (
    <span id={id} role={strong ? 'alert' : undefined} className={cx('q-validation', `is-${tone}`, className)} style={style}>
      {icon && (
        <span className="q-validation-icon">
          <Icon name={TONE_ICON[tone]} size={14} weight={strong ? 'fill' : 'regular'} />
        </span>
      )}
      <span>{children}</span>
    </span>
  )
}
