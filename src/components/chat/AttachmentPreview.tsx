import { useTranslation } from 'react-i18next'
import type { PendingAttachment } from '../../types/agent'

interface AttachmentPreviewProps {
  attachment: PendingAttachment
  onRemove: (id: string) => void
}

function FileIcon({ type }: { type: PendingAttachment['fileType'] }) {
  if (type === 'image') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    )
  }
  if (type === 'pdf') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      </svg>
    )
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="chat-attachment-spinner">
      <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function AttachmentPreview({ attachment, onRemove }: AttachmentPreviewProps) {
  const { t: _t } = useTranslation('chat')

  return (
    <div className="chat-attachment-chip">
      {attachment.fileType === 'image' && attachment.objectUrl
        ? <img src={attachment.objectUrl} alt={attachment.filename} className="chat-attachment-thumb" />
        : (
          <span className="chat-attachment-icon">
            <FileIcon type={attachment.fileType} />
          </span>
        )}

      <span className="chat-attachment-name">{attachment.filename}</span>

      {attachment.state === 'uploading' && (
        <span className="chat-attachment-status is-uploading"><SpinnerIcon /></span>
      )}
      {attachment.state === 'done' && (
        <span className="chat-attachment-status is-done"><CheckIcon /></span>
      )}

      {attachment.state !== 'uploading' && (
        <button
          type="button"
          className="chat-attachment-remove"
          onClick={() => onRemove(attachment.id)}
          aria-label="Remove attachment"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  )
}
