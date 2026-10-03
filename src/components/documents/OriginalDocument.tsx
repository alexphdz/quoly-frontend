import { useRef, useState } from 'react'
import { FilePdf, FileText } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { get } from '../../api/client'
import { Icon } from '../ds'
import { FormFeedback } from '../ui'

interface DocumentLink { url: string; filename: string; expires_in: number }

/** Fetch fresh authorized links on click; never expose private files as public URLs. */
export default function OriginalDocument({ endpoint, fileType, filename }: {
  endpoint: string
  fileType?: string | null
  filename?: string
}) {
  const { t } = useTranslation('common')
  const [pending, setPending] = useState<'open' | 'download' | null>(null)
  const [error, setError] = useState('')
  const busy = useRef(false)
  const pdf = fileType?.toLowerCase() === 'pdf'
  const FileIcon = pdf ? FilePdf : FileText

  const access = async (action: 'open' | 'download') => {
    if (busy.current) return
    setError('')
    // Reserve the tab during the user's click so async signing does not trigger popup blocking.
    const tab = action === 'open' ? window.open('', '_blank') : null
    if (action === 'open' && !tab) { setError(t('documents.popupBlocked')); return }
    if (tab) tab.opener = null
    busy.current = true
    setPending(action)
    try {
      const result = await get<DocumentLink>(`${endpoint}?download=${action === 'download'}`)
      if (tab) {
        if (!tab.closed) tab.location.replace(result.url)
      } else {
        const link = document.createElement('a')
        link.href = result.url
        link.download = result.filename
        link.rel = 'noreferrer'
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
    } catch {
      tab?.close()
      setError(t('documents.accessError'))
    } finally {
      busy.current = false
      setPending(null)
    }
  }

  return (
    <div className="original-document">
      <div className="original-document-row">
        <FileIcon size={36} weight="duotone" className={pdf ? 'original-document-pdf' : 'original-document-icon'} aria-hidden />
        <div className="original-document-copy">
          <strong>{filename || t(pdf ? 'documents.originalPdf' : 'documents.originalFile')}</strong>
          <span className="ds-meta">{t('documents.supplierDocument')}</span>
        </div>
        <div className="original-document-actions">
          <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" disabled={!!pending} onClick={() => void access('open')}>
            <Icon name="open_in_new" size={16} />
            {t(pending === 'open' ? 'documents.opening' : 'documents.open')}
          </button>
          <button type="button" className="ds-btn ds-btn-secondary ds-btn-sm" disabled={!!pending} onClick={() => void access('download')}>
            <Icon name="download" size={16} />
            {t(pending === 'download' ? 'documents.downloading' : 'documents.download')}
          </button>
        </div>
      </div>
      {error && <FormFeedback>{error}</FormFeedback>}
    </div>
  )
}
