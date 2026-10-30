import { useId, type ComponentPropsWithRef, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Field, controlClass, fieldAria, type ControlSize, type FieldBaseProps } from './Field'

export type CurrencyInputProps = FieldBaseProps & Omit<ComponentPropsWithRef<'input'>, 'size' | 'id' | 'type'> & {
  size?: ControlSize
  /** Código ISO 4217 mostrado. */
  currency?: string
  /** Si se pasa, la moneda es seleccionable. */
  currencies?: string[]
  onCurrencyChange?: (code: string) => void
  /** Unidad de precio (p. ej. "/ ud"). */
  unit?: string
  className?: string
  style?: CSSProperties
}

/** Importe + moneda ISO + unidad opcional. Tabular, alineado a la derecha. */
export function CurrencyInput({
  id, label, description, required, optionalLabel, message, status,
  size = 'md', currency = 'MXN', currencies, onCurrencyChange, unit, disabled, readOnly, className, style, ...rest
}: CurrencyInputProps) {
  const { t } = useTranslation('ds')
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
          aria-label={label ? undefined : t('currency.amount')}
          className="q-control-input is-numeric is-amount"
          {...fieldAria(uid, { description, message, status, required })}
          {...rest}
        />
        {unit && <span className="q-control-unit">{unit}</span>}
        <span aria-hidden="true" className="q-control-divider" />
        {currencies && !readOnly && !disabled
          ? (
              <select aria-label={t('currency.currency')} value={currency} onChange={(e) => onCurrencyChange?.(e.target.value)} className="q-control-currency-select">
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )
          : <span className="q-control-currency">{currency}</span>}
      </div>
    </Field>
  )
}
