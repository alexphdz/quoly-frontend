import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useCreateRFQ } from '../hooks/useRFQs'
import RFQForm from '../components/rfq/RFQForm'
import type { RFQCreate } from '../types/rfq'
import type { ApiError } from '../api/client'
import { PageHeader, toast } from '../components/ui'

export default function RFQCreatePage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const createRFQ = useCreateRFQ()
  const { user } = useAuth()

  const onSubmit = (data: RFQCreate) => {
    createRFQ.mutate(data, {
      onSuccess: (rfq) => {
        toast(t('rfqCreate.created'))
        navigate(`/rfqs/${rfq.id}`)
      },
    })
  }

  return (
    <div className="page page-wide">
      <div className="mb-5 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link to="/">{t('rfqCreate.breadcrumb')}</Link>
        <span>›</span>
        <span className="text-[var(--text-primary)]">{t('rfqCreate.newRfq')}</span>
      </div>
      <PageHeader
        title={t('rfqCreate.title')}
        subtitle={t('rfqCreate.subtitle')}
      />
      <RFQForm
        onSubmit={onSubmit}
        isPending={createRFQ.isPending}
        error={createRFQ.error ? (createRFQ.error as ApiError).detail : null}
        defaultEmailLocale={user?.default_email_locale ?? 'en'}
      />
    </div>
  )
}
