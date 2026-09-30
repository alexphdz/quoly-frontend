import { Icon } from '../ds'
import { useTranslation } from 'react-i18next'
import type { SupplierCompanyRead } from '../../types/supplierDirectory'
import { Avatar } from '../ui'

interface Props {
  suppliers: SupplierCompanyRead[]
  isLoading: boolean
  isPending: boolean
  onAdd: (supplierCompanyId: string) => void
}

export default function AddSupplierFromDirectory({ suppliers, isLoading, isPending, onAdd }: Props) {
  const { t } = useTranslation('rfq')
  if (isLoading) return <p className="text-sm text-[var(--text-muted)]">{t('directory.loading')}</p>

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
        <Icon name="apartment" size={16} /> {t('directory.addFromDirectory')}
      </div>
      {suppliers.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t('directory.noSaved')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {suppliers.map(supplier => (
            <button
              key={supplier.id}
              type="button"
              onClick={() => onAdd(supplier.id)}
              disabled={isPending}
              className="btn btn-secondary"
            >
              <Avatar name={supplier.display_name} size="sm" />
              {supplier.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
