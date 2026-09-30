import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Command } from 'cmdk'
import { Icon } from '../ds'
import { useRFQs } from '../../hooks/useRFQs'
import { useAllQuotes } from '../../hooks/useQuotes'
import { useSupplierDirectory } from '../../hooks/useSupplierDirectory'
import { rfqDisplayNumber } from '../../lib/rfqDisplay'

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(value => !value)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  return { open, setOpen }
}

export default function CommandPalette({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { data: rfqs } = useRFQs()
  const { data: quotes } = useAllQuotes()
  const { data: suppliers } = useSupplierDirectory()
  const nextQuote = quotes?.find(quote => quote.status === 'draft')

  const go = (to: string) => {
    onOpenChange(false)
    navigate(to)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label={t('palette.label')}
      overlayClassName="qy-overlay"
      contentClassName="qy-palette"
    >
      <div className="qy-palette-input">
        <Icon name="search" size={18} />
        <Command.Input placeholder={t('palette.placeholder')} />
      </div>
      <Command.List className="qy-palette-list">
        <Command.Empty className="qy-palette-empty">{t('palette.empty')}</Command.Empty>
        <Command.Group heading={t('palette.actions')}>
          <Command.Item className="qy-item" onSelect={() => go('/rfqs/new')}>
            <Icon name="add" size={16} />{t('nav.newRequest')}
          </Command.Item>
          {nextQuote && (
            <Command.Item className="qy-item" onSelect={() => go(`/quotes/${nextQuote.id}`)}>
              <Icon name="visibility" size={16} />{t('palette.reviewNext')}
            </Command.Item>
          )}
        </Command.Group>
        {rfqs && rfqs.length > 0 && (
          <Command.Group heading={t('nav.rfqs')}>
            {rfqs.slice(0, 30).map(rfq => (
              <Command.Item
                key={rfq.id}
                value={`${rfq.name} ${rfqDisplayNumber(rfq)} ${rfq.id}`}
                className="qy-item"
                onSelect={() => go(`/rfqs/${rfq.id}`)}
              >
                <Icon name="assignment" size={16} />
                <span className="truncate">{rfq.name}</span>
                <span className="ds-id" style={{ marginLeft: 'auto' }}>{rfqDisplayNumber(rfq)}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
        {suppliers && suppliers.length > 0 && (
          <Command.Group heading={t('nav.suppliers')}>
            {suppliers.slice(0, 30).map(supplier => (
              <Command.Item
                key={supplier.id}
                value={`${supplier.display_name} ${supplier.primary_email} ${supplier.id}`}
                className="qy-item"
                onSelect={() => go(`/suppliers/${supplier.id}`)}
              >
                <Icon name="apartment" size={16} />
                <span className="truncate">{supplier.display_name}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}
        <Command.Group heading={t('palette.pages')}>
          <Command.Item className="qy-item" onSelect={() => go('/')}><Icon name="home" size={16} />{t('nav.dashboard')}</Command.Item>
          <Command.Item className="qy-item" onSelect={() => go('/requests')}><Icon name="files" size={16} />{t('nav.rfqs')}</Command.Item>
          <Command.Item className="qy-item" onSelect={() => go('/quotations')}><Icon name="quotes" size={16} />{t('nav.quotations')}</Command.Item>
          <Command.Item className="qy-item" onSelect={() => go('/suppliers')}><Icon name="suppliers" size={16} />{t('nav.suppliers')}</Command.Item>
          <Command.Item className="qy-item" onSelect={() => go('/settings')}><Icon name="sliders" size={16} />{t('nav.settings')}</Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
