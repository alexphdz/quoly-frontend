import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { Button } from '../actions/Button'
import { TextButton } from '../actions/TextButton'
import { Icon } from '../core/Icon'
import { useAmount } from '../comparison/shared'
import type { DecisionPrice } from './shared'

export type DecisionRowState = 'default' | 'selected' | 'awarded'

/** Cabecera de columnas para DecisionRow (≥760px). */
export function DecisionRowHeader({ className, style }: { className?: string, style?: CSSProperties }) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLDivElement>(1000)
  if (width < 760) return <div ref={ref} />
  const heads = [t('dec.row.supplier'), t('dec.row.unitPrice'), t('dec.row.moq'), t('dec.row.leadTime'), t('dec.row.incoterm'), '']
  return (
    <div ref={ref} role="presentation" className={cx('q-dec-row-header', className)} style={style}>
      {heads.map((h, i) => <span key={i} className={cx('q-dec-label', i === 5 && 'is-end')}>{h}</span>)}
    </div>
  )
}

export type DecisionRowProps = {
  state?: DecisionRowState
  supplier: string
  quotation?: string
  price?: DecisionPrice | null
  priceText?: string
  priceNote?: string
  moq?: string | null
  leadTime?: string | null
  incoterm?: string | null
  /** Fecha de registro de la adjudicación. */
  recordedAt?: string
  onSelect?: () => void
  onConfirm?: () => void
  onChange?: () => void
  onView?: () => void
  className?: string
  style?: CSSProperties
}

/** Fila de decisión: seleccionar nunca registra la adjudicación; confirmar es una acción aparte. */
export function DecisionRow({
  state = 'default', supplier, quotation, price, priceText, priceNote, moq, leadTime, incoterm, recordedAt,
  onSelect, onConfirm, onChange, onView, className, style,
}: DecisionRowProps) {
  const { t } = useTranslation('ds')
  const fmt = useAmount()
  const [ref, width] = useElementWidth<HTMLDivElement>(1000)
  const mobile = width < 760
  const selected = state === 'selected'
  const awarded = state === 'awarded'
  const on = selected || awarded

  const marker = on && (
    <span className="q-dec-row-marker">
      <span className="q-dec-row-award">
        <Icon name="trophy" size={16} weight={awarded ? 'duotone' : 'regular'} />
        <span>{awarded ? t('dec.indicator.recorded') : t('dec.row.candidate')}</span>
      </span>
      {awarded && (
        <span className="q-dec-row-lock">
          <Icon name="lock-simple" size={14} />
          {recordedAt ? t('dec.row.recordedAt', { date: recordedAt }) : t('dec.row.finalRecord')}
        </span>
      )}
      {selected && <span className="q-dec-meta">{t('dec.row.pending')}</span>}
    </span>
  )
  const priceNode = price
    ? (
        <span className="q-dec-row-price">
          <span className="q-dec-row-price-value">{fmt(price.amount)}</span>
          <span className="q-dec-meta">{price.currency}</span>
        </span>
      )
    : <span className="q-dec-row-value is-missing">{priceText ?? t('dec.notProvided')}</span>
  const action = awarded
    ? <TextButton iconEnd="arrow-square-out" onClick={onView}>{t('dec.row.viewRecord')}</TextButton>
    : selected
      ? (
          <span className="q-dec-row-confirm">
            <Button size="xs" icon="trophy" onClick={onConfirm}>{t('dec.row.confirm')}</Button>
            {onChange && <TextButton onClick={onChange}>{t('dec.row.change')}</TextButton>}
          </span>
        )
      : <Button size="xs" variant="secondary" onClick={onSelect} className="q-dec-row-select">{t('dec.row.select')}</Button>
  const fact = (label: string, value: string | null | undefined) => (
    <div className="q-dec-row-fact">
      {mobile && <span className="q-dec-label">{label}</span>}
      <span className={cx('q-dec-row-value', value == null && 'is-missing')}>{value ?? '—'}</span>
    </div>
  )
  const ariaLabel = awarded ? t('dec.row.ariaAwarded', { supplier }) : selected ? t('dec.row.ariaSelected', { supplier }) : supplier

  return (
    <div ref={ref} role="group" aria-label={ariaLabel} className={cx('q-dec-row', `is-${state}`, mobile && 'is-mobile', className)} style={style}>
      <span aria-hidden="true" className="q-dec-row-bar" />
      <div className="q-dec-row-id">
        <span className="q-dec-row-name">{supplier}</span>
        {quotation && <span className="q-dec-meta q-dec-row-quotation">{quotation}</span>}
        {marker}
      </div>
      <div className="q-dec-row-pricecell">
        {mobile && <span className="q-dec-label">{t('dec.row.unitPrice')}</span>}
        {priceNode}
        {priceNote && <span className="q-dec-meta">{priceNote}</span>}
      </div>
      {mobile
        ? <div className="q-dec-row-facts">{fact(t('dec.row.moq'), moq)}{fact(t('dec.row.leadTime'), leadTime)}{fact(t('dec.row.incoterm'), incoterm)}</div>
        : <>{fact(t('dec.row.moq'), moq)}{fact(t('dec.row.leadTime'), leadTime)}{fact(t('dec.row.incoterm'), incoterm)}</>}
      <div className="q-dec-row-action">{action}</div>
    </div>
  )
}
