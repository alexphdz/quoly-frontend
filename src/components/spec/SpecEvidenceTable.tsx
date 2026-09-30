import { useTranslation } from 'react-i18next'
import type { SpecEvidenceLine } from '../../types/specEvidence'
const VERDICT_CLASS: Record<string, string> = {
  match: 'ds-pill ds-pill-success',
  deviation: 'ds-pill ds-pill-danger',
  missing_from_supplier: 'ds-pill ds-pill-warn',
  not_comparable: 'ds-pill ds-pill-muted',
  additional_supplier_parameter: 'ds-pill ds-pill-muted',
  needs_review: 'ds-pill ds-pill-warn',
}

export default function SpecEvidenceTable({
  lines,
  showVerdicts,
}: {
  lines: SpecEvidenceLine[]
  showVerdicts: boolean
}) {
  const { t } = useTranslation('specEvidence')

  if (lines.length === 0) {
    return <p className="ds-meta">{t('empty')}</p>
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            <th>{t('table.parameter')}</th>
            {showVerdicts && <th>{t('table.reference')}</th>}
            <th>{t('table.supplier')}</th>
            {showVerdicts && <th>{t('table.verdict')}</th>}
          </tr>
        </thead>
        <tbody>
          {lines.map((line, index) => (
            <tr
              key={`${line.parameter_name}-${index}`}
              style={line.verdict === 'needs_review' ? { background: 'var(--warn-bg)' } : undefined}
            >
              <td>{line.parameter_name}</td>
              {showVerdicts && <td>{line.reference_wording ?? '—'}</td>}
              <td>
                {line.supplier_wording ?? '—'}
                {line.source_url && (
                  <a href={line.source_url} target="_blank" rel="noreferrer" className="ds-link" style={{ marginLeft: 8 }}>
                    {t('openSource')}
                  </a>
                )}
              </td>
              {showVerdicts && line.verdict && (
                <td>
                  <span className={VERDICT_CLASS[line.verdict] ?? 'ds-pill ds-pill-muted'}>
                    {t(`verdict.${line.verdict}`)}
                  </span>
                </td>
              )}
              {showVerdicts && !line.verdict && <td>—</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
