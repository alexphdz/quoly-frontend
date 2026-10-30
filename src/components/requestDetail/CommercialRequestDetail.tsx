import { useEffect } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { RFQDetail, SendRequestsResponse, SupplierCreate, SupplierRead } from '../../types/rfq'
import type { BuyerActionRead } from '../../types/buyerAction'
import type { InboundMessageRead } from '../../types/inbound'
import type { QuoteListItem } from '../../types/quote'
import type { ComparisonResponse, DecisionRead } from '../../types/comparison'
import type { SupplierCompanyRead } from '../../types/supplierDirectory'
import { Breadcrumbs, Button, RfqHeader, Tabs } from '../../design-system'
import { useShellLayout } from '../layout/useShellLayout'
import { useElementWidth } from '../../design-system/hooks'
import { Btn, Empty, SectionCard } from '../ds'
import { Alert } from '../ui'
import InboundList from '../rfq/InboundList'
import ComparisonPreview from '../comparison/ComparisonPreview'
import QuoteList from '../quotes/QuoteList'
import QuoteUploadForm from '../quotes/QuoteUploadForm'
import SupplierQuestions from './SupplierQuestions'
import OverviewTab from './OverviewTab'
import SuppliersTab from './SuppliersTab'
import RequestPanel from './RequestPanel'
import { headerStatus } from './stages'

export type DetailTab = 'overview' | 'suppliers' | 'replies' | 'quotations' | 'comparison'
const TABS: DetailTab[] = ['overview', 'suppliers', 'replies', 'quotations', 'comparison']

export interface CommercialRequestDetailProps {
  rfq: RFQDetail
  openAsks: BuyerActionRead[]
  buyerActions: BuyerActionRead[]
  resolvingId: string | null
  onResolve: (id: string) => void
  suppliers: SupplierRead[]
  pendingCount: number
  confirmedQuotes: number
  draftQuotes: number
  googleConnected: boolean
  outlookConnected?: boolean
  sendPending: boolean
  sendError: Error | null
  sendResult?: SendRequestsResponse
  onSend: () => void
  onCloseSupplier: (supplierId: string) => void
  closingSupplierId: string | null
  showAddSupplier: boolean
  setShowAddSupplier: (open: boolean) => void
  directorySuppliers: SupplierCompanyRead[]
  directoryLoading: boolean
  addFromDirectoryPending: boolean
  addFromDirectoryError: Error | null
  onAddFromDirectory: (supplierCompanyId: string) => void
  onAddSupplier: (data: SupplierCreate) => void
  addSupplierPending: boolean
  addSupplierError: Error | null
  inbound: InboundMessageRead[]
  inboundLoading: boolean
  unreadMessages: number
  quotes: QuoteListItem[]
  quotesLoading: boolean
  showUpload: boolean
  setShowUpload: (open: boolean) => void
  onCreateQuote: (data: { supplierId: string; file?: File | null; rawText?: string | null }) => void
  createQuotePending: boolean
  createQuoteError: Error | null
  comparison?: ComparisonResponse
  decision?: DecisionRead | null
  copied: boolean
  onCopyEmail: () => void
}

