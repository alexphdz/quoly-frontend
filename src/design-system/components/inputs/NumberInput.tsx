import { useId, type ComponentPropsWithRef, type CSSProperties } from 'react'
import { Field, controlClass, fieldAria, type ControlSize, type FieldBaseProps } from './Field'

export type NumberInputProps = FieldBaseProps & Omit<ComponentPropsWithRef<'input'>, 'size' | 'id' | 'type'> & {
  size?: ControlSize
  /** Unidad tras la cifra (p. ej. "uds", "kg"). */
  unit?: string
  className?: string
  style?: CSSProperties
}

/** Cifra tabular alineada a la derecha. */
export function NumberInput({
  id, label, description, required, optionalLabel, message, status,
  size = 'md', unit, disabled, readOnly, className, style, ...rest
}: NumberInputProps) {
  const autoId = useId()
  const uid = id ?? autoId
  return (
    <Field id={uid} label={label} description={description} required={required} optionalLabel={optionalLabel} message={message} status={status} className={className} style={style}>
      <div className={controlClass({ size, status, disabled, readOnly })}>
        <input
          id={uid}
          inputMode="decimal"
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className="q-control-input is-numeric"
          {...fieldAria(uid, { description, message, status, required })}
          {...rest}
        />
        {unit && <span className="q-control-unit">{unit}</span>}
      </div>
    </Field>
  )
}
