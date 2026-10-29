import { useEffect, useId, useRef, useState, type ChangeEvent, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'

export type CheckboxProps = {
  id?: string
  name?: string
  value?: string
  label?: ReactNode
  description?: ReactNode
  checked?: boolean
  defaultChecked?: boolean
  indeterminate?: boolean
  disabled?: boolean
  status?: 'error'
  message?: ReactNode
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  className?: string
  style?: CSSProperties
}

export function Checkbox({
  id, name, value, label, description, checked, defaultChecked = false, indeterminate = false,
  disabled = false, status, message, onChange, className, style,
}: CheckboxProps) {
  const autoId = useId()
  const uid = id ?? autoId
  const [inner, setInner] = useState(defaultChecked)
  const on = checked ?? inner
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <div className={cx('q-choice-wrap', className)} style={style}>
      <label htmlFor={uid} className={cx('q-choice', disabled && 'is-disabled', status === 'error' && 'is-error')}>
        <span className="q-choice-control">
          <input
            ref={ref}
            id={uid}
            type="checkbox"
            name={name}
            value={value}
            checked={on}
            disabled={disabled}
            aria-invalid={status === 'error' || undefined}
            aria-describedby={message ? `${uid}-msg` : undefined}
            onChange={(e) => {
              setInner(e.target.checked)
              onChange?.(e)
            }}
          />
          <span aria-hidden="true" className={cx('q-checkbox-visual', (on || indeterminate) && 'is-filled')}>
            {indeterminate ? <Icon name="minus" size={12} /> : on ? <Icon name="check" size={12} /> : null}
          </span>
        </span>
        {(label || description) && (
          <span className="q-choice-text">
            {label && <span className="q-choice-label">{label}</span>}
            {description && <span className="q-choice-description">{description}</span>}
          </span>
        )}
      </label>
      {message && (
        <span id={`${uid}-msg`} className="q-choice-message">
          <Icon name="x-circle" size={16} weight="fill" />
          {message}
        </span>
      )}
    </div>
  )
}
