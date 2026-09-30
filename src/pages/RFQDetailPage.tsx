import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/ds'
import { useAuth } from '../hooks/useAuth'
import { useRFQ, useAddSupplier, useAddSupplierFromDirectory, useSendRequests, useInbound, useCloseSupplier, useBuyerActions, useResolveBuyerAction } from '../hooks/useRFQs'
import BuyerActionsPanel from '../components/rfq/BuyerActionsPanel'
import CommercialRequestDetail from '../components/requestDetail/CommercialRequestDetail'
import { useSupplierDirectory } from '../hooks/useSupplierDirectory'
import { useQuotes, useCreateQuote } from '../hooks/useQuotes'
import { useComparison, useDecision } from '../hooks/useComparison'
import SupplierList from '../components/rfq/SupplierList'
import SupplierStageChips from '../components/rfq/SupplierStageChips'
import { summarizeSupplierStages } from '../lib/supplierStages'
import AddSupplierForm from '../components/rfq/AddSupplierForm'
import AddSupplierFromDirectory from '../components/rfq/AddSupplierFromDirectory'
import PackagingSpecSummary from '../components/rfq/PackagingSpecSummary'
import RFQV3Summary from '../components/rfq/RFQV3Summary'
import CorrugatedSpecSummary from '../components/rfq/corrugated/CorrugatedSpecSummary'
import SendButton from '../components/rfq/SendButton'
import InboundList from '../components/rfq/InboundList'
import ComparisonPreview from '../components/comparison/ComparisonPreview'
import QuoteList from '../components/quotes/QuoteList'
import QuoteUploadForm from '../components/quotes/QuoteUploadForm'
import type { SupplierCreate } from '../types/rfq'
import { useTranslation } from 'react-i18next'
import { useEnumLabels } from '../i18n/labels'
import { useFormat } from '../lib/format'
import { useUnreadCount } from '../hooks/useInboundStream'
import { Alert, Badge, Button, Card, Dialog, EmptyState, ErrorState, PageSkeleton, ProgressBar, StatusBadge, toast } from '../components/ui'

