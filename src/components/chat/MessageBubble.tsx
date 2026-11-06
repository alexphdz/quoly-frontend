import i18n from '../../i18n'
import { IntelligenceMark } from '../../design-system'
import ChatMarkdown from './ChatMarkdown'
import type { AgentMessage } from '../../types/agent'
import SummaryCard from './SummaryCard'
import SummaryCardInteractive from './cards/SummaryCardInteractive'
import SupplierPickerCard from './cards/SupplierPickerCard'
import QuickOptionsCard from './cards/QuickOptionsCard'
import UndoCard from './cards/UndoCard'
import ApprovalCard from './cards/ApprovalCard'

interface MessageBubbleProps {
  message: AgentMessage
  prevMessage?: AgentMessage
  conversationId: string
  onUndoExpired?: () => void
}

function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  } catch {
    return ''
  }
}

function formatDateSep(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    const lng = i18n.resolvedLanguage || 'es'
    const day = d.getDate()
    const month = d.toLocaleString(lng, { month: 'short' })
    const today = i18n.t('dateToday', { ns: 'chat', defaultValue: 'Hoy' })
    return isToday ? `${today} · ${day} ${month}` : `${day} ${month}`
  } catch {
    return ''
  }
}

function isDifferentDay(a: AgentMessage | undefined, b: AgentMessage): boolean {
  if (!a) return true
  try {
    const da = new Date(a.created_at).toDateString()
    const db = new Date(b.created_at).toDateString()
    return da !== db
  } catch {
    return false
  }
}

function DateSeparator({ isoStr }: { isoStr: string }) {
  return (
    <div className="chat-date-separator">
      <span className="chat-date-separator-line" aria-hidden />
      <span className="chat-date-separator-text">{formatDateSep(isoStr)}</span>
      <span className="chat-date-separator-line" aria-hidden />
    </div>
  )
}

function SystemEvent({ content }: { content: string }) {
  return (
    <div className="chat-system-event">
      <span className="chat-system-event-line" aria-hidden />
      <span className="chat-system-event-text">{content}</span>
      <span className="chat-system-event-line" aria-hidden />
    </div>
  )
}

function CardRenderer({ message, conversationId, onUndoExpired }: MessageBubbleProps) {
  const { card } = message
  if (!card) return null

  switch (card.type) {
    case 'rfq_summary':
      return (
        <SummaryCardInteractive
          card={card}
          messageId={message.id}
          conversationId={conversationId}
        />
      )
    case 'supplier_picker':
      return (
        <SupplierPickerCard
          card={card}
          messageId={message.id}
          conversationId={conversationId}
        />
      )
    case 'quick_options':
      return (
        <QuickOptionsCard
          card={card}
          messageId={message.id}
          conversationId={conversationId}
        />
      )
    case 'undo':
      return (
        <UndoCard
          card={card}
          messageId={message.id}
          conversationId={conversationId}
          onExpired={onUndoExpired}
        />
      )
    case 'approval':
      return (
        <ApprovalCard
          card={card}
          messageId={message.id}
          conversationId={conversationId}
        />
      )
    default:
      return (
        <SummaryCard
          card={card}
          messageId={message.id}
          conversationId={conversationId}
        />
      )
  }
}

function AgentMessageView({ message, conversationId, onUndoExpired }: MessageBubbleProps) {
  const time = formatTime(message.created_at)
  return (
    <div className="chat-agent-message">
      <span className="chat-agent-mark">
        <IntelligenceMark size={16} />
      </span>
      <div className="chat-agent-content">
        <div className="chat-agent-header">
          <span className="chat-agent-name">{i18n.t('agentName', { ns: 'chat', defaultValue: 'Agente' })}</span>
          {time && <span className="chat-agent-time">{time}</span>}
        </div>
        {message.content && (
          <div className="chat-agent-text">
            <ChatMarkdown text={message.content} />
          </div>
        )}
        <CardRenderer
          message={message}
          conversationId={conversationId}
          onUndoExpired={onUndoExpired}
        />
      </div>
    </div>
  )
}

function UserMessageView({ message }: { message: AgentMessage }) {
  const time = formatTime(message.created_at)
  return (
    <div className="chat-user-message">
      <div className="chat-user-bubble">
        {message.content}
      </div>
      {time && <span className="chat-user-time">{time}</span>}
    </div>
  )
}

export default function MessageBubble({ message, prevMessage, conversationId, onUndoExpired }: MessageBubbleProps) {
  const showDate = isDifferentDay(prevMessage, message)

  return (
    <>
      {showDate && <DateSeparator isoStr={message.created_at} />}
      {message.role === 'system_event' && (
        <SystemEvent content={message.content ?? ''} />
      )}
      {message.role === 'agent' && (
        <AgentMessageView
          message={message}
          conversationId={conversationId}
          onUndoExpired={onUndoExpired}
        />
      )}
      {message.role === 'user' && (
        <UserMessageView message={message} />
      )}
    </>
  )
}

export function ThinkingIndicator({ text }: { text?: string }) {
  // Just the Quoly Intelligence mark + a single neutral label — no fixed rotating
  // phrases that wrongly implied every turn was "preparing a summary".
  const label = text ?? i18n.t('thinking', { ns: 'chat', defaultValue: 'Pensando…' })
  return (
    <div className="chat-thinking">
      <span className="chat-thinking-mark">
        <IntelligenceMark size={16} processing />
      </span>
      <span className="chat-thinking-text">{label}</span>
    </div>
  )
}
