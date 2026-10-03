import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  useQuote,
  useUpdateQuote,
  useConfirmQuote,
  useRejectQuote,
  useRestoreQuote,
  useDeleteQuote,
} from '../hooks/useQuotes'
import ExtractionPassSummary from '../components/extraction/ExtractionPassSummary'
import OriginalDocument from '../components/documents/OriginalDocument'
import QuoteReview from '../components/quoteReview/QuoteReview'
import QuoteFields from '../components/quotes/QuoteFields'
import QuoteEditForm from '../components/quotes/QuoteEditForm'
import CorrugatedQuoteEditForm from '../components/quotes/CorrugatedQuoteEditForm'
import { isQuoteLineItemsV2 } from '../types/quoteIntake'
import { useRFQ } from '../hooks/useRFQs'
import type { QuoteUpdate } from '../types/quote'
import type { ApiError } from '../api/client'
import { useTranslation } from 'react-i18next'
import { useEnumLabels } from '../i18n/labels'
import { useFormat } from '../lib/format'
import { useUnitLabel } from '../lib/units'
import { Alert, Dialog, ErrorState, FormFeedback, MissingFields, PageSkeleton, toast } from '../components/ui'

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation('quote')
  const labels = useEnumLabels()
  const fmt = useFormat()
  const units = useUnitLabel()
  const { data: quote, isLoading, error } = useQuote(id!)
  const { data: rfq, isLoading: rfqLoading } = useRFQ(quote?.rfq_id ?? '')
  const updateQuote = useUpdateQuote(id!)
  const confirmQuote = useConfirmQuote(id!, quote?.rfq_id ?? '')
  const rejectQuote = useRejectQuote(id!, quote?.rfq_id ?? '')
  const restoreQuote = useRestoreQuote(id!, quote?.rfq_id ?? '')
  const deleteQuote = useDeleteQuote(id!, quote?.rfq_id ?? '')
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  if (isLoading || rfqLoading) return <div className="ds-page"><PageSkeleton /></div>
  if (error || !quote) return <div className="ds-page"><ErrorState title={t('notFound.title')} message={t('notFound.message')} /></div>
  if (!(isQuoteLineItemsV2(quote.line_items) && rfq?.volume_tiers)) return <QuoteReview quote={quote} rfq={rfq} />

  const statusPill = quote.status === 'draft'
    ? 'ds-pill ds-pill-warn'
    : quote.status === 'confirmed'
      ? 'ds-pill ds-pill-success'
      : 'ds-pill ds-pill-muted'

  const handleUpdate = (data: QuoteUpdate) => {
    updateQuote.mutate(data, {
      onSuccess: () => { setEditing(false); toast(t('toast.updated')) },
    })
  }

  const isCommercialRfq = rfq?.request_kind === 'commercial'

  const handleConfirm = () => {
    confirmQuote.mutate()
  }

  const handleReject = () => {
    rejectQuote.mutate(undefined, { onSuccess: () => toast(t('toast.updated')) })
  }

  const handleRestore = () => {
    restoreQuote.mutate(undefined, { onSuccess: () => toast(t('toast.updated')) })
  }

  const handleDelete = () => {
    deleteQuote.mutate(undefined, {
      onSuccess: () => navigate(`/rfqs/${quote.rfq_id}`),
    })
  }

  return (
    <div className="ds-page">
      <div className="request-crumb">
        <Link to={`/rfqs/${quote.rfq_id}`} className="ds-link">{t('breadcrumb.rfq')}</Link>
        <span aria-hidden="true">{'/'}</span>
        <span>{t('breadcrumb.quote')}</span>
      </div>

      <div className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="ds-detail-title">{t('title')}</h1>
          <span className={statusPill}>{labels.quoteStatus(quote.status)}</span>
        </div>
        <p className="ds-meta" style={{ marginTop: 8 }}>
          {quote.supplier_name ?? `${t('supplierIdLabel')} ${quote.supplier_id}`}
        </p>
      </div>

      {quote.file_url && <OriginalDocument endpoint={`/quotes/${quote.id}/original`} fileType={quote.file_type} />}

      {rfq && (
        <Alert
          tone={
            quote.status === 'confirmed'
              ? 'success'
              : quote.status === 'rejected'
                ? 'warning'
                : quote.missing_fields.length > 0
                  ? 'warning'
                  : 'info'
          }
          className="mb-5"
        >
          {quote.status === 'confirmed'
            ? t('banner.confirmed')
            : quote.status === 'rejected'
              ? t('banner.rejected')
              : quote.missing_fields.length > 0
                ? t('banner.missing', { count: quote.missing_fields.length })
                : isCommercialRfq && quote.raw_price == null
                  ? t('banner.partialNoPrice')
                  : t('banner.review')}
        </Alert>
      )}

      {editing ? (
        <div className="ds-section">
          {isQuoteLineItemsV2(quote.line_items) && rfq?.volume_tiers ? (
            <CorrugatedQuoteEditForm
              quote={quote}
              lineItems={quote.line_items}
              volumeTiers={rfq.volume_tiers}
              onSubmit={handleUpdate}
              isPending={updateQuote.isPending}
              error={updateQuote.error}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <QuoteEditForm
              quote={quote}
              onSubmit={handleUpdate}
              isPending={updateQuote.isPending}
              error={updateQuote.error}
              onCancel={() => setEditing(false)}
            />
          )}
        </div>
      ) : (
        <div className="grid-2">
          <div>
            <QuoteFields quote={quote} volumeTiers={rfq?.volume_tiers ?? undefined} />
            {isCommercialRfq && quote.status === 'confirmed' && (
              <Link to={`/quotes/${quote.id}/spec-evidence`} className="ds-btn ds-btn-secondary" style={{ marginTop: 16 }}>
                {t('specEvidenceLink')}
              </Link>
            )}
            <div className="ds-toolbar-actions" style={{ marginTop: 20 }}>
              {quote.status === 'draft' && (
                <button type="button" className="ds-btn ds-btn-primary" onClick={handleConfirm} disabled={confirmQuote.isPending}>
                  {confirmQuote.isPending ? t('actions.accepting') : t('actions.accept')}
                </button>
              )}
              <button type="button" className="ds-btn ds-btn-secondary" onClick={() => setEditing(true)}>
                {t('actions.edit')}
              </button>
              {quote.status === 'rejected' ? (
                <button type="button" className="ds-btn ds-btn-secondary" onClick={handleRestore} disabled={restoreQuote.isPending}>
                  {restoreQuote.isPending ? t('actions.restoring') : t('actions.restore')}
                </button>
              ) : (
                <button type="button" className="ds-btn ds-btn-secondary" onClick={handleReject} disabled={rejectQuote.isPending}>
                  {rejectQuote.isPending ? t('actions.rejecting') : t('actions.reject')}
                </button>
              )}
              <button type="button" className="ds-btn ds-btn-quiet" onClick={() => setShowDeleteDialog(true)} disabled={deleteQuote.isPending}>
                {deleteQuote.isPending ? t('actions.deleting') : t('actions.delete')}
              </button>
            </div>
            {quote.status === 'draft' && isCommercialRfq && (
              <p className="ds-meta" style={{ marginTop: 8 }}>{t('actions.acceptHelperCommercial')}</p>
            )}
            <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} title={t('actions.deleteConfirm')}>
              <p>{t('actions.deleteWarning')}</p>
              <div className="ds-dialog-actions">
                <button type="button" className="ds-btn ds-btn-secondary" onClick={() => setShowDeleteDialog(false)}>{t('common:actions.cancel')}</button>
                <button type="button" className="ds-btn ds-btn-danger" onClick={handleDelete} disabled={deleteQuote.isPending}>
                  {deleteQuote.isPending ? t('actions.deleting') : t('actions.delete')}
                </button>
              </div>
            </Dialog>
          </div>

          <aside className="request-rail ds-rail">
            {quote.extraction_pass && (
              <section className="ds-section">
                <h2>{t('extractionSnapshot')}</h2>
                <ExtractionPassSummary data={quote.extraction_pass} />
              </section>
            )}
            {quote.faithful_summary && (
              <section className="ds-section">
                <h2>{t('supplierSummary')}</h2>
                <p>{quote.faithful_summary}</p>
                <p className="ds-meta" style={{ marginTop: 8 }}>{t('gmailPreserved')}</p>
              </section>
            )}
            <section className="ds-section">
              <h2>{t('normalized')}</h2>
              <div className="ds-facts-value tnum">
                {quote.normalized_price != null ? fmt.unitNumber(quote.normalized_price) : '—'}
              </div>
              <p className="ds-meta">{quote.normalized_currency ?? '—'}{quote.normalized_unit ? ` / ${units.per(quote.normalized_unit)}` : ''}</p>
              <p className="ds-meta">{t('normalizedNote')}</p>
            </section>
            <section className="ds-section">
              <h2>{t('completeness')}</h2>
              <MissingFields fields={quote.missing_fields} showComplete />
            </section>
            <section className="ds-section">
              <h2>{t('source.title')}</h2>
              <dl className="ds-facts">
                <div><dt>{t('source.fileType')}</dt><dd>{quote.file_type ?? '—'}</dd></div>
                <div><dt>{t('source.created')}</dt><dd>{fmt.date(quote.created_at, { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
                <div><dt>{t('source.updated')}</dt><dd>{fmt.date(quote.updated_at, { dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
              </dl>
            </section>
          </aside>

          {confirmQuote.error && (
            <FormFeedback>{(confirmQuote.error as ApiError).detail || t('actions.acceptFailed')}</FormFeedback>
          )}
        </div>
      )}
    </div>
  )
}
