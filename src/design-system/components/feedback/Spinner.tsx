import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'

export type SpinnerProps = {
  size?: number
  /** Texto accesible (visible con showLabel). */
  label?: string
  showLabel?: boolean
  className?: string
  style?: CSSProperties
}

export function Spinner({ size = 16, label, showLabel = false, className, style }: SpinnerProps) {
  const { t } = useTranslation('ds')
  const text = label ?? t('status.loading')
  return (
    <span role="status" aria-live="polite" className={cx('q-spinner', className)} style={style}>
      <span className="q-spin"><Icon name="circle-notch" size={size} /></span>
      {showLabel
        ? <span className={size >= 20 ? 'q-spinner-label is-md' : 'q-spinner-label'}>{`${text}…`}</span>
        : <span className="q-sr-only">{text}</span>}
    </span>
  )
}
