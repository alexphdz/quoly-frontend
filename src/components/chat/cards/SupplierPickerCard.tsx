import { CheckCircle } from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, TextButton } from '../../../design-system'
import ChannelSelect, { type SendChannel } from '../../rfq/ChannelSelect'
import { useResolveAction } from '../../../hooks/useConversationTurn'
import { useAuth } from '../../../hooks/useAuth'
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

  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(candidates.filter(c => c.preselected).map(c => c.supplier_id))
  )
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSupplier, setNewSupplier] = useState<NewSupplier>({ name: '', email: '' })
  const [newSuppliers, setNewSuppliers] = useState<NewSupplier[]>([])
  const [error, setError] = useState<string | null>(null)

  if (card.state === 'resolved') {
    return (
      <div className="chat-card is-resolved">
        <div className="chat-card-header">
          <span className="chat-card-title">{t('supplierPicker.directoryLabel', { defaultValue: 'PROVEEDORES DE TU DIRECTORIO' })}</span>
        </div>
        <div className="chat-card-resolved-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <CheckCircle size={16} weight="fill" color="var(--accent)" aria-hidden />
          {t('supplierPicker.sent', { defaultValue: 'Enviado' })}
        </div>
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
    } catch {
      setError(t('errors.turnFailed'))
    }
  }

  return (
    <div className="chat-supplier-card">
      <div className="chat-supplier-card-header">
        <span className="chat-supplier-card-label">
          {t('supplierPicker.directoryLabel', { defaultValue: 'PROVEEDORES DE TU DIRECTORIO' })}
        </span>
        <span className="chat-supplier-card-count">
          {t('supplierPicker.chosen', { count: totalCount, total: candidates.length + newSuppliers.length })}
        </span>
      </div>

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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
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
          onClick={handleSend}
          disabled={totalCount === 0 || resolveAction.isPending}
          loading={resolveAction.isPending}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ marginRight: 4 }}>
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
          {t('supplierPicker.sendN', { count: totalCount })}
        </Button>
      </div>
    </div>
  )
}
