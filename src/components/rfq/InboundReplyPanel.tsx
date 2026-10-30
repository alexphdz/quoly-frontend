import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReplyToInbound, useSuggestReply } from '../../hooks/useInboundActions'
import type { ApiError } from '../../api/client'

interface Props {
  inboundId: string
  rfqId: string
  onClose: () => void
}

export default function InboundReplyPanel({ inboundId, rfqId, onClose }: Props) {
  const { t } = useTranslation('inbox')
  const [body, setBody] = useState('')
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const reply = useReplyToInbound(inboundId, rfqId)
  const suggest = useSuggestReply(inboundId)

  const handleSend = () => {
    if (!body.trim()) return
    reply.mutate(body, {
      onSuccess: () => onClose(),
    })
  }

  // The AI draft is only generated on explicit request; the buyer always
  // reviews, edits, and sends. Nothing is auto-sent.
  const handleSuggest = () => {
    suggest.mutate(undefined, {
      onSuccess: data => setSuggestion(data.suggested_reply),
    })
  }

  const takeSuggestion = () => {
    if (suggestion) {
      setBody(suggestion)
      setSuggestion(null)
    }
  }

  return (
    <div className="ds-ask">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={suggest.isPending}
          className="ds-btn ds-btn-secondary"
        >
          {suggest.isPending ? t('reply_panel.suggesting') : t('reply_panel.suggest')}
        </button>
      </div>

      {suggestion && (
        <div
          style={{
            border: '1px solid var(--line-strong)',
            borderRadius: 8,
            background: 'var(--bg-subtle)',
            padding: '10px 12px',
            marginBottom: 10,
          }}
        >
          <p className="ds-meta" style={{ marginBottom: 6 }}>{t('reply_panel.suggestionLabel')}</p>
          <p style={{ whiteSpace: 'pre-wrap', margin: '0 0 10px', color: 'var(--tx-1)' }}>{suggestion}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={takeSuggestion} className="ds-btn ds-btn-primary">
              {t('reply_panel.useSuggestion')}
            </button>
            <button type="button" onClick={() => setSuggestion(null)} className="ds-btn ds-btn-quiet">
              {t('reply_panel.dismissSuggestion')}
            </button>
          </div>
        </div>
      )}

      {suggest.error && (
        <p className="ds-meta" style={{ color: 'var(--danger-fg)', marginBottom: 8 }}>
          {t('reply_panel.suggestFailed')}
        </p>
      )}

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
