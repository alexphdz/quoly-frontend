import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type ChipProps = {
  selected?: boolean
  removable?: boolean
  icon?: IconName
  count?: number
  disabled?: boolean
  onClick?: () => void
  onRemove?: () => void
  removeLabel?: string
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Filtro o selección rápida; seleccionado = relleno inverso. */
export function Chip({
  selected = false, removable = false, icon, count, disabled = false,
  onClick, onRemove, removeLabel, children, className, style,
}: ChipProps) {
  const { t } = useTranslation('ds')
  const text = typeof children === 'string' ? children : ''
  return (
    <span className={cx('q-chip', selected && 'is-selected', disabled && 'is-disabled', removable && 'is-removable', className)} style={style}>
      <button type="button" aria-pressed={selected} disabled={disabled} onClick={onClick} className="q-chip-main">
        {icon && <Icon name={icon} size={16} />}
        <span>{children}</span>
        {count != null && <span className="q-chip-count">{count}</span>}
      </button>
      {removable && (
        <button type="button" aria-label={removeLabel ?? t('chip.remove', { label: text })} disabled={disabled} onClick={onRemove} className="q-chip-remove">
          <Icon name="x" size={12} />
        </button>
      )}
    </span>
  )
}
