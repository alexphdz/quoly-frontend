import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/webp',
]
const ALLOWED_EXT = '.pdf,.docx,.png,.jpg,.jpeg,.webp'

interface FileUploadButtonProps {
  onFile: (file: File, error?: string) => void
  disabled?: boolean
}

export default function FileUploadButton({ onFile, disabled = false }: FileUploadButtonProps) {
  const { t } = useTranslation('chat')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleClick() {
    inputRef.current?.click()
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!inputRef.current) return
    inputRef.current.value = ''
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      onFile(file, 'type_error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      onFile(file, 'size_error')
      return
    }

    onFile(file)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_EXT}
        className="chat-file-input-hidden"
        onChange={handleChange}
        aria-hidden
        tabIndex={-1}
      />
      <button
        type="button"
        className="chat-input-attach"
        onClick={handleClick}
        disabled={disabled}
        title={t('input.attach')}
        aria-label={t('input.attach')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
        </svg>
      </button>
    </>
  )
}
