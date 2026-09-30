import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { getSpecEvidence } from '../api/quotes'
import SpecEvidenceTable from '../components/spec/SpecEvidenceTable'
import { Alert, ErrorState, PageSkeleton } from '../components/ui'

export default function SpecEvidencePage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('specEvidence')
  const [filter, setFilter] = useState<'all' | 'needs_review' | 'missing_from_supplier' | 'deviation' | 'match'>('all')
  const { data, isLoading, error } = useQuery({
    queryKey: ['spec-evidence', id],
    queryFn: () => getSpecEvidence(id!),
    enabled: Boolean(id),
  })

  if (isLoading) return <div className="ds-page"><PageSkeleton /></div>
  if (error || !data) {
    return (
      <div className="ds-page">
        <ErrorState title={t('notFound.title')} message={t('notFound.message')} />
      </div>
    )
  }

  const showVerdicts = data.buyer_has_reference
  const filterKeys = ['needs_review', 'missing_from_supplier', 'deviation', 'match'] as const
  const visibleLines = filter === 'all' ? data.lines : data.lines.filter(line => line.verdict === filter)

  return (
    <div className="ds-page">
      <div className="request-crumb">
        <Link to={`/rfqs/${data.rfq_id}`} className="ds-link">{t('breadcrumb.rfq')}</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/quotes/${data.quote_id}`} className="ds-link">{t('breadcrumb.quote')}</Link>
        <span aria-hidden="true">/</span>
        <span>{t('breadcrumb.spec')}</span>
      </div>

      <h1 className="ds-detail-title">{t('title')}</h1>
      <p className="ds-meta" style={{ marginTop: 8 }}>
        {data.supplier_name} · {t(`states.${data.spec_state}`, { defaultValue: data.spec_state })}
      </p>

      {!showVerdicts && (
        <Alert className="mt-5">
          {t('noReferenceHint')}
        </Alert>
      )}

      {data.spec_document_name && (
        <section className="ds-section">
          <h2>{data.spec_document_name}</h2>
          {data.spec_source_url && (
            <a href={data.spec_source_url} target="_blank" rel="noreferrer" className="ds-link">
              {t('openDocument')}
            </a>
          )}
        </section>
      )}

      {showVerdicts && data.lines.length > 0 && (
        <div className="ds-segmented" role="group" aria-label={t('filters.group')} style={{ marginTop: 16 }}>
          <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
            {t('filters.all')} {data.lines.length}
          </button>
          {filterKeys.map(key => {
            const count = data.lines.filter(line => line.verdict === key).length
            if (count === 0) return null
            return (
              <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
                {t(`verdict.${key}`)} {count}
              </button>
            )
          })}
        </div>
      )}

      <section className="ds-section">
        <SpecEvidenceTable lines={visibleLines} showVerdicts={showVerdicts} />
      </section>

      <div className="ds-toolbar-actions" style={{ marginTop: 20 }}>
        <Link to={`/rfqs/${data.rfq_id}/comparison`} className="ds-btn ds-btn-secondary">
          {t('openComparison')}
        </Link>
      </div>
    </div>
  )
}
