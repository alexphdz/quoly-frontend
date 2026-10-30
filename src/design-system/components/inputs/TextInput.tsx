import { useId, type ComponentPropsWithRef, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../core/Icon'
import { Field, controlClass, fieldAria, type ControlSize, type FieldBaseProps } from './Field'

export type TextInputProps = FieldBaseProps & Omit<ComponentPropsWithRef<'input'>, 'size' | 'id'> & {
  size?: ControlSize
  icon?: IconName
  suffix?: string
  className?: string
  style?: CSSProperties
  inputClassName?: string
}

export function TextInput({
  id, label, description, required, optionalLabel, message, status,
  size = 'md', icon, suffix, disabled, readOnly, className, style, inputClassName, ...rest
}: TextInputProps) {
  const { t } = useTranslation('ds')
  const autoId = useId()
  const uid = id ?? autoId
  return (
    <Field id={uid} label={label} description={description} required={required} optionalLabel={optionalLabel} message={message} status={status} className={className} style={style}>
      <div className={controlClass({ size, status, disabled, readOnly })}>
        {icon && <span className="q-control-icon"><Icon name={icon} size={size === 'lg' ? 20 : 16} /></span>}
        <input
          id={uid}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={inputClassName ? `q-control-input ${inputClassName}` : 'q-control-input'}
          {...fieldAria(uid, { description, message, status, required })}
          {...rest}
        />
        {suffix && <span className="q-control-suffix">{suffix}</span>}
        {readOnly && <span className="q-control-icon" title={t('field.readOnly')}><Icon name="lock-simple" size={16} /></span>}
      </div>
    </Field>
  )
}
