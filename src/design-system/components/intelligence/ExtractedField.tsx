import { useId, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { IntelligenceMark } from '../core/IntelligenceMark'
import { EvidenceReference, type EvidenceReferenceProps } from './EvidenceReference'
import { QiMark, fieldStatus, isMissing, isNumericValue, type FieldState } from './shared'

export type ExtractedFieldProps = {
  label: ReactNode
  context?: ReactNode
  value?: ReactNode
  currency?: string
  unit?: string
  /** auto = cifra si el valor es corto y numérico. */
  kind?: 'auto' | 'numeric' | 'text'
  state?: FieldState
  /** El comprador corrigió el valor (sigue sin confirmar hasta confirmarlo). */
  corrected?: boolean
  /** Valor extraído original cuando hubo corrección. */
  original?: string | number | null
  /** Motivo (no indicado / no comparable). */
  reason?: ReactNode
  note?: ReactNode
  evidence?: Omit<EvidenceReferenceProps, 'active' | 'onClick' | 'controls'>
  onEvidence?: () => void
  evidenceActive?: boolean
  evidenceControls?: string
  selected?: boolean
  onSelect?: () => void
  /** Acciones de revisión (Confirmar, Editar…). */
  actions?: ReactNode
  /** Sustituye la fila por un editor en línea. */
  editor?: ReactNode
  divider?: boolean
  className?: string
  style?: CSSProperties
}

/** Fila de campo extraído: etiqueta (25) · valor y procedencia (47) · estado y acciones (28). */
export function ExtractedField({
  label, context, value, currency, unit, kind = 'auto', state = 'proposed', corrected = false, original, reason, note,
  evidence, onEvidence, evidenceActive = false, evidenceControls, selected = false, onSelect, actions, editor, divider = true, className, style,
}: ExtractedFieldProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLDivElement>(900)
  const mobile = width < 640
  const labelId = useId()
  const missing = isMissing(state, value)
  const noncomparable = state === 'noncomparable'
  const numeric = kind === 'numeric' || (kind === 'auto' && isNumericValue(value))
  const status = fieldStatus(t, { state, corrected, value })

  const provenance = missing || noncomparable
    ? null
    : corrected
      ? <QiMark icon="pencil-simple" tone="primary" size="sm">{t('qi.provenance.corrected')}</QiMark>
      : state === 'confirmed'
        ? <QiMark icon="check" tone="confirmed" size="sm">{t('qi.state.confirmed')}</QiMark>
        : <QiMark mark={<IntelligenceMark size={14} />} tone="ai" size="sm">{t('qi.provenance.proposed')}</QiMark>
  const history = missing
    ? reason ?? null
    : noncomparable
      ? reason
      : corrected
        ? original == null ? t('qi.history.originalMissing') : t('qi.history.original', { value: original })
        : note

  const regionA = (
    <div className="q-qi-field-label">
      <span id={labelId} className="q-qi-label">{label}</span>
      {context && <span className="q-qi-meta">{context}</span>}
      <span aria-hidden="true" className={cx('q-qi-select-line', selected && 'is-on')} />
    </div>
  )
  const valueNode = missing
    ? <span aria-label={t('qi.noValue')} className="q-qi-value-missing">{'—'}</span>
    : noncomparable
      ? <span className="q-qi-value-text is-muted">{t('qi.state.noncomparable')}</span>
      : numeric
        ? (
            <span className="q-qi-figure">
              <span className="q-qi-figure-value">{value}</span>
              {currency && <span className="q-qi-figure-currency">{currency}</span>}
              {unit && <span className="q-qi-figure-unit">{unit}</span>}
            </span>
          )
        : (
            <span className="q-qi-value-text">
              {value}
              {(currency || unit) && <span className="q-qi-value-affix">{` ${[currency, unit].filter(Boolean).join(' ')}`}</span>}
            </span>
          )
  const regionB = (
    <div className="q-qi-field-value">
      {valueNode}
      {missing && <span className="q-qi-small">{t('qi.notInSource')}</span>}
      {(provenance || evidence) && (
        <div className="q-qi-provenance">
          {provenance}
          {evidence && <EvidenceReference {...evidence} active={evidenceActive} onClick={onEvidence} controls={evidenceControls} />}
        </div>
      )}
      {history && <span className={cx('q-qi-meta', !(provenance || evidence) && 'is-spaced')}>{history}</span>}
    </div>
  )
  const statusMark = <QiMark icon={status.icon} tone={status.tone}>{status.label}</QiMark>

  return (
    <div ref={ref} className={cx('q-qi-field', divider && 'has-divider', className)} style={style}>
      <div
        role="group"
        aria-labelledby={labelId}
        aria-current={selected ? 'true' : undefined}
        onClick={editor ? undefined : onSelect}
        className={cx('q-qi-field-row', mobile && 'is-mobile', editor && 'is-editing', selected && 'is-selected', onSelect && !editor && 'is-selectable')}
      >
        {editor
          ? editor
          : mobile
            ? (
                <>
                  {regionA}
                  <div className="q-qi-field-status-cell">{statusMark}</div>
                  <div className="q-qi-span">{regionB}</div>
                  {actions && <div className="q-qi-span q-qi-actions is-start">{actions}</div>}
                </>
              )
            : (
                <>
                  {regionA}
                  {regionB}
                  <div className="q-qi-field-state">
                    {statusMark}
                    {actions && <div className="q-qi-actions">{actions}</div>}
                  </div>
                </>
              )}
      </div>
    </div>
  )
}
