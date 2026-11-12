import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Icon, TextButton } from '../../../design-system'
import ChannelSelect, { type SendChannel } from '../../rfq/ChannelSelect'
import { useResolveAction } from '../../../hooks/useConversationTurn'
import { useAuth } from '../../../hooks/useAuth'
import type { ApiError } from '../../../api/client'
import type { AgentCard, SupplierCandidate, SupplierPickerCardPayload } from '../../../types/agent'

interface SupplierPickerCardProps {
  card: AgentCard
  messageId: string
  conversationId: string
}

interface NewSupplier {
  name: string
  email: string
}

export default function SupplierPickerCard({ card, messageId, conversationId }: SupplierPickerCardProps) {
  const { t } = useTranslation('chat')
  const { user } = useAuth()
  const resolveAction = useResolveAction(conversationId)
  const payload = card.payload as unknown as SupplierPickerCardPayload
  const candidates: SupplierCandidate[] = payload?.candidates ?? []
  const confirmToken: string = payload?.confirm_token ?? ''

  const googleConnected = !!user?.google_connected
  const outlookConnected = !!user?.outlook_connected
  const bothConnected = googleConnected && outlookConnected
  const [channel, setChannel] = useState<SendChannel>(
    user?.default_send_channel ?? (outlookConnected && !googleConnected ? 'outlook' : 'google'),
  )
  // Single mailbox → implicit; both → selector; none → undefined (backend fallback).
  const effectiveChannel: SendChannel | undefined = bothConnected
    ? channel
    : googleConnected ? 'google' : outlookConnected ? 'outlook' : undefined

  const isEmptyDirectory = candidates.length === 0

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(candidates.filter(c => c.preselected).map(c => c.supplier_id))
  )
  // Empty directory → the add form IS the card: open it from the start.
  const [showAddForm, setShowAddForm] = useState(isEmptyDirectory)
  const [newSupplier, setNewSupplier] = useState<NewSupplier>({ name: '', email: '' })
  const [newSuppliers, setNewSuppliers] = useState<NewSupplier[]>([])
  const [error, setError] = useState<string | null>(null)

  if (card.state === 'resolved') {
    return (
      <div className="chat-card-collapsed">
        <Icon name="check-circle" size={16} weight="fill" color="var(--color-status-success-text)" />
        {t('supplierPicker.sent', { defaultValue: 'Enviado' })}
      </div>
    )
  }

  if (card.state === 'dismissed') {
    return (
      <div className="chat-card is-dimmed">
        <div className="chat-card-state-label">{`(${t('card.dismissed')})`}</div>
      </div>
    )
  }

  function toggleSupplier(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleAddSupplier() {
    if (!newSupplier.name.trim() || !newSupplier.email.trim()) return
    setNewSuppliers(prev => [...prev, { ...newSupplier }])
    setNewSupplier({ name: '', email: '' })
    setShowAddForm(false)
  }

  const totalCount = selected.size + newSuppliers.length

  async function handleSend() {
    if (totalCount === 0) return
    setError(null)
    try {
      await resolveAction.mutateAsync({
        card_id: messageId,
        card_version: card.version,
        action: 'submit',
        confirm_token: confirmToken,
        payload: {
          selected_supplier_ids: Array.from(selected),
          new_suppliers: newSuppliers,
          ...(effectiveChannel ? { channel: effectiveChannel } : {}),
        },
      })
    } catch (err) {
      const detail = (err as ApiError).detail
      setError(
        detail === 'no_mailbox_connected' || detail === 'channel_not_connected'
          ? t('errors.noMailbox')
          : t('errors.turnFailed'),
      )
    }
  }

  return (
    <div className="chat-supplier-card">
      <div className="chat-supplier-card-header">
        <span className="chat-supplier-card-label">
          {t('supplierPicker.title', { defaultValue: 'Selecciona proveedores' })}
        </span>
        {!isEmptyDirectory && (
          <span className="chat-supplier-card-count">
            {t('supplierPicker.chosen', { count: totalCount, total: candidates.length + newSuppliers.length })}
          </span>
        )}
      </div>

      {isEmptyDirectory && newSuppliers.length === 0 && (
        <p className="chat-supplier-empty">
          {t('supplierPicker.emptyHint', {
            defaultValue: 'Aún no tienes proveedores guardados. Agrega el primero con su correo para enviarle la solicitud.',
          })}
        </p>
      )}

      <div className="chat-supplier-list">
        {candidates.slice(0, 8).map(c => (
          <label key={c.supplier_id} className="chat-supplier-row" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              className="chat-supplier-checkbox"
              checked={selected.has(c.supplier_id)}
              onChange={() => toggleSupplier(c.supplier_id)}
            />
            <div className="chat-supplier-info">
              <span className="chat-supplier-name">{c.company_name}</span>
              {(c as unknown as { city?: string }).city && (
                <span className="chat-supplier-city">{(c as unknown as { city?: string }).city}</span>
              )}
              {c.reason && (
                <span className="chat-supplier-reason">{c.reason}</span>
              )}
            </div>
          </label>
        ))}

        {newSuppliers.map((s, i) => (
          <div key={i} className="chat-supplier-row">
            <input type="checkbox" className="chat-supplier-checkbox" checked readOnly />
            <div className="chat-supplier-info">
              <span className="chat-supplier-name">{s.name}</span>
              <span className="chat-supplier-reason">{s.email}</span>
            </div>
          </div>
        ))}
      </div>

      {showAddForm
        ? (
          <div className="chat-supplier-add-form">
            <input
              className="chat-supplier-add-input"
              placeholder={t('supplierPicker.namePlaceholder', { defaultValue: 'Nombre de la empresa' })}
              value={newSupplier.name}
              onChange={e => setNewSupplier(p => ({ ...p, name: e.target.value }))}
            />
            <input
              className="chat-supplier-add-input"
              placeholder={t('supplierPicker.emailPlaceholder', { defaultValue: 'Correo electrónico' })}
              type="email"
              value={newSupplier.email}
              onChange={e => setNewSupplier(p => ({ ...p, email: e.target.value }))}
            />
            <div className="chat-supplier-add-actions">
              <Button variant="secondary" size="sm" onClick={handleAddSupplier}
                disabled={!newSupplier.name.trim() || !newSupplier.email.trim()}>
                {t('supplierPicker.addConfirm', { defaultValue: 'Agregar' })}
              </Button>
              <TextButton size="sm" onClick={() => setShowAddForm(false)}>
                {t('supplierPicker.addCancel', { defaultValue: 'Cancelar' })}
              </TextButton>
            </div>
          </div>
        )
        : (
          <button type="button" className="chat-supplier-add-row" onClick={() => setShowAddForm(true)}>
            <Icon name="user-plus" size={16} />
            {t('supplierPicker.addSupplier')}
          </button>
        )}

      {error && <div className="chat-supplier-card-error">{error}</div>}

      <div className="chat-supplier-card-footer">
        {bothConnected
          ? (
            <ChannelSelect
              googleConnected={googleConnected}
              outlookConnected={outlookConnected}
              value={channel}
              onChange={setChannel}
              disabled={resolveAction.isPending}
            />
          )
          : (
            <span className="chat-supplier-footer-label">
              {effectiveChannel === 'outlook'
                ? t('supplierPicker.fromOutlook', { defaultValue: 'Desde tu Outlook' })
                : t('supplierPicker.fromGmail', { defaultValue: 'Desde tu Gmail' })}
            </span>
          )}
        <Button
          variant="primary"
          size="sm"
          icon="paper-plane-tilt"
          onClick={handleSend}
          disabled={totalCount === 0 || resolveAction.isPending}
          loading={resolveAction.isPending}
        >
          {t('supplierPicker.sendN', { count: totalCount })}
        </Button>
      </div>
    </div>
  )
}
