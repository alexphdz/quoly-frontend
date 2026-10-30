import { useId, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'

export type SwitchProps = {
  id?: string
  name?: string
  label?: ReactNode
  description?: ReactNode
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  loading?: boolean
  /** Etiquetas visibles [encendido, apagado]. */
  stateLabels?: [string, string]
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  className?: string
  style?: CSSProperties
}

/** Interruptor de efecto inmediato (role="switch"). */
export function Switch({
  id, name, label, description, checked, defaultChecked = false, disabled = false, loading = false,
  stateLabels, onChange, className, style,
}: SwitchProps) {
  const autoId = useId()
  const uid = id ?? autoId
  const [inner, setInner] = useState(defaultChecked)
  const on = checked ?? inner
  return (
    <label htmlFor={uid} className={cx('q-switch', disabled && 'is-disabled', className)} style={style}>
      {(label || description) && (
        <span className="q-choice-text is-grow">
          {label && <span className="q-choice-label">{label}</span>}
          {description && <span className="q-choice-description">{description}</span>}
        </span>
      )}
      <span className="q-switch-side">
        {stateLabels && <span aria-hidden="true" className="q-switch-state">{on ? stateLabels[0] : stateLabels[1]}</span>}
        <span className="q-switch-control">
          <input
            id={uid}
            type="checkbox"
            role="switch"
            name={name}
            checked={on}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            onChange={(e) => {
              setInner(e.target.checked)
              onChange?.(e)
            }}
          />
          <span aria-hidden="true" className="q-switch-track" />
          <span aria-hidden="true" className="q-switch-thumb">
            {loading && <span className="q-spin"><Icon name="circle-notch" size={12} /></span>}
          </span>
        </span>
      </span>
    </label>
  )
}
