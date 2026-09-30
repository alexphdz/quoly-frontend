import { useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { enUS, es } from 'react-day-picker/locale'
import { Popover } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { Icon } from '../ds'
import { useFormat } from '../../lib/format'
import 'react-day-picker/style.css'
import '../../styles/components/date-field.scss'

/** Calendar dates are local YYYY-MM-DD. `new Date("YYYY-MM-DD")` is UTC and shifts the day. */
export function isoDateToLocal(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (!match) return undefined
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return undefined
  return date
}

export function localDateToIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const YEAR_BACK = 5
const YEAR_FORWARD = 10

/** January five years ago through December ten years ahead, widened to a saved month outside that window. */
export function navigationWindow(saved: Date | undefined, today = new Date()): { startMonth: Date; endMonth: Date } {
  const startMonth = new Date(today.getFullYear() - YEAR_BACK, 0, 1)
  const endMonth = new Date(today.getFullYear() + YEAR_FORWARD, 11, 1)
  if (!saved) return { startMonth, endMonth }
  const savedMonth = new Date(saved.getFullYear(), saved.getMonth(), 1)
  if (savedMonth < startMonth) return { startMonth: savedMonth, endMonth }
  if (savedMonth > endMonth) return { startMonth, endMonth: savedMonth }
  return { startMonth, endMonth }
}

export function DateField({
  name,
  label,
  value,
  onChange,
  placeholder,
  clearLabel,
  disabled,
}: {
  name: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  clearLabel: string
  disabled?: boolean
}) {
  const { i18n } = useTranslation()
  const fmt = useFormat()
  const [open, setOpen] = useState(false)
  const spanish = (i18n.resolvedLanguage ?? i18n.language).startsWith('es')
  const selected = isoDateToLocal(value)
  const formatted = selected ? fmt.date(selected, { dateStyle: 'medium' }) : ''
  const [month, setMonth] = useState<Date>(() => selected ?? new Date())
  const { startMonth, endMonth } = navigationWindow(selected)

  const pick = (day: Date | undefined) => {
    if (!day) return
    onChange(localDateToIso(day))
    setOpen(false)
  }

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) setMonth(selected ?? new Date())
        setOpen(next)
      }}
    >
      <input type="hidden" name={name} value={value} />
      <Popover.Trigger asChild>
        <button
          type="button"
          className="qy-date-trigger"
          disabled={disabled}
          aria-label={formatted ? `${label}, ${formatted}` : `${label}, ${placeholder}`}
          aria-expanded={open}
          aria-haspopup="dialog"
          data-name={name}
        >
          <span className={formatted ? undefined : 'is-placeholder'}>{formatted || placeholder}</span>
          <Icon name="calendar_today" size={16} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={4} className="qy-popover qy-date-pop">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={pick}
            locale={spanish ? es : enUS}
            month={month}
            onMonthChange={setMonth}
            startMonth={startMonth}
            endMonth={endMonth}
            captionLayout="dropdown"
            navLayout="around"
            showOutsideDays
            components={{
              Chevron: ({ orientation, className }) => (
                <Icon
                  name={
                    orientation === 'left'
                      ? 'chevron_left'
                      : orientation === 'right'
                        ? 'chevron_right'
                        : orientation === 'up'
                          ? 'expand_less'
                          : 'expand_more'
                  }
                  size={orientation === 'left' || orientation === 'right' ? 16 : 12}
                  className={className}
                />
              ),
            }}
          />
          {value ? (
            <button
              type="button"
              className="qy-date-clear"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
            >
              {clearLabel}
            </button>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
