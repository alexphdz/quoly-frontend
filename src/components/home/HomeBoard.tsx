import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { HomeBoard as HomeBoardData, OpenSliceKey } from '../../lib/dashboardMetrics'
import { useFormat } from '../../lib/format'

const SLICE_CLASS: Record<OpenSliceKey, string> = {
  quotes: 'is-quotes',
  waiting: 'is-waiting',
  attention: 'is-attention',
  other: 'is-other',
}

export default function HomeBoard({ board }: { board: HomeBoardData }) {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const rate = board.responseRate

  return (
    <div className="home-board">
      <article className="home-card home-card-open">
        <Link to="/requests" className="home-card-hit">
          <h2>{t('home.kpi.open')}</h2>
          <p className="home-card-num qy-num">{fmt.number(board.open)}</p>
          <p className="home-card-note">
            {board.readyToCompare > 0
              ? t('home.board.ready', { count: board.readyToCompare })
              : t('home.kpi.openHelper')}
          </p>
          {board.slices.length > 0 && (
            <>
              <div className="home-split" aria-hidden>
                {board.slices.map(slice => (
                  <span key={slice.key} className={SLICE_CLASS[slice.key]} style={{ flexGrow: slice.count }} />
                ))}
              </div>
              <ul className="home-split-legend">
                {board.slices.map(slice => (
                  <li key={slice.key}>
                    <span className={`home-swatch ${SLICE_CLASS[slice.key]}`} />
                    {t(`home.board.slice.${slice.key}`)}
                    <b className="qy-num">{fmt.number(slice.count)}</b>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Link>
      </article>

      <article className="home-card home-card-review">
        <header className="home-card-top">
          <div>
            <h2>
              <Link to="/quotations">{t('home.kpi.toReview')}</Link>
            </h2>
            <p className="home-card-num qy-num">{fmt.number(board.toReview)}</p>
            {board.newToday > 0 && (
              <p className="home-card-note">{t('home.board.newToday', { count: board.newToday })}</p>
            )}
          </div>
        </header>
        {board.queue.length === 0 ? (
          <p className="home-card-note">{t('home.board.reviewEmpty')}</p>
        ) : (
          <ul className="home-queue">
            {board.queue.map(item => (
              <li key={item.key}>
                <Link to={item.to}>
                  <span className="home-queue-name">{item.name}</span>
                  <span className="home-queue-meta">{t('home.board.quoteCount', { count: item.count })}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="home-card home-card-rate">
        <header className="home-card-inline">
          <h2>{t('home.kpi.responseRate')}</h2>
          <p className="home-card-num qy-num">{rate == null ? '—' : fmt.percent(rate)}</p>
        </header>
        <p className="home-card-note">
          {board.invited > 0
            ? t('home.board.responded', { responded: board.responded, invited: board.invited })
            : t('home.kpi.responseRateEmpty')}
        </p>
        {rate != null && (
          <div
            className="home-rate"
            role="img"
            aria-label={t('home.board.responded', { responded: board.responded, invited: board.invited })}
          >
            <span style={{ width: `${Math.round(rate * 100)}%` }} />
          </div>
        )}
      </article>

      <article className="home-card home-card-award">
        <h2>{t('home.kpi.decidedMonth')}</h2>
        <p className="home-card-num qy-num">{fmt.number(board.decidedMonth)}</p>
        <p className="home-card-note">
          {board.decidedMonth > 0
            ? t('home.board.awarded', { count: board.decidedMonth })
            : t('home.board.awardEmpty')}
        </p>
        {board.approaching > 0 && (
          <p className="home-card-note">{t('home.board.approaching', { count: board.approaching })}</p>
        )}
        {board.latestAward && (
          <Link to={`/rfqs/${board.latestAward.id}`} className="home-award-latest">
            <span>{t('home.board.latest')}</span>
            <strong>{board.latestAward.name}</strong>
            <span className="ds-meta">{fmt.date(board.latestAward.at, { day: 'numeric', month: 'short' })}</span>
          </Link>
        )}
      </article>
    </div>
  )
}
