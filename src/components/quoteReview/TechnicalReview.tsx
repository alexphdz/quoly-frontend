import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { getSpecEvidence } from '../../api/quotes'
import { Skeleton, StatusBadge, TextButton, type IconName, type StatusTone } from '../../design-system'
import type { SpecVerdict } from '../../types/specEvidence'

const VERDICT: Record<SpecVerdict, { tone: StatusTone, icon: IconName }> = {
  match: { tone: 'success', icon: 'check-circle' },
  deviation: { tone: 'warning', icon: 'warning' },
  missing_from_supplier: { tone: 'neutral', icon: 'minus-circle' },
  not_comparable: { tone: 'neutral', icon: 'prohibit' },
  additional_supplier_parameter: { tone: 'info', icon: 'info' },
  needs_review: { tone: 'ai', icon: 'quoly-proposed' },
}

/** Revisión técnica contra los requisitos escritos de la solicitud. Sin puntajes ni porcentajes. */
export default function TechnicalReview({ quoteId, onSource }: { quoteId: string, onSource: (snippet: string) => void }) {
  const { t } = useTranslation('quote')
  const { t: ts } = useTranslation('specEvidence')
  const { data: raw, isLoading, error } = useQuery({ queryKey: ['spec-evidence', quoteId], queryFn: () => getSpecEvidence(quoteId), retry: false })
  // Solo se usa una respuesta con forma válida; cualquier otra cuenta como no disponible.
  const data = raw && Array.isArray(raw.lines) ? raw : null

  return (
    <section className="qr2-group" aria-labelledby={`qr2-tech-${quoteId}`}>
      <h4 id={`qr2-tech-${quoteId}`} className="qr2-group-title">{t('v2.tech.title')}</h4>
      <p className="qr2-muted">{t('v2.tech.lead')}</p>
      {isLoading && <Skeleton shape="text" lines={4} />}
      {!isLoading && (error || !data) && <p className="qr2-muted qr2-tech-note">{t('v2.tech.unavailable')}</p>}
      {data && data.lines.length === 0 && <p className="qr2-muted qr2-tech-note">{t('v2.tech.empty')}</p>}
      {data && data.lines.length > 0 && (
        <table className="qr2-table qr2-tech">
          <thead>
            <tr>
              <th scope="col">{ts('table.parameter')}</th>
              <th scope="col">{t('v2.tech.requested')}</th>
              <th scope="col">{t('v2.tech.offered')}</th>
              {data.buyer_has_reference && <th scope="col">{t('v2.tech.verdict')}</th>}
            </tr>
          </thead>
          <tbody>
            {data.lines.map((line, index) => {
              const v = line.verdict ? VERDICT[line.verdict] : null
              const evidence = line.supplier_evidence?.[0]
              return (
                <tr key={`${line.parameter_name}-${index}`}>
                  <th scope="row"><span className="qr2-value">{line.parameter_name}</span></th>
                  <td>{line.reference_wording ?? <span className="qr2-muted">{t('v2.tech.notInRequest')}</span>}</td>
                  <td>{line.supplier_wording ? `«${line.supplier_wording}»` : <span className="qr2-missing">{ts('notStated')}</span>}</td>
                  {data.buyer_has_reference && (
                    <td>
                      <span className="qr2-tech-verdict">
                        {v && line.verdict && <StatusBadge tone={v.tone} variant="quiet" icon={v.icon}>{ts(`verdict.${line.verdict}`)}</StatusBadge>}
                        {line.verdict_reason && <span className="qr2-muted">{ts(`reason.${line.verdict_reason}`)}</span>}
                        {evidence?.exact_text && (
                          <TextButton size="sm" icon="file-text" onClick={() => onSource(evidence.exact_text)}>
                            {evidence.original_filename ? `${t('v2.viewSource')} · ${evidence.original_filename}` : t('v2.viewSource')}
                          </TextButton>
                        )}
                      </span>
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </section>
  )
}
