import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { toast as sonnerToast } from 'sonner'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'
import { TONE_ICON } from './ValidationMessage'

export type ToastTone = 'success' | 'info' | 'warning' | 'error' | 'loading'

export type ToastProps = {
  tone?: ToastTone
  title: ReactNode
  children?: ReactNode
  action?: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  className?: string
  style?: CSSProperties
}

/** Confirmación breve de una acción. Error = assertive; resto polite. */
export function Toast({ tone = 'success', title, children, action, onDismiss, dismissLabel, className, style }: ToastProps) {
  const { t } = useTranslation('ds')
  const loading = tone === 'loading'
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
      aria-busy={loading || undefined}
      className={cx('q-toast', `is-${tone}`, className)}
      style={style}
    >
      <span className="q-toast-icon">
        {loading
          ? <span className="q-spin"><Icon name="circle-notch" size={16} /></span>
          : <Icon name={TONE_ICON[tone]} size={16} weight="fill" />}
      </span>
      <span className="q-toast-title">{title}</span>
      {onDismiss && !loading
        ? (
            <button type="button" aria-label={dismissLabel ?? t('actions.close')} onClick={onDismiss} className="q-dismiss">
              <Icon name="x" size={16} />
            </button>
          )
        : <span />}
      {(children || action) && (
        <div className="q-toast-body">
          {children && <span className="q-toast-description">{children}</span>}
          {action}
        </div>
      )}
    </div>
  )
}

export type NotifyOptions = Omit<ToastProps, 'onDismiss' | 'className' | 'style'> & {
  /** ms; por defecto el del Toaster de la app. */
  duration?: number
}

/** Muestra un Toast Quoly en el Toaster (sonner) ya montado en la app. */
export function notify({ duration, ...props }: NotifyOptions) {
  return sonnerToast.custom((id) => <Toast {...props} onDismiss={() => sonnerToast.dismiss(id)} />, { duration, unstyled: true })
}
