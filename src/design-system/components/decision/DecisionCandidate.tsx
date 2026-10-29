import { useId, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { Button } from '../actions/Button'
import { TextButton } from '../actions/TextButton'
import { CmpStatus, useAmount, type ReviewStatus } from '../comparison/shared'
import { SelectionIndicator, type SelectionState } from './SelectionIndicator'
import { DecUnderline, type DecisionFact, type DecisionPrice } from './shared'

export type DecisionCandidateProps = {
  name: string
  reference?: string
  status?: ReviewStatus
  /** Precio normalizado; sin él, "No comparable". */
  price?: DecisionPrice | null
  original?: string
  priceReason?: string
  facts?: DecisionFact[]
  selection?: 'none' | SelectionState
  onSelect?: () => void
  onChangeSelection?: () => void
  onViewQuote?: () => void
  contained?: boolean
  divider?: boolean
  className?: string
  style?: CSSProperties
}

/** Candidato a decisión: el comprador selecciona; Quoly no recomienda ni puntúa. */
export function DecisionCandidate({
  name, reference, status = 'reviewed', price, original, priceReason, facts = [], selection = 'none',
  onSelect, onChangeSelection, onViewQuote, contained = false, divider = true, className, style,
}: DecisionCandidateProps) {
  const { t } = useTranslation('ds')
  const fmt = useAmount()
  const [ref, width] = useElementWidth<HTMLElement>(900)
  const mobile = width < 640
  const selected = selection !== 'none'
  const id = useId()
  return (
    <article
      ref={ref}
      aria-labelledby={id}
      aria-current={selected ? 'true' : undefined}
      className={cx('q-dec-candidate', mobile && 'is-mobile', contained && 'is-contained', divider && 'has-divider', className)}
      style={style}
    >
      <div className="q-dec-candidate-id">
        <h3 id={id} className="q-dec-candidate-name">{name}</h3>
        <div className="q-dec-candidate-line"><DecUnderline on={selected} /></div>
        {reference && <span className="q-dec-meta is-numeric q-dec-candidate-ref">{reference}</span>}
        <div className="q-dec-candidate-status"><CmpStatus status={status} /></div>
      </div>
      <div className="q-dec-candidate-offer">
        <div className="q-dec-candidate-price">
          {price
            ? (
                <span className="q-dec-figure">
                  <span className="q-dec-figure-value">{fmt(price.amount)}</span>
                  <span className="q-dec-figure-unit">{[price.currency, price.unit].filter(Boolean).join(' ')}</span>
                </span>
              )
            : (
                <span className="q-dec-nc">
                  <span className="q-dec-nc-label">{t('cmp.notComparable')}</span>
                  {priceReason && <span className="q-dec-meta is-sm">{priceReason}</span>}
                </span>
              )}
          {original && <span className="q-dec-meta is-numeric">{t('dec.original', { value: original })}</span>}
        </div>
        {facts.length > 0 && (
          <dl className="q-dec-facts">
            {facts.map((f, i) => (
              <div key={i}>
                <dt className="q-dec-label">{f.label}</dt>
                <dd className={f.value == null ? 'is-missing' : undefined}>
                  {f.value == null ? t('dec.notProvided') : f.value}
                  {f.note && <span className="q-dec-fact-note">{f.note}</span>}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      <div className="q-dec-candidate-actions">
        {selected
          ? (
              <>
                <SelectionIndicator state={selection} />
                {onChangeSelection && selection !== 'recorded' && <TextButton onClick={onChangeSelection}>{t('dec.changeSelection')}</TextButton>}
              </>
            )
          : onSelect && (
            <Button variant="secondary" size={mobile ? 'lg' : 'md'} icon="check-circle" fullWidth={mobile} aria-describedby={id} onClick={onSelect}>
              {t('dec.selectSupplier')}
            </Button>
          )}
        {onViewQuote && <TextButton iconEnd="arrow-square-out" onClick={onViewQuote}>{t('dec.viewQuote')}</TextButton>}
      </div>
    </article>
  )
}
