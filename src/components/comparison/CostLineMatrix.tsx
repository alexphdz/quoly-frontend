import { useTranslation } from 'react-i18next'
import type { ComparisonModel, RankedRow } from '../../lib/comparisonModel'
import type { CostBreakdownLine, CostKind } from '../../types/comparison'
import { Chip, Money, SectionCard, Tip } from '../ds'
import { cn } from '../ui'
import type { CmpFormat } from './useCmpFormat'

function lineFor(item: RankedRow, kind: CostKind, quantity: number | null): CostBreakdownLine | undefined {
  const found = (item.row.cost_breakdown ?? []).find(line => line.kind === kind)
  if (found || kind !== 'product' || item.row.normalized_price == null) return found
  return {
    kind: 'product',
    name: 'product',
    raw_amount: item.row.raw_price,
    raw_currency: item.row.raw_currency,
    basis: 'per_unit',
    included: false,
    normalized_per_unit: item.row.normalized_price,
    normalized_total: quantity != null ? item.row.normalized_price * quantity : null,
    source_wording: item.row.commercial_offer?.field_sources?.price ?? null,
  }
}

export default function CostLineMatrix({ model, f }: { model: ComparisonModel, f: CmpFormat }) {
  const { t } = useTranslation('comparison')
  if (model.kinds.length === 0) return null
  const columns = model.rows

  const bestFor = (kind: CostKind) => {
    const values = columns
      .map(item => lineFor(item, kind, model.quantity))
      .map(line => (line && !line.included ? line.normalized_total : line?.included ? 0 : null))
      .filter((value): value is number => value != null)
    return values.length > 1 ? Math.min(...values) : null
  }
  const totals = columns.map(item => item.total).filter((value): value is number => value != null)
  const bestTotal = totals.length > 1 ? Math.min(...totals) : null

  return (
    <SectionCard icon="table_rows" title={t('cmp.lines.title')} flush>
      <div className="ds-table-wrap">
        <table className="ds-table cmp-matrix" aria-label={t('cmp.lines.title')}>
          <thead>
            <tr>
              <th scope="col">{t('cmp.lines.line')}</th>
              {columns.map(item => (
                <th key={item.row.quote_id} scope="col" className={cn('qy-num', item.rank === 1 && 'is-leading')}>
                  {item.row.supplier_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {model.kinds.map(kind => {
              const best = bestFor(kind)
              return (
                <tr key={kind}>
                  <th scope="row">{t(`cmp.lines.kinds.${kind}`)}</th>
                  {columns.map(item => {
                    const line = lineFor(item, kind, model.quantity)
                    const value = line?.included ? 0 : line?.normalized_total ?? null
                    const isBest = best != null && value != null && Math.abs(value - best) < 0.005
                    return (
                      <td key={item.row.quote_id} className={cn('qy-num', item.rank === 1 && 'is-leading')}>
                        {!line ? (
                          <span className="cmp-muted">{t('cmp.lines.notQuoted')}</span>
                        ) : line.included ? (
                          <Chip tone="neutral">{t('cmp.lines.included')}</Chip>
                        ) : (
                          <Tip content={line.source_wording || undefined}>
                            <span tabIndex={line.source_wording ? 0 : undefined} className={cn(isBest && 'cmp-best')}>
                              <Money value={line.normalized_total} currency={f.currency} digits={0} />
                            </span>
                          </Tip>
                        )}
                        {line && !line.included && line.raw_amount != null && (
                          <div className="cmp-sub">
                            {line.basis === 'lot'
                              ? `${f.fmt.number(line.raw_amount)} ${line.raw_currency ?? ''} · ${t('cmp.lines.lot')}`
                              : t('cmp.lines.perUnit', { amount: `${f.fmt.unitNumber(line.raw_amount)} ${line.raw_currency ?? ''}` })}
                          </div>
                        )}
                        {isBest && <div className="cmp-sub cmp-best-label">{t('cmp.lines.best')}</div>}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr className="cmp-matrix-total">
              <th scope="row">{t('cmp.lines.total')}</th>
              {columns.map(item => (
                <td key={item.row.quote_id} className={cn('qy-num', item.rank === 1 && 'is-leading')}>
                  <span className={cn(bestTotal != null && item.total === bestTotal && 'cmp-best')}>
                    <Money value={item.total} currency={f.currency} digits={0} />
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="cmp-foot">
        <p>{t('cmp.lines.note', { quantity: model.quantity != null ? f.qty(model.quantity) : '—', units: f.units, currency: f.currency })}</p>
      </div>
    </SectionCard>
  )
}
