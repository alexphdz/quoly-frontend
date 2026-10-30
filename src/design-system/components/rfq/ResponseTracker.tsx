import { useId, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'

export type ResponseTrackerProps = {
  responded?: number
  total?: number
  label?: string
  /** Hasta este total se dibujan segmentos; por encima, barra continua. */
  segmentLimit?: number
  className?: string
  style?: CSSProperties
}

/** Respuestas de proveedores: conteo Outfit 24 + indicador de 5px + desglose. */
export function ResponseTracker({ responded = 0, total = 0, label, segmentLimit = 12, className, style }: ResponseTrackerProps) {
  const { t } = useTranslation('ds')
  const id = useId()
  const done = Math.max(0, Math.min(responded, total))
  const pending = total - done
  const segmented = total > 0 && total <= segmentLimit
  return (
    <div className={cx('q-rfq-tracker', className)} style={style}>
      <div className="q-rfq-tracker-head">
        <span id={id} className="q-rfq-label">{label ?? t('rfq.tracker.label')}</span>
        <span aria-hidden="true" className="q-rfq-tracker-count">
          {done}
          <span className="q-rfq-tracker-total">{` / ${total}`}</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-labelledby={id}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={total ? t('rfq.tracker.valueText', { responded: done, total }) : t('rfq.summary.noSuppliers')}
        className={cx('q-rfq-tracker-bar', segmented && 'is-segmented')}
      >
        {segmented
          ? Array.from({ length: total }, (_, i) => <span key={i} className={i < done ? 'is-done' : undefined} />)
          : <span className="q-rfq-tracker-fill" style={{ transform: `scaleX(${total ? done / total : 0})` }} />}
      </div>
      <div aria-hidden="true" className="q-rfq-tracker-legend">
        <span><span className="q-rfq-tracker-key is-done" /><strong>{done}</strong>{` ${t('rfq.tracker.responded', { count: done })}`}</span>
        <span><span className="q-rfq-tracker-key" /><strong>{pending}</strong>{` ${t('rfq.tracker.pending', { count: pending })}`}</span>
      </div>
    </div>
  )
}
