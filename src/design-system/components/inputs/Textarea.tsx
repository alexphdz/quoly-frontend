import { useId, useState, type ComponentPropsWithRef, type CSSProperties } from 'react'
import { Field, controlClass, fieldAria, type FieldBaseProps } from './Field'

export type TextareaProps = FieldBaseProps & Omit<ComponentPropsWithRef<'textarea'>, 'id'> & {
  className?: string
  style?: CSSProperties
}

/** Texto largo; con maxLength muestra contador "n / máx". */
export function Textarea({
  id, label, description, required, optionalLabel, message, status,
  rows = 4, maxLength, disabled, readOnly, value, defaultValue, onChange, className, style, ...rest
}: TextareaProps) {
  const autoId = useId()
  const uid = id ?? autoId
  const [length, setLength] = useState(String(value ?? defaultValue ?? '').length)
  const count = value !== undefined ? String(value).length : length
  return (
    <Field id={uid} label={label} description={description} required={required} optionalLabel={optionalLabel} message={message} status={status} className={className} style={style}>
      <div className={`${controlClass({ status, disabled, readOnly })} is-multiline`}>
        <textarea
          id={uid}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          value={value}
          defaultValue={defaultValue}
          onChange={(e) => {
            setLength(e.target.value.length)
            onChange?.(e)
          }}
          className="q-control-textarea"
          style={{ minHeight: rows * 21 }}
          {...fieldAria(uid, { description, message, status, required })}
          {...rest}
        />
        {maxLength !== undefined && <span aria-live="polite" className="q-control-counter">{`${count} / ${maxLength}`}</span>}
      </div>
    </Field>
  )
}
