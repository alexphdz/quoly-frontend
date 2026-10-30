import { useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormat } from '../../../lib/format'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { Button } from '../actions/Button'
import { IconButton } from '../actions/IconButton'
import { Icon, type IconName } from '../core/Icon'
import { ValidationMessage } from '../feedback/ValidationMessage'
import { Progress } from '../indicators/Progress'

const ICON_BY_EXT: Record<string, IconName> = {
  pdf: 'file-pdf', xls: 'file-xls', xlsx: 'file-xls', csv: 'file-xls', doc: 'file-doc', docx: 'file-doc',
  png: 'file-image', jpg: 'file-image', jpeg: 'file-image', webp: 'file-image',
}

/** Icono Phosphor por extensión del archivo. */
export function fileIcon(name = ''): IconName {
  return ICON_BY_EXT[(name.split('.').pop() ?? '').toLowerCase()] ?? 'file-text'
}

/** Tamaño legible (B · KB · MB) en el locale de la app. */
export function useFileSize() {
  const { locale } = useFormat()
  return (b?: number | null) => {
    if (b == null) return null
    if (b < 1024) return `${b} B`
    if (b < 1048576) return `${(b / 1024).toLocaleString(locale, { maximumFractionDigits: 0 })} KB`
    return `${(b / 1048576).toLocaleString(locale, { maximumFractionDigits: 1 })} MB`
  }
}

export type DocumentDropzoneProps = {
  /** Tipos aceptados: vienen de la app, no se inventan. */
  accept?: string
  multiple?: boolean
  onSelect?: (file: File | File[]) => void
  onRemove?: () => void
  file?: { name: string, size?: number } | null
  /** `{ progress }` solo cuando el uploader real expone progreso; `{}` = en curso sin porcentaje. */
  upload?: { progress?: number } | null
  /** Motivo real del error. */
  error?: ReactNode
  disabled?: boolean
  title?: string
  description?: string
  buttonLabel?: string
  label?: string
  /** Documentación: fuerza un estado visual. */
  state?: 'hover' | 'dragover'
  id?: string
  className?: string
  style?: CSSProperties
}

/** Adjunta un documento de especificaciones opcional. Solo selección de archivo: no analiza, no compara, no envía. */
export function DocumentDropzone({
  accept, multiple = false, onSelect, onRemove, file, upload, error, disabled = false, title, description, buttonLabel, label, state,
  id = 'dropzone', className, style,
}: DocumentDropzoneProps) {
  const { t } = useTranslation('ds')
  const size = useFileSize()
  const [ref, w] = useElementWidth<HTMLDivElement>(780)
  const input = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)
  const depth = useRef(0)
  const dg = (drag || state === 'dragover') && !disabled
  const errId = `${id}-error`
  const lbl = label ?? t('form.drop.label')
  const pick = (list: FileList | null) => {
    const fs = Array.from(list ?? [])
    if (fs.length && onSelect) onSelect(multiple ? fs : fs[0])
  }

  if (file) {
    const sz = size(file.size)
    return (
      <div ref={ref} className={cx('q-drop', className)} style={style}>
        <div role="group" aria-label={lbl} className="q-drop-file">
          <span className="q-drop-file-icon"><Icon name={fileIcon(file.name)} size={24} /></span>
          <span className={cx('q-drop-file-body', upload && 'is-uploading')}>
            <span className="q-drop-file-name" title={file.name}>{file.name}</span>
            {upload
              ? (upload.progress != null
                ? <Progress variant="linear" value={upload.progress} label={t('form.drop.uploading')} valueText={`${Math.round(upload.progress)}%`} />
                : <Progress variant="indeterminate" label={t('form.drop.uploadingFile')} />)
              : sz && <span className="q-drop-file-size">{sz}</span>}
          </span>
          {onRemove && <IconButton icon="trash" label={t('form.drop.remove', { name: file.name })} variant="tertiary" size="sm" onClick={onRemove} disabled={disabled} />}
        </div>
        <span aria-live="polite" className="q-sr-only">
          {upload ? t('form.drop.uploadingName', { name: file.name }) : t('form.drop.selected', { name: file.name })}
        </span>
      </div>
    )
  }

  return (
    <div ref={ref} className={cx('q-drop', className)} style={style}>
      <div
        className={cx('q-drop-zone', w < 520 && 'is-narrow', dg && 'is-drag', error && 'is-error', disabled && 'is-disabled', state === 'hover' && 'is-hover')}
        onDragEnter={(e) => { e.preventDefault(); if (disabled) return; depth.current++; setDrag(true) }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) e.dataTransfer.dropEffect = 'copy' }}
        onDragLeave={() => { depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDrag(false) }}
        onDrop={(e) => { e.preventDefault(); depth.current = 0; setDrag(false); if (!disabled) pick(e.dataTransfer.files) }}
      >
        <span className="q-drop-icon"><Icon name="file-arrow-up" size={24} /></span>
        <span className="q-drop-text">
          <span className="q-drop-title">{dg ? t('form.drop.release') : (title ?? t('form.drop.title'))}</span>
          <span className="q-drop-desc">{description ?? t('form.drop.description')}</span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          icon="upload-simple"
          disabled={disabled}
          onClick={() => input.current?.click()}
          aria-describedby={error ? errId : undefined}
        >
          {buttonLabel ?? t('form.drop.button')}
        </Button>
        <input
          ref={input}
          id={`${id}-input`}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          aria-label={lbl}
          tabIndex={-1}
          className="q-sr-only"
          onChange={(e) => { pick(e.target.files); e.target.value = '' }}
        />
      </div>
      {error && <ValidationMessage id={errId} tone="error">{error}</ValidationMessage>}
    </div>
  )
}
