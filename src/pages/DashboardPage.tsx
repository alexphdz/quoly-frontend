import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useOpenBuyerActions, useRFQs } from '../hooks/useRFQs'
import { useAllQuotes } from '../hooks/useQuotes'
import { useAuth } from '../hooks/useAuth'
import AttentionCard from '../components/rfq/AttentionCard'
import { Icon, SectionCard, Skel } from '../components/ds'
import HomeBoard from '../components/home/HomeBoard'
import { ErrorState } from '../components/ui'
import { dashboardStats, homeBoard, recentActivity, requestKpiCounts, upcomingDeadlines } from '../lib/dashboardMetrics'
import { greetingFirstName } from '../lib/displayName'
import { dayPart } from '../lib/greeting'
import { deadlineDays, rfqDisplayNumber } from '../lib/rfqDisplay'
import { useFormat } from '../lib/format'
import { useRelativeDays } from '../components/rfq/RequestsLedgerTable'

export default function DashboardPage() {
  const { t } = useTranslation(['rfq', 'common'])
  const fmt = useFormat()
  const relative = useRelativeDays()
  const { user } = useAuth()
  const { data: rfqs, isLoading, error } = useRFQs()
  const { data: quotes } = useAllQuotes()
  const { data: actions } = useOpenBuyerActions()

  const stats = dashboardStats(rfqs ?? [], quotes ?? [])
  const board = homeBoard(rfqs ?? [], quotes ?? [])
  const kpis = requestKpiCounts(rfqs ?? [], quotes ?? [], actions ?? [])
  const deadlines = upcomingDeadlines(rfqs ?? [])
  const activity = recentActivity(rfqs ?? [], quotes ?? [])
  const pipelineLabels = [t('journey.draft'), t('journey.sent'), t('journey.quotes'), t('journey.decided')]
  const name = greetingFirstName(user?.email)
  const part = dayPart()
  const greetingKey = {
    morning: name ? 'home.greeting.morningNamed' : 'home.greeting.morning',
    afternoon: name ? 'home.greeting.afternoonNamed' : 'home.greeting.afternoon',
    evening: name ? 'home.greeting.eveningNamed' : 'home.greeting.evening',
  }[part]
  const heading = t(greetingKey, { name })
  const subtitle = stats.toReview > 0
    ? t('home.greeting.toReview', { count: stats.toReview })
    : kpis.needsYou > 0
      ? t('home.greeting.waiting', { count: kpis.needsYou })
      : t('home.greeting.quiet')

  const newRequest = (
    <Link to="/rfqs/new" className="ds-btn ds-btn-primary ds-btn-md">
      <Icon name="add" size={16} />
      {t('dashboard.newRfq')}
    </Link>
  )

  return (
    <div className="ds-page qt-page home-page">
      <header className="qy-page-head">
        <div>
          <h1 className="ds-title" data-testid="home-greeting">{heading}</h1>
          <p className="qy-page-sub">{subtitle}</p>
        </div>
        {newRequest}
      </header>

      {error && <ErrorState title={t('dashboard.loadErrorTitle')} message={t('dashboard.loadErrorMessage')} />}
      {isLoading && <div className="qy-card-body" style={{ padding: 0 }}><Skel h={240} /></div>}

      {rfqs && (
        <>
          <HomeBoard board={board} />

          <SectionCard plain title={t('home.pipeline.title')}>
            <div className="home-pipeline-bar" aria-hidden>
              {stats.pipeline.map((count, index) => (
                count > 0 ? <span key={pipelineLabels[index]} className="home-pipeline-seg" style={{ flexGrow: count, flexBasis: 0 }} /> : null
              ))}
            </div>
            <ul className="home-pipeline-legend">
              {stats.pipeline.map((count, index) => (
                <li key={pipelineLabels[index]}>{pipelineLabels[index]} <b className="qy-num">{count}</b></li>
              ))}
            </ul>
          </SectionCard>

          <AttentionCard rfqs={rfqs} quotes={quotes ?? []} actions={actions ?? []} />

          <div className="home-grid">
            <SectionCard plain title={t('home.deadlines.title')} flush={deadlines.length > 0}>
              {deadlines.length === 0 ? (
                <p className="ds-meta">{t('home.deadlines.empty')}</p>
              ) : (
                <ul className="home-deadlines">
                  {deadlines.map((rfq) => {
                    const days = deadlineDays(rfq.response_deadline) ?? 0
                    const urgency = days < 0 ? 'is-late' : days <= 2 ? 'is-soon' : undefined
                    return (
                      <li key={rfq.id}>
                        <div>
                          <Link to={`/rfqs/${rfq.id}`} className="qt-request-name">{rfq.name}</Link>
                          <span className="ds-id">{rfqDisplayNumber(rfq)}</span>
                        </div>
                        <div className="home-deadline-meta">
                          <span className={urgency}>
                            {days < 0 ? t('dashboard.deadline.overdue', { count: Math.abs(days) }) : relative(days)}
                          </span>
                          <span className="ds-meta">{t('home.deadlines.quotes', { received: rfq.quoted_count, invited: rfq.supplier_count })}</span>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </SectionCard>

            <SectionCard plain title={t('home.activity.title')} flush={activity.length > 0}>
              {activity.length === 0 ? (
                <p className="ds-meta">{t('home.activity.empty')}</p>
              ) : (
                <ul className="home-activity">
                  {activity.map(item => (
                    <li key={item.key}>
                      <div>
                        <Link to={item.to} className="qt-request-name">{item.title}</Link>
                        <p className="ds-meta">
                          {t(`home.activity.${item.kind}`)}
                          {item.detail ? ` · ${item.detail}` : ''}
                        </p>
                      </div>
                      <span className="rq-attention-time">{fmt.date(item.at, { dateStyle: 'medium' })}</span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <div className="home-footer-link">
            <Link to="/requests" className="ds-link">{t('home.viewRequests')}</Link>
          </div>
        </>
      )}
    </div>
  )
}
