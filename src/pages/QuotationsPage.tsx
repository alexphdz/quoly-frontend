import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAllQuotes } from '../hooks/useQuotes'
import QuotationsTable from '../components/quotations/QuotationsTable'
import ReviewQueue from '../components/quotations/ReviewQueue'
import RequestFilter, { type RequestOption } from '../components/quotations/RequestFilter'
import { Btn, Empty, Icon, SectionCard, Skel, Tabs } from '../components/ds'
import { ErrorState } from '../components/ui'
import { quoteListStatus } from '../lib/quoteDisplay'
import { useRFQs } from '../hooks/useRFQs'

type StatusFilter = 'all' | 'draft' | 'confirmed' | 'rejected'

export default function QuotationsPage() {
  const { t } = useTranslation('quotation')
  const { data: quotes, isLoading, error } = useAllQuotes()
  const { data: rfqs } = useRFQs()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedRfqId, setSelectedRfqId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const all = useMemo(
    () => [...(quotes ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [quotes],
  )

  const rfqOptions: RequestOption[] = useMemo(() => {
    const byRfq = new Map<string, RequestOption>()
    for (const quote of all) {
      const current = byRfq.get(quote.rfq_id)
      byRfq.set(quote.rfq_id, {
        id: quote.rfq_id,
        name: quote.rfq_name,
        number: quote.rfq_number ?? null,
        count: (current?.count ?? 0) + 1,
      })
    }
    return [...byRfq.values()]
  }, [all])

  const scoped = useMemo(() => {
    const query = search.trim().toLowerCase()
    return all.filter((quote) => {
      if (selectedRfqId && quote.rfq_id !== selectedRfqId) return false
      if (!query) return true
      return `${quote.supplier_name} ${quote.rfq_name} ${quote.rfq_number ?? ''}`.toLowerCase().includes(query)
    })
  }, [all, search, selectedRfqId])

  const rows = statusFilter === 'all' ? scoped : scoped.filter(quote => quoteListStatus(quote) === statusFilter)
  const countOf = (status: StatusFilter) => (status === 'all' ? scoped.length : scoped.filter(q => quoteListStatus(q) === status).length)

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setSelectedRfqId(null)
  }

  return (
    <div className="ds-page qt-page">
      <header className="qy-page-head">
        <div>
          <h1 className="ds-title">{t('title')}</h1>
        </div>
      </header>

      {error && <ErrorState title={t('loadError')} />}

      {isLoading && (
        <div className="qy-card qy-card-body" aria-busy>
          <Skel h={180} />
        </div>
      )}

      {quotes && all.length === 0 && (
        <div className="qy-card">
          <Empty icon="receipt_long" title={t('empty.title')} description={t('empty.body')} />
        </div>
      )}

      {all.length > 0 && rfqs && (
        <ReviewQueue quotes={all} rfqs={rfqs} />
      )}

      {all.length > 0 && (
        <>
          <SectionCard flush className="qt-card">
            <div className="qt-toolbar">
              <Tabs<StatusFilter>
                layoutId="quotations-tabs"
                label={t('filters.statusLabel')}
                value={statusFilter}
                onChange={setStatusFilter}
                tabs={[
                  { id: 'all', label: t('filters.all'), icon: 'layers', count: countOf('all') },
                  { id: 'draft', label: t('filters.needsReview'), icon: 'visibility', count: countOf('draft') },
                  { id: 'confirmed', label: t('filters.confirmed'), icon: 'check_circle', count: countOf('confirmed') },
                  { id: 'rejected', label: t('filters.rejected'), icon: 'do_not_disturb_on', count: countOf('rejected') },
                ]}
              />
              <div className="qt-toolbar-actions">
                <RequestFilter options={rfqOptions} value={selectedRfqId} onChange={setSelectedRfqId} />
                <label className="ds-search">
                  <Icon name="search" size={16} />
                  <input
                    type="search"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder={t('filters.searchPlaceholder')}
                    title={t('filters.searchPlaceholder')}
                    aria-label={t('filters.searchLabel')}
                  />
                </label>
              </div>
            </div>
            {rows.length === 0 ? (
              <Empty
                icon="search"
                title={t('noResults')}
                action={<Btn variant="secondary" onClick={clearFilters}>{t('filters.clear')}</Btn>}
              />
            ) : (
              <QuotationsTable rows={rows} />
            )}
          </SectionCard>
        </>
      )}
    </div>
  )
}
