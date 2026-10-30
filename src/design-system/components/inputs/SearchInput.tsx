import { useId, type ComponentPropsWithRef, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from '../core/Icon'
import { Field, controlClass, fieldAria, type ControlSize, type FieldBaseProps } from './Field'

export type SearchInputProps = FieldBaseProps & Omit<ComponentPropsWithRef<'input'>, 'size' | 'id' | 'type'> & {
  size?: ControlSize
  /** Atajo de teclado visible cuando está vacío (p. ej. "/"). */
  shortcut?: string
  onClear?: () => void
  clearLabel?: string
  className?: string
  style?: CSSProperties
}

export function SearchInput({
  id, label, description, required, optionalLabel, message, status,
  size = 'md', shortcut, onClear, clearLabel, disabled, value, className, style, ...rest
}: SearchInputProps) {
  const { t } = useTranslation('ds')
  const autoId = useId()
  const uid = id ?? autoId
  return (
    <Field id={uid} label={label} description={description} required={required} optionalLabel={optionalLabel} message={message} status={status} className={className} style={style}>
      <div className={controlClass({ size, status, disabled })}>
        <span className="q-control-icon"><Icon name="magnifying-glass" size={size === 'lg' ? 20 : 16} /></span>
        <input
          id={uid}
          type="search"
          role="searchbox"
          disabled={disabled}
          value={value}
          className="q-control-input"
          {...fieldAria(uid, { description, message, status, required })}
          {...rest}
        />
        {value
          ? (
              <button type="button" aria-label={clearLabel ?? t('search.clear')} onClick={onClear} className="q-control-clear">
                <Icon name="x" size={16} />
              </button>
            )
          : shortcut && <kbd className="q-control-kbd">{shortcut}</kbd>}
      </div>
    </Field>
  )
}
