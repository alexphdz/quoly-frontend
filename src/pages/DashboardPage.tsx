import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, DonutChart, EmptySection, Icon, RecoveryState, Skeleton, TextButton, type IconName } from '../design-system'
import { useShellLayout } from '../components/layout/useShellLayout'
import { useOpenBuyerActions, useRFQs } from '../hooks/useRFQs'
import { useAllQuotes } from '../hooks/useQuotes'
import { useAuth } from '../hooks/useAuth'
import { greetingFirstName } from '../lib/displayName'
import { dayPart } from '../lib/greeting'
import { useFormat } from '../lib/format'
import { homeActivity, quotesToReview, statusCounts, suppliersAwaiting, upcomingDates, type HomeEvent } from '../lib/homeFeed'

const ATTENTION_LIMIT = 4
const STATUS = [
  { key: 'draft', color: 'violet' },
  { key: 'open', color: 'blue' },
  { key: 'closed', color: 'teal' },
] as const

function Row({ to, icon, tone, title, context, aria }: { to: string, icon: IconName, tone?: 'warning', title: string, context: string, aria?: string }) {
  return (
    <li className="hm-row-item">
      <Link to={to} aria-label={aria} className="hm-row">
        <span className={`hm-row-icon${tone ? ` is-${tone}` : ''}`}><Icon name={icon} size={16} /></span>
        <span className="hm-row-text">
          <span className="hm-row-title">{title}</span>
          <span className="hm-row-context">{context}</span>
        </span>
        <span className="hm-row-caret"><Icon name="caret-right" size={16} /></span>
      </Link>
    </li>
  )
}

/** «Hace 25 min», «Hace 3 h», «Ayer» o la fecha corta. */
function useRelativeTime() {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  return (iso: string) => {
    const at = new Date(iso)
    const mins = Math.max(0, Math.round((Date.now() - at.getTime()) / 60_000))
    if (mins < 60) return t('inicio.time.minutes', { count: Math.max(1, mins) })
    const today = new Date()
    if (at.toDateString() === today.toDateString()) return t('inicio.time.hours', { count: Math.round(mins / 60) })
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (at.toDateString() === yesterday.toDateString()) return t('inicio.time.yesterday')
    return fmt.date(at, { day: 'numeric', month: 'short' })
  }
}

function Section({ id, title, sub, className, children }: { id: string, title: string, sub?: string, className?: string, children: ReactNode }) {
  return (
    <section aria-labelledby={id} className={`hm-section ${className ?? ''}`}>
      <header className="hm-section-head">
        <h2 id={id} className="hm-h2">{title}</h2>
        {sub && <span className="hm-sub">{sub}</span>}
      </header>
      {children}
    </section>
  )
}

