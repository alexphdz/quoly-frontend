import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { SupplierRead } from '../../types/rfq'
import { useEnumLabels } from '../../i18n/labels'
import { useFormat } from '../../lib/format'
import { Avatar, Badge, Button, EmptyState, StatusBadge } from '../ui'

const CLOSABLE = new Set([
  'not_contacted',
  'awaiting_response',
  'buyer_action_required',
  'partial_response',
  'quote_received',
  'pending',
  'requested',
  'quoted',
])

export default function SupplierList({
  suppliers,
  onCloseSupplier,
  isClosingId,
}: {
  suppliers: SupplierRead[]
  onCloseSupplier?: (supplierId: string) => void
  isClosingId?: string | null
}) {
  const { t } = useTranslation('rfq')
  const labels = useEnumLabels()
  const fmt = useFormat()
  if (suppliers.length === 0) {
    return <EmptyState title={t('suppliers.emptyTitle')} description={t('suppliers.emptyDescription')} />
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border-subtle)]">
      <table className="qtable">
        <thead>
          <tr>
            <th>{t('suppliers.headers.supplier')}</th>
            <th>{t('suppliers.headers.email')}</th>
            <th>{t('suppliers.headers.status')}</th>
            <th>{t('suppliers.headers.requested')}</th>
            {onCloseSupplier && <th></th>}
          </tr>
        </thead>
        <tbody>
          {suppliers.map(s => (
            <tr key={s.id}>
              <td>
                <div className="flex items-center gap-3">
                  <Avatar name={s.name} size="sm" />
                  <div>
                    <div className="font-semibold">
                      {s.supplier_company_id ? (
                        <Link to={`/suppliers/${s.supplier_company_id}`} className="hover:underline">{s.name}</Link>
                      ) : s.name}
                    </div>
                    <Badge tone="neutral">{s.supplier_company_id ? t('suppliers.fromDirectory') : t('suppliers.addedManually')}</Badge>
                  </div>
                </div>
              </td>
              <td className="text-[var(--text-secondary)]">{s.email}</td>
              <td><StatusBadge status={s.status} label={labels.supplierStatus(s.status)} /></td>
              <td className="text-[var(--text-secondary)]">{s.requested_at ? fmt.date(s.requested_at) : '—'}</td>
              {onCloseSupplier && (
                <td>
                  {CLOSABLE.has(s.status) && (
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={isClosingId === s.id}
                      onClick={() => onCloseSupplier(s.id)}
                    >
                      {t('suppliers.close')}
                    </Button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
