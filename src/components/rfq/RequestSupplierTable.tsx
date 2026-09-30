import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { SupplierRead } from '../../types/rfq'
import type { QuoteListItem } from '../../types/quote'
import type { ComparisonRow } from '../../types/comparison'
import type { InboundMessageRead } from '../../types/inbound'
import { useEnumLabels } from '../../i18n/labels'
import { useFormat } from '../../lib/format'
import { normalizeSupplierStage } from '../../lib/supplierStages'
import { Empty } from '../ds'
import { useUnitLabel } from '../../lib/units'

const CLOSABLE = new Set([
  'not_contacted',
  'awaiting_response',
  'buyer_action_required',
  'partial_response',
  'quote_received',
  'pending',
  'requested',
  'quoted',
])

interface Props {
  suppliers: SupplierRead[]
  quotes: QuoteListItem[]
  comparisonRows?: ComparisonRow[]
  inbound: InboundMessageRead[]
  onCloseSupplier?: (supplierId: string) => void
  isClosingId?: string | null
}

export default function RequestSupplierTable({
  suppliers,
  quotes,
  comparisonRows = [],
  inbound,
  onCloseSupplier,
  isClosingId,
}: Props) {
  const { t } = useTranslation('rfq')
  const labels = useEnumLabels()
  const fmt = useFormat()
  const units = useUnitLabel()
  const [openId, setOpenId] = useState<string | null>(null)

  if (suppliers.length === 0) {
    return (
      <Empty
        icon="apartment"
        title={t('suppliers.emptyTitle')}
        description={t('suppliers.emptyDescription')}
      />
    )
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table qt-table rd-suppliers">
        <thead>
          <tr>
            <th>{t('detail.supplierTable.supplier')}</th>
            <th>{t('detail.supplierTable.stage')}</th>
            <th>{t('detail.supplierTable.latest')}</th>
            <th style={{ textAlign: 'right' }}>{t('detail.supplierTable.price')}</th>
          </tr>
        </thead>
        <tbody>
          {suppliers.map(supplier => {
            const stage = normalizeSupplierStage(supplier.status)
            const quote = quotes.find(item => item.supplier_id === supplier.id)
            const priced = comparisonRows.find(row => row.supplier_id === supplier.id && row.raw_price != null)
            const latest = inbound
              .filter(message => message.supplier_id === supplier.id)
              .sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime())[0]
            const open = openId === supplier.id
            const latestText = latest
              ? (latest.subject || latest.body_text.replace(/\s+/g, ' ').trim())
              : ''
            const price = priced
              ? [priced.raw_currency, fmt.number(priced.raw_price!), priced.raw_unit ? `/ ${units.per(priced.raw_unit)}` : ''].filter(Boolean).join(' ')
              : null
            return (
              <Fragment key={supplier.id}>
                <tr
                  className={open ? 'is-open' : undefined}
                  onClick={() => setOpenId(open ? null : supplier.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div className="ds-request-name">{supplier.name}</div>
                    <div className="ds-request-meta">{supplier.email}</div>
                  </td>
                  <td>
                    <span className={stage === 'buyer_action_required' ? 'ds-pill ds-pill-warn' : stage === 'quote_received' || stage === 'partial_response' ? 'ds-pill' : 'ds-pill ds-pill-muted'}>
                      {labels.supplierStatus(stage)}
                    </span>
                  </td>
                  <td>
                    {latest ? (
                      <div className="rd-latest" title={latestText}>
                        <div className="rd-latest-text">{latestText}</div>
                        <div className="ds-meta">{fmt.date(latest.received_at, { day: 'numeric', month: 'short' })}</div>
                      </div>
                    ) : supplier.requested_at ? (
                      <div className="rd-latest">
                        <div>{t('detail.supplierTable.sent')}</div>
                        <div className="ds-meta">{fmt.date(supplier.requested_at, { day: 'numeric', month: 'short' })}</div>
                      </div>
                    ) : (
                      <span className="ds-muted">—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {price ?? (quote ? <span className="ds-muted">{t('detail.supplierTable.noPrice')}</span> : <span className="ds-muted">—</span>)}
                  </td>
                </tr>
                {open && (
                  <tr className="is-open">
                    <td colSpan={4}>
                      {latest?.body_text && <p className="ds-meta" style={{ maxWidth: '68ch' }}>{latest.body_text.slice(0, 280)}</p>}
                      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                        {quote && (
                          <Link to={`/quotes/${quote.id}`} className="ds-link" onClick={event => event.stopPropagation()}>
                            {t('detail.supplierTable.quotation')}
                          </Link>
                        )}
                        {onCloseSupplier && CLOSABLE.has(supplier.status) && (
                          <button
                            type="button"
                            className="ds-btn ds-btn-text"
                            disabled={isClosingId === supplier.id}
                            onClick={event => {
                              event.stopPropagation()
                              onCloseSupplier(supplier.id)
                            }}
                          >
                            {t('detail.supplierTable.close')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
