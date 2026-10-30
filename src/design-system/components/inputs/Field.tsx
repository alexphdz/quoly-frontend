import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { ValidationMessage } from '../feedback/ValidationMessage'

export type FieldStatus = 'error' | 'warning' | 'success'

/** Props comunes a todos los campos con etiqueta. */
export type FieldBaseProps = {
  id?: string
  label?: ReactNode
  description?: ReactNode
  required?: boolean
  /** Texto cuando no es obligatorio; '' para ocultarlo. Por defecto "opcional". */
  optionalLabel?: string
  message?: ReactNode
  status?: FieldStatus
}

export type FieldProps = FieldBaseProps & {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Etiqueta arriba (label-md) + descripción + control + mensaje de validación. */
export function Field({ id, label, description, required = false, optionalLabel, message, status, children, className, style }: FieldProps) {
  const { t } = useTranslation('ds')
  const optional = optionalLabel ?? t('field.optional')
  return (
    <div className={cx('q-field', className)} style={style}>
      {label && (
        <label htmlFor={id} className="q-field-label">
          {label}
          {required
            ? <span aria-hidden="true" className="q-field-required">{'*'}</span>
            : optional && <span className="q-field-optional">{`(${optional})`}</span>}
        </label>
      )}
      {description && <div id={id ? `${id}-desc` : undefined} className="q-field-description">{description}</div>}
      {children}
      {message && (
        <ValidationMessage id={id ? `${id}-msg` : undefined} tone={status === 'success' ? 'success' : status === 'warning' ? 'warning' : 'error'}>
          {message}
        </ValidationMessage>
      )}
    </div>
  )
}

/** Atributos ARIA del control según descripción, mensaje y estado del Field. */
export function fieldAria(id: string, { description, message, status, required }: Pick<FieldBaseProps, 'description' | 'message' | 'status' | 'required'>) {
  const describedBy = [description && `${id}-desc`, message && `${id}-msg`].filter(Boolean).join(' ')
  return {
    'aria-describedby': describedBy || undefined,
    'aria-invalid': status === 'error' || undefined,
    'aria-required': required || undefined,
  }
}

export type ControlSize = 'xs' | 'sm' | 'md' | 'lg'

/** Clases del marco de control (borde, fondo, foco, estado). */
export function controlClass({ size = 'md', status, disabled, readOnly }: { size?: ControlSize, status?: FieldStatus, disabled?: boolean, readOnly?: boolean }) {
  return cx('q-control', `is-${size}`, status && `is-${status}`, disabled && 'is-disabled', readOnly && 'is-readonly')
}
