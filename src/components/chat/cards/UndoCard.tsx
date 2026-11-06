import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextButton } from '../../../design-system'
import { useResolveAction } from '../../../hooks/useConversationTurn'
import type { AgentCard, UndoCardPayload } from '../../../types/agent'

interface UndoCardProps {
  card: AgentCard
  messageId: string
  conversationId: string
  onExpired?: () => void
}

export default function UndoCard({ card, messageId, conversationId, onExpired }: UndoCardProps) {
  const { t } = useTranslation('chat')
  const resolveAction = useResolveAction(conversationId)
  const payload = card.payload as unknown as UndoCardPayload
  const sentTo = payload?.sent_to ?? 0
  const expiresAt = payload?.expires_at ? new Date(payload.expires_at).getTime() : Date.now() + 30_000

  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.round((expiresAt - Date.now()) / 1000)))
  const [expired, setExpired] = useState(secondsLeft <= 0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (expired || card.state !== 'pending') return

    intervalRef.current = window.setInterval(() => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining <= 0) {
        setExpired(true)
        if (intervalRef.current) window.clearInterval(intervalRef.current)
        onExpired?.()
      }
    }, 500)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [expiresAt, expired, card.state, onExpired])

  if (card.state === 'resolved' || card.state === 'dismissed' || expired) {
    return null
  }

  const progress = Math.max(0, secondsLeft / 30)

  async function handleUndo() {
    await resolveAction.mutateAsync({
      card_id: messageId,
      card_version: card.version,
      action: 'undo',
    })
  }

  return (
    <div className="chat-undo-banner" role="status">
      <div className="chat-undo-content">
        <span className="chat-undo-text">
          {t('undo.banner', { count: sentTo, seconds: secondsLeft })}
        </span>
        <TextButton
          size="sm"
          onClick={handleUndo}
          disabled={resolveAction.isPending}
          className="chat-undo-action"
        >
          {t('undo.action')}
        </TextButton>
      </div>
      <div className="chat-undo-progress-track">
        <div
          className="chat-undo-progress-fill"
          style={{ transform: `scaleX(${progress})` }}
        />
      </div>
    </div>
  )
}
