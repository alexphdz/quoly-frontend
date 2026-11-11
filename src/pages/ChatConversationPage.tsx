import { useEffect, useRef, useState } from 'react'
import { useIsMutating } from '@tanstack/react-query'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { InlineAlert, TextButton } from '../design-system'
import ChatInput from '../components/chat/ChatInput'
import MessageBubble, { ThinkingIndicator } from '../components/chat/MessageBubble'
import { useConversation } from '../hooks/useConversations'
import { useConversationTurn, useResolveAction } from '../hooks/useConversationTurn'
import { useConversationUpdates } from '../hooks/useConversationUpdates'
import type { AgentMessage } from '../types/agent'

// Conversaciones cuyo mensaje inicial ya se envió (sobrevive remounts de StrictMode).
const initialTurnSent = new Set<string>()

function hasActiveBlockingCard(messages: AgentMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    if (msg.card?.type === 'supplier_picker' && msg.card.state === 'pending') {
      return msg.id
    }
  }
  return null
}

export default function ChatConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const { t } = useTranslation('chat')
  const navigate = useNavigate()
  const location = useLocation()
  // True right after the user started a conversation from the welcome screen:
  // render the chat shell immediately (no "loading conversation" flash).
  const startingNew = !!(location.state as { initialMessage?: string } | null)?.initialMessage

  const { data: conversation, isLoading } = useConversation(conversationId)
  const turn = useConversationTurn(conversationId ?? '')
  const resolveAction = useResolveAction(conversationId ?? '')

  const { triggerFastPoll } = useConversationUpdates(conversationId, turn.isPending)

  // Acciones de tarjeta en vuelo (chips, confirmar, enviar) desde CUALQUIER
  // componente: tras un clic en chip el backend genera la siguiente pregunta
  // con el LLM — el comprador debe ver "Pensando…" también ahí.
  const actionPending = useIsMutating({ mutationKey: ['agent-action', conversationId ?? ''] }) > 0

  // Send the message typed on the welcome screen, once, via this component's
  // turn instance so the thinking indicator + optimistic bubble show here.
  // CRÍTICO: el guard vive a nivel módulo (no useRef) porque StrictMode en dev
  // desmonta/remonta el componente y un ref se resetea → DOS POST /turns con el
  // mismo mensaje (turno duplicado = thinking fantasma + respuestas dobles).
  // Además se limpia location.state: si no, un F5 re-enviaba el mensaje.
  useEffect(() => {
    const initialMessage = (location.state as { initialMessage?: string } | null)?.initialMessage
    if (conversationId && initialMessage && !initialTurnSent.has(conversationId)) {
      initialTurnSent.add(conversationId)
      turn.mutate({ message: initialMessage })
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messages: AgentMessage[] = conversation?.messages ?? []

  // "Pensando…" se deriva del estado REAL de la conversación, no de un flag que
  // se puede quedar colgado: se muestra mientras un turno corre y el último
  // mensaje sigue siendo del usuario (el agente aún no respondió), o mientras
  // se procesa una acción de tarjeta. En cuanto llega CUALQUIER mensaje del
  // agente, el último deja de ser del usuario y el indicador desaparece solo.
  const lastMsg = messages[messages.length - 1]
  const showThinking = (turn.isPending && lastMsg?.role === 'user') || actionPending

  const blockingCardId = hasActiveBlockingCard(messages)
  const isBlocked = blockingCardId !== null

  const [approachingLimit, setApproachingLimit] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, showThinking])

  async function handleSend(message: string, attachmentIds: string[]) {
    const result = await turn.mutateAsync({ message, attachments: attachmentIds })
    if (result?.warning === 'approaching_limit') {
      setApproachingLimit(String(
        typeof conversation?.turns_remaining === 'number'
          ? conversation.turns_remaining
          : ''
      ))
    }
  }

  async function handleDismissBlock() {
    if (!blockingCardId || !conversationId) return
    const msg = messages.find(m => m.id === blockingCardId)
    if (!msg?.card) return
    await resolveAction.mutateAsync({
      card_id: blockingCardId,
      card_version: msg.card.version,
      action: 'dismiss',
    })
  }

  function handleUndoExpired() {
    triggerFastPoll()
  }

  if (isLoading && !startingNew && messages.length === 0) {
    return (
      <div className="asistente-layout">
        <div className="asistente-chat-area">
          <div className="chat-loading">{t('loadingConversation')}</div>
        </div>
      </div>
    )
  }

  const limitReached = turn.error?.message?.includes('cost_cap_reached') ||
    turn.error?.message?.includes('chat_rfqs_per_month_limit')

  return (
    <div className="asistente-layout">
      <div className="asistente-chat-area">
        <div className="chat-messages-scroll">
          <div className="chat-messages-inner">
            {messages.map((msg, idx) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                prevMessage={messages[idx - 1]}
                conversationId={conversationId ?? ''}
                onUndoExpired={handleUndoExpired}
              />
            ))}

            {showThinking && <ThinkingIndicator />}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {limitReached && (
          <div className="chat-limit-banner">
            <InlineAlert tone="warning">
              {t('limit.reached')}
              {' '}
              <TextButton size="sm" onClick={() => navigate('/rfqs/new')}>
                {t('limit.useForm')}
              </TextButton>
            </InlineAlert>
          </div>
        )}

        <ChatInput
          conversationId={conversationId ?? ''}
          onSend={handleSend}
          loading={showThinking}
          disabled={false}
          blocked={isBlocked}
          onDismissBlock={isBlocked ? handleDismissBlock : undefined}
          warning={approachingLimit}
          turnError={turn.isError && !limitReached ? t('errors.agentError', { defaultValue: 'No pude responder. Tu mensaje sigue aquí.' }) : null}
          onRetry={turn.isError ? () => turn.reset() : undefined}
        />
      </div>
    </div>
  )
}
