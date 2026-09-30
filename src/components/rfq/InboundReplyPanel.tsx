import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReplyToInbound } from '../../hooks/useInboundActions'
import type { ApiError } from '../../api/client'

interface Props {
  inboundId: string
  rfqId: string
  onClose: () => void
}

export default function InboundReplyPanel({ inboundId, rfqId, onClose }: Props) {
  const { t } = useTranslation('inbox')
  const [body, setBody] = useState('')
  const reply = useReplyToInbound(inboundId, rfqId)

  const handleSend = () => {
    if (!body.trim()) return
    reply.mutate(body, {
      onSuccess: () => onClose(),
    })
  }

  return (
    <div className="ds-ask">
      <textarea
        value={body}
        onChange={event => setBody(event.target.value)}
        rows={4}
        placeholder={t('reply_panel.placeholder')}
        style={{ width: '100%', minHeight: 96, padding: '8px 12px', border: '1px solid var(--line-strong)', borderRadius: 6, background: 'var(--bg-surface)', color: 'var(--tx-1)' }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={handleSend}
          disabled={reply.isPending || !body.trim()}
          className="ds-btn ds-btn-primary"
        >
          {reply.isPending ? t('reply_panel.sending') : t('reply_panel.sendReply')}
        </button>
        <button type="button" onClick={onClose} className="ds-btn ds-btn-secondary">
          {t('common:actions.cancel')}
        </button>
      </div>
      {reply.error && (
        <p className="ds-meta" style={{ color: 'var(--danger-fg)' }}>{(reply.error as ApiError).detail || t('reply_panel.replyFailed')}</p>
      )}
    </div>
  )
}