export default function CommercialRequestDetail(props: CommercialRequestDetailProps) {
  const { rfq, quotes, comparison, decision, confirmedQuotes } = props
  const { t } = useTranslation('rfq')
  const navigate = useNavigate()
  const location = useLocation()
  const layout = useShellLayout()
  const [bodyRef, bodyW] = useElementWidth<HTMLDivElement>(1200)
  const [params, setParams] = useSearchParams()
  const requested = params.get('tab') as DetailTab | null
  const tab: DetailTab = requested && TABS.includes(requested) ? requested : 'overview'
  const setTab = (next: DetailTab, hash?: string) => {
    setParams(next === 'overview' ? {} : { tab: next }, { replace: true })
    if (hash) window.setTimeout(() => document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }
  const head = headerStatus(rfq)
  const stacked = bodyW < 900

  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash, props.openAsks.length, tab])

  const action = head.key === 'draft'
    ? <Button icon="pencil-simple" onClick={() => navigate(`/rfqs/${rfq.id}/edit`)}>{t('detalle.editRequest')}</Button>
    : decision
      ? <Button variant="secondary" icon="columns" onClick={() => navigate(`/rfqs/${rfq.id}/comparison`)}>{t('detalle.viewComparison')}</Button>
      : undefined

  return (
    <div className={`rd2-page is-${layout}`}>
      <Breadcrumbs items={[{ label: t('detail.breadcrumbRfqs'), to: '/requests' }, { label: rfq.name }]} />
      <RfqHeader
        className="rd2-header"
        title={rfq.name}
        reference={rfq.internal_reference ?? undefined}
        status={head.status}
        statusLabel={t(`solicitudes.status.${head.key}`)}
        action={action}
      />

      <div className="rd2-tabs">
        <Tabs<DetailTab>
          label={t('detail.tabsLabel')}
          idPrefix="rd2"
          value={tab}
          onChange={next => setTab(next)}
          items={TABS.map(value => ({ value, label: t(`detalle.tabs.${value}`) }))}
        />
      </div>

      <div ref={bodyRef} className={`rd2-body${stacked ? ' is-stacked' : ''}`}>
        <div className="rd2-main" role="tabpanel" id={`rd2-panel-${tab}`} aria-labelledby={`rd2-tab-${tab}`}>
          {tab === 'overview' && <OverviewTab {...props} onTab={setTab} />}
          {tab === 'suppliers' && <SuppliersTab {...props} onTab={setTab} />}
          {tab === 'replies' && (
            <>
              <SupplierQuestions rfq={rfq} actions={props.buyerActions} suppliers={props.suppliers} quotes={quotes} inbound={props.inbound} />
              <SectionCard icon="drafts" title={t('detail.tabs.inbox')} flush={props.inbound.length === 0}>
                {props.inboundLoading
                  ? <p className="ds-meta">{t('detail.loadingInbound')}</p>
                  : props.inbound.length === 0
                    ? <Empty icon="mail" title={t('detail.replies.emptyTitle')} />
                    : <InboundList messages={props.inbound} rfqId={rfq.id} suppliers={props.suppliers} />}
              </SectionCard>
            </>
          )}
          {tab === 'quotations' && (
            <SectionCard
              icon="receipt_long"
              title={t('detail.quotesHeading', { count: quotes.length })}
              actions={(
                <Btn size="sm" variant="secondary" icon={props.showUpload ? undefined : 'upload'} onClick={() => props.setShowUpload(!props.showUpload)}>
                  {props.showUpload ? t('common:actions.cancel') : t('detail.addQuoteManually')}
                </Btn>
              )}
            >
              {props.draftQuotes > 0 && <Alert tone="warning" className="mb-4">{t('detail.draftWarning')}</Alert>}
              {props.showUpload && (
                <div className="mb-4">
                  <QuoteUploadForm suppliers={props.suppliers} onSubmit={props.onCreateQuote} isPending={props.createQuotePending} error={props.createQuoteError} />
                </div>
              )}
              {props.quotesLoading
                ? <p className="ds-meta">{t('detail.loadingQuotes')}</p>
                : quotes.length > 0
                  ? <QuoteList quotes={quotes} baseCurrency={rfq.base_currency} />
                  : <Empty icon="description" title={t('detail.noQuotesTitle')} description={t('detail.noQuotesDescription')} />}
            </SectionCard>
          )}
          {tab === 'comparison' && (
            <SectionCard
              icon="balance"
              title={t('detail.tabs.comparison')}
              actions={<Btn variant="primary" size="sm" icon="balance" disabled={confirmedQuotes === 0} disabledReason={t('detail.comparisonEmptyDescription')} onClick={() => navigate(`/rfqs/${rfq.id}/comparison`)}>{t('detail.next2.compareChoose')}</Btn>}
            >
              {comparison && comparison.rows.length > 0 ? (
                <ComparisonPreview
                  rfqId={rfq.id}
                  rows={comparison.rows}
                  ranking={comparison.ranking}
                  baseCurrency={comparison.base_currency}
                  baseUnit={comparison.base_unit}
                  rfqQuantity={rfq.quantity}
                  decision={decision}
                />
              ) : (
                <Empty icon="balance" title={t('detail.comparisonEmptyTitle')} description={t('detail.comparisonEmptyDescription')} />
              )}
            </SectionCard>
          )}
        </div>
        <RequestPanel rfq={rfq} stacked={stacked} mobile={layout === 'mobile'} copied={props.copied} onCopyEmail={props.onCopyEmail} />
      </div>
    </div>
  )
}
