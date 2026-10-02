import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { deleteReferenceSpec, uploadReferenceSpec } from '../../api/rfqs'
import type { ApiError } from '../../api/client'
import type { RFQAttachment } from '../../types/rfq'
import { referenceSpecificationAttachments } from '../../lib/specScenario'
import { FormFeedback } from '../ui'

interface Props {
  rfqId: string
  attachments?: RFQAttachment[]
  readOnly?: boolean
}

export default function ReferenceSpecManager({ rfqId, attachments, readOnly }: Props) {
  const { t } = useTranslation('rfq')
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const specs = referenceSpecificationAttachments(attachments)

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['rfq', rfqId] })
  }

  const onPickFiles = async (files: FileList | null) => {
    if (!files?.length || readOnly) return
    setError(null)
    setBusy(true)
    try {
      for (const file of Array.from(files)) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          setError(t('commercial.specPdfOnly'))
          continue
        }
        await uploadReferenceSpec(rfqId, file)
      }
      await refresh()
    } catch (err) {
      setError((err as ApiError).detail || t('commercial.specUploadFailed'))
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const onRemove = async (attachmentId: string) => {
    if (readOnly) return
    setError(null)
    setRemovingId(attachmentId)
    try {
      await deleteReferenceSpec(rfqId, attachmentId)
      await refresh()
    } catch (err) {
      setError((err as ApiError).detail || t('commercial.specRemoveFailed'))
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div>
      {error && <FormFeedback>{error}</FormFeedback>}
      {specs.length > 0 && (
        <ul>
          {specs.map((spec) => (
            <li key={spec.id ?? spec.file_name} className="ds-file-row">
              {spec.file_url ? (
                <a href={spec.file_url} target="_blank" rel="noreferrer" className="ds-link truncate">{spec.file_name}</a>
              ) : (
                <span className="truncate">{spec.file_name}</span>
              )}
              {!readOnly && spec.id && (
                <button
                  type="button"
                  className="ds-btn ds-btn-text"
                  aria-label={t('commercial.removeSpec')}
                  disabled={removingId === spec.id || busy}
                  onClick={() => void onRemove(spec.id!)}
                >
                  {t('commercial.removeSpec')}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!readOnly && (
        <div style={{ marginTop: 8 }}>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="ds-file-input"
            data-testid="reference-spec-file"
            onChange={(e) => void onPickFiles(e.target.files)}
          />
          <button
            type="button"
            className="ds-btn ds-btn-secondary"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            {busy ? t('commercial.specUploading') : t('commercial.specAddPdf')}
          </button>
          <p className="ds-meta" style={{ marginTop: 8 }}>{t('commercial.specSheetHelp')}</p>
        </div>
      )}
      {readOnly && specs.length === 0 && (
        <p className="ds-meta">{t('commercial.specNoneAttached')}</p>
      )}
    </div>
  )
}
