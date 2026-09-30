import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Command } from 'cmdk'
import { Popover } from 'radix-ui'
import { COMMERCIAL_UNIT_GROUPS } from '../../../constants/commercial'
import { Icon } from '../../ds'

export default function UnitPicker({
  value,
  onChange,
  name = 'base_unit',
  label,
  error,
}: {
  value: string
  onChange: (code: string) => void
  name?: string
  label: string
  error?: boolean
}) {
  const { t } = useTranslation('rfq')
  const [open, setOpen] = useState(false)
  const selected = value ? t(`commercial.units.${value}`, { defaultValue: value }) : ''

  const groups = useMemo(
    () =>
      COMMERCIAL_UNIT_GROUPS.map((group) => ({
        ...group,
        items: group.codes.map((code) => ({
          code,
          label: t(`commercial.units.${code}`),
        })),
      })),
    [t],
  )

  const pick = (code: string) => {
    onChange(code)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <input type="hidden" name={name} value={value} />
      <Popover.Trigger asChild>
        <button
          type="button"
          className="cr-qty-unit"
          data-name={name}
          aria-label={label}
          aria-invalid={error || undefined}
          aria-expanded={open}
        >
          <span>{selected || t('commercial.unitPlaceholder')}</span>
          <Icon name="expand_more" size={14} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={4} className="qy-popover cr-unit-pop">
          <Command label={label}>
            <div className="cr-unit-search">
              <Icon name="search" size={14} />
              <Command.Input placeholder={t('commercial.unitSearch')} />
            </div>
            <Command.List className="cr-unit-list">
              <Command.Empty className="cr-unit-empty">{t('commercial.unitEmpty')}</Command.Empty>
              {groups.map((group) => (
                <Command.Group key={group.id} heading={t(`commercial.unitGroup.${group.id}`)}>
                  {group.items.map((item) => (
                    <Command.Item
                      key={item.code}
                      value={`${item.code} ${item.label}`}
                      data-option-value={item.code}
                      className="qy-item"
                      onSelect={() => pick(item.code)}
                    >
                      <span>{item.label}</span>
                      {value === item.code && <Icon name="check" size={14} className="qy-item-check" />}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
