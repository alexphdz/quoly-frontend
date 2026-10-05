import { useTranslation } from 'react-i18next'
import { AiMark, Btn, Icon } from '../ds'

export interface ExtractionPassData {
  message_labels?: string[]
  spec_parameters?: Array<{
    name: string
    value: string
    source?: string | null
    evidence?: Array<{ segment_id: string; exact_text?: string | null }>
  }>
  facts?: Array<{
    field_name: string
    raw_value?: unknown
    unit?: string | null
    review_state?: string
    evidence?: Array<{ segment_id: string; exact_text?: string | null }>
  }>
  source_map?: Array<{
    segment_id: string
    source_kind: string
    original_filename?: string | null
    segment_type: string
    locator?: Record<string, unknown>
    read_status: string
  }>
  retrieval_metadata?: { status?: string; matched_segments?: number; query_terms?: string[]; predecessor_ambiguous?: boolean }
  retrieved_context?: Array<{
    id: string
    source_kind: string
    locator?: Record<string, unknown>
    text: string
  }>
  buyer_actions?: Array<{ question: string; context?: string | null }>
  summary?: string | null
  processing?: {
    status: 'pending' | 'complete' | 'partial' | 'failed' | 'unknown'
    failure_reason?: string | null
    readable_inputs?: string[]
    unreadable_inputs?: string[]
  }
}

