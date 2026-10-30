import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { TextButton } from '../actions/TextButton'
import { Icon } from '../core/Icon'
import { useAmount } from '../comparison/shared'
import type { DecisionFact, DecisionPrice } from './shared'

export type AwardRecordProps = {
  /** selected = aún no registrada · recorded = registro final. */
  state?: 'selected' | 'recorded'
  supplier: string
  quotation?: string
  rfq?: string
  price?: DecisionPrice | null
  priceText?: string
  priceNote?: string
  /** Hasta 3 hechos del snapshot comercial. */
  facts?: DecisionFact[]
  summary?: ReactNode
  recordedBy?: string
  recordedAt?: string
  date?: string
  /** Motivo escrito por el comprador. */
  rationale?: string
  onViewQuote?: () => void
  links?: ReactNode
  note?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Registro formal de adjudicación: regla superior coral, trofeo en línea, snapshot comercial. */
export function AwardRecord({
  state = 'recorded', supplier, quotation, rfq, price, priceText, priceNote, facts = [], summary, recordedBy, recordedAt, date, rationale,
  onViewQuote, links, note, className, style,
}: AwardRecordProps) {
  const { t } = useTranslation('ds')
  const fmt = useAmount()
  const [ref, width] = useElementWidth<HTMLElement>(900)
  const mobile = width < 640
  const recorded = state === 'recorded'
  const refs = [rfq, quotation].filter(Boolean).join(' · ')
  const foot = [recorded && recordedBy && t('dec.record.recordedBy', { name: recordedBy }), recorded && recordedAt].filter(Boolean).join(' · ') || (recorded ? null : t('dec.record.notYet'))
  const shown = facts.slice(0, 3)
  return (
    <article
      ref={ref}
      aria-label={recorded ? t('dec.record.ariaRecorded', { supplier }) : t('dec.record.ariaSelected', { supplier })}
      className={cx('q-dec-record', recorded && 'is-recorded', mobile && 'is-mobile', className)}
      style={style}
    >
      <span aria-hidden="true" className="q-dec-record-rule" />
      <header className="q-dec-record-head">
        <div role="status" className="q-dec-record-status">
          <span className="q-dec-record-eyebrow">
            <span aria-hidden="true" className="q-dec-record-icons">
              <span className="is-trophy"><Icon name="trophy" size={16} weight="duotone" /></span>
              <span className="is-check"><Icon name="check-circle" size={16} /></span>
            </span>
            <span className="q-dec-eyebrow is-strong">{recorded ? t('dec.record.recorded') : t('dec.record.selected')}</span>
          </span>
          <span className="q-dec-record-sub">{recorded ? t('dec.record.recordedSub') : t('dec.record.selectedSub')}</span>
        </div>
        {recorded && date && <span className="q-dec-meta is-numeric q-dec-record-date">{date}</span>}
      </header>
      <div className="q-dec-record-body">
        <div className="q-dec-record-main">
          <h3 className="q-dec-record-supplier">{supplier}</h3>
          {refs && <span className="q-dec-meta is-numeric q-dec-record-refs">{refs}</span>}
          {summary && <p className="q-dec-record-summary">{summary}</p>}
        </div>
        <dl className="q-dec-record-snapshot">
          {(price || priceText) && (
            <div className="q-dec-record-price">
              <dt className="q-dec-label">{t('dec.record.price')}</dt>
              <dd>
                {price
                  ? (
                      <span className="q-dec-record-figure">
                        <span className="q-dec-record-figure-value">{fmt(price.amount)}</span>
                        <span className="q-dec-record-figure-unit">{[price.currency, price.unit].filter(Boolean).join(' ')}</span>
                      </span>
                    )
                  : <span className="q-dec-record-price-text">{priceText}</span>}
                {priceNote && <span className="q-dec-meta">{priceNote}</span>}
              </dd>
            </div>
          )}
          {shown.length > 0 && (
            <div className="q-dec-record-facts" style={{ gridTemplateColumns: `repeat(${mobile && shown.length > 2 ? 2 : shown.length}, minmax(0, 1fr))` }}>
              {shown.map((f, i) => (
                <div key={i}>
                  <dt className="q-dec-label">{f.label}</dt>
                  <dd className={f.value == null ? 'is-missing' : undefined}>{f.value == null ? t('dec.notProvided') : f.value}</dd>
                </div>
              ))}
            </div>
          )}
        </dl>
      </div>
      {rationale && (
        <div className="q-dec-record-rationale">
          <span>{t('dec.record.rationale')}</span>
          <p>{rationale}</p>
        </div>
      )}
      <footer className="q-dec-record-foot">
        <span className="q-dec-meta q-dec-record-foot-text">
          {foot && <span>{foot}</span>}
          {note && <span className="is-sm">{note}</span>}
        </span>
        <div className="q-dec-record-links">
          {links}
          {onViewQuote && <TextButton iconEnd="arrow-square-out" onClick={onViewQuote}>{t('dec.viewQuote')}</TextButton>}
        </div>
      </footer>
    </article>
  )
}
