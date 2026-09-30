import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { RFQDetail, SendRequestsResponse, SupplierCreate, SupplierRead } from '../../types/rfq'
import type { BuyerActionRead } from '../../types/buyerAction'
import type { InboundMessageRead } from '../../types/inbound'
import type { QuoteListItem } from '../../types/quote'
import type { ComparisonResponse, ComparisonRow, DecisionRead } from '../../types/comparison'
import type { SupplierCompanyRead } from '../../types/supplierDirectory'
import { useFormat } from '../../lib/format'
import { deadlineDays, journeyIndex } from '../../lib/rfqDisplay'
import { referenceSpecificationAttachments } from '../../lib/specScenario'
import { Breadcrumbs, Btn, Chip, Empty, Icon, IconBtn, KeyFacts, Money, SectionCard, Tabs, type Fact } from '../ds'
import { RequestStatusChip, SupplierStatusChip } from '../ds/StatusChips'
import { Alert, ProgressBar } from '../ui'
import AddSupplierForm from '../rfq/AddSupplierForm'
import AddSupplierFromDirectory from '../rfq/AddSupplierFromDirectory'
import SendButton from '../rfq/SendButton'
import InboundList from '../rfq/InboundList'
import RequestSupplierTable from '../rfq/RequestSupplierTable'
import ReferenceSpecManager from '../rfq/ReferenceSpecManager'
import SpecScenarioBadge from '../rfq/SpecScenarioBadge'
import ComparisonPreview from '../comparison/ComparisonPreview'
import QuoteList from '../quotes/QuoteList'
import QuoteUploadForm from '../quotes/QuoteUploadForm'
import SupplierQuestions from './SupplierQuestions'
import { useRelativeDays } from '../rfq/RequestsLedgerTable'

type DetailTab = 'overview' | 'suppliers' | 'replies' | 'quotations' | 'comparison'
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

function rankedRows(comparison?: ComparisonResponse): ComparisonRow[] {
  if (!comparison) return []
  const byId = new Map(comparison.rows.map(row => [row.quote_id, row]))
  const ranked = comparison.ranking.map(id => byId.get(id)).filter((row): row is ComparisonRow => !!row)
  return ranked.length > 0 ? ranked : comparison.rows
}

const comparablePrice = (row: ComparisonRow) => row.all_in_price ?? row.normalized_price

