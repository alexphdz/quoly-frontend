import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Icon } from '../../../design-system'
import { useResolveAction } from '../../../hooks/useConversationTurn'
import { MAILBOX_SETTINGS_PATH } from '../../../lib/mailbox'
import type { ApiError } from '../../../api/client'
import type { AgentCard, MailboxRequiredCardPayload } from '../../../types/agent'

interface MailboxRequiredCardProps {
  card: AgentCard
  messageId: string
  conversationId: string
}

// The request is ready but nothing can go out without a usable mailbox. The
// buyer connects one in Settings → Email and comes back: "recheck" swaps this
// card for the supplier picker, or answers 400 no_mailbox_connected.
export default function MailboxRequiredCard({ card, messageId, conversationId }: MailboxRequiredCardProps) {
  const { t } = useTranslation('chat')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const resolveAction = useResolveAction(conversationId)
  const payload = card.payload as unknown as MailboxRequiredCardPayload | undefined
  const reconnect = payload?.reason === 'address_unknown'
  const [error, setError] = useState<string | null>(null)

  if (card.state === 'resolved') {
    return (
      <div className="chat-card-collapsed">
        <Icon name="check-circle" size={16} weight="fill" color="var(--color-status-success-text)" />
        {t('mailboxRequired.resolved')}
      </div>
    )
  }

  if (card.state !== 'pending') return null

  async function handleRecheck() {
    setError(null)
    try {
      await resolveAction.mutateAsync({
        card_id: messageId,
        card_version: card.version,
        action: 'recheck',
      })
      // The supplier picker that follows reads the mailbox from the profile.
      queryClient.invalidateQueries({ queryKey: ['me'] })
    } catch (err) {
      const apiError = err as ApiError
      const code = apiError.code ?? apiError.detail
      setError(
        code === 'no_mailbox_connected'
          ? t('mailboxRequired.stillMissing')
          : code === 'mailbox_address_unknown'
            ? t('errors.mailboxAddressUnknown')
            : t('errors.turnFailed'),
      )
    }
  }

  return (
    <div className="chat-card is-pending">
      <div className="chat-card-header">
        <Icon name="envelope-simple" size={16} />
        <span className="chat-card-title">
          {reconnect ? t('mailboxRequired.titleReconnect') : t('mailboxRequired.title')}
        </span>
      </div>
      <p className="chat-mailbox-card-text">
        {reconnect ? t('mailboxRequired.textReconnect') : t('mailboxRequired.text')}
      </p>
      {error && <p className="chat-card-error" role="alert">{error}</p>}
      <div className="chat-card-actions">
        <Button variant="primary" size="sm" icon="envelope-simple" onClick={() => navigate(MAILBOX_SETTINGS_PATH)}>
          {reconnect ? t('mailboxRequired.reconnect') : t('mailboxRequired.connect')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRecheck}
          disabled={resolveAction.isPending}
          loading={resolveAction.isPending}
        >
          {t('mailboxRequired.recheck')}
        </Button>
      </div>
    </div>
  )
}
