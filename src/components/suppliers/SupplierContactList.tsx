import { useTranslation } from 'react-i18next'
import type { SupplierContactRead } from '../../types/supplierDirectory'
import { Icon } from '../ds'
import { EmptyState } from '../ui'

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
    return <EmptyState title={t('suppliers.contacts.emptyTitle')} description={t('suppliers.contacts.emptyDescription')} />
  }

  return (
    <ul className="sd-contacts">
      {contacts.map(contact => (
        <li key={contact.id} className="sd-contact">
          <div className="sd-contact-head">
            <span className="sd-contact-name">{contact.name}</span>
            {contact.is_primary && <span className="ds-pill">{t('suppliers.contacts.primary')}</span>}
            {contact.source !== 'manual' && <span className="ds-pill ds-pill-muted">{contact.source}</span>}
          </div>
          <ul className="sd-contact-lines">
            <li>
              <Icon name="mail" size={14} />
              <span>{contact.email}</span>
            </li>
            {contact.phone && (
              <li>
                <Icon name="phone" size={14} />
                <span>{contact.phone}</span>
              </li>
            )}
          </ul>
          {contact.job_title && <p className="sd-contact-role">{contact.job_title}</p>}
          {editable && (
            <div className="sd-contact-actions">
              {!contact.is_primary && onSetPrimary && (
                <button
                  type="button"
                  className="ds-btn ds-btn-secondary"
                  disabled={pendingContactId === contact.id}
                  onClick={() => onSetPrimary(contact.id)}
                >
                  {t('suppliers.contacts.makePrimary')}
                </button>
              )}
              {onDelete && contacts.length > 1 && (
                <button
                  type="button"
                  className="ds-btn ds-btn-quiet"
                  disabled={pendingContactId === contact.id}
                  onClick={() => onDelete(contact.id)}
                >
                  {t('suppliers.contacts.remove')}
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
