import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'

export type SelectionState = 'selected' | 'pending' | 'recorded'

export type SelectionIndicatorProps = {
  state?: SelectionState
  label?: string
  className?: string
  style?: CSSProperties
}

/** Seleccionado ≠ adjudicación registrada: icono + texto, nunca solo color. */
export function SelectionIndicator({ state = 'selected', label, className, style }: SelectionIndicatorProps) {
  const { t } = useTranslation('ds')
  const recorded = state === 'recorded'
  return (
    <span role="status" className={cx('q-dec-indicator', `is-${state}`, className)} style={style}>
      <span className="q-dec-indicator-icon">
        <Icon name={recorded ? 'trophy' : 'check-circle'} size={recorded ? 15 : 16} weight={recorded ? 'duotone' : undefined} />
      </span>
      {label ?? t(`dec.indicator.${state}`)}
    </span>
  )
}
