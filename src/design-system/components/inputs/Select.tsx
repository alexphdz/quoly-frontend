import { useId, type ComponentPropsWithRef, type CSSProperties } from 'react'
import { Icon } from '../core/Icon'
import { Field, controlClass, fieldAria, type ControlSize, type FieldBaseProps } from './Field'

export type SelectOption = string | { value: string, label: string, disabled?: boolean }

export type SelectProps = FieldBaseProps & Omit<ComponentPropsWithRef<'select'>, 'size' | 'id' | 'children'> & {
  size?: ControlSize
  options?: SelectOption[]
  placeholder?: string
  className?: string
  style?: CSSProperties
}

/** Elección única — select nativo por accesibilidad, con marco Quoly. */
export function Select({
  id, label, description, required, optionalLabel, message, status,
  size = 'md', options = [], placeholder, disabled, value, defaultValue, className, style, ...rest
}: SelectProps) {
  const autoId = useId()
  const uid = id ?? autoId
  return (
    <Field id={uid} label={label} description={description} required={required} optionalLabel={optionalLabel} message={message} status={status} className={className} style={style}>
      <div className={`${controlClass({ size, status, disabled })} is-select`}>
        <select
          id={uid}
          disabled={disabled}
          required={required}
          value={value}
          defaultValue={defaultValue === undefined && value === undefined && placeholder ? '' : defaultValue}
          className="q-control-select"
          {...fieldAria(uid, { description, message, status, required })}
          {...rest}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
        <span className="q-control-caret"><Icon name="caret-down" size={16} /></span>
      </div>
    </Field>
  )
}
