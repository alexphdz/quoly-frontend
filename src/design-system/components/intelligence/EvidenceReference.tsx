import { useId, type CSSProperties, type MouseEvent, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { TextButton } from '../actions/TextButton'
import { Icon } from '../core/Icon'
import { SOURCE_ICON, type EvidenceSource } from './shared'

export type EvidenceReferenceProps = {
  source?: EvidenceSource
  /** Tipo de fuente (p. ej. "Correo del proveedor"). */
  label?: string
  /** Ubicación dentro de la fuente (p. ej. "pág. 2"). */
  location?: string
  /** Texto de la acción (por defecto "Ver evidencia"). */
  text?: string
  active?: boolean
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  /** id del EvidencePanel que controla. */
  controls?: string
  className?: string
  style?: CSSProperties
}

/** Referencia compacta a la evidencia de un campo; sin onClick es solo informativa. */
export function EvidenceReference({ source = 'email', label, location, text, active = false, onClick, controls, className, style }: EvidenceReferenceProps) {
  const { t } = useTranslation('ds')
  const sourceText = (
    <span className="q-evidence-source">
      {label ?? t(`qi.source.${source}`)}
      {location ? ` · ${location}` : ''}
    </span>
  )
  if (!onClick) {
    return (
      <span className={cx('q-evidence-ref', 'is-static', className)} style={style}>
        <Icon name={SOURCE_ICON[source]} size={15} />
        {sourceText}
      </span>
    )
  }
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-controls={controls}
      onClick={(e) => {
        e.stopPropagation()
        onClick(e)
      }}
      className={cx('q-evidence-ref', active && 'is-active', className)}
      style={style}
    >
      <span className="q-evidence-icon"><Icon name={SOURCE_ICON[source]} size={15} /></span>
      <span className="q-evidence-text">{text ?? t('qi.evidence.view')}</span>
      <span aria-hidden="true" className="q-evidence-sep" />
      {sourceText}
    </button>
  )
}

export type EvidenceSegment = string | { id: string, text: string }

export type EvidencePanelProps = {
  id?: string
  source?: EvidenceSource
  sourceType?: string
  from?: string
  received?: string
  subject?: string
  /** Texto real de la fuente; los objetos son pasajes enlazables a campos. */
  segments?: EvidenceSegment[]
  /** id(s) de pasaje activos. */
  active?: string | string[] | null
  /** Etiqueta del campo seleccionado. */
  activeLabel?: string
  /** Solo los pasajes activos (móvil / secuencial). */
  passageOnly?: boolean
  onOpen?: () => void
  openLabel?: string
  /** false = flotante con elevación. */
  embedded?: boolean
  className?: string
  style?: CSSProperties
}

function Segment({ segment, on, panelId }: { segment: EvidenceSegment, on: boolean, panelId: string }): ReactNode {
  if (typeof segment === 'string') return segment
  return <span id={`${panelId}-${segment.id}`} className={cx('q-evidence-passage', on && 'is-on')}>{segment.text}</span>
}

/** Fuente original con el pasaje asociado al campo seleccionado resaltado. */
export function EvidencePanel({
  id, source = 'email', sourceType, from, received, subject, segments = [], active = [], activeLabel, passageOnly = false,
  onOpen, openLabel, embedded = true, className, style,
}: EvidencePanelProps) {
  const { t } = useTranslation('ds')
  const autoId = useId()
  const panelId = id ?? autoId
  const activeIds = Array.isArray(active) ? active : active ? [active] : []
  const hits = segments.filter((s): s is { id: string, text: string } => typeof s !== 'string' && activeIds.includes(s.id))
  const type = sourceType ?? t(`qi.source.${source}`)
  return (
    <div id={panelId} role="region" aria-label={t('qi.evidence.region', { source: type })} className={cx('q-evidence-panel', !embedded && 'is-floating', className)} style={style}>
      <div className="q-evidence-head">
        <span className="q-evidence-type">
          <Icon name={SOURCE_ICON[source]} size={15} />
          {type}
          {received && <span>{`· ${received}`}</span>}
        </span>
        {from && <span className="q-evidence-from">{from}</span>}
        {subject && <span className="q-evidence-meta">{t('qi.evidence.subject', { subject })}</span>}
      </div>
      <div className="q-evidence-body">
        {passageOnly
          ? hits.length
            ? (
                <div className="q-evidence-hits">
                  {hits.map((h) => <p key={h.id}>{'…'}<Segment segment={h} on panelId={panelId} />{'…'}</p>)}
                </div>
              )
            : <p className="q-evidence-empty">{activeLabel ? t('qi.evidence.noPassage') : t('qi.evidence.selectField')}</p>
          : (
              <div className="q-evidence-text-full">
                {segments.map((s, i) => <Segment key={i} segment={s} on={typeof s !== 'string' && activeIds.includes(s.id)} panelId={panelId} />)}
              </div>
            )}
      </div>
      <div className="q-evidence-foot">
        <span aria-live="polite" className="q-evidence-meta q-evidence-status">
          {activeLabel
            ? hits.length
              ? (
                  <>
                    <span aria-hidden="true" className="q-evidence-swatch" />
                    {t('qi.evidence.linked', { field: activeLabel })}
                  </>
                )
              : t('qi.evidence.notLinked', { field: activeLabel })
            : t('qi.evidence.noneSelected')}
        </span>
        {onOpen && <TextButton iconEnd="arrow-square-out" onClick={onOpen}>{openLabel ?? t('qi.evidence.openOriginal')}</TextButton>}
      </div>
    </div>
  )
}
