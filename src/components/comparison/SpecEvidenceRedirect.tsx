import { Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQuote } from '../../hooks/useQuotes'
import { ErrorState, PageSkeleton } from '../ui'

/** Existing bookmarks open the same final drawer; there is no second spec page. */
export default function SpecEvidenceRedirect() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('quote')
  const { data: quote, isLoading, error } = useQuote(id ?? '')
  if (isLoading) return <div className="ds-page"><PageSkeleton /></div>
  if (error || !quote) return <div className="ds-page"><ErrorState title={t('notFound.title')} message={t('notFound.message')} /></div>
  return <Navigate to={`/rfqs/${quote.rfq_id}/comparison?spec=${encodeURIComponent(quote.id)}`} replace />
}
