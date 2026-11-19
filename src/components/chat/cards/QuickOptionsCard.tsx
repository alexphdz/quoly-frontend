import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useIsMutating } from '@tanstack/react-query'
import { useResolveAction } from '../../../hooks/useConversationTurn'
import type { ApiError } from '../../../api/client'
import type { AgentCard, QuickOption, QuickOptionsCardPayload } from '../../../types/agent'

interface QuickOptionsCardProps {
  card: AgentCard
  messageId: string
  conversationId: string
}

export default function QuickOptionsCard({ card, messageId, conversationId }: QuickOptionsCardProps) {
  const { t } = useTranslation('chat')
  const resolveAction = useResolveAction(conversationId)
  // Con un turno de texto en vuelo, elegir un chip crearía una carrera (la
  // invalidación pisa el mensaje optimista del turno): se espera a que termine.
  const turnInFlight = useIsMutating({ mutationKey: ['agent-turn', conversationId] }) > 0
  const payload = card.payload as unknown as QuickOptionsCardPayload | undefined
  const options: QuickOption[] = Array.isArray(payload?.options) ? payload.options : []
  const groupLabel = typeof payload?.label === 'string' ? payload.label : null
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="chat-quick-options-group">
      {groupLabel && <span className="chat-quick-options-label">{groupLabel}</span>}
      <div className="chat-quick-options">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            className={`chat-quick-option-btn${opt.default ? ' is-default' : ''}`}
            onClick={() => handleSelect(opt.value)}
            disabled={resolveAction.isPending || turnInFlight}
          >
            {opt.label}
            {opt.default && (
              <span className="chat-quick-option-default">{` · ${t('quickOptions.default')}`}</span>
            )}
          </button>
        ))}
      </div>
      {error && <span className="chat-quick-options-error" role="alert">{error}</span>}
    </div>
  )
}
