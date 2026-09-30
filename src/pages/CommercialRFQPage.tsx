import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { uploadReferenceSpec } from '../api/rfqs'
import CommercialRFQForm from '../components/rfq/CommercialRFQForm'
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

  const title = isEdit ? t('commercial.editTitle') : t('commercial.title')

  return (
    <div className="ds-page cr-page">
      <div className="request-crumb">
        <Link to="/requests" className="ds-link">{t('detail.breadcrumbRfqs')}</Link>
        <span aria-hidden="true">/</span>
        <span>{title}</span>
      </div>
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
