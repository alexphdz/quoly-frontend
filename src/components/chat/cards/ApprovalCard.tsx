import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Icon, TextButton, IconButton, InlineAlert, IntelligenceMark } from '../../../design-system'
import { useAuth } from '../../../hooks/useAuth'
import { useResolveAction } from '../../../hooks/useConversationTurn'
import type { AgentCard, ApprovalCardPayload, GroundingEntry } from '../../../types/agent'

interface ApprovalCardProps {
  card: AgentCard
  messageId: string
  conversationId: string
}

function GroundingCollapsible({ grounding }: { grounding: GroundingEntry[] }) {
  const { t } = useTranslation('chat')
  const [open, setOpen] = useState(false)

  if (!grounding || grounding.length === 0) return null

  return (
    <div className="chat-approval-grounding">
      <button
        type="button"
        className="chat-approval-grounding-toggle"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span>{t('approval.sourcesWithCount', { count: grounding.length, defaultValue: `Ver fuentes (${grounding.length})` })}</span>
        <span className="chat-approval-grounding-chevron" aria-hidden>
          <Icon name={open ? 'caret-up' : 'caret-down'} size={12} />
        </span>
      </button>
      {open && (
        <ul className="chat-approval-grounding-list">
          {grounding.map((entry, i) => (
            <li key={i} className="chat-approval-grounding-entry">
              <span className="chat-approval-grounding-sentence">{entry.sentence}</span>
              <span className="chat-approval-grounding-source">
                {t('approval.source', { field: entry.source_field })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ApprovalCard({ card, messageId, conversationId }: ApprovalCardProps) {
  const { t } = useTranslation('chat')
  const { user } = useAuth()
  const resolveAction = useResolveAction(conversationId)
  const payload = card.payload as unknown as ApprovalCardPayload

  const [editing, setEditing] = useState(false)
  const [editedBody, setEditedBody] = useState(payload?.draft_body ?? '')

  const isOutlook = !!(user?.outlook_connected)
  const isSensitive = payload?.question_type === 'sensitive_commitment'
  const isPending = card.state === 'pending'

  if (card.state === 'resolved') {
    return (
      <div className="chat-card is-resolved">
        <div className="chat-card-divider" />
        <span className="chat-card-resolved-label">
          {t('approval.approve')}
        </span>
      </div>
    )
  }

  if (card.state === 'dismissed') {
    return (
      <div className="chat-card is-dimmed">
        <div className="chat-card-divider" />
        <span className="chat-card-state-label">{`(${t('card.dismissed')})`}</span>
      </div>
    )
  }

  if (card.state === 'outdated') {
    return (
      <div className="chat-card is-dimmed">
        <div className="chat-card-divider" />
        <span className="chat-card-state-label">{`(${t('card.outdated')})`}</span>
      </div>
    )
  }

  async function handleApprove() {
    await resolveAction.mutateAsync({
      card_id: messageId,
      card_version: card.version,
      action: 'approve',
      confirm_token: payload.confirm_token,
    })
  }

  async function handleSendEdited() {
    await resolveAction.mutateAsync({
      card_id: messageId,
      card_version: card.version,
      action: 'edit',
      confirm_token: payload.confirm_token,
      payload: { body: editedBody },
    })
    setEditing(false)
  }

  async function handleDiscard() {
    await resolveAction.mutateAsync({
      card_id: messageId,
      card_version: card.version,
      action: 'discard',
    })
  }

  function handleCopyReply() {
    navigator.clipboard.writeText(payload?.draft_body ?? '')
  }

  return (
    <div className="chat-card chat-approval-card">
      {/* Header */}
      <div className="chat-approval-header">
        {t('approval.draftHeader', { defaultValue: 'Borrador por aprobar' })}
        {' · '}
        <span className="chat-approval-supplier">{payload?.supplier_name}</span>
      </div>

      {/* Quoted question */}
      {payload?.question && (
        <blockquote className="chat-approval-question">
          {(payload?.supplier_name || (payload as { question_asked_at?: string }).question_asked_at) && (
            <span className="chat-approval-question-meta">
              {t('approval.askedAt', {
                supplier: payload.supplier_name,
                time: (payload as { question_asked_at?: string }).question_asked_at ?? '',
                defaultValue: `${payload.supplier_name} preguntó`,
              })}
            </span>
          )}
          <span className="chat-approval-question-text">{payload.question}</span>
        </blockquote>
      )}

      {/* Sensitive commitment warning */}
      {isSensitive && (
        <InlineAlert tone="warning" className="chat-approval-sensitive-note">
          {t('approval.sensitiveNote')}
        </InlineAlert>
      )}

      {/* Outlook limitation note */}
      {isOutlook && (
        <InlineAlert tone="warning" className="chat-approval-outlook-note">
          <span>{t('approval.outlookNote')}</span>
          <IconButton
            icon="copy"
            size="xs"
            label={t('approval.copyReply')}
            onClick={handleCopyReply}
            className="chat-approval-copy-btn"
          />
        </InlineAlert>
      )}

      {/* Draft label */}
      <div className="chat-approval-draft-label">
        <IntelligenceMark size={12} />
        <span>{t('approval.draftLabel', { defaultValue: 'Borrador' })}</span>
      </div>

      {/* Draft body */}
      <div className="chat-approval-body">
        {editing && isPending ? (
          <textarea
            className="chat-approval-edit-area"
            value={editedBody}
            onChange={e => setEditedBody(e.target.value)}
            rows={5}
          />
        ) : (
          <p className="chat-approval-body-text">{payload?.draft_body}</p>
        )}
      </div>

      {/* Grounding collapsible */}
      <GroundingCollapsible grounding={payload?.grounding ?? []} />

      {/* Recipient */}
      {(payload as { recipient?: string }).recipient && (
        <div className="chat-approval-recipient">
          {(payload as { recipient?: string }).recipient}
        </div>
      )}

      {/* Actions */}
      {isPending && (
        <div className="chat-approval-actions">
          {editing ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSendEdited}
                disabled={resolveAction.isPending || !editedBody.trim()}
              >
                {t('approval.sendEdited')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setEditing(false); setEditedBody(payload?.draft_body ?? '') }}
              >
                {t('approval.cancelEdit', { defaultValue: 'Cancelar' })}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                size="sm"
                icon="paper-plane-tilt"
                onClick={handleApprove}
                disabled={resolveAction.isPending}
              >
                {t('approval.approve')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon="pencil-simple"
                onClick={() => setEditing(true)}
                disabled={resolveAction.isPending}
              >
                {t('approval.edit')}
              </Button>
              <TextButton
                size="sm"
                onClick={handleDiscard}
                disabled={resolveAction.isPending}
              >
                {t('approval.discard')}
              </TextButton>
            </>
          )}
        </div>
      )}
    </div>
  )
}
