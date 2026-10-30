import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { IconButton } from '../actions/IconButton'
import { EvidencePanel, type EvidencePanelProps } from './EvidenceReference'
import { ExtractionCompleteness } from './ExtractionCompleteness'
import { ExtractionSummary } from './ExtractionSummary'
import { FieldReviewEditor, type FieldReviewEditorProps } from './FieldReviewEditor'
import { isMissing } from './shared'

export type ReviewField = Omit<FieldReviewEditorProps, 'onChange' | 'selected' | 'onSelect' | 'evidenceActive' | 'evidenceControls' | 'onEvidence'> & {
  key: string
  /** id del pasaje de la fuente asociado al campo. */
  passage?: string
}

export type ReviewWorkspaceProps = {
  fields: ReviewField[]
  source?: Omit<EvidencePanelProps, 'id' | 'active' | 'activeLabel' | 'passageOnly' | 'onOpen'>
  supplier?: string
  meta?: ReactNode
  title?: string
  sourceTitle?: string
  /** auto: split ≥1040, stacked ≥600, sequential debajo. */
  layout?: 'auto' | 'split' | 'stacked' | 'sequential'
  initialSelected?: string
  onChange?: (fields: ReviewField[]) => void
  onOpenSource?: () => void
  className?: string
  style?: CSSProperties
}

/** Espacio de revisión: datos interpretados + fuente original con el pasaje del campo seleccionado. */
export function ReviewWorkspace({
  fields: initialFields, source = {}, supplier, meta, title, sourceTitle, layout = 'auto', initialSelected, onChange, onOpenSource, className, style,
}: ReviewWorkspaceProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLDivElement>(1100)
  const mode = layout !== 'auto' ? layout : width >= 1040 ? 'split' : width >= 600 ? 'stacked' : 'sequential'
  const [fields, setFields] = useState(initialFields)
  const [selected, setSelected] = useState(initialSelected ?? initialFields[0]?.key)
  const panelId = useId()

  const update = (key: string, patch: Partial<ReviewField>) => {
    setFields((list) => {
      const next = list.map((f) => (f.key === key ? { ...f, ...patch } : f))
      onChange?.(next)
      return next
    })
  }

  const counts = { total: fields.length, missing: 0, confirmed: 0, pending: 0, noncomparable: 0 }
  fields.forEach((f) => {
    const s = isMissing(f.state ?? 'proposed', f.value) ? 'missing' : f.state ?? 'proposed'
    counts[s === 'proposed' ? 'pending' : s]++
  })
  const available = counts.total - counts.missing
  const missingLabels = fields.filter((f) => isMissing(f.state ?? 'proposed', f.value)).map((f) => f.label)
  const status = counts.pending > 0 ? (counts.missing ? 'partial' : 'ready') : 'reviewed'
  const current = fields.find((f) => f.key === selected)
  const index = Math.max(0, fields.findIndex((f) => f.key === selected))
  const heading = title ?? t('qi.workspace.title')
  const sourceHeading = sourceTitle ?? t('qi.workspace.source')

  const row = (f: ReviewField, last: boolean) => {
    const { key, passage: _passage, ...props } = f
    return (
      <FieldReviewEditor
        key={key}
        {...props}
        divider={!last}
        selected={selected === key}
        onSelect={() => setSelected(key)}
        evidenceActive={selected === key}
        evidenceControls={panelId}
        onEvidence={f.evidence ? () => setSelected(key) : undefined}
        onChange={(next) => update(key, next)}
      />
    )
  }
  const panel = (passageOnly: boolean) => (
    <EvidencePanel id={panelId} {...source} passageOnly={passageOnly} active={current?.passage} activeLabel={current?.label} onOpen={onOpenSource} />
  )
  const head = (
    <div className="q-qi-ws-head">
      <h3 className="q-qi-ws-title">{heading}</h3>
      {meta && <span className="q-qi-small">{meta}</span>}
    </div>
  )
  const summary = (
    <ExtractionSummary
      status={status}
      title={counts.pending ? t('qi.workspace.claimPending') : t('qi.workspace.claimReviewed')}
      summary={counts.pending ? t('qi.workspace.summaryPending', { count: counts.pending }) : t('qi.workspace.summaryReviewed')}
      meta={supplier ? t('qi.workspace.emailFrom', { supplier }) : undefined}
      available={available}
      total={counts.total}
      reviewCount={counts.pending}
      missing={missingLabels}
    />
  )
  const completeness = (
    <ExtractionCompleteness total={counts.total} confirmed={counts.confirmed} pending={counts.pending} missing={counts.missing} noncomparable={counts.noncomparable} />
  )

  if (mode === 'sequential') {
    return (
      <div ref={ref} className={cx('q-qi-ws', 'is-sequential', className)} style={style}>
        {head}
        <div className="q-qi-ws-summary">{summary}</div>
        <div className="q-qi-ws-completeness">{completeness}</div>
        <div className="q-qi-ws-pager">
          <span aria-live="polite">{t('qi.workspace.fieldOf', { current: index + 1, total: fields.length })}</span>
          <div>
            <IconButton icon="caret-left" label={t('qi.workspace.previous')} size="lg" disabled={index === 0} onClick={() => setSelected(fields[index - 1].key)} />
            <IconButton icon="caret-right" label={t('qi.workspace.next')} size="lg" disabled={index >= fields.length - 1} onClick={() => setSelected(fields[index + 1].key)} />
          </div>
        </div>
        {current && row(current, true)}
        <div className="q-qi-ws-source is-sequential">
          <h3 className="q-qi-ws-source-title">{sourceHeading}</h3>
          {panel(true)}
        </div>
      </div>
    )
  }

  return (
    <div ref={ref} className={cx('q-qi-ws', `is-${mode}`, className)} style={style}>
      <section aria-label={heading} className="q-qi-ws-data">
        {head}
        <div className="q-qi-ws-summary">{summary}</div>
        <div className="q-qi-ws-completeness">{completeness}</div>
        <div role="list" aria-label={t('qi.workspace.fields')} className="q-qi-ws-list">
          {fields.map((f, i) => <div role="listitem" key={f.key}>{row(f, i === fields.length - 1)}</div>)}
        </div>
      </section>
      <section aria-label={sourceHeading} className="q-qi-ws-source">
        <h3 className="q-qi-ws-source-title">{sourceHeading}</h3>
        {panel(false)}
      </section>
    </div>
  )
}
