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
            {line.supplier_evidence?.map((citation, citationIndex) => {
              const locator = citation.locator ?? {}
              const location = citation.original_filename
                ? [citation.original_filename,
                    locator.page ? t('sourcePage', { page: locator.page }) : null,
                    locator.sheet ? t('sourceSheetRow', { sheet: locator.sheet, row: locator.row }) : null]
                    .filter(Boolean).join(' · ')
                : t(`sourceSection.${citation.segment_type ?? 'unknown'}`)
              return (
                <span key={`${citation.segment_id}-${citationIndex}`} className="spec-parameter-reference">
                  <q>{citation.exact_text}</q>{' · '}{location}
                </span>
              )
            })}
            {showVerdicts && line.reference_wording && (
              <span className="spec-parameter-reference">{t('table.reference')}{': '}{line.reference_wording}</span>
            )}
            {showVerdicts && line.verdict && (
              <>
                <span className={VERDICT_CLASS[line.verdict] ?? 'ds-pill ds-pill-muted'}>
                  {t(`verdict.${line.verdict}`)}
                </span>
                {line.verdict_reason && (
                  <span className="spec-parameter-reference">{t(`reason.${line.verdict_reason}`)}</span>
                )}
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  )
}
