import { useId, type ChangeEvent, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../../utils'

export type RadioProps = {
  id?: string
  name?: string
  value?: string
  label?: ReactNode
  description?: ReactNode
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  className?: string
  style?: CSSProperties
}

export function Radio({ id, name, value, label, description, checked, defaultChecked, disabled = false, onChange, className, style }: RadioProps) {
  const autoId = useId()
  const uid = id ?? autoId
  return (
    <label htmlFor={uid} className={cx('q-choice', disabled && 'is-disabled', className)} style={style}>
      <span className="q-choice-control">
        <input
          id={uid}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
        />
        <span aria-hidden="true" className="q-radio-visual" />
      </span>
      {(label || description) && (
        <span className="q-choice-text">
          {label && <span className="q-choice-label">{label}</span>}
          {description && <span className="q-choice-description">{description}</span>}
        </span>
      )}
    </label>
  )
}
