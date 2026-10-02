import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOpenBuyerActions, useRFQs } from '../hooks/useRFQs'
import { useAllQuotes } from '../hooks/useQuotes'
import RequestsLedgerTable, { requestDestination, useRelativeDays } from '../components/rfq/RequestsLedgerTable'
import { Btn, Collapsible, Empty, Icon, SectionCard, Skel, Tabs } from '../components/ds'
import { ErrorState, toast } from '../components/ui'
import { computeListMetrics, deadlineDays, rfqDisplayNumber, rfqListBucket, rfqSearchHaystack } from '../lib/rfqDisplay'
import { requestAttentionEvents, requestKpiCounts, responseDeadlineDays, upcomingDeadlines } from '../lib/dashboardMetrics'
import { useFormat } from '../lib/format'

type TabFilter = 'all' | 'open' | 'drafts' | 'closed'

function formatReplyBy(iso: string, locale: string, now = new Date()): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }
  if (date.getFullYear() !== now.getFullYear()) options.year = 'numeric'
  return new Intl.DateTimeFormat(locale, options).format(date)
}

export default function RequestsPage() {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const relative = useRelativeDays()
  const { data: rfqs, isLoading, error } = useRFQs()
  const { data: allQuotes, isFetched: quotesFetched } = useAllQuotes()
  const { data: openActions, isFetched: actionsFetched } = useOpenBuyerActions()
  const [filter, setFilter] = useState<TabFilter>('all')
  const [search, setSearch] = useState('')
  const countsReady = quotesFetched && actionsFetched

  const metrics = useMemo(() => computeListMetrics(rfqs ?? [], 0), [rfqs])
  const kpis = useMemo(
    () => requestKpiCounts(rfqs ?? [], allQuotes ?? [], openActions ?? []),
    [rfqs, allQuotes, openActions],
  )
  const attention = useMemo(
    () => requestAttentionEvents(rfqs ?? [], allQuotes ?? [], openActions ?? []),
    [rfqs, allQuotes, openActions],
  )
  const schedule = useMemo(() => upcomingDeadlines(rfqs ?? [], 1000), [rfqs])
  const upcomingShown = schedule.slice(0, 5)
  const upcomingMore = schedule.length - upcomingShown.length

  const visibleRfqs = useMemo(() => {
    const query = search.trim().toLowerCase()
    let list = (rfqs ?? []).filter((rfq) => {
      if (filter !== 'all' && rfqListBucket(rfq) !== (filter === 'drafts' ? 'draft' : filter)) return false
      return true
    })
    if (query) list = list.filter(rfq => rfqSearchHaystack(rfq).includes(query))
    return [...list].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  }, [filter, rfqs, search])

  const newRequest = (
    <Link to="/rfqs/new" className="ds-btn ds-btn-primary ds-btn-md">
      <Icon name="add" size={16} />
      {t('dashboard.newRfq')}
    </Link>
  )

  const lead: ReactNode[] = []
  if (kpis.needsYou > 0) {
    lead.push(
      <span key="needs" className="rq-ops-ask">{t('dashboard.ops.needs', { count: kpis.needsYou })}</span>,
    )
  }
  if (kpis.toReview > 0) {
    lead.push(
      <span key="review">{t('dashboard.ops.review', { count: kpis.toReview })}</span>,
    )
  }
  const waiting = kpis.awaiting > 0
    ? [
        t('dashboard.ops.waiting', { count: kpis.awaiting }),
        ...(kpis.awaitingSuppliers > 0 && kpis.awaitingSuppliers !== kpis.awaiting
          ? [t('dashboard.ops.unanswered', { count: kpis.awaitingSuppliers })]
          : []),
      ].join(' · ')
    : ''

  const listFormat = new Intl.ListFormat(fmt.locale, { style: 'narrow', type: 'conjunction' })

  return (
    <div className="ds-page qt-page">
      <header className="qy-page-head">
        <div>
          <h1 className="ds-title">{t('dashboard.title')}</h1>
        </div>
        {newRequest}
      </header>

      {error && <ErrorState title={t('dashboard.loadErrorTitle')} message={t('dashboard.loadErrorMessage')} />}

      {isLoading && <Skel h={320} />}

      {rfqs && rfqs.length === 0 && (
        <div className="qy-card">
          <Empty
            icon="assignment"
            title={t('dashboard.emptyTitle')}
            description={t('dashboard.emptyDescription')}
            action={newRequest}
          />
        </div>
      )}

      {rfqs && rfqs.length > 0 && (
        <>
          {!countsReady && <Skel h={88} />}

          {countsReady && (
            <>
              <div className="rq-ops">
                <p className="rq-ops-lead">
                  <span className="rq-ops-kicker">{t('dashboard.ops.today')}</span>
                  {lead.length === 0
                    ? <span className="rq-ops-clear">{t('dashboard.ops.clear')}</span>
                    : lead.flatMap((node, index) => (
                        index === 0
                          ? [node]
                          : [<span key={`dot-${index}`} className="rq-ops-dot" aria-hidden="true"> · </span>, node]
                      ))}
                </p>
                {waiting && <p className="rq-ops-quiet">{waiting}</p>}
              </div>

              <Collapsible
                className="rq-attention-collapsible"
                label={t('dashboard.ops.attention')}
                summary={attention.length > 0 ? String(attention.length) : undefined}
              >
                {attention.length === 0 ? (
                  <p className="rq-quiet">{t('dashboard.attention.caughtUp')}</p>
                ) : (
                  <ul className="rq-queue">
                    {attention.map((item) => {
                      const what = item.kind === 'ask'
                        ? (item.supplierName
                            ? (item.askCount > 1
                                ? t('dashboard.ops.askedMany', { supplier: item.supplierName, count: item.askCount })
                                : t('dashboard.attention.asked', { supplier: item.supplierName }))
                            : t('dashboard.table.needYou', { count: item.askCount }))
                        : t('home.activity.quote')
                      const why = item.kind === 'ask'
                        ? item.question
                        : (item.supplierNames.length > 0 ? listFormat.format(item.supplierNames) : undefined)
                      const days = item.at ? deadlineDays(item.at) : null
                      return (
                        <li key={item.key}>
                          <Link to={item.to} className={item.kind === 'ask' ? 'is-ask' : undefined}>
                            <span className="rq-queue-what">{what}</span>
                            <span className="rq-queue-request">
                              <span className="rq-queue-name">{item.rfq.name}</span>
                              <span className="ds-id">{rfqDisplayNumber(item.rfq)}</span>
                            </span>
                            <span className="rq-queue-why" title={why}>{why}</span>
                            <span className="rq-queue-when">
                              {days != null ? relative(days) : ''}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </Collapsible>

              <section className="rq-plain" aria-labelledby="rq-upcoming-title">
                <h2 id="rq-upcoming-title">{t('dashboard.ops.upcoming')}</h2>
                {schedule.length === 0 ? (
                  <p className="rq-quiet">{t('home.deadlines.empty')}</p>
                ) : (
                  <ul className="rq-schedule">
                    {upcomingShown.map((rfq) => {
                      const iso = rfq.response_deadline!
                      const days = responseDeadlineDays(iso) ?? 0
                      const why = days < 0
                        ? t('dashboard.deadline.overdue', { count: Math.abs(days) })
                        : t('dashboard.ops.replyBy')
                      return (
                        <li key={rfq.id}>
                          <Link to={requestDestination(rfq)}>
                            <time className="rq-schedule-date" dateTime={iso.slice(0, 10)}>
                              {formatReplyBy(iso, fmt.locale)}
                            </time>
                            <span className="rq-schedule-name">{rfq.name}</span>
                            <span className={days < 0 ? 'rq-schedule-why is-late' : 'rq-schedule-why'}>{why}</span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
                {upcomingMore > 0 && (
                  <p className="rq-quiet">{t('dashboard.ops.more', { count: upcomingMore })}</p>
                )}
              </section>
            </>
          )}

          <SectionCard flush className="qt-card">
            <div className="qt-toolbar">
              <Tabs<TabFilter>
                layoutId="requests-tabs"
                label={t('dashboard.filterLabel')}
                value={filter}
                onChange={setFilter}
                tabs={[
                  { id: 'all', label: t('dashboard.tabs.all'), icon: 'layers', count: metrics.total },
                  { id: 'open', label: t('dashboard.tabs.open'), icon: 'send', count: metrics.openCount },
                  { id: 'drafts', label: t('dashboard.tabs.drafts'), icon: 'edit', count: metrics.draftCount },
                  { id: 'closed', label: t('dashboard.tabs.closed'), icon: 'check_circle', count: metrics.closedCount },
                ]}
              />
              <div className="qt-toolbar-actions">
                <label className="ds-search">
                  <Icon name="search" size={16} />
                  <input
                    type="search"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder={t('dashboard.searchPlaceholder')}
                    title={t('dashboard.searchPlaceholder')}
                    aria-label={t('dashboard.searchPlaceholder')}
                  />
                </label>
                <Btn variant="ghost" size="sm" icon="filter_list" onClick={() => toast(t('dashboard.filterSoon'))}>
                  {t('dashboard.filterAction')}
                </Btn>
                <Btn variant="ghost" size="sm" icon="download" onClick={() => toast(t('dashboard.exportSoon'))}>
                  {t('dashboard.export')}
                </Btn>
              </div>
            </div>
            {visibleRfqs.length === 0 ? (
              <Empty
                icon="search"
                title={t('dashboard.noMatchTitle')}
                description={t('dashboard.noMatchDescription')}
                action={(
                  <Btn variant="secondary" onClick={() => { setSearch(''); setFilter('all') }}>
                    {t('dashboard.clearFilters')}
                  </Btn>
                )}
              />
            ) : (
              <RequestsLedgerTable rfqs={visibleRfqs} />
            )}
          </SectionCard>
        </>
      )}
    </div>
  )
}