export default function ExtractionPassSummary({
  data,
  onRetry,
  retrying = false,
  onEvidenceSelect,
}: {
  data: ExtractionPassData
  onRetry?: () => void
  retrying?: boolean
  onEvidenceSelect?: (text: string) => void
}) {
  const { t } = useTranslation('extraction')

  const labels = data.message_labels ?? []
  const specs = data.spec_parameters ?? []
  const asks = data.buyer_actions ?? []

  const processing = data.processing
  const sourceBySegment = new Map((data.source_map ?? []).map(source => [source.segment_id, source]))
  const hasRetrievalResult = Boolean(data.retrieval_metadata?.status && data.retrieval_metadata.status !== 'disabled')
  const retrievedSources = (data.source_map ?? []).filter(source => source.segment_type === 'retrieved_context')
  const retrievedClauses = data.retrieved_context ?? []

  const evidence = (references?: Array<{ segment_id: string; exact_text?: string | null }>) => {
    if (!references?.length) return null
    return references.map((reference, index) => {
      if (!reference.exact_text) return null
      const source = sourceBySegment.get(reference.segment_id)
      const locator = source?.locator ?? {}
      const location = source?.original_filename
        ? [source.original_filename, locator.page ? t('evidence.page', { page: locator.page }) : null,
            locator.sheet ? t('evidence.sheetRow', { sheet: locator.sheet, row: locator.row }) : null]
            .filter(Boolean).join(' · ')
        : t(`evidence.section.${source?.segment_type ?? 'unknown'}`)
      return (
        <span key={`${reference.segment_id}-${index}`} className="ai-panel-evidence">
          {onEvidenceSelect
            ? <button type="button" className="qr-snippet" onClick={() => onEvidenceSelect(reference.exact_text!)}>“{reference.exact_text}”</button>
            : <q>{reference.exact_text}</q>}
          <span className="ds-meta">{location}</span>
        </span>
      )
    })
  }

  if (!data.summary && labels.length === 0 && specs.length === 0 && asks.length === 0
    && (data.facts?.length ?? 0) === 0 && !processing && !hasRetrievalResult) {
    return null
  }

  return (
    <section className="ai-panel" aria-label={t('panelTitle')}>
      <header className="ai-panel-head">
        <AiMark kind="read" />
        {labels.length > 0 && (
          <div className="ai-panel-labels">
            {labels.map((label) => (
              <span key={label} className="ds-pill ds-pill-muted">
                {t(`labels.${label}`, { defaultValue: label.replace(/_/g, ' ') })}
              </span>
            ))}
          </div>
        )}
      </header>

      {processing?.status === 'failed' && (
        <div className="ai-panel-block">
          <p className="ai-panel-label ai-panel-label-warn">
            <Icon name="warning" size={13} />
            {t('processing.failed')}
          </p>
          <p>{t(`failure.${processing.failure_reason ?? 'unknown_error'}`)}</p>
          {onRetry && <Btn size="sm" variant="secondary" loading={retrying} onClick={onRetry}>{t('processing.retry')}</Btn>}
        </div>
      )}

      {processing?.status === 'partial' && (
        <div className="ai-panel-block">
          <p className="ai-panel-label ai-panel-label-warn">
            <Icon name="warning" size={13} />
            {t('processing.partial')}
          </p>
          <p>{t('processing.partialHelp', { count: processing.unreadable_inputs?.length ?? 0 })}</p>
        </div>
      )}

      {data.retrieval_metadata?.status && data.retrieval_metadata.status !== 'disabled' && (
        <div className="ai-panel-block" aria-label={t('retrieval.title')}>
          <p className="ai-panel-label">{t('retrieval.title')}</p>
          {data.retrieval_metadata.predecessor_ambiguous && <p>{t('retrieval.ambiguousPredecessor')}</p>}
          {retrievedClauses.length > 0 ? (
            <>
              <p>{t('retrieval.contextNote')}</p>
              <ul>
                {retrievedClauses.map(clause => {
                  const source = sourceBySegment.get(clause.id)
                  const locator = source?.locator ?? clause.locator ?? {}
                  const location = source?.original_filename
                    ? [source.original_filename, locator.page ? t('evidence.page', { page: locator.page }) : null]
                      .filter(Boolean).join(' · ')
                    : t(`retrieval.sourceKind.${clause.source_kind}`, { defaultValue: clause.source_kind })
                  return <li key={clause.id}><span className="ds-meta">{location}</span><br /><q>{clause.text}</q></li>
                })}
              </ul>
            </>
          ) : retrievedSources.length > 0 ? <p>{t('retrieval.contextNote')}</p>
            : data.retrieval_metadata.predecessor_ambiguous
              || (data.retrieval_metadata.matched_segments ?? 0) > 0
              || !(data.retrieval_metadata.query_terms?.length)
              ? <p>{t('retrieval.notEvaluated')}</p>
              : <p>{t('retrieval.noMatches')}</p>}
        </div>
      )}

      {data.summary && <p className="ai-panel-summary">{data.summary}</p>}

      {specs.length > 0 && (
        <div className="ai-panel-block">
          <p className="ai-panel-label">{t('specParameters')}</p>
          <dl className="ds-facts">
            {specs.map((entry) => (
              <div key={`${entry.name}-${entry.value}`}>
                <dt>{entry.name}</dt>
                <dd>
                  {entry.value}
                  {entry.evidence && <div>{evidence(entry.evidence)}</div>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {(data.facts?.length ?? 0) > 0 && (
        <div className="ai-panel-block">
          <p className="ai-panel-label">{t('evidence.facts')}</p>
          <dl className="ds-facts">
            {data.facts?.map((fact, index) => (
              <div key={`${fact.field_name}-${index}`}>
                <dt>{fact.field_name.replace(/_/g, ' ')}</dt>
                <dd>
                  {typeof fact.raw_value === 'string' || typeof fact.raw_value === 'number'
                    ? String(fact.raw_value)
                    : JSON.stringify(fact.raw_value ?? '—')}{fact.unit ? ` ${fact.unit}` : ''}
                  {fact.review_state && fact.review_state !== 'supported' && (
                    <span className="ds-meta">{t(`evidence.review.${fact.review_state}`, { defaultValue: fact.review_state })}</span>
                  )}
                  {fact.evidence && <div>{evidence(fact.evidence)}</div>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {asks.length > 0 && (
        <div className="ai-panel-block">
          <p className="ai-panel-label ai-panel-label-warn">
            <Icon name="warning" size={13} />
            {t('buyerAsks')}
          </p>
          <ul className="ai-panel-asks">
            {asks.map((item) => (
              <li key={item.question}>
                <span className="ai-panel-ask-q">{item.question}</span>
                {item.context && <span className="ai-panel-ask-ctx">{item.context}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
