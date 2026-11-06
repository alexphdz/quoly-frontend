import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useConversations } from '../../hooks/useConversations'
import { useRelativeTime } from '../../lib/relativeTime'
import type { ConversationSummary } from '../../types/agent'

interface ConversationListProps {
  activeId?: string
}

function ConversationRow({
  conv,
  isActive,
  onClick,
}: {
  conv: ConversationSummary
  isActive: boolean
  onClick: () => void
}) {
  const { t } = useTranslation('chat')
  const relativeTime = useRelativeTime()
  const baseStatus = t(`list.statusLabel.${conv.phase}`, { defaultValue: conv.phase })
  // When the RFQ has been sent, append "· Enviada · N de M respondieron".
  const status = conv.sent && (conv.supplier_count ?? 0) > 0
    ? `${baseStatus} · ${t('list.sentCount', { responded: conv.responded_count ?? 0, total: conv.supplier_count ?? 0 })}`
    : baseStatus
  const pendingLabel = conv.pending_action
    ? `→ ${t(`list.pendingLabel.${conv.pending_action}`, { defaultValue: conv.pending_action })}`
    : null

  return (
    <button
      type="button"
      className={`conv-list-row${isActive ? ' is-active' : ''}`}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="conv-list-row-top">
        <span className="conv-list-row-title">
          {conv.rfq_name ?? t('list.newRequest', { defaultValue: 'Nueva solicitud' })}
        </span>
        <span className="conv-list-row-time">{relativeTime(conv.last_activity_at)}</span>
      </div>
      <span className="conv-list-row-status">{status}</span>
      {pendingLabel && (
        <span className="conv-list-row-action">{pendingLabel}</span>
      )}
    </button>
  )
}

export default function ConversationList({ activeId }: ConversationListProps) {
  const { t } = useTranslation('chat')
  const { data: conversations, isLoading } = useConversations()
  const navigate = useNavigate()
  // A conversation is only listed once it has content: an empty draft
  // (no turns, no RFQ) stays hidden until the first message is sent.
  const isEmpty = (c: ConversationSummary) => c.turns_count === 0 && !c.rfq_id
  const active = conversations?.filter(c => c.phase !== 'archivada' && !isEmpty(c)) ?? []
  const archived = conversations?.filter(c => c.phase === 'archivada') ?? []

  // "New request" returns to the welcome screen; the conversation is created
  // only when the user sends the first message (no empty rows in the list).
  function handleNew() {
    navigate('/asistente')
  }

  return (
    <aside className="conv-list-panel">
      <div className="conv-list-header">
        <button type="button" className="conv-list-new-btn" onClick={handleNew}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          {t('list.newConversation', { defaultValue: 'Nueva solicitud de cotización' })}
        </button>
      </div>

      <div className="conv-list-section-label">
        {t('list.sectionLabel', { defaultValue: 'CONVERSACIONES' })}
      </div>

      <div className="conv-list-scroll">
        {isLoading && (
          <div className="conv-list-loading">
            {[0, 1, 2].map(i => (
              <div key={i} className="conv-list-skeleton" />
            ))}
          </div>
        )}

        {!isLoading && active.length === 0 && archived.length === 0 && (
          <div className="conv-list-empty">
            {t('list.emptyText', { defaultValue: 'Aquí verás lo que cotices desde el chat.' })}
          </div>
        )}

        {active.map(conv => (
          <ConversationRow
            key={conv.id}
            conv={conv}
            isActive={conv.id === activeId}
            onClick={() => navigate(`/asistente/${conv.id}`)}
          />
        ))}

        {archived.length > 0 && (
          <button type="button" className="conv-list-archived-toggle">
            {t('list.archived', { defaultValue: 'Archivadas' })} ({archived.length})
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
        )}
      </div>
    </aside>
  )
}
