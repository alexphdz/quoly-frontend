import { useEffect, useRef, useState, type KeyboardEvent, type SyntheticEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../actions/Button'
import { TextButton } from '../actions/TextButton'
import { TextInput } from '../inputs/TextInput'
import { EvidenceReference } from './EvidenceReference'
import { ExtractedField, type ExtractedFieldProps } from './ExtractedField'
import { QiMark, fieldStatus, isMissing, type FieldState } from './shared'

export type FieldReviewChange = {
  value: string | number | null | undefined
  state: FieldState
  corrected: boolean
  original: string | number | null | undefined
}

export type FieldReviewEditorProps = Omit<ExtractedFieldProps, 'value' | 'actions' | 'editor' | 'label'> & {
  label: string
  value?: string | number | null
  /** Devuelve un mensaje de error o null. */
  validate?: (value: string) => string | null | undefined
  onChange?: (next: FieldReviewChange) => void
  confirmLabel?: string
  startEditing?: boolean
  draftValue?: string
  initialError?: string
}

/**
 * Revisión humana de un campo: Confirmar (aparte) y Editar en línea.
 * Guardar una corrección no confirma; la confirmación es una acción separada.
 */
export function FieldReviewEditor({
  label, value: initialValue, state: initialState = 'proposed', corrected: initialCorrected = false, original: initialOriginal,
  currency, unit, evidence, onEvidence, evidenceActive, evidenceControls, selected, onSelect, validate, onChange,
  confirmLabel, startEditing = false, draftValue, initialError, ...field
}: FieldReviewEditorProps) {
  const { t } = useTranslation('ds')
  const [value, setValue] = useState(initialValue)
  const [state, setState] = useState<FieldState>(initialState)
  const [corrected, setCorrected] = useState(initialCorrected)
  const [original, setOriginal] = useState(initialOriginal)
  const [editing, setEditing] = useState(startEditing)
  const [draft, setDraft] = useState(draftValue ?? (initialValue == null ? '' : String(initialValue)))
  const [error, setError] = useState<string | null>(initialError ?? null)
  const box = useRef<HTMLDivElement>(null)
  const returnFocus = useRef(false)

  useEffect(() => {
    setValue(initialValue)
    setState(initialState)
    setCorrected(initialCorrected)
    setOriginal(initialOriginal)
  }, [initialValue, initialState, initialCorrected, initialOriginal])

  useEffect(() => {
    if (editing && !startEditing) box.current?.querySelector('input')?.focus()
    if (!editing && returnFocus.current) {
      returnFocus.current = false
      box.current?.querySelector<HTMLButtonElement>('[data-qi-edit] button')?.focus()
    }
  }, [editing, startEditing])

  const missing = isMissing(state, value)
  const stop = (fn: () => void) => (e?: SyntheticEvent) => {
    e?.stopPropagation()
    fn()
  }
  const begin = () => {
    setDraft(value == null ? '' : String(value))
    setError(null)
    setEditing(true)
    onSelect?.()
  }
  const cancel = () => {
    returnFocus.current = true
    setError(null)
    setEditing(false)
  }
  const save = () => {
    const text = draft.trim()
    const problem = !text ? t('qi.editor.required') : validate?.(text)
    if (problem) {
      setError(problem)
      return
    }
    returnFocus.current = true
    if (text === String(value ?? '')) {
      setEditing(false)
      return
    }
    const next: FieldReviewChange = { value: text, state: 'proposed', corrected: true, original: corrected ? original : missing ? null : value }
    setValue(text)
    setState('proposed')
    setCorrected(true)
    setOriginal(next.original)
    setError(null)
    setEditing(false)
    onChange?.(next)
  }
  const confirm = () => {
    setState('confirmed')
    onChange?.({ value, state: 'confirmed', corrected, original })
  }

  const status = fieldStatus(t, { state: missing ? 'missing' : state, corrected, value })
  const prior = missing
    ? t('qi.notInSource')
    : corrected
      ? original == null ? t('qi.history.originalMissing') : t('qi.history.originalExtracted', { value: original })
      : t('qi.history.extracted', { value: [value, currency, unit].filter((x) => x != null && x !== '').join(' ') })

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      cancel()
    }
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault()
      save()
    }
  }

  const editor = editing && (
    <div className="q-qi-editor" onKeyDown={onKeyDown}>
      <div className="q-qi-editor-head">
        <div className="q-qi-editor-label">
          <span className="q-qi-label">{label}</span>
          <span aria-hidden="true" className="q-qi-select-line is-on" />
        </div>
        <QiMark icon={status.icon} tone={status.tone}>{t('qi.editor.editing', { state: status.label.toLowerCase() })}</QiMark>
      </div>
      <div className="q-qi-editor-input">
        <TextInput
          aria-label={t('qi.editor.correct', { field: label })}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value)
            if (error) setError(null)
          }}
          suffix={[currency, unit].filter(Boolean).join(' ') || undefined}
          message={error}
          status={error ? 'error' : undefined}
        />
      </div>
      <div className="q-qi-editor-context">
        <span className="q-qi-meta">{prior}</span>
        {evidence && <EvidenceReference {...evidence} active={evidenceActive} onClick={onEvidence} controls={evidenceControls} />}
      </div>
      <span className="q-qi-meta">{t('qi.editor.note')}</span>
      <div className="q-qi-editor-actions">
        <Button variant="secondary" size="sm" onClick={cancel}>{t('confirm.cancel')}</Button>
        <Button size="sm" onClick={save}>{t('qi.editor.save')}</Button>
      </div>
    </div>
  )

  const actions = !editing && state !== 'noncomparable' && (
    missing
      ? <span data-qi-edit=""><Button variant="secondary" size="sm" icon="plus" onClick={stop(begin)}>{t('qi.editor.add')}</Button></span>
      : state === 'confirmed'
        ? <span data-qi-edit=""><TextButton icon="pencil-simple" onClick={stop(begin)}>{t('qi.editor.edit')}</TextButton></span>
        : (
            <>
              <Button variant="secondary" size="sm" icon="check" onClick={stop(confirm)}>{confirmLabel ?? t('qi.editor.confirm')}</Button>
              <span data-qi-edit="" className="q-qi-edit-link"><TextButton icon="pencil-simple" onClick={stop(begin)}>{t('qi.editor.edit')}</TextButton></span>
            </>
          )
  )

  return (
    <div ref={box}>
      <ExtractedField
        {...field}
        label={label}
        value={value}
        currency={currency}
        unit={unit}
        state={missing ? 'missing' : state}
        corrected={corrected}
        original={original}
        evidence={evidence}
        onEvidence={onEvidence}
        evidenceActive={evidenceActive}
        evidenceControls={evidenceControls}
        selected={selected || editing}
        onSelect={onSelect}
        editor={editor || undefined}
        actions={actions || undefined}
      />
    </div>
  )
}
