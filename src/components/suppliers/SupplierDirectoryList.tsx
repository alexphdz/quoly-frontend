import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { SupplierCompanyRead } from '../../types/supplierDirectory'
import { EmptyState } from '../ui'

export default function SupplierDirectoryList({
  suppliers,
  onRestore,
}: {
  suppliers: SupplierCompanyRead[]
  onRestore?: (id: string) => void
}) {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  if (suppliers.length === 0) {
    return <EmptyState title={t('suppliers.list.emptyTitle')} description={t('suppliers.list.emptyDescription')} />
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>{t('suppliers.directory.columns.company')}</th>
            <th>{t('suppliers.directory.columns.contact')}</th>
            <th>{t('suppliers.directory.columns.tags')}</th>
            {onRestore && <th className="sup-restore" />}
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => {
            const primary = supplier.contacts?.find(contact => contact.is_primary) ?? supplier.contacts?.[0]
            const place = [supplier.city, supplier.country].filter(Boolean).join(', ')
            return (
              <tr key={supplier.id} className="is-link" onClick={() => navigate(`/suppliers/${supplier.id}`)}>
                <td>
                  <Link to={`/suppliers/${supplier.id}`} className="ds-request-name" title={supplier.display_name} style={{ color: supplier.is_active ? undefined : 'var(--tx-2)' }} onClick={event => event.stopPropagation()}>
                    {supplier.display_name}
                  </Link>
                  {place && <div className="ds-request-meta">{place}</div>}
                </td>
                <td>
                  <div className="sup-contact-name">{primary?.name || supplier.display_name}</div>
                  {(primary?.email || supplier.primary_email) && (
                    <div className="sup-contact-email" title={primary?.email || supplier.primary_email}>
                      {primary?.email || supplier.primary_email}
                    </div>
                  )}
                </td>
                <td>
                  <div className="sup-tags">
                    {(supplier.tags ?? []).slice(0, 4).map(tag => (
                      <span key={tag} className="ds-pill ds-pill-muted">{tag}</span>
                    ))}
                  </div>
                </td>
                {onRestore && (
                  <td className="sup-restore">
                    <button
                      type="button"
                      className="ds-btn ds-btn-text"
                      onClick={event => {
                        event.stopPropagation()
                        onRestore(supplier.id)
                      }}
                    >
                      {t('suppliers.directory.restore')}
                    </button>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