export default function CommercialRequestDetail(props: CommercialRequestDetailProps) {
  const { rfq, suppliers, quotes, openAsks, comparison, decision, confirmedQuotes, draftQuotes, pendingCount } = props
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const relative = useRelativeDays()
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const requested = params.get('tab') as DetailTab | null
  const tab: DetailTab = requested && TABS.includes(requested) ? requested : 'overview'
  const setTab = (next: DetailTab) => setParams(next === 'overview' ? {} : { tab: next }, { replace: true })

  const unit = t(`commercial.units.${rfq.base_unit}`, { defaultValue: rfq.base_unit })
  const rfqNumber = rfq.header_data?.rfq_number || `RFQ-${rfq.id.slice(0, 8).toUpperCase()}`
  const ranked = rankedRows(comparison)
  const leader = decision ? ranked.find(row => row.quote_id === decision.quote_id) ?? ranked[0] : ranked[0]
  const awardedName = decision ? leader?.supplier_name ?? suppliers.find(s => s.id === decision.supplier_id)?.name : null
  const nextDraftQuote = [...quotes].filter(q => q.status === 'draft').sort((a, b) => a.created_at.localeCompare(b.created_at))[0]
  const responded = suppliers.filter(s => ['quote_received', 'quoted', 'partial_response', 'buyer_action_required', 'declined'].includes(s.status)).length

  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(location.hash.slice(1))
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash, openAsks.length])

  const next = (() => {
    if (rfq.status === 'draft') {
      return { text: t('detail.next2.draft'), action: <Link to={`/rfqs/${rfq.id}/edit`} className="ds-btn ds-btn-primary ds-btn-md"><Icon name="edit" size={16} />{t('commercial.continueDraft')}</Link> }
    }
    if (decision) {
      return { text: t('detail.next2.decided', { name: awardedName ?? '' }), action: <Btn variant="secondary" icon="emoji_events" onClick={() => navigate(`/rfqs/${rfq.id}/comparison`)}>{t('detail.next2.viewDecision')}</Btn> }
    }
    if (openAsks.length > 0) {
      return { text: t('detail.next2.asks', { count: openAsks.length }), action: <Btn variant="primary" icon="chat" onClick={() => { setTab('overview'); document.getElementById('needs-answer')?.scrollIntoView({ behavior: 'smooth' }) }}>{t('detail.next2.answer')}</Btn> }
    }
    if (nextDraftQuote) {
      return { text: t('detail.next.quotesNeedReview', { count: draftQuotes }), action: <Btn variant="primary" icon="visibility" onClick={() => navigate(`/quotes/${nextDraftQuote.id}`)}>{t('detail.next2.review')}</Btn> }
    }
    if (suppliers.length === 0) {
      return { text: t('detail.next.addSuppliersText'), action: <Btn variant="primary" icon="add" onClick={() => setTab('suppliers')}>{t('detail.addSuppliers')}</Btn> }
    }
    if (pendingCount > 0) {
      return { text: t('detail.next.suppliersPending', { count: pendingCount }), action: <Btn variant="primary" icon="send" onClick={() => setTab('suppliers')}>{t('detail.next2.send')}</Btn> }
    }
    if (confirmedQuotes > 0) {
      return { text: t('detail.next2.compare', { count: confirmedQuotes }), action: <Btn variant="primary" icon="balance" onClick={() => navigate(`/rfqs/${rfq.id}/comparison`)}>{t('detail.next2.compareChoose')}</Btn> }
    }
    return { text: t('detail.next.waitingReplies'), action: <Btn variant="secondary" icon="upload" onClick={() => { setTab('quotations'); props.setShowUpload(true) }}>{t('detail.addQuoteManually')}</Btn> }
  })()

  const days = deadlineDays(rfq.response_deadline)
  const facts: Fact[] = [
    { icon: 'inventory_2', label: t('commercial.quantity'), value: <span className="qy-num">{fmt.number(rfq.quantity)} <span className="qt-unit">{unit}</span></span> },
    {
      icon: 'calendar_today',
      label: t('detail.responseDeadline'),
      value: days == null || !rfq.response_deadline
        ? <span className="rd-soft">{t('detail.facts.noDeadline')}</span>
        : <span className={days < 0 && rfq.status === 'open' ? 'rq-overdue' : undefined}>{days < 0 && rfq.status === 'open' ? t('dashboard.deadline.overdue', { count: -days }) : relative(days)}</span>,
      title: rfq.response_deadline ? fmt.date(rfq.response_deadline, { dateStyle: 'long' }) : undefined,
    },
    { icon: 'payments', label: t('detail.baseCurrency'), value: rfq.base_currency || t('commercial.notSet') },
    { icon: 'group', label: t('detail.tabs.suppliers'), value: suppliers.length === 0 ? <span className="rd-soft">{t('detail.facts.noSuppliers')}</span> : t('detail.facts.responded', { received: responded, total: suppliers.length }) },
    {
      icon: 'emoji_events',
      label: decision ? t('detail.facts.awarded') : t('detail.facts.leader'),
      value: leader && comparablePrice(leader) != null
        ? <span className="rd-leader"><span className="truncate">{leader.supplier_name}</span><Money value={comparablePrice(leader)} currency={comparison?.base_currency} digits="unit" /></span>
        : <span className="rd-soft">{t('detail.facts.noQuotes')}</span>,
      title: leader && comparablePrice(leader) != null
        ? leader.supplier_name
        : t('detail.facts.noQuotes'),
    },
  ]

  const tabs = [
    { id: 'overview' as const, label: t('detail.tabs.overview'), icon: 'home' },
    { id: 'suppliers' as const, label: t('detail.tabs.suppliers'), icon: 'apartment', count: suppliers.length },
    { id: 'replies' as const, label: t('detail.tabs.inbox'), icon: 'drafts', count: props.inbound.length },
    { id: 'quotations' as const, label: t('detail.tabs.quotes'), icon: 'receipt_long', count: quotes.length },
    { id: 'comparison' as const, label: t('detail.tabs.comparison'), icon: 'balance', count: confirmedQuotes },
  ]

  return (
    <div className="ds-page rd-page">
      <header className="rd-head">
        <Breadcrumbs backTo="/requests" items={[{ label: t('detail.breadcrumbRfqs'), to: '/requests' }, { label: rfq.name }]} />
        <div className="rd-title-row">
          <div className="rd-title">
            <div className="qr-title-row">
              <h1 className="ds-title">{rfq.name}</h1>
              <RequestStatusChip status={rfq.status} />
              <span className="ds-id">{rfqNumber}</span>
            </div>
            <p className="qr-sub">
              {t('detail.createdOn', { date: fmt.date(rfq.created_at) })}
              {awardedName && <> · <span className="qr-sub-name">{t('detail.awardedTo', { name: awardedName })}</span></>}
            </p>
          </div>
          <JourneyHeader rfq={rfq} />
        </div>
        <div className="rd-next" role="status">
          <span className="rd-next-label">{t('detail.next2.label')}</span>
          <span className="rd-next-text">{next.text}</span>
          <span className="rd-next-action">{next.action}</span>
        </div>
      </header>

      <KeyFacts facts={facts} label={t('detail.facts.label')} />

      <Tabs<DetailTab> tabs={tabs} value={tab} onChange={setTab} layoutId="request-detail-tabs" label={t('detail.tabsLabel')} />

      <div className="rd-grid">
        <div className="rd-main">
          {tab === 'overview' && <Overview {...props} ranked={ranked} leader={leader} onTab={setTab} />}
          {tab === 'suppliers' && <SuppliersTab {...props} />}
          {tab === 'replies' && (
            <SectionCard icon="drafts" title={t('detail.tabs.inbox')} flush={props.inbound.length === 0}>
              {props.inboundLoading
                ? <p className="ds-meta">{t('detail.loadingInbound')}</p>
                : props.inbound.length === 0
                  ? <Empty icon="mail" title={t('detail.replies.emptyTitle')} />
                  : <InboundList messages={props.inbound} rfqId={rfq.id} suppliers={suppliers} />}
            </SectionCard>
          )}
          {tab === 'quotations' && <QuotationsTab {...props} />}
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
        <Rail {...props} responded={responded} />
      </div>
    </div>
  )
}

