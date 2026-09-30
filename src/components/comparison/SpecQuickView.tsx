import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { ComparisonRow } from '../../types/comparison'
import SpecEvidenceTable from '../spec/SpecEvidenceTable'

interface Props {
  row: ComparisonRow
  onClose: () => void
}

export default function SpecQuickView({ row, onClose }: Props) {
  const { t } = useTranslation('comparison')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const evidenceLines = row.spec_evidence_lines ?? []
  const params = row.extracted_parameters ?? []
  const showVerdicts = Boolean(row.buyer_has_reference && evidenceLines.length > 0)

  return (
    <div className="ds-drawer-root">
      <button type="button" className="ds-drawer-catcher" aria-label={t('specQuickView.close')} onClick={onClose} />
      <aside className="ds-drawer" role="dialog" aria-labelledby="spec-quick-view-title">
        <div className="ds-drawer-head">
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <p className="ds-drawer-kicker">{t('specQuickView.eyebrow')}</p>
              <h2 id="spec-quick-view-title" className="ds-drawer-title">{row.supplier_name}</h2>
            </div>
            <button type="button" className="ds-btn ds-btn-secondary" onClick={onClose}>
              {t('specQuickView.close')}
            </button>
          </div>
        </div>
        <div className="ds-drawer-body">
          <p className="ds-meta">{t('specQuickView.statusLabel')}</p>
          <p>{t(`specQuickView.states.${row.spec_state ?? 'not_received'}`)}</p>

          {row.spec_document_name && (
            <div style={{ marginTop: 16 }}>
              <p>{row.spec_document_name}</p>
              {row.spec_source_url && (
                <a href={row.spec_source_url} target="_blank" rel="noreferrer" className="ds-link">
                  {t('specQuickView.openDocument')}
                </a>
              )}
            </div>
          )}

          {evidenceLines.length > 0 ? (
            <div style={{ marginTop: 16 }}>
              <SpecEvidenceTable lines={evidenceLines} showVerdicts={showVerdicts} />
            </div>
          ) : params.length > 0 ? (
            <dl style={{ marginTop: 16 }}>
              {params.map(entry => (
                <div key={`${entry.name}-${entry.value}`} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                  <dt className="ds-meta">{entry.name}</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            !row.spec_document_name && <p className="ds-meta" style={{ marginTop: 16 }}>{t('specQuickView.empty')}</p>
          )}
        </div>
        <div className="ds-drawer-foot" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <Link to={`/quotes/${row.quote_id}`} className="ds-btn ds-btn-secondary">{t('specQuickView.openQuote')}</Link>
          <Link to={`/quotes/${row.quote_id}/spec-evidence`} className="ds-btn ds-btn-primary">{t('specQuickView.openFullSpec')}</Link>
        </div>
      </aside>
    </div>
  )
}
