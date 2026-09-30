import { Icon } from '../ds'
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { SupplierRead } from '../../types/rfq'
import type { ApiError } from '../../api/client'
import { Alert, Button, FormField, SelectInput, TextArea } from '../ui'

interface Props {
  suppliers: SupplierRead[]
  onSubmit: (data: { supplierId: string; file?: File | null; rawText?: string | null }) => void
  isPending: boolean
  error: Error | null
}

export default function QuoteUploadForm({ suppliers, onSubmit, isPending, error }: Props) {
  const { t } = useTranslation('quote')
  const [supplierId, setSupplierId] = useState('')
  const [mode, setMode] = useState<'file' | 'text'>('file')
  const [rawText, setRawText] = useState('')
  const [submitError, setSubmitError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError('')
    if (!supplierId) {
      setSubmitError(t('upload.supplierRequired'))
      return
    }

    const file = fileRef.current?.files?.[0] ?? null
    if (mode === 'file' && !file) {
      setSubmitError(t('upload.fileRequired'))
      return
    }
    if (mode === 'text' && !rawText.trim()) {
      setSubmitError(t('upload.textRequired'))
      return
    }

    onSubmit({
      supplierId,
      file: mode === 'file' ? file : null,
      rawText: mode === 'text' ? rawText : null,
    })

    setRawText('')
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-card-subtle)] p-4">
      <FormField label={t('upload.supplier')} required>
        <SelectInput
          value={supplierId}
          onChange={e => setSupplierId(e.target.value)}
        >
          <option value="">{t('upload.selectSupplier')}</option>
          {suppliers.map(s => (
            <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
          ))}
        </SelectInput>
      </FormField>

      <div className="segmented" role="tablist" aria-label={t('upload.method')}>
        <button type="button" className={mode === 'file' ? 'active' : ''} onClick={() => setMode('file')}>
          <Icon name="description" size={15} /> {t('upload.uploadFile')}
        </button>
        <button type="button" className={mode === 'text' ? 'active' : ''} onClick={() => setMode('text')}>
          <Icon name="content_paste" size={15} /> {t('upload.pasteText')}
        </button>
      </div>

      {mode === 'file' ? (
        <FormField label={t('upload.file')} required helper={t('upload.fileHelper')}>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.csv"
            className="input"
          />
        </FormField>
      ) : (
        <FormField label={t('upload.quoteText')} required>
          <TextArea
            value={rawText}
            onChange={e => setRawText(e.target.value)}
            rows={5}
            placeholder={t('upload.pastePlaceholder')}
          />
        </FormField>
      )}

      {submitError && <Alert tone="warning">{submitError}</Alert>}
      {error && (
        <Alert tone="error">{(error as ApiError).detail || t('upload.failed')}</Alert>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="justify-self-start"
      >
        <Icon name="upload" size={16} /> {isPending ? t('upload.uploading') : t('upload.submit')}
      </Button>
    </form>
  )
}