const JOURNEY_ICONS = ['edit', 'send', 'receipt_long', 'check_circle'] as const

function JourneyHeader({ rfq }: { rfq: RFQDetail }) {
  const { t } = useTranslation('rfq')
  const index = journeyIndex(rfq)
  const quotesLabel = rfq.supplier_count > 0
    ? t('journey.quotesIn', { received: rfq.quoted_count, total: rfq.supplier_count })
    : t('journey.quotes')
  const steps = [t('journey.draft'), t('journey.sent'), quotesLabel, t('journey.decided')]
  return (
    <ol className="rd-journey" aria-label={t('journey.label')}>
      {steps.map((label, step) => {
        const state = step < index || (step === 3 && index === 3) ? 'done' : step === index ? 'current' : 'next'
        return (
          <li key={step} className={`is-${state}`} aria-current={state === 'current' ? 'step' : undefined}>
            <span className="rd-journey-mark" aria-hidden>
              <Icon name={JOURNEY_ICONS[step]} size={16} filled={state === 'current'} />
            </span>
            <span className="rd-journey-label">
              {label}
              <span className="sr-only">{` · ${t(`journey.state.${state}`)}`}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Overview({
  rfq,
  suppliers,
  buyerActions,
  quotes,
  inbound,
  comparison,
  decision,
  ranked,
  leader,
  onTab,
}: CommercialRequestDetailProps & { ranked: ComparisonRow[], leader?: ComparisonRow, onTab: (tab: DetailTab) => void }) {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const navigate = useNavigate()
  const runnerUp = ranked.find(row => row.quote_id !== leader?.quote_id && comparablePrice(row) != null)
  const leaderPrice = leader ? comparablePrice(leader) : null
  const currency = comparison?.base_currency
  const allIn = comparison?.ranking_basis === 'all_in'

  return (
    <>
      <SupplierQuestions rfq={rfq} actions={buyerActions} suppliers={suppliers} quotes={quotes} inbound={inbound} />

      <SectionCard
        icon="balance"
        title={decision ? t('detail.preview.decidedTitle') : t('detail.preview.title')}
        actions={(
          <Btn
            size="sm"
            variant={leader && !decision ? 'primary' : 'secondary'}
            icon="balance"
            disabled={!leader}
            disabledReason={t('detail.comparisonEmptyDescription')}
            onClick={() => navigate(`/rfqs/${rfq.id}/comparison`)}
          >
            {decision ? t('detail.next2.viewDecision') : t('detail.next2.compareChoose')}
          </Btn>
        )}
      >
        {leader && leaderPrice != null ? (
          <div className="rd-preview">
            <div className="rd-preview-lead">
              <span className="rd-preview-kicker">{decision ? t('detail.preview.awarded') : t('detail.preview.leading')}</span>
              <span className="rd-preview-name">{leader.supplier_name}</span>
            </div>
            <div className="rd-preview-figure">
              <Money value={leaderPrice} currency={currency} digits="unit" className="rd-preview-price" />
              <span className="qt-unit">{allIn ? t('detail.preview.allInPer', { unit: comparison?.base_unit }) : t('detail.preview.per', { unit: comparison?.base_unit })}</span>
            </div>
            <div className="rd-preview-figure">
              <Money value={leaderPrice * rfq.quantity} currency={currency} digits={0} className="rd-preview-total" />
              <span className="qt-unit">{t('detail.preview.forQuantity', { quantity: fmt.number(rfq.quantity) })}</span>
            </div>
            {runnerUp && comparablePrice(runnerUp) != null && (
              <p className="rd-preview-note">
                {t('detail.preview.vsNext', {
                  amount: fmt.money(Math.abs((comparablePrice(runnerUp)! - leaderPrice) * rfq.quantity), currency ?? 'USD', { maximumFractionDigits: 0 }),
                  name: runnerUp.supplier_name,
                })}
                {' · '}
                {t('detail.preview.compared', { count: ranked.length })}
              </p>
            )}
          </div>
        ) : (
          <p className="rd-empty-line">{t('detail.comparisonEmptyDescription')}</p>
        )}
      </SectionCard>

      <SectionCard
        icon="apartment"
        title={t('detail.suppliersHeading', { count: suppliers.length })}
        actions={<Btn size="sm" variant="text" onClick={() => onTab('suppliers')}>{t('detail.overview.manageSuppliers')}</Btn>}
        flush
      >
        {suppliers.length === 0 ? (
          <p className="rd-empty-line rd-pad">{t('detail.next.addSuppliersText')}</p>
        ) : (
          <ul className="rd-suppliers">
            {suppliers.map(supplier => (
              <li key={supplier.id}>
                <span className="rd-supplier-name">{supplier.name}</span>
                <span className="rd-supplier-email">{supplier.email}</span>
                <SupplierStatusChip status={supplier.status} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard icon="assignment" title={t('detail.overview.spec')}>
        <dl className="rd-spec">
          <div>
            <dt>{t('commercial.technicalRequirements')}</dt>
            <dd style={{ whiteSpace: 'pre-wrap' }}>
              {rfq.technical_requirements
                || (referenceSpecificationAttachments(rfq.attachments).length > 0
                  ? t('commercial.specSheetOnlyHint')
                  : t('commercial.whatSuppliersDatasheet'))}
            </dd>
          </div>
          <div>
            <dt>{t('commercial.specScenario.label')}</dt>
            <dd><SpecScenarioBadge technicalRequirements={rfq.technical_requirements} attachments={rfq.attachments} /></dd>
          </div>
          <div>
            <dt>{t('commercial.specSheet')}</dt>
            <dd><ReferenceSpecManager rfqId={rfq.id} attachments={rfq.attachments} readOnly={rfq.status === 'closed'} /></dd>
          </div>
        </dl>
      </SectionCard>
    </>
  )
}

function SuppliersTab(props: CommercialRequestDetailProps) {
  const { t } = useTranslation('rfq')
  const { showAddSupplier, setShowAddSupplier } = props
  const [addTab, setAddTab] = useState<'directory' | 'once'>('directory')
  const anchorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showAddSupplier) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setShowAddSupplier(false) }
    const onPointer = (event: MouseEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) setShowAddSupplier(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
    }
  }, [showAddSupplier, setShowAddSupplier])

  return (
    <SectionCard
      className="rd-suppliers-card"
      icon="apartment"
      title={t('detail.suppliersHeading', { count: props.suppliers.length })}
      flush
      actions={(
        <div className="rd-supplier-actions">
          <div className="ds-popover-anchor" ref={anchorRef}>
            <Btn size="sm" variant="secondary" icon="add" aria-expanded={showAddSupplier} onClick={() => setShowAddSupplier(!showAddSupplier)}>
              {t('detail.addSuppliers')}
            </Btn>
            {showAddSupplier && (
              <div className="ds-popover" role="dialog" aria-label={t('detail.addSupplierDialog')}>
                <div className="ds-tabs" role="tablist" aria-label={t('detail.addSupplierDialog')}>
                  <button type="button" role="tab" className="ds-tab" aria-selected={addTab === 'directory'} onClick={() => setAddTab('directory')}>
                    {t('detail.addFromDirectoryTab')}
                  </button>
                  <button type="button" role="tab" className="ds-tab" aria-selected={addTab === 'once'} onClick={() => setAddTab('once')}>
                    {t('detail.addForRequestTab')}
                  </button>
                </div>
                <div style={{ marginTop: 12 }}>
                  {addTab === 'directory'
                    ? <AddSupplierFromDirectory suppliers={props.directorySuppliers} isLoading={props.directoryLoading} isPending={props.addFromDirectoryPending} onAdd={props.onAddFromDirectory} />
                    : <AddSupplierForm onSubmit={props.onAddSupplier} isPending={props.addSupplierPending} error={props.addSupplierError} />}
                  {props.addFromDirectoryError && <Alert tone="error">{t('detail.directoryAddError')}</Alert>}
                </div>
              </div>
            )}
          </div>
          {props.suppliers.length > 0 && (
            <SendButton
              pendingCount={props.pendingCount}
              googleConnected={props.googleConnected}
              outlookConnected={props.outlookConnected}
              isPending={props.sendPending}
              error={props.sendError}
              result={props.sendResult}
              onSend={props.onSend}
            />
          )}
        </div>
      )}
    >
      <div className="rd-table">
        <RequestSupplierTable
          suppliers={props.suppliers}
          quotes={props.quotes}
          comparisonRows={props.comparison?.rows}
          inbound={props.inbound}
          onCloseSupplier={props.onCloseSupplier}
          isClosingId={props.closingSupplierId}
        />
      </div>
    </SectionCard>
  )
}

function QuotationsTab(props: CommercialRequestDetailProps) {
  const { t } = useTranslation('rfq')
  const { quotes, showUpload, setShowUpload } = props
  return (
    <SectionCard
      icon="receipt_long"
      title={t('detail.quotesHeading', { count: quotes.length })}
      actions={(
        <Btn size="sm" variant="secondary" icon={showUpload ? undefined : 'upload'} onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? t('common:actions.cancel') : t('detail.addQuoteManually')}
        </Btn>
      )}
    >
      {props.draftQuotes > 0 && <Alert tone="warning" className="mb-4">{t('detail.draftWarning')}</Alert>}
      {showUpload && (
        <div className="mb-4">
          <QuoteUploadForm suppliers={props.suppliers} onSubmit={props.onCreateQuote} isPending={props.createQuotePending} error={props.createQuoteError} />
        </div>
      )}
      {props.quotesLoading
        ? <p className="ds-meta">{t('detail.loadingQuotes')}</p>
        : quotes.length > 0
          ? <QuoteList quotes={quotes} baseCurrency={props.rfq.base_currency} />
          : <Empty icon="description" title={t('detail.noQuotesTitle')} description={t('detail.noQuotesDescription')} />}
    </SectionCard>
  )
}

function Rail({
  rfq,
  suppliers,
  quotes,
  confirmedQuotes,
  draftQuotes,
  copied,
  onCopyEmail,
  responded,
}: CommercialRequestDetailProps & { responded: number }) {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const placeRole = rfq.incoterms?.place_role
  const placeLabel = placeRole
    ? t(`commercial.placeRole.${placeRole}`, { defaultValue: t('commercial.namedPlace') })
    : t('commercial.namedPlace')

  const details: Array<{ key: string, label: string, value: ReactNode | null }> = [
    { key: 'quantity', label: t('commercial.quantity'), value: `${fmt.number(rfq.quantity)} ${t(`commercial.units.${rfq.base_unit}`, { defaultValue: rfq.base_unit })}` },
    { key: 'currency', label: t('detail.baseCurrency'), value: rfq.base_currency || null },
    { key: 'incoterm', label: t('commercial.incoterm'), value: rfq.incoterms?.rule ? `${rfq.incoterms.rule}${rfq.incoterms.named_place ? ` · ${placeLabel}: ${rfq.incoterms.named_place}` : ''}` : null },
    { key: 'delivery', label: t('commercial.deliveryDate'), value: rfq.requested_delivery_date ? fmt.date(rfq.requested_delivery_date) : null },
    { key: 'deadline', label: t('detail.responseDeadline'), value: rfq.response_deadline ? fmt.date(rfq.response_deadline) : null },
    {
      key: 'reference',
      label: t('commercial.internalReference'),
      value: rfq.internal_reference
        ? <>{rfq.internal_reference}<span className="rd-ask-meta" style={{ display: 'block' }}>{rfq.share_internal_reference ? t('commercial.whatSuppliersReference') : t('commercial.whatSuppliersReferenceHidden')}</span></>
        : null,
    },
  ]
  const present = details.filter(item => item.value)
  const missing = details.filter(item => !item.value)
  const canEdit = rfq.status !== 'decided' && rfq.status !== 'closed'
  const progress = suppliers.length ? (responded / suppliers.length) * 100 : 0

  return (
    <aside className="rd-rail">
      <SectionCard icon="group" title={t('detail.progress.title')}>
        <div className="rd-progress">
          <div className="rd-progress-head">
            <span className="qy-num rd-progress-big">{responded}<span className="qt-unit"> / {suppliers.length}</span></span>
            <span className="qt-hint">{t('detail.progress.responded')}</span>
          </div>
          <ProgressBar value={progress} />
          <dl className="rd-progress-rows">
            <div><dt><Icon name="check_circle" size={14} />{t('detail.progress.confirmed')}</dt><dd className="qy-num">{confirmedQuotes}</dd></div>
            <div><dt><Icon name="visibility" size={14} />{t('detail.progress.toReview')}</dt><dd className="qy-num">{draftQuotes}</dd></div>
            <div><dt><Icon name="receipt_long" size={14} />{t('detail.progress.quotes')}</dt><dd className="qy-num">{quotes.length}</dd></div>
          </dl>
        </div>
      </SectionCard>

      <SectionCard icon="mail" title={t('detail.inboxAddress.title')}>
        <div className="rd-inbox">
          <code className="rd-inbox-address">{rfq.email_address}</code>
          <IconBtn label={copied ? t('detail.inboxAddress.copied') : t('detail.inboxAddress.copy')} icon={copied ? 'check_circle' : 'content_copy'} onClick={onCopyEmail} />
        </div>
        {t('detail.inboxAddress.description') ? <p className="rd-ask-meta">{t('detail.inboxAddress.description')}</p> : null}
      </SectionCard>

      <SectionCard icon="assignment" title={t('detail.requestDetails')}>
        <dl className="rd-details">
          {present.map(item => (
            <div key={item.key}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        {missing.length > 0 && (
          <p className="rd-missing">
            <Chip tone="outline">{t('detail.missing.label')}</Chip>
            <span>{missing.map(item => item.label.toLocaleLowerCase()).join(', ')}</span>
            {canEdit && <Link to={`/rfqs/${rfq.id}/edit`} className="ds-link">{t('detail.missing.add')}</Link>}
          </p>
        )}
      </SectionCard>
    </aside>
  )
}
