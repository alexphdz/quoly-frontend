import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type SplitButtonProps = {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  icon?: IconName
  children?: ReactNode
  /** Nombre accesible del disparador del menú. */
  menuLabel?: string
  expanded?: boolean
  disabled?: boolean
  onClick?: () => void
  onMenu?: () => void
  className?: string
  style?: CSSProperties
}

/** Acción principal + disparador de menú para variantes de la misma acción. */
export function SplitButton({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  menuLabel,
  expanded = false,
  disabled = false,
  onClick,
  onMenu,
  className,
  style,
}: SplitButtonProps) {
  const { t } = useTranslation('ds')
  const iconSize = size === 'lg' ? 20 : 16
  return (
    <span role="group" className={cx('q-split-btn', `is-${variant}`, className)} style={style}>
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={cx('q-btn', `is-${variant}`, `is-${size}`, icon && 'has-icon', 'q-split-main')}
      >
        {icon && <Icon name={icon} size={iconSize} />}
        <span className="q-btn-label">{children}</span>
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onMenu}
        aria-label={menuLabel ?? t('actions.moreOptions')}
        aria-haspopup="menu"
        aria-expanded={expanded}
        className={cx('q-btn', `is-${variant}`, `is-${size}`, 'q-split-trigger')}
      >
        <Icon name={expanded ? 'caret-up' : 'caret-down'} size={16} />
      </button>
    </span>
  )
}
