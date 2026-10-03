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

/** Parameter evidence stays in the final drawer, without repeated source links. */
export default function SpecEvidenceSummary({ lines, showVerdicts }: {
  lines: SpecEvidenceLine[]
  showVerdicts: boolean
}) {
  const { t } = useTranslation('specEvidence')
  return (
    <dl className="spec-parameters">
      {lines.map((line, index) => (
        <div key={`${line.parameter_name}-${index}`} className="spec-parameter">
          <dt>{line.parameter_name}</dt>
          <dd>
            <span>{line.supplier_wording ?? t('notStated')}</span>
            {showVerdicts && line.reference_wording && (
              <span className="spec-parameter-reference">{t('table.reference')}{': '}{line.reference_wording}</span>
            )}
            {showVerdicts && line.verdict && (
              <span className={VERDICT_CLASS[line.verdict] ?? 'ds-pill ds-pill-muted'}>
                {t(`verdict.${line.verdict}`)}
              </span>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