export default function RFQDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t, i18n } = useTranslation('rfq')
  const labels = useEnumLabels()
  const fmt = useFormat()
  const { data: rfq, isLoading, error } = useRFQ(id!)
  const addSupplier = useAddSupplier(id!)
  const addSupplierFromDirectory = useAddSupplierFromDirectory(id!)
  const sendRequests = useSendRequests(id!)
  const closeSupplier = useCloseSupplier(id!)
  const { data: buyerActions } = useBuyerActions(id!)
  const resolveBuyerAction = useResolveBuyerAction(id!)
  const { data: inbound, isLoading: inboundLoading } = useInbound(id!)
  const { data: unread } = useUnreadCount()
  const { data: directorySuppliers, isLoading: directoryLoading } = useSupplierDirectory()
  const { data: quotes, isLoading: quotesLoading } = useQuotes(id!)
  const createQuote = useCreateQuote(id!)
  const { user } = useAuth()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'suppliers' | 'inbox' | 'quotes'>('overview')
  const [showAddSupplier, setShowAddSupplier] = useState(false)

  const suppliers = rfq?.suppliers ?? []
  const supplierStageCounts = useMemo(
    () => summarizeSupplierStages(suppliers),
    [suppliers],
  )
  const pendingCount = suppliers.filter(s => s.status === 'not_contacted' || s.status === 'pending').length
  const responseCount = quotes?.length ?? rfq?.response_count ?? 0
  const confirmedQuotes = quotes?.filter(q => q.status === 'confirmed').length ?? 0
  const draftQuotes = quotes?.filter(q => q.status === 'draft').length ?? 0
  const progress = suppliers.length ? (confirmedQuotes / suppliers.length) * 100 : 0
  const attentionMessages = inbound?.filter(message => message.status === 'unmatched' || message.status === 'error').length ?? 0
  const unreadMessages = id ? unread?.by_rfq[id] ?? 0 : 0
  // Show the comparison preview as soon as there is a confirmed quote; runners-up and spread only appear with 2+.
  const comparisonLocale = i18n.resolvedLanguage === 'es' ? 'es' : 'en'
  const { data: comparison } = useComparison(id!, comparisonLocale, confirmedQuotes >= 1)
  const { data: decision } = useDecision(id!)
  const nextStep = useMemo(() => {
    if (!rfq) return { tone: 'info' as const, title: t('detail.next.loading'), text: '' }
    if (draftQuotes > 0) return { tone: 'warning' as const, title: t('detail.next.quotesNeedReview', { count: draftQuotes }), text: t('detail.next.quotesNeedReviewText') }
    if ((rfq.suppliers ?? []).length === 0) return { tone: 'warning' as const, title: t('detail.next.addSuppliers'), text: t('detail.next.addSuppliersText') }
    if (pendingCount > 0) return { tone: 'info' as const, title: t('detail.next.suppliersPending', { count: pendingCount }), text: t('detail.next.suppliersPendingText') }
    if (confirmedQuotes > 0) return { tone: 'success' as const, title: t('detail.next.readyToCompare'), text: t('detail.next.readyToCompareText') }
    return { tone: 'info' as const, title: t('detail.next.waitingReplies'), text: t('detail.next.waitingRepliesText') }
  }, [rfq, confirmedQuotes, draftQuotes, pendingCount, t])

  if (isLoading) return <div className="page page-wide"><PageSkeleton /></div>
  if (error || !rfq) return <div className="page page-wide"><ErrorState title={t('detail.notFoundTitle')} message={t('detail.notFoundMessage')} /></div>

  const copyEmail = () => {
    navigator.clipboard.writeText(rfq.email_address)
    setCopied(true)
    toast(t('detail.emailCopied'))
    setTimeout(() => setCopied(false), 1500)
  }

  const handleAddSupplier = (data: SupplierCreate) => {
    addSupplier.mutate(data, { onSuccess: () => toast(t('detail.supplierAdded')) })
  }

  if (rfq.request_kind === 'commercial') {
    return (
      <CommercialRequestDetail
        rfq={rfq}
        openAsks={(buyerActions ?? []).filter(action => action.status === 'open')}
        buyerActions={buyerActions ?? []}
        resolvingId={resolveBuyerAction.isPending ? resolveBuyerAction.variables ?? null : null}
        onResolve={(actionId) => {
          resolveBuyerAction.mutate(actionId, {
            onSuccess: () => toast(t('buyerActions.resolvedToast')),
          })
        }}
        suppliers={suppliers}
        pendingCount={pendingCount}
        confirmedQuotes={confirmedQuotes}
        draftQuotes={draftQuotes}
        googleConnected={!!user?.google_connected}
        outlookConnected={!!user?.outlook_connected}
        sendPending={sendRequests.isPending}
        sendError={sendRequests.error}
        sendResult={sendRequests.data}
        onSend={() => sendRequests.mutate()}
        onCloseSupplier={(supplierId) => {
          closeSupplier.mutate(supplierId, { onSuccess: () => toast(t('suppliers.closedToast')) })
        }}
        closingSupplierId={closeSupplier.isPending ? closeSupplier.variables ?? null : null}
        showAddSupplier={showAddSupplier}
        setShowAddSupplier={setShowAddSupplier}
        directorySuppliers={directorySuppliers ?? []}
        directoryLoading={directoryLoading}
        addFromDirectoryPending={addSupplierFromDirectory.isPending}
        addFromDirectoryError={addSupplierFromDirectory.error}
        onAddFromDirectory={(supplierCompanyId) => addSupplierFromDirectory.mutate(supplierCompanyId)}
        onAddSupplier={handleAddSupplier}
        addSupplierPending={addSupplier.isPending}
        addSupplierError={addSupplier.error}
        inbound={inbound ?? []}
        inboundLoading={inboundLoading}
        unreadMessages={unreadMessages}
        quotes={quotes ?? []}
        quotesLoading={quotesLoading}
        showUpload={showUpload}
        setShowUpload={setShowUpload}
        onCreateQuote={(data) => {
          createQuote.mutate(data, {
            onSuccess: (quote) => {
              setShowUpload(false)
              navigate(`/quotes/${quote.id}`)
            },
          })
        }}
        createQuotePending={createQuote.isPending}
        createQuoteError={createQuote.error}
        comparison={comparison}
        decision={decision}
        copied={copied}
        onCopyEmail={copyEmail}
      />
    )
  }

  return (
    <div className="page page-wide">
      <div className="mb-5 flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link to="/">{t('detail.breadcrumbRfqs')}</Link>
        <span>›</span>
        <span className="text-[var(--text-primary)]">{rfq.name}</span>
      </div>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/requests" className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--text-secondary)]"><Icon name="arrow_back" size={16} /> {t('detail.back')}</Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="qy-heading text-2xl font-bold">{rfq.name}</h1>
            <StatusBadge status={rfq.status} label={labels.rfqStatus(rfq.status)} />
          </div>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {rfq.header_data?.rfq_number || `RFQ-${rfq.id.slice(0, 8)}`}
            {' · '}
            {fmt.number(rfq.quantity)}{' '}
            {rfq.base_unit}
            {rfq.delivery_point ? ` · ${rfq.delivery_point}` : ''}
          </p>
        </div>
      </div>

      <Alert tone={nextStep.tone} title={nextStep.title}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>{nextStep.text}</span>
          {draftQuotes > 0 && <button type="button" onClick={() => setActiveTab('quotes')} className="btn btn-secondary">{t('detail.reviewQuotes')}</button>}
        </div>
      </Alert>

      <div className="tabs mt-6">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')} type="button"><Icon name="description" size={17} /> {t('detail.tabs.overview')}</button>
        <button className={`tab ${activeTab === 'suppliers' ? 'active' : ''}`} onClick={() => setActiveTab('suppliers')} type="button"><Icon name="group" size={17} /> {t('detail.tabs.suppliers')} <Badge>{suppliers.length}</Badge></button>
        <button className={`tab ${activeTab === 'inbox' ? 'active' : ''}`} onClick={() => setActiveTab('inbox')} type="button">
          <Icon name="inbox" size={17} /> {t('detail.tabs.inbox')} {unreadMessages > 0 && <Badge tone="brand">{unreadMessages}</Badge>} {attentionMessages > 0 && <Badge tone="warning">{attentionMessages}</Badge>}
        </button>
        <button className={`tab ${activeTab === 'quotes' ? 'active' : ''}`} onClick={() => setActiveTab('quotes')} type="button"><Icon name="inventory" size={17} /> {t('detail.tabs.quotes')} <Badge>{quotes?.length ?? 0}</Badge></button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid-2 mt-5">
          <div className="grid gap-4">
            {comparison && (
              <ComparisonPreview
                rfqId={id!}
                rows={comparison.rows}
                ranking={comparison.ranking}
                baseCurrency={comparison.base_currency}
                baseUnit={comparison.base_unit}
                rfqQuantity={rfq.quantity}
                decision={decision}
              />
            )}
            <Card className="card-pad">
              <h2 className="qy-heading font-semibold">{t('detail.request')}</h2>
                  <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{rfq.description}</p>
                  <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                    <div><dt className="text-[var(--text-muted)]">{t('detail.quantity')}</dt><dd>{fmt.number(rfq.quantity)} {rfq.base_unit}</dd></div>
                    <div><dt className="text-[var(--text-muted)]">{t('detail.baseCurrency')}</dt><dd>{rfq.base_currency}</dd></div>
                    <div><dt className="text-[var(--text-muted)]">{t('detail.deliveryPoint')}</dt><dd>{rfq.delivery_point}</dd></div>
                    <div><dt className="text-[var(--text-muted)]">{t('detail.responseDeadline')}</dt><dd>{rfq.response_deadline}</dd></div>
                  </dl>
            </Card>
            {rfq.corrugated_spec ? (
              <>
                <CorrugatedSpecSummary spec={rfq.corrugated_spec} volumeTiers={rfq.volume_tiers} />
                <RFQV3Summary
                  header={rfq.header_data}
                  lineItems={undefined}
                  incoterms={rfq.incoterms}
                  attachments={rfq.attachments}
                  checklist={rfq.response_checklist}
                />
              </>
            ) : (
              <>
                <RFQV3Summary
                  header={rfq.header_data}
                  lineItems={rfq.line_items}
                  incoterms={rfq.incoterms}
                  attachments={rfq.attachments}
                  checklist={rfq.response_checklist}
                />
                <PackagingSpecSummary spec={rfq.specification} />
              </>
            )}
          </div>          <aside className="right-rail">
            <Card className="card-pad">
              <h3 className="qy-heading font-semibold">{t('detail.progress.title')}</h3>
              <SupplierStageChips counts={supplierStageCounts} />
              <div className="mt-5 grid grid-cols-2 gap-5 text-sm">
                <div><div className="text-[var(--text-muted)]">{t('detail.progress.suppliers')}</div><div className="tnum mt-1 text-2xl font-semibold">{suppliers.length}</div></div>
                <div><div className="text-[var(--text-muted)]">{t('detail.progress.responses')}</div><div className="tnum mt-1 text-2xl font-semibold text-[var(--brand)]">{responseCount}</div></div>
                <div><div className="text-[var(--text-muted)]">{t('detail.progress.confirmed')}</div><div className="tnum mt-1 text-2xl font-semibold text-green-500">{confirmedQuotes}</div></div>
                <div><div className="text-[var(--text-muted)]">{t('detail.progress.toReview')}</div><div className="tnum mt-1 text-2xl font-semibold text-amber-500">{draftQuotes}</div></div>
              </div>
              <div className="mt-5"><ProgressBar value={progress} /></div>
            </Card>
            {buyerActions && buyerActions.length > 0 && (
              <BuyerActionsPanel
                actions={buyerActions}
                rfq={rfq}
                resolvingId={resolveBuyerAction.isPending ? resolveBuyerAction.variables : null}
                onResolve={(actionId) => {
                  resolveBuyerAction.mutate(actionId, {
                    onSuccess: () => toast(t('buyerActions.resolvedToast')),
                  })
                }}
              />
            )}
            <Card className="card-pad">
              <h3 className="qy-heading font-semibold">{t('detail.inboxAddress.title')}</h3>
              {t('detail.inboxAddress.description') ? <p className="mt-2 text-sm text-[var(--text-secondary)]">{t('detail.inboxAddress.description')}</p> : null}
              <button onClick={copyEmail} type="button" className="input mt-3 flex items-center justify-between text-left">
                <span className="truncate">{rfq.email_address}</span>
                <Icon name="content_copy" size={16} />
              </button>
              {copied && <p className="mt-2 text-sm text-[var(--success-text)]">{t('detail.inboxAddress.copied')}</p>}
            </Card>
            <Card className="card-pad">
              <h3 className="qy-heading flex items-center gap-2 font-semibold"><Icon name="send" size={16} /> {t('detail.whatSuppliers.title')}</h3>
                <ul className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)]">
                  <li>{rfq.header_data?.rfq_number ? t('detail.whatSuppliers.rfqNumber', { number: rfq.header_data.rfq_number }) : t('detail.whatSuppliers.headerDetails')}</li>
                  <li>{rfq.incoterms?.rule || t('detail.whatSuppliers.deliveryTerms')}{rfq.incoterms?.named_place ? ` — ${rfq.incoterms.named_place}` : ''}</li>
                  <li>{t('detail.whatSuppliers.lineItems', { count: rfq.line_items?.length ?? 0 })}</li>
                  <li>{t('detail.whatSuppliers.attachments', { count: rfq.attachments?.length ?? 0 })}</li>
                  <li>{t('detail.whatSuppliers.requiredFields', { count: rfq.response_checklist?.required_fields?.length ?? 0 })}</li>
                </ul>
            </Card>
          </aside>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <Card className="card-pad mt-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="qy-heading font-semibold">{t('detail.suppliersHeading', { count: suppliers.length })}</h2>
              <SupplierStageChips counts={supplierStageCounts} />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowAddSupplier(true)}><Icon name="person_add" size={16} /> {t('detail.addSuppliers')}</Button>
              <SendButton pendingCount={pendingCount} googleConnected={!!user?.google_connected} outlookConnected={!!user?.outlook_connected} isPending={sendRequests.isPending} error={sendRequests.error} result={sendRequests.data} onSend={() => sendRequests.mutate()} />
            </div>
          </div>
          <SupplierList
            suppliers={suppliers}
            onCloseSupplier={(supplierId) => {
              closeSupplier.mutate(supplierId, { onSuccess: () => toast(t('suppliers.closedToast')) })
            }}
            isClosingId={closeSupplier.isPending ? closeSupplier.variables : null}
          />
          <Dialog open={showAddSupplier} onClose={() => setShowAddSupplier(false)} title={t('detail.addSupplierDialog')}>
            <div className="grid gap-5">
              <AddSupplierFromDirectory suppliers={directorySuppliers ?? []} isLoading={directoryLoading} isPending={addSupplierFromDirectory.isPending} onAdd={(supplierCompanyId) => addSupplierFromDirectory.mutate(supplierCompanyId)} />
              <hr className="border-[var(--border-subtle)]" />
              <AddSupplierForm onSubmit={handleAddSupplier} isPending={addSupplier.isPending} error={addSupplier.error} />
              {addSupplierFromDirectory.error && <Alert tone="error">{t('detail.directoryAddError')}</Alert>}
            </div>
          </Dialog>
        </Card>
      )}

      {activeTab === 'inbox' && (
        <Card className="card-pad mt-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="qy-heading font-semibold">{t('detail.inboxHeading')}</h2>
          </div>
          {inboundLoading ? <p className="text-sm text-[var(--text-muted)]">{t('detail.loadingInbound')}</p> : <InboundList messages={inbound ?? []} rfqId={id!} suppliers={suppliers} />}
        </Card>
      )}

      {activeTab === 'quotes' && (
        <Card className="card-pad mt-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="qy-heading font-semibold">{t('detail.quotesHeading', { count: quotes?.length ?? 0 })}</h2>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowUpload(!showUpload)}>{showUpload ? t('common:actions.cancel') : t('detail.addQuoteManually')}</Button>
              <Link to={`/rfqs/${id}/comparison`} className="btn btn-primary">{t('detail.compare')}</Link>
            </div>
          </div>
          {draftQuotes > 0 && <Alert tone="warning" className="mb-4">{t('detail.draftWarning')}</Alert>}
          {showUpload && (
            <div className="mb-4">
              <QuoteUploadForm
                suppliers={suppliers}
                onSubmit={(data) => {
                  createQuote.mutate(data, {
                    onSuccess: (quote) => {
                      setShowUpload(false)
                      navigate(`/quotes/${quote.id}`)
                    },
                  })
                }}
                isPending={createQuote.isPending}
                error={createQuote.error}
              />
            </div>
          )}
          {quotes && quotes.length > 0 ? <QuoteList quotes={quotes} baseCurrency={rfq.base_currency} /> : <EmptyState title={t('detail.noQuotesTitle')} description={t('detail.noQuotesDescription')} />}
        </Card>
      )}
    </div>
  )
}
