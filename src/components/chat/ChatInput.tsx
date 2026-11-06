import { useState, useRef, useCallback, type KeyboardEvent, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { IntelligenceMark, InlineAlert, TextButton } from '../../design-system'
import FileUploadButton from './FileUploadButton'
import AttachmentPreview from './AttachmentPreview'
import type { PendingAttachment } from '../../types/agent'
import * as agentApi from '../../api/agent'

interface ChatInputProps {
  conversationId: string
  onSend: (message: string, attachmentIds: string[]) => void
  disabled?: boolean
  loading?: boolean
  blocked?: boolean
  onDismissBlock?: () => void
  warning?: string | null
  turnError?: string | null
  onRetry?: () => void
  placeholder?: string
}

function newLocalId() {
  return `att-${Math.random().toString(36).slice(2)}`
}

function inferFileType(file: File): PendingAttachment['fileType'] {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type === 'application/pdf') return 'pdf'
  return 'docx'
}

export default function ChatInput({
  conversationId,
  onSend,
  disabled = false,
  loading = false,
  blocked = false,
  onDismissBlock,
  warning,
  turnError,
  onRetry,
  placeholder,
}: ChatInputProps) {
  const { t } = useTranslation('chat')
  const [value, setValue] = useState('')
  const [attachments, setAttachments] = useState<PendingAttachment[]>([])
  const [fileError, setFileError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  function handleSubmit() {
    const msg = value.trim()
    const readyAttachments = attachments.filter(a => a.state === 'done' && a.attachment_id)
    if ((!msg && readyAttachments.length === 0) || disabled || loading || blocked) return
    const ids = readyAttachments.map(a => a.attachment_id!)
    onSend(msg, ids)
    setValue('')
    setAttachments([])
    setFileError(null)
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleFormSubmit(e: FormEvent) {
    e.preventDefault()
    handleSubmit()
  }

  const handleFile = useCallback(async (file: File, error?: string) => {
    setFileError(null)
    if (error === 'type_error') { setFileError(t('file.typeError')); return }
    if (error === 'size_error') { setFileError(t('file.sizeError')); return }

    const localId = newLocalId()
    const objectUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    const pending: PendingAttachment = {
      id: localId,
      filename: file.name,
      fileType: inferFileType(file),
      state: 'uploading',
      objectUrl,
    }

    setAttachments(prev => [...prev, pending])

    try {
      const result = await agentApi.uploadAttachment(conversationId, file)
      setAttachments(prev =>
        prev.map(a =>
          a.id === localId ? { ...a, state: 'done', attachment_id: result.attachment_id } : a
        )
      )
    } catch {
      setAttachments(prev =>
        prev.map(a => (a.id === localId ? { ...a, state: 'error' } : a))
      )
      setFileError(t('file.extractionFailed'))
    }
  }, [conversationId, t])

  function removeAttachment(localId: string) {
    setAttachments(prev => {
      const att = prev.find(a => a.id === localId)
      if (att?.objectUrl) URL.revokeObjectURL(att.objectUrl)
      return prev.filter(a => a.id !== localId)
    })
  }

  const isInputDisabled = disabled || loading || blocked
  const canSend = (value.trim().length > 0 || attachments.some(a => a.state === 'done')) && !isInputDisabled

  const inputPlaceholder = placeholder ?? (blocked ? t('input.blocked') : t('input.placeholder'))

  return (
    <div className="chat-input-wrapper">
      {warning && (
        <InlineAlert tone="warning" className="chat-input-alert">
          {t('limit.approaching', { count: warning })}
        </InlineAlert>
      )}

      {attachments.length > 0 && (
        <div className="chat-attachment-row">
          {attachments.map(att => (
            <AttachmentPreview
              key={att.id}
              attachment={att}
              onRemove={removeAttachment}
            />
          ))}
        </div>
      )}

      {fileError && (
        <InlineAlert tone="warning" className="chat-input-alert">
          {fileError}
        </InlineAlert>
      )}

      {turnError && (
        <div className="chat-turn-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          <span>{t('errors.agentError')}</span>
          {onRetry && (
            <button type="button" className="chat-retry-btn" onClick={onRetry}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              {t('errors.tryAgain')}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="chat-input-form">
        <div className={`chat-input-box${blocked ? ' is-blocked' : ''}`}>
          <textarea
            ref={textareaRef}
            className="chat-input-textarea"
            placeholder={inputPlaceholder}
            value={value}
            onChange={(e) => { setValue(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
            rows={1}
            aria-label={t('input.placeholder')}
          />

          <div className="chat-input-bottom-row">
            <FileUploadButton
              onFile={handleFile}
              disabled={isInputDisabled}
            />

            {loading
              ? (
                <span className="chat-input-thinking">
                  <IntelligenceMark size={20} processing />
                </span>
              )
              : (
                <button
                  type="submit"
                  className="chat-input-send"
                  disabled={!canSend}
                  aria-label={t('input.send')}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              )}
          </div>
        </div>

        {blocked && onDismissBlock && (
          <div className="chat-input-blocked-hint">
            <span>{t('input.blockedHint', { defaultValue: 'Elige proveedores arriba para seguir' })}</span>
            <TextButton size="sm" onClick={onDismissBlock}>
              {t('input.closeSelection', { defaultValue: 'Cerrar selección' })}
            </TextButton>
          </div>
        )}
      </form>
    </div>
  )
}
