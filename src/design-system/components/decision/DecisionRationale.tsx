import { useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Textarea } from '../inputs/Textarea'
import { KeyValueGroup, type KeyValueItem } from '../structure/KeyValueGroup'

export type DecisionRationaleProps = {
  title?: string
  description?: string
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  required?: boolean
  error?: string
  maxLength?: number
  /** Datos de la cotización como referencia (no forman parte del motivo). */
  context?: KeyValueItem[]
  placeholder?: string
  className?: string
  style?: CSSProperties
}

/** Motivo escrito por el comprador. Quoly no lo genera ni lo completa. */
export function DecisionRationale({
  title, description, value, defaultValue = '', onChange, required = false, error, maxLength, context = [], placeholder, className, style,
}: DecisionRationaleProps) {
  const { t } = useTranslation('ds')
  const [own, setOwn] = useState(defaultValue)
  const heading = title ?? t('dec.rationale.title')
  return (
    <section aria-label={heading} className={cx('q-dec-rationale', className)} style={style}>
      <h3 className="q-dec-rationale-title">{heading}</h3>
      <p className="q-dec-rationale-description">{description ?? t('dec.rationale.description')}</p>
      {context.length > 0 && (
        <div className="q-dec-rationale-context">
          <span className="q-dec-label">{t('dec.rationale.context')}</span>
          <KeyValueGroup columns={2} items={context} />
        </div>
      )}
      <div className="q-dec-rationale-field">
        <Textarea
          label={t('dec.rationale.field')}
          optionalLabel={required ? undefined : t('dec.rationale.optional')}
          required={required}
          rows={5}
          maxLength={maxLength}
          placeholder={placeholder}
          value={value ?? own}
          onChange={(e) => {
            setOwn(e.target.value)
            onChange?.(e.target.value)
          }}
          message={error}
          status={error ? 'error' : undefined}
          style={{ minHeight: 120 }}
        />
      </div>
      <span className="q-dec-meta is-sm q-dec-rationale-note">{t('dec.rationale.note')}</span>
    </section>
  )
}
