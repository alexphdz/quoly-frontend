import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  title: string
  url: string
  onClose: () => void
}

export default function SpecPdfModal({ title, url, onClose }: Props) {
  const { t } = useTranslation('comparison')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="ds-modal-backdrop" onClick={onClose}>
      <div
        className="ds-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="spec-pdf-title"
        onClick={event => event.stopPropagation()}
      >
        <div className="ds-modal-bar">
          <h2 id="spec-pdf-title">{title}</h2>
          <button type="button" className="ds-btn ds-btn-secondary" onClick={onClose}>
            {t('specPdf.close')}
          </button>
        </div>
        <iframe title={title} src={url} />
      </div>
    </div>
  )
}
