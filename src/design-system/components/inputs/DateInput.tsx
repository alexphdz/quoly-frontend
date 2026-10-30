import { useId, useState, type CSSProperties } from 'react'
import { DayPicker } from 'react-day-picker'
import { enUS, es } from 'react-day-picker/locale'
import { Popover } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { Icon } from '../core/Icon'
import { Field, controlClass, fieldAria, type ControlSize, type FieldBaseProps } from './Field'
import 'react-day-picker/style.css'

/** Fechas de calendario como YYYY-MM-DD local (new Date('YYYY-MM-DD') es UTC y desplaza el día). */
function isoToLocal(value: string | undefined): Date | undefined {
  const m = value ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : null
  if (!m) return undefined
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return d.getMonth() === Number(m[2]) - 1 ? d : undefined
}

function localToIso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

/** Texto en formato local (dd/mm/aaaa o mm/dd/yyyy) → ISO, o undefined si no es una fecha válida. */
function parseTyped(text: string, dayFirst: boolean): string | undefined {
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/.exec(text.trim())
  if (!m) return undefined
  const [a, b, y] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const day = dayFirst ? a : b
  const month = dayFirst ? b : a
  const d = new Date(y, month - 1, day)
  return d.getMonth() === month - 1 && d.getDate() === day ? localToIso(d) : undefined
}

export type DateInputProps = FieldBaseProps & {
  size?: ControlSize
  disabled?: boolean
  readOnly?: boolean
  /** Fecha ISO YYYY-MM-DD ('' = vacía). */
  value?: string
  onChange?: (value: string) => void
  /** Pista de formato; por defecto según idioma. */
  placeholder?: string
  minDate?: Date
  name?: string
  className?: string
  style?: CSSProperties
}

/** Fecha escrita en el formato local, con calendario desplegable. */
export function DateInput({
  id, label, description, required, optionalLabel, message, status,
  size = 'md', disabled = false, readOnly = false, value = '', onChange, placeholder, minDate, name, className, style,
}: DateInputProps) {
  const { t, i18n } = useTranslation('ds')
  const autoId = useId()
  const uid = id ?? autoId
  const dayFirst = (i18n.resolvedLanguage ?? i18n.language ?? 'es').startsWith('es')
  const selected = isoToLocal(value)
  const shown = selected
    ? dayFirst
      ? `${pad(selected.getDate())}/${pad(selected.getMonth() + 1)}/${selected.getFullYear()}`
      : `${pad(selected.getMonth() + 1)}/${pad(selected.getDate())}/${selected.getFullYear()}`
    : ''
  const [draft, setDraft] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(() => selected ?? new Date())

  const commit = () => {
    if (draft === null) return
    if (draft.trim() === '') onChange?.('')
    else {
      const iso = parseTyped(draft, dayFirst)
      if (iso) onChange?.(iso)
    }
    setDraft(null)
  }

  return (
    <Field id={uid} label={label} description={description} required={required} optionalLabel={optionalLabel} message={message} status={status} className={className} style={style}>
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          if (next) setMonth(selected ?? new Date())
          setOpen(next)
        }}
      >
        <Popover.Anchor asChild>
          <div className={controlClass({ size, status, disabled, readOnly })}>
            {name && <input type="hidden" name={name} value={value} />}
            <input
              id={uid}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
              value={draft ?? shown}
              placeholder={placeholder ?? t(dayFirst ? 'date.formatDayFirst' : 'date.formatMonthFirst')}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
              }}
              className="q-control-input is-numeric-text"
              {...fieldAria(uid, { description, message, status, required })}
            />
            {!readOnly && (
              <Popover.Trigger asChild>
                <button type="button" aria-label={t('date.openCalendar')} disabled={disabled} className="q-control-clear is-calendar">
                  <Icon name="calendar-blank" size={16} />
                </button>
              </Popover.Trigger>
            )}
          </div>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content align="end" sideOffset={4} className="q-floating q-date-pop">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(day) => {
                if (!day) return
                onChange?.(localToIso(day))
                setDraft(null)
                setOpen(false)
              }}
              disabled={minDate ? { before: minDate } : undefined}
              locale={dayFirst ? es : enUS}
              month={month}
              onMonthChange={setMonth}
              showOutsideDays
              components={{
                Chevron: ({ orientation }) => (
                  <Icon name={orientation === 'left' ? 'caret-left' : orientation === 'right' ? 'caret-right' : orientation === 'up' ? 'caret-up' : 'caret-down'} size={16} />
                ),
              }}
            />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </Field>
  )
}
