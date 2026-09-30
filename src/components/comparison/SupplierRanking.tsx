import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import type { ComparisonModel, RankedRow } from '../../lib/comparisonModel'
import type { ComparisonRow } from '../../types/comparison'
import { formatLeadTimeParts, formatPriceTierSummary } from '../../lib/comparisonCommercial'
import { useUnitLabel } from '../../lib/units'
import * as quotesApi from '../../api/quotes'
import { Btn, Chip, Icon, Menu, Money, SectionCard, Tip } from '../ds'
import { cn, toast } from '../ui'
import type { CmpFormat } from './useCmpFormat'

const SOURCE_ICON: Record<string, string> = { email: 'mail', file: 'description', manual: 'edit' }

interface Props {
  rfqId: string
  model: ComparisonModel
  f: CmpFormat
  allIn: boolean
  fxLine: string | null
  canSelect: boolean
  awardedQuoteId?: string | null
  onSelect: (quoteId: string) => void
  onViewSpec: (row: ComparisonRow) => void
  onViewSpecSheet: (row: ComparisonRow) => void
}

export default function SupplierRanking({ rfqId, model, f, allIn, fxLine, canSelect, awardedQuoteId, onSelect, onViewSpec, onViewSpecSheet }: Props) {
  const { t } = useTranslation('comparison')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const exclude = useMutation({
    mutationFn: (quoteId: string) => quotesApi.rejectQuote(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparison', rfqId] })
      queryClient.invalidateQueries({ queryKey: ['quotes'] })
      toast(t('cmp.table.excluded'))
    },
  })

  return (
    <SectionCard icon="leaderboard" title={t('cmp.table.title')} flush>
      <div className="ds-table-wrap cmp-table-wrap">
        <table className="ds-table cmp-table" aria-label={t('cmp.table.title')}>
          <thead>
            <tr>
              <th scope="col" className="cmp-col-rank"><span className="sr-only">{t('cmp.table.rank')}</span>{'#'}</th>
              <th scope="col">{t('cmp.table.supplier')}</th>
              <th scope="col" className="qy-num">{t('cmp.table.unitPrice')}</th>
              <th scope="col" className="qy-num">{t('cmp.table.total')}</th>
              <th scope="col" className="cmp-col-lead">{t('cmp.table.lead')}</th>
              <th scope="col" className="qy-num">{t('cmp.table.moq')}</th>
              <th scope="col">{t('cmp.table.terms')}</th>
              <th scope="col">{t('cmp.table.completeness')}</th>
              <th scope="col">{t('table.headers.specSheet')}</th>
              <th scope="col"><span className="sr-only">{t('cmp.table.actions')}</span></th>
            </tr>
          </thead>
          <tbody>
            {model.rows.map(item => (
              <SupplierRow
                key={item.row.quote_id}
                item={item}
                model={model}
                f={f}
                canSelect={canSelect}
                awarded={item.row.quote_id === awardedQuoteId}
                onSelect={onSelect}
                onViewSpec={onViewSpec}
                onViewSpecSheet={onViewSpecSheet}
                onOpen={() => navigate(`/quotes/${item.row.quote_id}`)}
                onExclude={() => exclude.mutate(item.row.quote_id)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="cmp-foot">
        <p>
          {allIn
            ? t('cmp.table.footRankAllIn', { quantity: model.quantity != null ? f.qty(model.quantity) : '—', units: f.units })
            : t('cmp.table.footRankUnit', { currency: f.currency, unit: f.unit })}
        </p>
        {fxLine && <p>{fxLine}</p>}
      </div>
    </SectionCard>
  )
}

function SupplierRow({
  item,
  model,
  f,
  canSelect,
  awarded,
  onSelect,
  onViewSpec,
  onViewSpecSheet,
  onOpen,
  onExclude,
}: {
  item: RankedRow
  model: ComparisonModel
  f: CmpFormat
  canSelect: boolean
  awarded: boolean
  onSelect: (id: string) => void
  onViewSpec: (row: ComparisonRow) => void
  onViewSpecSheet: (row: ComparisonRow) => void
  onOpen: () => void
  onExclude: () => void
}) {
  const { t } = useTranslation('comparison')
  const units = useUnitLabel()
  const { row } = item
  const sourceIcon = SOURCE_ICON[row.source ?? 'manual'] ?? 'edit'
  const tiers = formatPriceTierSummary(row.commercial_offer, f.fmt, units.per)
  const lead = formatLeadTimeParts(row.commercial_offer, row.raw_delivery_lead_time_days, t)
  const leading = item.rank === 1
  const missingFields = row.missing_fields.filter(field => !['currency_conversion', 'unit_conversion'].includes(field))
  const barWidth = item.comparable != null && model.priceMax > 0 ? Math.max(6, (item.comparable / model.priceMax) * 100) : 0

  return (
    <tr className={cn(leading && 'is-leading', awarded && 'is-awarded')}>
      <td className="cmp-col-rank">
        {item.rank != null ? <span className={cn('qy-rank', leading && 'is-first')}>{item.rank}</span> : <span className="qy-rank">–</span>}
      </td>
      <td className="cmp-col-supplier">
        <Link to={`/quotes/${row.quote_id}`} className="cmp-supplier-name">{row.supplier_name}</Link>
        <div className="cmp-sub cmp-supplier-sub">
          <Tip content={t(`cmp.table.source.${row.source ?? 'manual'}`)}>
            <span className="cmp-source" tabIndex={0} aria-label={t(`cmp.table.source.${row.source ?? 'manual'}`)}>
              <Icon name={sourceIcon} size={13} />
            </span>
          </Tip>
          {row.raw_price != null
            ? t('cmp.table.quoted', { price: f.fmt.unitNumber(row.raw_price), currency: row.raw_currency ?? '', unit: units.per(row.raw_unit) })
            : t('cmp.table.noPrice')}
        </div>
      </td>
      <td className="qy-num cmp-col-price">
        <Money value={item.comparable} currency={f.currency} digits="unit" className="cmp-strong" />
        {item.comparable != null && <div className="qy-bar cmp-bar" aria-hidden><span style={{ width: `${barWidth}%` }} /></div>}
        {tiers.length > 0 && <div className="cmp-sub">{tiers.join(' · ')}</div>}
      </td>
      <td className="qy-num">
        <Money value={item.total} currency={f.currency} digits={0} />
        {item.deltaTotal != null && item.rank !== 1 && (
          <div className="cmp-sub cmp-delta">
            <Money value={item.deltaTotal} currency={f.currency} digits={0} signed />
          </div>
        )}
      </td>
      <td className="cmp-col-lead">
        <div className="cmp-cell-line">
          {lead.primary === '—'
            ? <span className="cmp-muted">—</span>
            : <Traced text={lead.wording}><span className="qy-num">{lead.primary}</span></Traced>}
          {item.fastest && <Chip tone="brand" icon="bolt">{t('badges.fastest')}</Chip>}
        </div>
      </td>
      <td className="qy-num">
        {row.raw_quantity_moq != null
          ? <Traced text={row.commercial_offer?.moq_source_wording}>{f.qty(row.raw_quantity_moq)}</Traced>
          : <span className="cmp-muted">—</span>}
        {item.moqExcess && (
          <div style={{ marginTop: 4 }}>
            <Chip tone="danger" icon="warning">{t('cmp.table.exceeds')}</Chip>
            {item.moqExcess.cost != null && (
              <div className="cmp-sub">{t('cmp.table.exceedsCost', { amount: f.total(item.moqExcess.cost) })}</div>
            )}
          </div>
        )}
      </td>
      <td className="cmp-col-terms">
        {row.raw_payment_terms ? <Wording text={row.raw_payment_terms} primary /> : <span className="cmp-muted">—</span>}
        {(row.raw_delivery_point || row.commercial_offer?.quote_validity) && (
          <Wording text={[row.raw_delivery_point, row.commercial_offer?.quote_validity].filter(Boolean).join(' · ')} />
        )}
      </td>
      <td>
        {item.blocked
          ? <Chip tone="danger" icon="error">{t('table.notComparable')}</Chip>
          : item.gaps === 0
            ? <Chip tone="success" icon="check_circle">{t('cmp.table.complete')}</Chip>
            : (
              <Tip content={[...missingFields, ...item.unquotedKinds.map(kind => t(`cmp.lines.kinds.${kind}`))].join(', ')}>
                <span tabIndex={0}><Chip tone="warn" icon="error">{t('cmp.table.gaps', { count: item.gaps })}</Chip></span>
              </Tip>
            )}
      </td>
      <td className="cmp-col-spec">
        {row.spec_source_url ? (
          <button type="button" className="ds-link" onClick={() => onViewSpecSheet(row)}>{t('table.viewSpec')}</button>
        ) : (
          <span className="cmp-muted">{t('table.noSpecification')}</span>
        )}
        {row.spec_state && row.spec_state !== 'not_received' && (
          <div><button type="button" className="ds-link cmp-sub" onClick={() => onViewSpec(row)}>{t('table.specStatus.received')}</button></div>
        )}
      </td>
      <td className="cmp-col-actions">
        <div className="cmp-actions">
          {canSelect && item.rank != null && (
            <Btn size="sm" variant={leading ? 'primary' : 'secondary'} onClick={() => onSelect(row.quote_id)}>{t('table.select')}</Btn>
          )}
          {awarded && <Chip tone="success" icon="check_circle">{t('badges.awarded')}</Chip>}
          <Menu
            label={t('cmp.table.actions')}
            items={[
              { label: t('cmp.review.openQuote'), icon: 'open_in_new', onSelect: onOpen },
              ...(canSelect ? [{ label: t('cmp.table.exclude'), icon: 'do_not_disturb_on', onSelect: onExclude, danger: true }] : []),
            ]}
          />
        </div>
      </td>
    </tr>
  )
}

function Wording({ text, primary = false }: { text: string; primary?: boolean }) {
  const { t } = useTranslation('comparison')
  return (
    <Tip content={t('cmp.table.supplierWrote', { text })}>
      <span tabIndex={0} className={cn('cmp-clip', !primary && 'cmp-sub')}>{text}</span>
    </Tip>
  )
}

function Traced({ text, children }: { text?: string | null; children: ReactNode }) {
  const { t } = useTranslation('comparison')
  if (!text) return <>{children}</>
  return (
    <Tip content={t('cmp.table.supplierWrote', { text })}>
      <span tabIndex={0} className="cmp-traced">{children}</span>
    </Tip>
  )
}
