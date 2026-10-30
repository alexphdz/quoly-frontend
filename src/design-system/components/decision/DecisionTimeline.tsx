import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { TextButton } from '../actions/TextButton'
import { EmptySection } from '../structure/EmptySection'

export type DecisionEvent = {
  /** Fecha visible ya formateada. */
  date: string
  /** Valor ISO para <time>. */
  datetime?: string
  time?: string
  title: string
  actor?: string
  description?: string
  reference?: string
  action?: { label: string, onClick: () => void }
}

export type DecisionTimelineProps = {
  /** Más reciente primero. Solo eventos persistidos. */
  events?: DecisionEvent[]
  label?: string
  emptyTitle?: string
  emptyText?: string
  className?: string
  style?: CSSProperties
}

/** Historial de la decisión (fecha 120 · nodo 24 · evento). */
export function DecisionTimeline({ events = [], label, emptyTitle, emptyText, className, style }: DecisionTimelineProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLDivElement>(800)
  const mobile = width < 560
  if (!events.length) {
    return (
      <div ref={ref} className={className} style={style}>
        <EmptySection title={emptyTitle ?? t('dec.timeline.emptyTitle')} text={emptyText ?? t('dec.timeline.emptyText')} className="q-dec-timeline-empty" />
      </div>
    )
  }
  return (
    <div ref={ref} className={className} style={style}>
      <ol aria-label={label ?? t('dec.timeline.label')} className={cx('q-dec-timeline', mobile && 'is-mobile')}>
        {events.map((e, i) => {
          const latest = i === 0
          const last = i === events.length - 1
          const time = (
            <span className="q-dec-meta is-numeric q-dec-timeline-time">
              <time dateTime={e.datetime}>{e.date}</time>
              {e.time && <span>{mobile ? ` · ${e.time}` : e.time}</span>}
            </span>
          )
          return (
            <li key={i} aria-current={latest ? 'step' : undefined} className={cx('q-dec-event', latest && 'is-latest', last && 'is-last')}>
              {!mobile && <div className="q-dec-event-when">{time}</div>}
              <div aria-hidden="true" className="q-dec-event-node"><span className="q-dec-event-line" /><span className="q-dec-event-dot" /></div>
              <div className="q-dec-event-body">
                {mobile && time}
                <span className="q-dec-event-title">{e.title}</span>
                {e.actor && <span className="q-dec-meta">{e.actor}</span>}
                {e.description && <p className="q-dec-event-description">{e.description}</p>}
                {(e.reference || e.action) && (
                  <div className="q-dec-event-foot">
                    {e.reference && <span className="q-dec-meta is-sm is-numeric">{e.reference}</span>}
                    {e.action && <TextButton iconEnd="arrow-square-out" onClick={e.action.onClick}>{e.action.label}</TextButton>}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
