import { useTranslation } from 'react-i18next'
import { Icon, type IconName } from '../../design-system'
import type { PendingAttachment } from '../../types/agent'

interface AttachmentPreviewProps {
  attachment: PendingAttachment
  onRemove: (id: string) => void
}

const FILE_ICON: Record<string, IconName> = {
  image: 'file-image',
  pdf: 'file-pdf',
  docx: 'file-doc',
}

export default function AttachmentPreview({ attachment, onRemove }: AttachmentPreviewProps) {
  const { t } = useTranslation('chat')

  return (
    <div className="chat-attachment-chip">
      {attachment.fileType === 'image' && attachment.objectUrl
        ? <img src={attachment.objectUrl} alt={attachment.filename} className="chat-attachment-thumb" />
        : (
          <span className="chat-attachment-icon">
            <Icon name={FILE_ICON[attachment.fileType] ?? 'file-text'} size={16} />
          </span>
        )}

      <span className="chat-attachment-name">{attachment.filename}</span>

      {attachment.state === 'uploading' && (
        <span className="chat-attachment-status is-uploading">
          <span className="q-spin">
            <Icon name="circle-notch" size={12} />
          </span>
        </span>
      )}
      {attachment.state === 'done' && (
        <span className="chat-attachment-status is-done">
          <Icon name="check" size={12} />
        </span>
      )}

      {attachment.state !== 'uploading' && (
        <button
          type="button"
          className="chat-attachment-remove"
          onClick={() => onRemove(attachment.id)}
          aria-label={t('file.remove', { defaultValue: 'Quitar archivo' })}
        >
          <Icon name="x" size={12} />
        </button>
      )}
    </div>
  )
}
