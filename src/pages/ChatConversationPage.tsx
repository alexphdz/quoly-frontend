import { useEffect, useRef, useState } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { InlineAlert, TextButton } from '../design-system'
import ConversationList from '../components/chat/ConversationList'
import ChatInput from '../components/chat/ChatInput'
import MessageBubble, { ThinkingIndicator } from '../components/chat/MessageBubble'
import { useConversation } from '../hooks/useConversations'
import { useConversationTurn, useResolveAction } from '../hooks/useConversationTurn'
import { useConversationUpdates } from '../hooks/useConversationUpdates'
import { useShellLayout } from '../components/layout/useShellLayout'
import type { AgentMessage } from '../types/agent'

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
  const layout = useShellLayout()
  const isMobile = layout === 'mobile'
  const navigate = useNavigate()
  const location = useLocation()
  // True right after the user started a conversation from the welcome screen:
  // render the chat shell immediately (no "loading conversation" flash).
  const startingNew = !!(location.state as { initialMessage?: string } | null)?.initialMessage

  const { data: conversation, isLoading } = useConversation(conversationId)
  const turn = useConversationTurn(conversationId ?? '')
  const resolveAction = useResolveAction(conversationId ?? '')

  const { triggerFastPoll } = useConversationUpdates(conversationId, turn.isPending)

  // Send the message typed on the welcome screen, once, via this component's
  // turn instance so the thinking indicator + optimistic bubble show here.
  const initialSentRef = useRef(false)
  useEffect(() => {
    const initialMessage = (location.state as { initialMessage?: string } | null)?.initialMessage
    if (!initialSentRef.current && conversationId && initialMessage) {
      initialSentRef.current = true
      turn.mutate({ message: initialMessage })
    }
  }, [conversationId]) // eslint-disable-line react-hooks/exhaustive-deps

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messages: AgentMessage[] = conversation?.messages ?? []

  const blockingCardId = hasActiveBlockingCard(messages)
  const isBlocked = blockingCardId !== null

  const [approachingLimit, setApproachingLimit] = useState<string | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, turn.isPending])

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
        {!isMobile && <ConversationList activeId={conversationId} />}
        <div className="asistente-chat-area">
          <div className="chat-loading">{t('loadingConversation')}</div>
        </div>
      </div>
    )
  }

  const limitReached = turn.error?.message?.includes('cost_cap_reached') ||
    turn.error?.message?.includes('chat_rfqs_per_month_limit')

  const rfqId = conversation?.rfq_id
  const phase = conversation?.phase ?? 'armando'
  const draftName = conversation?.draft_data?.name ? String(conversation.draft_data.name) : null
  const rfqName = draftName
    ?? messages.find(m => m.role === 'agent' && m.content)?.content?.slice(0, 50)
    ?? null

  return (
    <div className="asistente-layout">
      {!isMobile && <ConversationList activeId={conversationId} />}

      <div className="asistente-chat-area">
        {/* Conversation header */}
        <div className="chat-conv-header">
          <div className="chat-conv-header-left">
            {rfqName && (
              <span className="chat-conv-header-title">{rfqName}</span>
            )}
            <span className="chat-conv-header-phase">
              {t(`list.statusLabel.${phase}`, { defaultValue: phase })}
            </span>
          </div>
          {rfqId && (
            <Link to={`/rfqs/${rfqId}`} className="chat-conv-header-link">
              {t('conv.viewRfq', { defaultValue: 'Ver en Solicitudes' })}
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M19 19H5V5h7V3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
            </Link>
          )}
        </div>

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

            {turn.isPending && <ThinkingIndicator />}

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
          loading={turn.isPending}
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
