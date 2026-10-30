import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Button, ConfirmDialog, DataTable, IconButton, InlineAlert, Menu, MenuItem, ResponseTracker, SegmentedControl, SideSheet,
  StatusBadge, TextButton, type DataTableColumn,
} from '../../design-system'
import type { ApiError } from '../../api/client'
import type { EmailPayload, SupplierRead } from '../../types/rfq'
import AddSupplierForm from '../rfq/AddSupplierForm'
import AddSupplierFromDirectory from '../rfq/AddSupplierFromDirectory'
import EmailPayloadDisplay from '../rfq/EmailPayloadDisplay'
import type { CommercialRequestDetailProps, DetailTab } from './CommercialRequestDetail'
import { CLOSABLE, stageOf } from './stages'
import { useStageMeta } from './useStageMeta'

const RESPONDED = new Set(['quote_received', 'partial_response', 'buyer_action_required', 'declined'])
const STAGE_ORDER = ['quote_received', 'partial_response', 'buyer_action_required', 'awaiting_response', 'not_contacted', 'declined', 'closed']

const TABLE_STYLE = {
  '--table-bg': 'var(--color-canvas)',
  '--table-row-comfortable': '84px',
} as CSSProperties

/** 04B · Proveedores: quién recibió la solicitud y su etapa. Agregar nunca envía; enviar pide confirmación. */
export default function SuppliersTab(props: CommercialRequestDetailProps & { onTab: (tab: DetailTab, hash?: string) => void }) {
  const { rfq, suppliers, quotes, pendingCount, onTab } = props
  const { t } = useTranslation('rfq')
  const navigate = useNavigate()
  const meta = useStageMeta(props)
  const [addMode, setAddMode] = useState<'directory' | 'once'>('directory')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const readOnly = rfq.status === 'decided' || rfq.status === 'closed'
  const mailbox = props.googleConnected || !!props.outlookConnected
  const payloads = (props.sendResult ?? []).filter((item): item is EmailPayload => 'body' in item)

  useEffect(() => {
    if (!props.sendPending) setConfirmOpen(false)
  }, [props.sendPending])

  const counts = new Map<string, number>()
  for (const s of suppliers) counts.set(stageOf(s.status).key, (counts.get(stageOf(s.status).key) ?? 0) + 1)
  const received = suppliers.filter(s => stageOf(s.status).key !== 'not_contacted')
  const responded = received.filter(s => RESPONDED.has(stageOf(s.status).key)).length

  const quoteOf = (s: SupplierRead) => quotes.filter(q => q.supplier_id === s.id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
  const rowAction = (s: SupplierRead) => {
    const stage = stageOf(s.status).key
    const quote = quoteOf(s)
    if (stage === 'not_contacted' && !readOnly) return { label: t('detalle.suppliers.send'), run: () => setConfirmOpen(true) }
    if (stage === 'buyer_action_required') return { label: t('detalle.summary.viewQuestion'), run: () => onTab('replies', 'needs-answer') }
    if (quote && quote.status === 'draft') return { label: t('detalle.suppliers.reviewResponse'), run: () => navigate(`/quotes/${quote.id}`) }
    if (quote) return { label: t('detalle.suppliers.viewQuote'), run: () => navigate(`/quotes/${quote.id}`) }
    if (stage === 'partial_response') return { label: t('detalle.suppliers.reviewResponse'), run: () => onTab('replies') }
    return null
  }

  const columns: DataTableColumn<SupplierRead>[] = [
    {
      key: 'supplier',
      header: t('detalle.suppliers.colSupplier'),
      type: 'identity',
      minWidth: 220,
      render: s => (
        <span className="rd2-supplier-id">
          <span className="rd2-supplier-name is-lg">{s.name}</span>
          <span className="rd2-supplier-mail">{s.contact_name ? `${s.contact_name} · ${s.email}` : s.email}</span>
        </span>
      ),
    },
    {
      key: 'stage',
      header: t('detalle.suppliers.colStage'),
      type: 'status',
      minWidth: 220,
      render: s => {
        const stage = stageOf(s.status)
        return (
          <span className="rd2-stage">
            <StatusBadge tone={stage.tone} variant="quiet" icon={stage.icon}>{t(`detalle.stage.${stage.key}`, { defaultValue: s.status })}</StatusBadge>
            <span className="rd2-supplier-meta">{meta(s)}</span>
          </span>
        )
      },
    },
    {
      key: 'actions',
      header: t('solicitudes.columns.actions'),
      type: 'actions',
      width: 220,
      primary: s => {
        const a = rowAction(s)
        const closable = !readOnly && CLOSABLE.has(stageOf(s.status).key)
        return (
          <span className="rd2-row-actions">
            {a && <TextButton size="sm" iconEnd="caret-right" className="rd2-strong" onClick={a.run}>{a.label}</TextButton>}
            <Menu
              align="end"
              trigger={<IconButton icon="dots-three" size="xs" label={t('detalle.suppliers.more', { name: s.name })} />}
            >
              <MenuItem icon="chat-text" onSelect={() => onTab('replies')}>{t('detalle.suppliers.viewReplies')}</MenuItem>
              {closable && (
                <MenuItem
                  icon="lock-simple"
                  description={t('detalle.suppliers.closeHint')}
                  disabled={props.closingSupplierId === s.id}
                  onSelect={() => props.onCloseSupplier(s.id)}
                >
                  {t('detalle.suppliers.close')}
                </MenuItem>
              )}
            </Menu>
          </span>
        )
      },
    },
  ]

  return (
    <div className="rd2-suppliers">
      <div className="rd2-block-head is-top">
        <div className="rd2-head-text">
          <h2 className="rd2-h2">{t('detalle.tabs.suppliers')}</h2>
          <p className="rd2-lead">{t('detalle.suppliers.lead')}</p>
        </div>
        {!readOnly && (
          <div className="rd2-head-actions">
            {pendingCount > 0 && (
              <Button icon="paper-plane-tilt" loading={props.sendPending} onClick={() => setConfirmOpen(true)}>
                {t('detalle.suppliers.sendCount', { count: pendingCount })}
              </Button>
            )}
            <Button variant={pendingCount > 0 ? 'secondary' : 'primary'} icon="plus" onClick={() => props.setShowAddSupplier(true)}>
              {t('detalle.suppliers.add')}
            </Button>
          </div>
        )}
      </div>

      {props.sendError && (
        <InlineAlert
          prominence="blocking"
          tone="error"
          title={t('detalle.suppliers.sendFailed')}
          actions={<Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)}>{t('detalle.suppliers.retrySend')}</Button>}
        >
          {(props.sendError as ApiError).detail || t('send.failed')}
        </InlineAlert>
      )}
      {payloads.length > 0 && (
        <div className="rd2-payloads">
          <InlineAlert tone="info" title={t('detalle.suppliers.noMailboxTitle')}>{t('detalle.suppliers.noMailboxText')}</InlineAlert>
          <EmailPayloadDisplay payloads={payloads} />
        </div>
      )}

      {suppliers.length > 0 && (
        <div className="rd2-stats">
          <div className="rd2-stat is-total">
            <span className="rd2-stat-value is-lg">{suppliers.length}</span>
            <span className="rd2-muted">{t('detalle.suppliers.added', { count: suppliers.length })}</span>
          </div>
          <div className="rd2-stat-row">
            {STAGE_ORDER.filter(k => counts.get(k)).map(k => (
              <div key={k} className={`rd2-stat${k === 'buyer_action_required' ? ' is-warning' : ''}`}>
                <span className="rd2-stat-value">{counts.get(k)}</span>
                <span className="rd2-muted">{t(`detalle.stageCount.${k}`, { count: counts.get(k) })}</span>
              </div>
            ))}
          </div>
          {received.length > 0 && (
            <div className="rd2-stat-tracker">
              <ResponseTracker responded={responded} total={received.length} label={t('detalle.suppliers.respondedOf')} />
            </div>
          )}
        </div>
      )}

      <div style={TABLE_STYLE}>
        <DataTable
          columns={columns}
          rows={suppliers}
          rowKey="id"
          density="comfortable"
          interactive={false}
          caption={t('detalle.tabs.suppliers')}
          state={suppliers.length === 0 ? 'empty' : 'ready'}
          empty={{
            label: t('detalle.suppliers.emptyLabel'),
            title: t('detalle.summary.noSuppliersTitle'),
            text: t('detalle.summary.noSuppliersText'),
            action: readOnly ? undefined : <Button icon="plus" onClick={() => props.setShowAddSupplier(true)}>{t('detalle.suppliers.add')}</Button>,
          }}
        />
      </div>

      <SideSheet
        open={props.showAddSupplier}
        onClose={() => props.setShowAddSupplier(false)}
        title={t('detalle.suppliers.add')}
        description={t('detalle.suppliers.addNote')}
        width={520}
      >
        <div className="rd2-add">
          <SegmentedControl
            label={t('detalle.suppliers.add')}
            value={addMode}
            onChange={setAddMode}
            fullWidth
            options={[
              { value: 'directory', label: t('detalle.suppliers.fromDirectory') },
              { value: 'once', label: t('detalle.suppliers.forThisRequest') },
            ]}
          />
          {addMode === 'directory'
            ? <AddSupplierFromDirectory suppliers={props.directorySuppliers} isLoading={props.directoryLoading} isPending={props.addFromDirectoryPending} onAdd={props.onAddFromDirectory} />
            : <AddSupplierForm onSubmit={props.onAddSupplier} isPending={props.addSupplierPending} error={props.addSupplierError} />}
          {props.addFromDirectoryError && <InlineAlert tone="error">{t('detail.directoryAddError')}</InlineAlert>}
        </div>
      </SideSheet>

      <ConfirmDialog
        open={confirmOpen}
        title={t('detalle.suppliers.confirmTitle', { count: pendingCount })}
        description={mailbox ? t('detalle.suppliers.confirmMailbox') : t('detalle.suppliers.confirmNoMailbox')}
        details={suppliers.filter(s => stageOf(s.status).key === 'not_contacted').map(s => ({ label: s.name, value: s.email }))}
        confirmLabel={t('detalle.suppliers.confirmAction', { count: pendingCount })}
        cancelLabel={t('crear.actions.cancel')}
        pending={props.sendPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={props.onSend}
      />
    </div>
  )
}
