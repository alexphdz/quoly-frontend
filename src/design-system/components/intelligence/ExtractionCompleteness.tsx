import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'

export type ExtractionCompletenessProps = {
  total?: number
  confirmed?: number
  pending?: number
  missing?: number
  noncomparable?: number
  title?: string
  description?: string
  /** Segmentos por campo hasta este total; por encima, barra proporcional. */
  segmentLimit?: number
  className?: string
  style?: CSSProperties
}

type Part = 'confirmed' | 'pending' | 'noncomparable' | 'missing'

/** Completitud: campos presentes en la fuente y su estado de revisión (no mide exactitud). */
export function ExtractionCompleteness({
  total = 0, confirmed = 0, pending = 0, missing = 0, noncomparable = 0, title, description, segmentLimit = 24, className, style,
}: ExtractionCompletenessProps) {
  const { t } = useTranslation('ds')
  const available = Math.max(0, total - missing)
  const segmented = total > 0 && total <= segmentLimit
  const parts: Array<[Part, number]> = [['confirmed', confirmed], ['pending', pending], ['noncomparable', noncomparable], ['missing', missing]]
  const cells: Part[] = []
  parts.forEach(([k, n]) => {
    for (let i = 0; i < n; i++) cells.push(k)
  })
  while (cells.length < total) cells.push('missing')
  const heading = title ?? t('qi.completeness.title')
  const summary = `${t('qi.completeness.available', { available, total })}: ${parts.filter(([, n]) => n > 0).map(([k, n]) => `${n} ${t(`qi.completeness.${k}`, { count: n })}`).join(', ')}`
  return (
    <div role="group" aria-label={heading} className={cx('q-qi-completeness', className)} style={style}>
      <div className="q-qi-completeness-head">
        <div className="q-qi-completeness-title">
          <h4>{heading}</h4>
          <span className="q-qi-small">{description ?? t('qi.completeness.description')}</span>
        </div>
        <span className="q-qi-completeness-count">
          <span className="q-qi-completeness-figure">
            {available}
            <span className="is-muted">{` / ${total}`}</span>
          </span>
          <span className="q-qi-small">{t('qi.completeness.availableShort')}</span>
        </span>
      </div>
      <div aria-hidden="true" className={cx('q-qi-completeness-bar', segmented && 'is-segmented')}>
        {segmented
          ? cells.map((k, i) => <span key={i} className={`is-${k}`} />)
          : parts.filter(([k]) => k !== 'missing').map(([k, n]) => <span key={k} className={`is-${k}`} style={{ width: `${total ? (n / total) * 100 : 0}%` }} />)}
      </div>
      <span className="q-sr-only">{summary}</span>
      <div aria-hidden="true" className="q-qi-completeness-legend">
        {parts.filter(([k, n]) => n > 0 || k === 'pending' || k === 'missing').map(([k, n]) => (
          <span key={k}>
            <span className={`q-qi-completeness-key is-${k}`} />
            <strong>{n}</strong>
            {t(`qi.completeness.${k}`, { count: n })}
          </span>
        ))}
      </div>
    </div>
  )
}
