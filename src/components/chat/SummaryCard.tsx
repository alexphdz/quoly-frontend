import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, TextButton, IntelligenceMark } from '../../design-system'
import { useResolveAction } from '../../hooks/useConversationTurn'
import type { AgentCard, RfqSummaryCard } from '../../types/agent'
import { ApiError } from '../../api/client'

interface SummaryCardProps {
  card: AgentCard
  messageId: string
  conversationId: string
}

const FIELD_ORDER = [
  'name', 'description', 'quantity', 'base_unit', 'base_currency',
  'delivery_point', 'response_deadline', 'requested_delivery_date',
  'technical_requirements',
]

export default function SummaryCard({ card, messageId, conversationId }: SummaryCardProps) {
  const { t } = useTranslation('chat')
  const resolveAction = useResolveAction(conversationId)
  const [error, setError] = useState<string | null>(null)

  if (card.state === 'resolved') {
    return (
      <div className="chat-card is-resolved">
        <div className="chat-card-divider" />
        <span className="chat-card-resolved-label">{t('summary.title')}</span>
      </div>
    )
  }

  if (card.state === 'outdated' || card.state === 'dismissed') {
    return (
      <div className="chat-card is-dimmed">
        <div className="chat-card-divider" />
        <span className="chat-card-state-label">
          {card.state === 'outdated' ? t('summary.outdated') : t('summary.dismissed')}
        </span>
      </div>
    )
  }

  const payload = card.payload as unknown as RfqSummaryCard
  const fields = payload?.fields ?? {}
  const assumedFields: string[] = payload?.assumed_fields ?? []
  const confirmToken: string = payload?.confirm_token ?? ''

  async function handleConfirm() {
    setError(null)
    try {
      await resolveAction.mutateAsync({
        card_id: messageId,
        card_version: card.version,
        action: 'confirm',
        confirm_token: confirmToken,
      })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t('errors.cardExpired', { defaultValue: 'The summary has changed. Please review again.' }))
      } else {
        setError(t('errors.turnFailed'))
      }
    }
  }

  async function handleDismiss() {
    setError(null)
    await resolveAction.mutateAsync({
      card_id: messageId,
      card_version: card.version,
      action: 'dismiss',
    })
  }

  const displayFields = FIELD_ORDER.filter(k => fields[k] != null)

  return (
    <div className="chat-card is-pending">
      <div className="chat-card-header">
        <span className="chat-card-title">{t('summary.title')}</span>
      </div>

      <table className="chat-summary-table">
        <tbody>
          {displayFields.map(key => {
            const isAssumed = assumedFields.includes(key)
            return (
              <tr key={key} className={isAssumed ? 'is-assumed' : ''}>
                <td className="chat-summary-label">
                  {isAssumed && (
                    <span className="chat-summary-assumed-mark">
                      <IntelligenceMark size={12} variant="proposed" color="var(--color-data-proposed-text)" />
                    </span>
                  )}
                  <span className={isAssumed ? 'chat-summary-label-text is-assumed' : 'chat-summary-label-text'}>
                    {t(`summary.fields.${key}`, { defaultValue: key })}
                  </span>
                </td>
                <td className="chat-summary-value">
                  <span
                    className={isAssumed ? 'chat-summary-value-text is-assumed' : 'chat-summary-value-text'}
                    title={isAssumed ? t('summary.assumedTooltip') : undefined}
                  >
                    {String(fields[key])}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {error && <p className="chat-card-error">{error}</p>}

      <div className="chat-card-actions">
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirm}
          loading={resolveAction.isPending}
          disabled={resolveAction.isPending}
        >
          {t('summary.confirm')}
        </Button>
        <TextButton size="sm" onClick={handleDismiss} disabled={resolveAction.isPending}>
          {t('summary.dismiss')}
        </TextButton>
      </div>
    </div>
  )
}
