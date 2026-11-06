import { useTranslation } from 'react-i18next'
import { useResolveAction } from '../../../hooks/useConversationTurn'
import type { AgentCard } from '../../../types/agent'

interface QuickOption {
  value: string
  label: string
}

interface QuickOptionsCardProps {
  card: AgentCard
  messageId: string
  conversationId: string
}

export default function QuickOptionsCard({ card, messageId, conversationId }: QuickOptionsCardProps) {
  const { t: _t } = useTranslation('chat')
  const resolveAction = useResolveAction(conversationId)
  const options: QuickOption[] = (card.payload?.options as QuickOption[]) ?? []
  const groupLabel = typeof card.payload?.label === 'string' ? card.payload.label : null

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
    await resolveAction.mutateAsync({
      card_id: messageId,
      card_version: card.version,
      action: 'select' as never,
      payload: { value },
    })
  }

  return (
    <div className="chat-quick-options-group">
      {groupLabel && <span className="chat-quick-options-label">{groupLabel}</span>}
      <div className="chat-quick-options">
        {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          className="chat-quick-option-btn"
          onClick={() => handleSelect(opt.value)}
          disabled={resolveAction.isPending}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
