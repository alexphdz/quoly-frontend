import { useTranslation } from 'react-i18next'
import type { ComparisonModel } from '../../lib/comparisonModel'
import { Btn, Chip, Icon, Tip } from '../ds'
import FaithfulSummary from './FaithfulSummary'
import type { CmpFormat } from './useCmpFormat'

interface Props {
  model: ComparisonModel
  allIn: boolean
  summary: string
  f: CmpFormat
  canSelect: boolean
  onSelect: (quoteId: string) => void
}

export default function RecommendationCard({ model, summary, f, canSelect, onSelect }: Props) {
  const { t } = useTranslation('comparison')
  const leader = model.leader
  if (!leader || leader.comparable == null) return null
  const runner = model.runnerUp
  const missingFields = leader.row.missing_fields.filter(field => !['currency_conversion', 'unit_conversion'].includes(field))
  const ranked = model.rows.filter(item => item.rank != null).length

  const why: string[] = []
  if (runner?.comparable != null && runner.deltaUnit != null) {
    why.push(t('cmp.rec.rationale.price', {
      price: f.unitPrice(leader.comparable),
      unit: f.unit,
      pct: f.fmt.number((runner.deltaUnit / runner.comparable) * 100, { maximumFractionDigits: 1 }),
      runner: runner.row.supplier_name,
    }))
    if (runner.deltaTotal != null && model.quantity != null) {
      why.push(t('cmp.rec.rationale.saves', {
        deltaTotal: f.total(runner.deltaTotal),
        quantity: f.qty(model.quantity),
        units: f.units,
      }))
    }
  } else {
    why.push(t('cmp.rec.rationale.only'))
  }
  if (runner && leader.leadDays != null && runner.leadDays != null && leader.leadDays !== runner.leadDays) {
    const diff = Math.abs(leader.leadDays - runner.leadDays)
    why.push(leader.leadDays < runner.leadDays
      ? t('cmp.rec.rationale.faster', { count: diff })
      : t('cmp.rec.rationale.slower', { count: diff, runner: runner.row.supplier_name }))
  }
  if (leader.gaps > 0) why.push(t('cmp.rec.rationale.gaps', { count: leader.gaps }))

  const payment = leader.advancePercent != null
    ? t('cmp.rec.factAdvance', { percent: leader.advancePercent })
    : leader.row.raw_payment_terms?.trim() || null

  return (
    <section className="qy-card cmp-rec" aria-label={t('ai.section')}>
      <div className="cmp-rec-main">
        <div className="cmp-rec-eyebrow">
          <span className="cmp-rec-label">{t('cmp.rec.title')}</span>
          <Tip content={t('cmp.rec.footnote')}>
            <button type="button" className="cmp-rec-info" aria-label={t('cmp.rec.footnote')}>
              <Icon name="info" size={14} />
            </button>
          </Tip>
        </div>
        <h2 className="cmp-rec-name">{leader.row.supplier_name}</h2>
        <div className="cmp-chips">
          {ranked > 1 && <Chip tone="success">{t('cmp.rec.lowest')}</Chip>}
          {leader.gaps === 0
            ? <Chip tone="neutral">{t('cmp.rec.complete')}</Chip>
            : missingFields.length > 0
              ? <Chip tone="warn">{t('cmp.rec.missing', { count: missingFields.length })}</Chip>
              : <Chip tone="warn">{t('cmp.rec.gaps', { count: leader.unquotedKinds.length })}</Chip>}
          {leader.fastest && ranked > 1 && <Chip tone="neutral">{t('cmp.rec.fastest')}</Chip>}
        </div>
        <div className="cmp-rec-why">
          <p className="cmp-rec-kicker">{t('cmp.rec.whyTitle')}</p>
          <p>{why.join(' ')}</p>
        </div>
      </div>

      <div className="cmp-rec-side">
        <div className="cmp-rec-price">
          {f.fmt.unitNumber(leader.comparable)}
          <span className="cmp-rec-cur">{f.currency}</span>
        </div>
        <div className="cmp-rec-unit">{t('cmp.rec.perUnit', { unit: f.unit })}</div>
        {leader.total != null && model.quantity != null && (
          <div className="cmp-rec-totals">
            <div>{t('cmp.rec.totalAmount', { amount: f.total(leader.total) })}</div>
            <div>{t('cmp.rec.quantityLine', { quantity: f.qty(model.quantity), units: f.units })}</div>
          </div>
        )}
        <dl className="cmp-rec-facts">
          {leader.leadDays != null && (
            <div>
              <dt>{t('cmp.rec.factLead')}</dt>
              <dd>{t('cmp.rec.factLeadValue', { count: leader.leadDays })}</dd>
            </div>
          )}
          {payment && (
            <div>
              <dt>{t('cmp.rec.factPayment')}</dt>
              <dd>{payment}</dd>
            </div>
          )}
          <div>
            <dt>{t('cmp.rec.factQuote')}</dt>
            <dd>
              {leader.gaps === 0
                ? t('cmp.rec.factQuoteComplete')
                : t('cmp.rec.factQuoteGaps', { count: leader.gaps })}
            </dd>
          </div>
        </dl>
        {canSelect && (
          <Btn variant="primary" size="md" className="cmp-rec-select" onClick={() => onSelect(leader.row.quote_id)}>
            {t('cmp.rec.select')}
          </Btn>
        )}
      </div>

      {summary && (
        <div className="cmp-rec-ai">
          <p className="cmp-rec-kicker">
            <span className="brand-mark" aria-hidden />
            {t('cmp.rec.analysis')}
          </p>
          <FaithfulSummary text={summary} />
        </div>
      )}
    </section>
  )
}
