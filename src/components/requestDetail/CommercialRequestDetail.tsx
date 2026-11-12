import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { createConversation } from '../../api/agent'
import { toast } from '../ui'
import type { RFQDetail, SendRequestsResponse, SupplierCreate, SupplierRead } from '../../types/rfq'
import type { BuyerActionRead } from '../../types/buyerAction'
import type { InboundMessageRead } from '../../types/inbound'
import type { QuoteListItem } from '../../types/quote'
import type { ComparisonResponse, DecisionRead } from '../../types/comparison'
import type { SupplierCompanyRead } from '../../types/supplierDirectory'
import { Breadcrumbs, Button, RfqHeader, Tabs, TextButton } from '../../design-system'
import { useShellLayout } from '../layout/useShellLayout'
import { useElementWidth } from '../../design-system/hooks'
import InboundList from '../rfq/InboundList'
import ComparisonExperience from './ComparisonExperience'
import SupplierQuestions from './SupplierQuestions'
import OverviewTab from './OverviewTab'
import SuppliersTab from './SuppliersTab'
import RequestPanel from './RequestPanel'
import QuotesTab from './QuotesTab'
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
  defaultChannel?: 'google' | 'outlook' | null
  sendPending: boolean
  sendError: Error | null
  sendResult?: SendRequestsResponse
  onSend: (channel?: 'google' | 'outlook') => void
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
  const { rfq, quotes, comparison, decision } = props
  const { t } = useTranslation('rfq')
  const { t: tChat } = useTranslation('chat')
  const navigate = useNavigate()
  // Abrir/retomar la conversación del asistente ligada a esta RFQ (E2): si no
  // existe, se crea una atada al rfq_id (el backend siembra el estado real).
  const openingChat = useRef(false)
  const openAssistant = async () => {
    if (openingChat.current) return
    if (rfq.conversation_id) {
      navigate(`/asistente/${rfq.conversation_id}`)
      return
    }
    openingChat.current = true
    try {
      const conv = await createConversation(rfq.id)
      navigate(`/asistente/${conv.id}`)
    } catch {
      toast(tChat('rfq.ask_assistant_error'), 'error')
    } finally {
      openingChat.current = false
    }
  }
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

  // Un borrador creado por el CHAT ya está completo (solo falta elegir proveedores
  // y enviar), así que su acción principal lleva a la pestaña de proveedores, NO al
  // formulario de edición. Un borrador creado por FORMULARIO sí se termina editando.
  const action = head.key === 'draft'
    ? rfq.created_via === 'chat'
      ? <Button icon="paper-plane-tilt" onClick={() => setTab('suppliers')}>{t('detalle.pickSuppliers')}</Button>
      : <Button icon="pencil-simple" onClick={() => navigate(`/rfqs/${rfq.id}/edit`)}>{t('detalle.editRequest')}</Button>
    : (head.key === 'closed' || decision)
      ? <Button variant="secondary" icon="columns" onClick={() => setTab('comparison')}>{t('detalle.viewComparison')}</Button>
      : undefined

  return (
    <div className={`rd2-page is-${layout}`}>
      <Breadcrumbs items={[{ label: t('detail.breadcrumbRfqs'), to: '/requests' }, { label: rfq.name }]} />
      <div className="rd2-chat-origin">
        <TextButton size="sm" onClick={openAssistant}>
          {rfq.created_via === 'chat' ? tChat('rfq.created_via_chat') : tChat('rfq.ask_assistant')}
        </TextButton>
      </div>
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

      <div ref={bodyRef} className={`rd2-body${stacked ? ' is-stacked' : ''}${tab === 'comparison' ? ' is-comparison' : ''}`}>
        <div className={`rd2-main${tab === 'comparison' ? ' is-comparison' : ''}`} role="tabpanel" id={`rd2-panel-${tab}`} aria-labelledby={`rd2-tab-${tab}`}>
          {tab === 'overview' && <OverviewTab {...props} onTab={setTab} />}
          {tab === 'suppliers' && <SuppliersTab {...props} onTab={setTab} />}
          {tab === 'replies' && (
            <div className="rd2-replies">
              <div>
                <h2 className="rd2-h2">{t('respuestas.title')}</h2>
                <p className="rd2-lead">{t('respuestas.lead')}</p>
                <div className="rd2-stat-row rp-stats">
                  <div className="rd2-stat"><span className="rd2-stat-value">{props.inbound.length}</span><span className="rd2-muted">{t('respuestas.messages', { count: props.inbound.length })}</span></div>
                  <div className={`rd2-stat${props.openAsks.length ? ' is-warning' : ''}`}><span className="rd2-stat-value">{props.openAsks.length}</span><span className="rd2-muted">{t('respuestas.openQuestions', { count: props.openAsks.length })}</span></div>
                </div>
              </div>
              <SupplierQuestions rfq={rfq} actions={props.buyerActions} suppliers={props.suppliers} quotes={quotes} inbound={props.inbound} />
              <section aria-labelledby="rd2-h-messages" className="rd2-block">
                <h3 id="rd2-h-messages" className="rd2-h2 is-sm">{t('respuestas.messagesTitle')}<span className="rd2-count">{props.inbound.length}</span></h3>
                {props.inboundLoading
                  ? <p className="rd2-muted">{t('detail.loadingInbound')}</p>
                  : <InboundList messages={props.inbound} rfqId={rfq.id} suppliers={props.suppliers} />}
              </section>
            </div>
          )}
          {tab === 'quotations' && <QuotesTab {...props} />}
          {tab === 'comparison' && <ComparisonExperience rfq={rfq} comparison={comparison} decision={decision} openAsks={props.openAsks} />}
        </div>
        {tab !== 'comparison' && <RequestPanel rfq={rfq} stacked={stacked} mobile={layout === 'mobile'} copied={props.copied} onCopyEmail={props.onCopyEmail} />}
      </div>
    </div>
  )
}