function RowsSkeleton({ rows, cols }: { rows: number, cols: string }) {
  return (
    <div className="hm-rows">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="hm-skel-row" style={{ gridTemplateColumns: cols }}>
          <Skeleton shape="text" width="64px" />
          <Skeleton shape="text" lines={2} />
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const navigate = useNavigate()
  const relative = useRelativeTime()
  const layout = useShellLayout()
  const mobile = layout === 'mobile'
  const { user } = useAuth()
  const rfqsQuery = useRFQs()
  const quotesQuery = useAllQuotes()
  const actionsQuery = useOpenBuyerActions()
  const [activeSeg, setActiveSeg] = useState<number | null>(null)

  const rfqs = rfqsQuery.data
  const quotes = quotesQuery.data ?? []
  const actions = actionsQuery.data ?? []
  const loading = rfqsQuery.isLoading || quotesQuery.isLoading || actionsQuery.isLoading
  const workError = !!quotesQuery.error || !!actionsQuery.error
  const retryWork = () => Promise.all([quotesQuery.refetch(), actionsQuery.refetch()])

  const name = greetingFirstName(user?.email)
  const part = dayPart()
  const greeting = t(`home.greeting.${part}${name ? 'Named' : ''}`, { name })

  const toReview = quotesToReview(quotes)
  const awaiting = suppliersAwaiting(rfqs ?? [], actions)
  const nR = toReview.length
  const nA = awaiting.total
  const firstUse = !!rfqs && rfqs.length === 0
  const counts = statusCounts(rfqs ?? [])
  const total = (rfqs ?? []).length
  const dates = upcomingDates(rfqs ?? [])
  const activity = homeActivity(rfqs ?? [], quotes, actions)

  let summary: string
  if (firstUse) summary = t('inicio.summary.firstUse')
  else if (nR === 0 && nA === 0) summary = t('inicio.summary.clear')
  else {
    const parts = [nR && t('inicio.summary.toReview', { count: nR }), nA && t('inicio.summary.awaiting', { count: nA })].filter(Boolean) as string[]
    summary = parts.length === 2 ? t('inicio.summary.both', { a: parts[0], b: parts[1] }) : t('inicio.summary.one', { a: parts[0] })
  }

  const segments = STATUS.map(s => ({ label: t(`inicio.status.${s.key}`), value: counts[s.key], color: s.color }))
  const eventIcon: Record<HomeEvent['kind'], IconName> = {
    review: 'file-magnifying-glass', quote: 'envelope-simple', ask: 'question', awarded: 'trophy', created: 'file-text',
  }
  const eventTitle = (e: HomeEvent) => {
    if (e.kind === 'review') return t('inicio.activity.review', { supplier: e.supplier })
    if (e.kind === 'quote') return t('inicio.activity.quote', { supplier: e.supplier })
    if (e.kind === 'ask') return t('inicio.activity.ask', { rfq: e.rfqName })
    if (e.kind === 'awarded') return t('inicio.activity.awarded')
    return t('inicio.activity.created', { rfq: e.rfqName })
  }
  const eventContext = (e: HomeEvent) => {
    if (e.kind === 'ask') return e.question && e.supplier ? t('inicio.activity.askContext', { supplier: e.supplier, question: e.question }) : e.supplier ?? ''
    if (e.kind === 'awarded') return e.rfqName
    if (e.kind === 'created') return t('inicio.activity.createdContext')
    if (e.noPrice) return t('inicio.activity.noPrice', { rfq: e.rfqName })
    if (e.kind === 'review' && e.missing) return t('inicio.activity.missing', { rfq: e.rfqName, count: e.missing })
    return t('inicio.quoteContext', { rfq: e.rfqName })
  }
  const dayLabel = (days: number) => (days < 0 ? t('inicio.dates.overdue') : days === 0 ? t('inicio.dates.today') : days === 1 ? t('inicio.dates.tomorrow') : t('inicio.dates.in', { count: days }))
  const dateKind = (kind: 'response' | 'delivery', days: number) => (kind === 'delivery' ? t('inicio.dates.delivery') : days < 0 ? t('inicio.dates.responseOverdue', { count: -days }) : t('inicio.dates.response'))
  const fullDate = (iso: string) => fmt.date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso, { day: 'numeric', month: 'short', year: 'numeric' })

  if (rfqsQuery.error) {
    return (
      <div className={`hm-page is-${layout}`}>
        <h1 className="hm-h1">{greeting}</h1>
        <RecoveryState
          label={t('inicio.error.label')}
          title={t('inicio.error.title')}
          text={t('inicio.error.text')}
          retryLabel={t('inicio.error.retry')}
          onRetry={() => rfqsQuery.refetch()}
        />
      </div>
    )
  }

  const recovery = (
    <RecoveryState
      narrow
      label={t('inicio.error.partialLabel')}
      title={t('inicio.error.partialTitle')}
      text={t('inicio.error.partialText')}
      retryLabel={t('inicio.error.retry')}
      onRetry={retryWork}
    />
  )

  return (
    <div className={`hm-page is-${layout}`}>
      <section className="hm-welcome">
        <h1 className="hm-h1" data-testid="home-greeting">{greeting}</h1>
        {loading ? <Skeleton shape="text" width="420px" /> : <p className="hm-summary">{summary}</p>}
      </section>

      {firstUse && (
        <section className="hm-first-use">
          <EmptySection
            as="h2"
            title={t('inicio.firstUse.title')}
            text={t('inicio.firstUse.text')}
            action={<Button icon="plus" onClick={() => navigate('/rfqs/new')}>{t('inicio.firstUse.action')}</Button>}
          />
        </section>
      )}

      {!firstUse && (
        <>
          <section aria-labelledby="hm-attention" className="hm-section hm-attention">
            <h2 id="hm-attention" className="hm-h2">{t('inicio.attention.title')}</h2>
            {loading && (
              <div className="hm-attn-grid">
                {[0, 1].map(i => (
                  <div key={i} className="hm-attn-col">
                    <Skeleton shape="text" width="180px" />
                    <Skeleton shape="block" width="56px" height={72} />
                    <Skeleton shape="text" lines={3} />
                  </div>
                ))}
              </div>
            )}
            {!loading && workError && <div className="hm-rule-top">{recovery}</div>}
            {!loading && !workError && nR + nA > 0 && (
              <div className="hm-attn-grid">
                <div className="hm-attn-col">
                  <span className="hm-eyebrow">{t('inicio.attention.toReview')}</span>
                  <span className="hm-hero is-a">{nR}</span>
                  <span className="hm-caption">{t('inicio.attention.toReviewCaption', { count: nR })}</span>
                  {nR > 0 && (
                    <ul className="hm-rows is-attn">
                      {toReview.slice(0, ATTENTION_LIMIT).map(q => (
                        <Row
                          key={q.id}
                          to={q.to}
                          icon="file-magnifying-glass"
                          title={q.supplier}
                          context={t(q.noPrice ? 'inicio.quoteContextNoPrice' : 'inicio.quoteContext', { rfq: q.rfqName })}
                          aria={t('inicio.attention.reviewAria', { supplier: q.supplier, rfq: q.rfqName })}
                        />
                      ))}
                    </ul>
                  )}
                  <div className="hm-more">
                    <TextButton size="sm" iconEnd="caret-right" className="hm-more-btn" onClick={() => navigate('/quotations')}>{t('inicio.attention.viewQuotes')}</TextButton>
                  </div>
                </div>
                <div className="hm-attn-col">
                  <span className="hm-eyebrow">{t('inicio.attention.awaiting')}</span>
                  <span className="hm-hero is-b">{nA}</span>
                  <span className="hm-caption">{t('inicio.attention.awaitingCaption', { count: nA })}</span>
                  {awaiting.items.length > 0 && (
                    <ul className="hm-rows is-attn">
                      {awaiting.items.slice(0, ATTENTION_LIMIT).map(a => (
                        <Row
                          key={a.key}
                          to={a.to}
                          icon="question"
                          tone="warning"
                          title={a.supplier ?? a.rfqName}
                          context={a.supplier
                            ? (a.question ? t('inicio.askContext', { rfq: a.rfqName, question: a.question }) : a.rfqName)
                            : t('inicio.attention.suppliersWaiting', { count: a.count })}
                          aria={t('inicio.attention.askAria', { name: a.supplier ?? a.rfqName, rfq: a.rfqName })}
                        />
                      ))}
                    </ul>
                  )}
                  <div className="hm-more">
                    <TextButton size="sm" iconEnd="caret-right" className="hm-more-btn" onClick={() => navigate('/requests?attention=1')}>{t('inicio.attention.viewRequests')}</TextButton>
                  </div>
                </div>
              </div>
            )}
            {!loading && !workError && nR + nA === 0 && (
              <div className="hm-rule-top">
                <EmptySection title={t('inicio.clear.title')} text={t('inicio.clear.text')} />
              </div>
            )}
          </section>

          <Section id="hm-status" title={t('inicio.status.title')} sub={t('inicio.status.sub')} className="hm-status">
            <div className="hm-status-body">
              {loading
                ? <Skeleton shape="circle" width={mobile ? '136px' : '168px'} height={mobile ? 136 : 168} />
                : (
                  <div className={`hm-donut${mobile ? ' is-sm' : ''}`}>
                    <DonutChart
                      segments={segments}
                      size="compact"
                      legend={false}
                      centerLabel={t('inicio.status.center')}
                      activeIndex={activeSeg ?? undefined}
                      ariaLabel={t('inicio.status.aria', { list: segments.map(s => `${s.label} ${s.value}`).join(', '), total })}
                    />
                  </div>
                )}
              <ul aria-label={t('inicio.status.legend')} className="hm-legend">
                {segments.map((s, i) => (
                  <li
                    key={s.label}
                    className={activeSeg != null && activeSeg !== i ? 'is-dim' : undefined}
                    onMouseEnter={() => setActiveSeg(i)}
                    onMouseLeave={() => setActiveSeg(null)}
                  >
                    {loading
                      ? <Skeleton shape="text" width="100%" />
                      : (
                        <>
                          <span className="hm-legend-row">
                            <span aria-hidden="true" className="hm-legend-dot" style={{ background: `var(--chart-${s.color})` }} />
                            <span className="hm-legend-label">{s.label}</span>
                            <span className="hm-legend-value">{s.value}</span>
                          </span>
                          <span aria-hidden="true" className="hm-legend-track">
                            <span style={{ width: total ? `${(s.value / total) * 100}%` : '0%', background: `var(--chart-${s.color})` }} />
                          </span>
                        </>
                      )}
                  </li>
                ))}
              </ul>
            </div>
          </Section>

          <Section id="hm-dates" title={t('inicio.dates.title')} className="hm-dates">
            {loading
              ? <RowsSkeleton rows={4} cols="94px minmax(0, 1fr)" />
              : dates.rows.length === 0
                ? <p className="hm-note">{t('inicio.dates.empty')}</p>
                : (
                  <ul className="hm-rows">
                    {dates.rows.map(d => (
                      <li key={d.key} className="hm-row-item">
                        <Link to={`/rfqs/${d.rfqId}`} className="hm-row is-date" aria-label={`${d.rfqName}: ${dateKind(d.kind, d.days)}, ${fullDate(d.date)}`}>
                          <span className={`hm-date${d.days < 0 ? ' is-overdue' : ''}`}>
                            <span className="hm-date-day">{fullDate(d.date)}</span>
                            <span className="hm-date-when">{dayLabel(d.days)}</span>
                          </span>
                          <span className="hm-row-text">
                            <span className="hm-row-title">{d.rfqName}</span>
                            <span className="hm-row-context is-loose">{dateKind(d.kind, d.days)}</span>
                          </span>
                          <span className="hm-row-caret is-end"><Icon name="caret-right" size={16} /></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
            {!loading && dates.undated.length > 0 && (
              <p className="hm-note">
                <Icon name="calendar-blank" size={16} />
                <span>{t('inicio.dates.undated', { count: dates.undated.length, list: dates.undated.join(', ') })}</span>
              </p>
            )}
          </Section>

          <Section id="hm-activity" title={t('inicio.activity.title')} className="hm-activity">
            {loading && <RowsSkeleton rows={5} cols="16px minmax(0, 1fr)" />}
            {!loading && workError && <div className="hm-rule-top">{recovery}</div>}
            {!loading && !workError && (activity.length === 0
              ? <p className="hm-note">{t('inicio.activity.empty')}</p>
              : (
                <ul className="hm-rows">
                  {activity.map(e => (
                    <li key={e.key} className="hm-row-item">
                      <Link to={e.to} className="hm-row is-event">
                        <span className={`hm-row-icon is-top${e.kind === 'ask' ? ' is-warning' : ''}`}><Icon name={eventIcon[e.kind]} size={16} /></span>
                        <span className="hm-row-text">
                          <span className="hm-event-title">{eventTitle(e)}</span>
                          <span className="hm-row-context is-loose">{eventContext(e)}</span>
                        </span>
                        <span className="hm-event-time">{relative(e.at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
          </Section>
        </>
      )}
    </div>
  )
}
