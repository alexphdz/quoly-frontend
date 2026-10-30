import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { Button } from '../actions/Button'
import { TextButton } from '../actions/TextButton'
import { Icon } from '../core/Icon'
import { IntelligenceMark } from '../core/IntelligenceMark'
import { SkeletonBar } from './shared'

export type ExtractionStatus = 'processing' | 'ready' | 'partial' | 'reviewed' | 'failed'

export type ExtractionSummaryProps = {
  status?: ExtractionStatus
  /** Afirmación principal (Outfit 20). */
  title?: ReactNode
  summary?: ReactNode
  meta?: ReactNode
  available?: number
  total?: number
  reviewCount?: number
  /** Etiquetas de campos no indicados. */
  missing?: string[]
  onReview?: () => void
  reviewLabel?: string
  onRetry?: () => void
  retryLabel?: string
  /** Cambia para re-animar la entrada con un resultado nuevo. */
  resultKey?: string | number
  className?: string
  style?: CSSProperties
}

/** Resumen de Quoly Intelligence: afirmación + campos disponibles y por revisar. Sin puntuaciones. */
export function ExtractionSummary({
  status = 'ready', title, summary, meta, available = 0, total, reviewCount, missing = [], onReview, reviewLabel, onRetry, retryLabel,
  resultKey, className, style,
}: ExtractionSummaryProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLElement>(900)
  const stack = width < 560
  const busy = status === 'processing'
  const failed = status === 'failed'
  const segmented = total != null && total > 0 && total <= 24
  const metaNode = meta && <span className="q-qi-small">{meta}</span>

  return (
    <section
      ref={ref}
      aria-label={t('qi.summary.label')}
      aria-busy={busy || undefined}
      className={cx('q-qi-summary', (stack || failed) && 'is-single', stack && 'is-stacked', className)}
      style={style}
    >
      <div className="q-qi-summary-main">
        <div className="q-qi-summary-id">
          <span className="q-qi-brand"><IntelligenceMark size={18} processing={busy} />{'Quoly Intelligence'}</span>
          <span aria-hidden="true" className="q-qi-summary-sep" />
          <span role="status" className={cx('q-qi-summary-status', `is-${status}`)}>{t(`qi.summary.status.${status}`)}</span>
        </div>
        <div key={resultKey} className={cx('q-qi-summary-body', !busy && 'is-entering')}>
          {busy
            ? (
                <div className="q-qi-summary-skeleton">
                  <SkeletonBar width="82%" height={14} />
                  <SkeletonBar width="64%" />
                  <span className="q-sr-only">{t('qi.summary.analyzing')}</span>
                </div>
              )
            : (
                <>
                  {title && <p className="q-qi-summary-title">{title}</p>}
                  {summary && <p className="q-qi-summary-text">{summary}</p>}
                </>
              )}
          {failed && onRetry && (
            <div className="q-qi-summary-retry">
              <Button variant="secondary" icon="arrow-clockwise" onClick={onRetry}>{retryLabel ?? t('qi.summary.retry')}</Button>
            </div>
          )}
        </div>
        {!stack && metaNode && <div className="q-qi-summary-meta">{metaNode}</div>}
      </div>
      {!failed && (
        <div className="q-qi-summary-side">
          {busy || total == null
            ? <div className="q-qi-summary-skeleton"><SkeletonBar width={96} height={36} /><SkeletonBar width={110} /></div>
            : (
                <>
                  <span className="q-qi-summary-figure">
                    {available}
                    <span className="is-muted">{` / ${total}`}</span>
                  </span>
                  <span className="q-qi-small q-qi-summary-caption">{t('qi.summary.availableFields')}</span>
                </>
              )}
          <div aria-hidden="true" className="q-qi-summary-bar">
            {busy || !total
              ? <span />
              : segmented
                ? Array.from({ length: total }, (_, i) => <span key={i} className={i < available ? 'is-on' : undefined} />)
                : <span style={{ background: `linear-gradient(90deg, var(--color-text-primary) ${(available / total) * 100}%, var(--qi-track) 0)` }} />}
          </div>
          {!busy && reviewCount != null && (
            <span className={cx('q-qi-summary-review', !reviewCount && 'is-done')}>
              {reviewCount ? t('qi.summary.toReview', { count: reviewCount }) : <><Icon name="check" size={14} />{t('qi.summary.nothingToReview')}</>}
            </span>
          )}
          {!busy && missing.length > 0 && <span className="q-qi-small q-qi-summary-missing">{t('qi.summary.missing', { fields: missing.join(', ') })}</span>}
          {!busy && onReview && (
            <div className="q-qi-summary-action">
              <TextButton iconEnd="caret-right" onClick={onReview}>{reviewLabel ?? t('qi.summary.review')}</TextButton>
            </div>
          )}
        </div>
      )}
      {stack && metaNode && <div className="q-qi-summary-meta">{metaNode}</div>}
    </section>
  )
}
