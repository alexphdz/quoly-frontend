import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Popover } from 'radix-ui'
import { Command } from 'cmdk'
import { Icon } from '../ds'

export interface RequestOption { id: string, name: string, number: string | null, count: number }

/** Request picker: a Radix popover with cmdk search, replacing a native select. */
export default function RequestFilter({
  options,
  value,
  onChange,
}: {
  options: RequestOption[]
  value: string | null
  onChange: (id: string | null) => void
}) {
  const { t } = useTranslation('quotation')
  const [open, setOpen] = useState(false)
  const selected = options.find(option => option.id === value)

  const pick = (id: string | null) => {
    onChange(id)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <div className="qt-filter">
        <Popover.Trigger asChild>
          <button type="button" className="qy-select-trigger is-compact qt-filter-trigger" aria-label={t('filters.allRequests')}>
            <Icon name="assignment" size={16} />
            <span className="truncate">{selected?.name ?? t('filters.allRequests')}</span>
            <Icon name="expand_more" size={14} />
          </button>
        </Popover.Trigger>
        {selected && (
          <button type="button" className="qt-filter-clear" aria-label={t('filters.clearRequest')} onClick={() => onChange(null)}>
            <Icon name="close" size={14} />
          </button>
        )}
      </div>
      <Popover.Portal>
        <Popover.Content align="start" sideOffset={4} className="qy-popover qt-filter-pop">
          <Command label={t('filters.allRequests')}>
            <div className="qt-filter-input">
              <Icon name="search" size={16} />
              <Command.Input placeholder={t('filters.findRequest')} />
            </div>
            <Command.List className="qt-filter-list">
              <Command.Empty className="qy-palette-empty">{t('filters.noRequest')}</Command.Empty>
              <Command.Item value="__all" className="qy-item" onSelect={() => pick(null)}>
                <span className="truncate">{t('filters.allRequests')}</span>
                {!value && <Icon name="check" size={14} className="qy-item-check" />}
              </Command.Item>
              {options.map(option => (
                <Command.Item
                  key={option.id}
                  value={`${option.name} ${option.number ?? ''} ${option.id}`}
                  className="qy-item"
                  onSelect={() => pick(option.id)}
                >
                  <span className="truncate">{option.name}</span>
                  {option.number && <span className="ds-id">{option.number}</span>}
                  <span className="qy-num qt-filter-count">{option.count}</span>
                  {value === option.id && <Icon name="check" size={14} className="qy-item-check" />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
