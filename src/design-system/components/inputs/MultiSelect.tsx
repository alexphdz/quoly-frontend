import { useId, useState, type CSSProperties } from 'react'
import { Popover } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { Icon } from '../core/Icon'
import { Field, controlClass, fieldAria, type ControlSize, type FieldBaseProps } from './Field'

export type MultiSelectOption = { value: string, label: string, meta?: string, disabled?: boolean }

export type MultiSelectProps = FieldBaseProps & {
  size?: ControlSize
  disabled?: boolean
  options?: MultiSelectOption[]
  value?: string[]
  defaultValue?: string[]
  placeholder?: string
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Valores visibles en el disparador antes de "+N". */
  maxVisible?: number
  onChange?: (value: string[]) => void
  className?: string
  style?: CSSProperties
}

/** Varias opciones de una lista: disparador con hasta maxVisible valores + "+N"; listbox con casillas. */
export function MultiSelect({
  id, label, description, required, optionalLabel, message, status,
  size = 'md', disabled = false, options = [], value, defaultValue = [], placeholder,
  open, defaultOpen = false, onOpenChange, maxVisible = 2, onChange, className, style,
}: MultiSelectProps) {
  const { t } = useTranslation('ds')
  const autoId = useId()
  const uid = id ?? autoId
  const [inner, setInner] = useState<string[]>(defaultValue)
  const [innerOpen, setInnerOpen] = useState(defaultOpen)
  const selected = value ?? inner
  const isOpen = open ?? innerOpen

  const setOpen = (next: boolean) => {
    setInnerOpen(next)
    onOpenChange?.(next)
  }
  const toggle = (v: string) => {
    const next = selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]
    setInner(next)
    onChange?.(next)
  }
  const labelFor = (v: string) => options.find((o) => o.value === v)?.label ?? v

  return (
    <Field id={uid} label={label} description={description} required={required} optionalLabel={optionalLabel} message={message} status={status} className={className} style={style}>
      <Popover.Root open={isOpen} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            id={uid}
            type="button"
            disabled={disabled}
            aria-haspopup="listbox"
            className={`${controlClass({ size, status, disabled })} is-multiselect`}
            {...fieldAria(uid, { description, message, status, required })}
          >
            {selected.length === 0
              ? <span className="q-control-placeholder">{placeholder ?? t('select.placeholder')}</span>
              : (
                  <span className="q-multiselect-values">
                    {selected.slice(0, maxVisible).map((v) => <span key={v} className="q-multiselect-value">{labelFor(v)}</span>)}
                    {selected.length > maxVisible && <span className="q-multiselect-more">{`+${selected.length - maxVisible}`}</span>}
                  </span>
                )}
            <span className="q-control-icon"><Icon name={isOpen ? 'caret-up' : 'caret-down'} size={16} /></span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="start" sideOffset={4} className="q-floating q-multiselect-pop" style={{ minWidth: 'var(--radix-popover-trigger-width)' }}>
            <ul role="listbox" aria-multiselectable="true" aria-labelledby={uid} className="q-listbox">
              {options.map((o) => {
                const on = selected.includes(o.value)
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      disabled={o.disabled}
                      onClick={() => toggle(o.value)}
                      className="q-listbox-option"
                    >
                      <span aria-hidden="true" className={on ? 'q-check-box is-checked' : 'q-check-box'}>
                        {on && <Icon name="check" size={12} />}
                      </span>
                      <span className="q-listbox-label">{o.label}</span>
                      {o.meta && <span className="q-listbox-meta">{o.meta}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </Field>
  )
}
