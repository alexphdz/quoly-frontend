import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useRef, useState, type KeyboardEvent, type FormEvent } from 'react'
import { Icon } from '../design-system'
import FileUploadButton from '../components/chat/FileUploadButton'
import * as agentApi from '../api/agent'
import { useAuth } from '../hooks/useAuth'
import type { ConversationDetail } from '../types/agent'

const EXAMPLE_CARDS = [
  {
    titleKey: 'empty.card1Title',
    descKey: 'empty.card1Desc',
    titleDefault: 'Cajas de cartón',
    descDefault: '5,000 cajas de cartón corrugado para entrega en Monterrey antes del 15 de diciembre',
  },
  {
    titleKey: 'empty.card2Title',
    descKey: 'empty.card2Desc',
    titleDefault: 'Etiquetas con diseño',
    descDefault: '20,000 etiquetas BOPP de 8 × 5 cm; te adjunto el diseño',
  },
  {
    titleKey: 'empty.card3Title',
    descKey: 'empty.card3Desc',
    titleDefault: 'Pallets de madera',
    descDefault: '300 pallets de madera 1200 × 1000 puestos en Querétaro',
  },
]

function WelcomeArea() {
  const { t } = useTranslation('chat')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }

  async function startConversation(text: string) {
    if (!text.trim()) return
    const conv = await agentApi.createConversation()
    // Seed the detail cache so the chat page renders instantly — no
    // "loading conversation" flash between the welcome screen and the chat.
    queryClient.setQueryData<ConversationDetail>(['agent-conversation', conv.id], {
      id: conv.id,
      phase: conv.phase ?? 'armando',
      rfq_id: conv.rfq_id ?? null,
      draft_data: conv.draft_data ?? null,
      messages: conv.messages ?? [],
      turns_count: conv.turns_count ?? 0,
      turns_remaining: conv.turns_remaining ?? 40,
    })
    navigate(`/asistente/${conv.id}`, { state: { initialMessage: text.trim() } })
  }

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    await startConversation(value)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      startConversation(value)
    }
  }

  const firstName = user?.first_name ?? ''
  const canSend = value.trim().length > 0

  return (
    <div className="chat-welcome-outer">
      <div className="chat-welcome-inner">
        {firstName && (
          <p className="chat-welcome-greeting">{t('empty.greeting', { name: firstName, defaultValue: `Hola, ${firstName}` })}</p>
        )}
        <h2 className="chat-welcome-title">
          {t('empty.title')}
        </h2>

        <form className="chat-welcome-input-box" onSubmit={handleSubmit}>
          <textarea
            ref={textareaRef}
            className="chat-welcome-textarea"
            placeholder={t('empty.inputPlaceholder', { defaultValue: 'Ej. 5,000 cajas de cartón corrugado para Monterrey en diciembre' })}
            value={value}
            rows={2}
            onChange={e => { setValue(e.target.value); autoResize() }}
            onKeyDown={handleKeyDown}
            aria-label={t('empty.title')}
          />
          <div className="chat-welcome-input-bottom">
            <FileUploadButton
              onFile={() => {}}
              disabled={false}
            />
            <button
              type="submit"
              className="chat-input-send"
              disabled={!canSend}
              aria-label={t('input.send')}
            >
              <Icon name="paper-plane-tilt" size={16} weight="fill" />
            </button>
          </div>
        </form>

        <div className="chat-welcome-cards">
          {EXAMPLE_CARDS.map((card, i) => (
            <button
              key={i}
              type="button"
              className="chat-welcome-card"
              onClick={() => startConversation(t(card.descKey, { defaultValue: card.descDefault }))}
            >
              <div className="chat-welcome-card-title">
                {t(card.titleKey, { defaultValue: card.titleDefault })}
              </div>
              <div className="chat-welcome-card-desc">
                {t(card.descKey, { defaultValue: card.descDefault })}
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="chat-welcome-form-link"
          onClick={() => navigate('/rfqs/new')}
        >
          <Icon name="clipboard-text" size={16} />
          {t('empty.useForm', { defaultValue: 'Cotizar con el formulario' })}
        </button>
      </div>
    </div>
  )
}

export default function AsistentePage() {
  return (
    <div className="asistente-layout">
      <div className="asistente-chat-area">
        <WelcomeArea />
      </div>
    </div>
  )
}
