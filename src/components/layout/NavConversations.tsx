import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Icon } from '../../design-system'
import { useConversations } from '../../hooks/useConversations'
import { useRelativeTime } from '../../lib/relativeTime'
import type { ConversationSummary } from '../../types/agent'

/**
 * Conversaciones del Agente dentro del sidebar de navegación (prop `section`
 * del Sidebar/MobileNavDrawer). Solo se monta cuando el tab Agente está activo.
 * Sustituye al antiguo panel lateral independiente del chat.
 */
export default function NavConversations() {
  const { t } = useTranslation('chat')
  const navigate = useNavigate()
  const { conversationId } = useParams<{ conversationId: string }>()
  const { data: conversations, isLoading } = useConversations()
  const relativeTime = useRelativeTime()

  // Un borrador vacío (sin turnos ni RFQ) no se lista hasta el primer mensaje.
  const isEmpty = (c: ConversationSummary) => c.turns_count === 0 && !c.rfq_id
  const active = conversations?.filter(c => c.phase !== 'archivada' && !isEmpty(c)) ?? []

  return (
    <div className="nav-convs">
      <div className="nav-convs-head">
        <span className="nav-convs-label">{t('list.sectionLabel', { defaultValue: 'Conversaciones' })}</span>
        <button
          type="button"
          className="nav-convs-new"
          title={t('list.newRequest', { defaultValue: 'Nueva solicitud' })}
          aria-label={t('list.newRequest', { defaultValue: 'Nueva solicitud' })}
          onClick={() => navigate('/asistente')}
        >
          <Icon name="plus" size={16} />
        </button>
      </div>

      <div className="nav-convs-scroll">
        {isLoading && (
          <>
            <span className="nav-convs-skeleton" />
            <span className="nav-convs-skeleton" />
          </>
        )}

        {!isLoading && active.length === 0 && (
          <p className="nav-convs-empty">
            {t('list.emptyText', { defaultValue: 'Aquí verás lo que cotices desde el chat.' })}
          </p>
        )}

        {active.map(conv => {
          const isActive = conv.id === conversationId
          const status = conv.sent && (conv.supplier_count ?? 0) > 0
            ? t('list.sentCount', { responded: conv.responded_count ?? 0, total: conv.supplier_count ?? 0 })
            : t(`list.statusLabel.${conv.phase}`, { defaultValue: conv.phase })
          return (
            <div key={conv.id} className={`nav-convs-row${isActive ? ' is-active' : ''}`}>
              <button
                type="button"
                className="nav-convs-row-main"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => navigate(`/asistente/${conv.id}`)}
              >
                <span className="nav-convs-row-title">
                  {conv.rfq_name ?? t('list.newRequest', { defaultValue: 'Nueva solicitud' })}
                </span>
                <span className="nav-convs-row-meta">
                  <span className="nav-convs-row-status">{status}</span>
                  <span className="nav-convs-row-time">{relativeTime(conv.last_activity_at)}</span>
                </span>
                {conv.pending_action && (
                  <span className="nav-convs-row-pending">
                    {t(`list.pendingLabel.${conv.pending_action}`, { defaultValue: conv.pending_action })}
                  </span>
                )}
              </button>
              {conv.rfq_id && (
                <button
                  type="button"
                  className="nav-convs-row-link"
                  title={t('conv.viewRfq', { defaultValue: 'Ver en Solicitudes' })}
                  aria-label={t('conv.viewRfq', { defaultValue: 'Ver en Solicitudes' })}
                  onClick={() => navigate(`/rfqs/${conv.rfq_id}`)}
                >
                  <Icon name="arrow-square-out" size={14} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
