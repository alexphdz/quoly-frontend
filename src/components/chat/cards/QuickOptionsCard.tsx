import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useIsMutating } from '@tanstack/react-query'
import { Button, TextButton } from '../../../design-system'
import { useResolveAction } from '../../../hooks/useConversationTurn'
import { useAuth } from '../../../hooks/useAuth'
import { connectedMailboxes } from '../../../lib/mailbox'
import type { ApiError } from '../../../api/client'
import type { AgentCard, QuickOption, QuickOptionsCardPayload } from '../../../types/agent'

interface QuickOptionsCardProps {
  card: AgentCard
  messageId: string
  conversationId: string
}

export default function QuickOptionsCard({ card, messageId, conversationId }: QuickOptionsCardProps) {
  const { t } = useTranslation('chat')
  const { user } = useAuth()
  const resolveAction = useResolveAction(conversationId)
  // Con un turno de texto en vuelo, elegir un chip crearía una carrera (la
  // invalidación pisa el mensaje optimista del turno): se espera a que termine.
  const turnInFlight = useIsMutating({ mutationKey: ['agent-turn', conversationId] }) > 0
  const payload = card.payload as unknown as QuickOptionsCardPayload | undefined
  const options: QuickOption[] = Array.isArray(payload?.options) ? payload.options : []
  const groupLabel = typeof payload?.label === 'string' ? payload.label : null
  const [error, setError] = useState<string | null>(null)
  // Mailbox card ("send_channel"): picking a mailbox sends right away, and an
  // email can't be unsent → the chosen option waits here for a confirmation.
  const isMailboxChoice = payload?.field === 'send_channel'
  const [confirmValue, setConfirmValue] = useState<string | null>(null)

  if (card.state !== 'pending') {
    const result = card.card_result as { label?: string } | null
    const selectedLabel = result?.label
    return selectedLabel
      ? (
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          {`✓ ${selectedLabel}`}
        </span>
      )
      : null
  }

  async function handleSelect(value: string) {
    setError(null)
    setConfirmValue(null)
    try {
      await resolveAction.mutateAsync({
        card_id: messageId,
        card_version: card.version,
        action: 'select',
        payload: { value },
      })
    } catch (err) {
      // Elegir el buzón (field "send_channel") encola el envío: puede fallar por
      // el buzón. Moneda/unidad solo caen en el mensaje genérico.
      const apiError = err as ApiError
      const code = apiError.code ?? apiError.detail
      setError(
        code === 'mailbox_address_unknown'
          ? t('errors.mailboxAddressUnknown')
          : code === 'no_mailbox_connected' || code === 'channel_not_connected'
            ? t('errors.noMailbox')
            : t('errors.turnFailed'),
      )
    }
  }

  const confirmOption = confirmValue ? options.find(o => o.value === confirmValue) : undefined
  const confirmEmail = confirmOption
    ? connectedMailboxes(user).find(m => m.channel === confirmOption.value)?.email ?? confirmOption.label
    : ''
  const supplierCount = typeof payload?.supplier_count === 'number' ? payload.supplier_count : 0
  const confirmTitle = supplierCount > 0
    ? t('sendConfirm.title', { count: supplierCount, email: confirmEmail })
    : t('sendConfirm.titleNoCount', { email: confirmEmail })

  return (
    <div className="chat-quick-options-group">
      {groupLabel && <span className="chat-quick-options-label">{groupLabel}</span>}
      <div className="chat-quick-options">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`chat-quick-option-btn${opt.default ? ' is-default' : ''}`}
            onClick={() => (isMailboxChoice ? setConfirmValue(opt.value) : handleSelect(opt.value))}
            disabled={resolveAction.isPending || turnInFlight}
            aria-pressed={isMailboxChoice ? confirmValue === opt.value : undefined}
          >
            {opt.label}
            {opt.default && (
              <span className="chat-quick-option-default">{` · ${t('quickOptions.default')}`}</span>
            )}
          </button>
        ))}
      </div>
      {confirmOption && (
        <div className="chat-send-confirm is-inline" role="alertdialog" aria-label={confirmTitle}>
          <span className="chat-supplier-footer-label">
            <strong>{confirmTitle}</strong>
            {' '}
            {t('sendConfirm.noUndo')}
          </span>
          <span className="chat-send-confirm-actions">
            <TextButton size="sm" onClick={() => setConfirmValue(null)} disabled={resolveAction.isPending}>
              {t('sendConfirm.cancel')}
            </TextButton>
            <Button
              variant="primary"
              size="sm"
              icon="paper-plane-tilt"
              onClick={() => handleSelect(confirmOption.value)}
              disabled={resolveAction.isPending || turnInFlight}
              loading={resolveAction.isPending}
            >
              {t('sendConfirm.send')}
            </Button>
          </span>
        </div>
      )}
      {error && <span className="chat-quick-options-error" role="alert">{error}</span>}
    </div>
  )
}
