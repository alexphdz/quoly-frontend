import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { uploadReferenceSpec } from '../api/rfqs'
import CommercialRFQForm from '../components/rfq/CommercialRFQForm'
import { useShellLayout } from '../components/layout/useShellLayout'
import { BreadcrumbItem } from '../design-system'
import { ErrorState, PageSkeleton, toast } from '../components/ui'
import { useCreateRFQ, useRFQ, useUpdateCommercialRFQ } from '../hooks/useRFQs'
import type { ApiError } from '../api/client'
import type { CommercialRFQWrite } from '../types/rfq'

export default function CommercialRFQPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const { t } = useTranslation('rfq')
  const navigate = useNavigate()
  const existing = useRFQ(id ?? '')
  const createRFQ = useCreateRFQ()
  const updateRFQ = useUpdateCommercialRFQ()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const layout = useShellLayout()

  const onSubmit = async (data: CommercialRFQWrite, specFiles: File[]) => {
    setUploadError(null)
    setSaving(true)
    try {
      const rfq =
        isEdit && id
          ? await updateRFQ.mutateAsync({ id, data })
          : await createRFQ.mutateAsync(data)
      for (const file of specFiles) {
        await uploadReferenceSpec(rfq.id, file)
      }
      toast(data.status === 'draft' ? t('commercial.draftSaved') : t('commercial.created'))
      navigate(`/rfqs/${rfq.id}`)
    } catch (err) {
      setUploadError((err as ApiError).detail)
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && existing.error) {
    return (
      <div className="ds-page">
        <ErrorState />
      </div>
    )
  }

  if (isEdit && existing.isLoading) {
    return (
      <div className="ds-page">
        <PageSkeleton />
      </div>
    )
  }

  if (isEdit && existing.data && existing.data.request_kind !== 'commercial') {
    return <Navigate to={`/rfqs/${existing.data.id}`} replace />
  }

  const pending = saving || createRFQ.isPending || updateRFQ.isPending
  const error = uploadError ?? ((createRFQ.error ?? updateRFQ.error) as ApiError | null)?.detail ?? null

  const editing = isEdit && existing.data

  return (
    <div className={`cr2-page is-${layout}`}>
      <header className="cr2-head">
        <nav aria-label={t('crear.breadcrumb')}>
          <ol className="q-crumbs">
            <BreadcrumbItem to="/requests" last>{t('detail.breadcrumbRfqs')}</BreadcrumbItem>
          </ol>
        </nav>
        <h1 className="cr2-h1">{editing ? t('crear.editTitle') : t('crear.title')}</h1>
        <p className="cr2-intro">{editing ? t('crear.editIntro') : t('crear.intro')}</p>
      </header>
      <CommercialRFQForm
        key={existing.data?.id ?? 'new'}
        initial={existing.data}
        isPending={pending}
        error={error}
        onSubmit={onSubmit}
      />
    </div>
  )
}
