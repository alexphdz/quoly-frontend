import { useTranslation } from 'react-i18next'
import type { SupplierContactRead } from '../../types/supplierDirectory'
import { Button, EmptyState, Icon, StatusBadge, Tag } from '../../design-system'

interface Props {
  contacts: SupplierContactRead[]
  editable?: boolean
  onSetPrimary?: (contactId: string) => void
  onDelete?: (contactId: string) => void
  pendingContactId?: string | null
}

export default function SupplierContactList({
  contacts,
  editable,
  onSetPrimary,
  onDelete,
  pendingContactId,
}: Props) {
  const { t } = useTranslation('common')
  if (contacts.length === 0) {
    return <EmptyState title={t('suppliers.contacts.emptyTitle')}><p>{t('suppliers.contacts.emptyDescription')}</p></EmptyState>
  }

  return (
    <ul className="sd-contacts">
      {contacts.map(contact => (
        <li key={contact.id} className="sd-contact">
          <div className="sd-contact-head">
            <span className="sd-contact-name">{contact.name}</span>
            {contact.is_primary && <StatusBadge tone="success" variant="quiet">{t('suppliers.contacts.primary')}</StatusBadge>}
            {contact.source !== 'manual' && <Tag variant="plain">{contact.source}</Tag>}
          </div>
          <ul className="sd-contact-lines">
            <li>
              <Icon name="envelope-simple" size={14} />
              <span>{contact.email}</span>
            </li>
            {contact.phone && <li><span>{contact.phone}</span></li>}
          </ul>
          {contact.job_title && <p className="sd-contact-role">{contact.job_title}</p>}
          {editable && (
            <div className="sd-contact-actions">
              {!contact.is_primary && onSetPrimary && (
                <Button size="sm" variant="secondary" disabled={pendingContactId === contact.id} onClick={() => onSetPrimary(contact.id)}>{t('suppliers.contacts.makePrimary')}</Button>
              )}
              {onDelete && contacts.length > 1 && (
                <Button size="sm" variant="tertiary" disabled={pendingContactId === contact.id} onClick={() => onDelete(contact.id)}>{t('suppliers.contacts.remove')}</Button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
