import { CheckCircle } from '@phosphor-icons/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, IntelligenceMark } from '../../../design-system'
import { useResolveAction } from '../../../hooks/useConversationTurn'
import { useFormat } from '../../../lib/format'
import type { AgentCard, RfqSummaryCard } from '../../../types/agent'
import { ApiError } from '../../../api/client'

interface SummaryCardInteractiveProps {
  card: AgentCard
  messageId: string
  conversationId: string
}

// base_unit is merged into the "Cantidad" row, so it is not shown separately.
const FIELD_ORDER = [
  'name', 'description', 'quantity', 'base_currency',
  'delivery_point', 'response_deadline', 'requested_delivery_date',
  'technical_requirements', 'attachments',
]

const CURRENCY_LABEL: Record<string, string> = {
  MXN: 'MXN · Peso mexicano',
  USD: 'USD · Dólar estadounidense',
  EUR: 'EUR · Euro',
  CAD: 'CAD · Dólar canadiense',
  GBP: 'GBP · Libra esterlina',
  CNY: 'CNY · Yuan',
}

const FIELD_LABEL_ES: Record<string, string> = {
  name: 'Nombre',
  description: 'Descripción',
  quantity: 'Cantidad',
  base_unit: 'Unidad',
  base_currency: 'Moneda',
  delivery_point: 'Lugar de entrega',
  response_deadline: 'Plazo de respuesta',
  requested_delivery_date: 'Entrega deseada',
  technical_requirements: 'Requisitos técnicos',
  attachments: 'Archivos',
}

export default function SummaryCardInteractive({ card, messageId, conversationId }: SummaryCardInteractiveProps) {
  const { t } = useTranslation('chat')
  const fmt = useFormat()
  const resolveAction = useResolveAction(conversationId)
  const [error, setError] = useState<string | null>(null)

  if (card.state === 'resolved') {
    return (
      <div className="chat-card is-resolved">
        <div className="chat-card-header">
          <span className="chat-card-title">{t('summary.title', { defaultValue: 'RESUMEN DE LA SOLICITUD' })}</span>
        </div>
        <div className="chat-card-resolved-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <CheckCircle size={16} weight="fill" color="var(--accent)" aria-hidden />
          {t('summary.rfqCreated', { defaultValue: 'Solicitud creada' })}
        </div>
      </div>
    )
  }

  if (card.state === 'outdated' || card.state === 'dismissed') {
    return (
      <div className="chat-card is-dimmed">
        <div className="chat-card-state-label">
          {card.state === 'outdated' ? `(${t('card.outdated')})` : `(${t('card.dismissed')})`}
        </div>
      </div>
    )
  }

  const payload = card.payload as unknown as RfqSummaryCard & { corrected_fields?: string[] }
  const fields = payload?.fields ?? {}
  const assumedFields: string[] = payload?.assumed_fields ?? []
  const correctedFields: string[] = payload?.corrected_fields ?? []
  const confirmToken: string = payload?.confirm_token ?? ''

  const displayFields = FIELD_ORDER.filter(k => fields[k] != null)

  // Format raw backend values for display (contract stays raw).
  function displayValue(key: string): string {
    const raw = fields[key]
    if (raw == null) return ''
    if (key === 'quantity') {
      const n = Number(raw)
      const num = Number.isFinite(n) && String(raw).trim() !== '' ? fmt.number(n) : String(raw)
      const unit = fields['base_unit'] != null ? String(fields['base_unit']) : ''
      return unit ? `${num} ${unit}` : num
    }
    if (key === 'base_currency') {
      const code = String(raw).toUpperCase()
      return CURRENCY_LABEL[code] ?? String(raw)
    }
    if (key === 'response_deadline' || key === 'requested_delivery_date') {
      // Parse date-only values at local noon so the timezone never shifts the day.
      const s = String(raw)
      const d = fmt.date(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T12:00:00` : s)
      return d || s
    }
    return String(raw)
  }

  async function handleConfirm() {
    setError(null)
    try {
      await resolveAction.mutateAsync({
        card_id: messageId,
        card_version: card.version,
        action: 'confirm',
        confirm_token: confirmToken,
      })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(t('errors.cardExpired', { defaultValue: 'El resumen ha cambiado. Por favor revísalo de nuevo.' }))
      } else {
        setError(t('errors.turnFailed'))
      }
    }
  }

  return (
    <div className="chat-card is-pending">
      <div className="chat-card-header">
        <span className="chat-card-title">
          {t('summary.title', { defaultValue: 'RESUMEN DE LA SOLICITUD' })}
        </span>
      </div>

      {/* Legend row */}
      <div className="chat-summary-legend">
        <span className="chat-summary-legend-item">
          <IntelligenceMark size={12} variant="proposed" color="var(--color-data-proposed-text)" />
          <span>{t('summary.assumed', { defaultValue: 'Sugerido' })}</span>
        </span>
        <span className="chat-summary-legend-sep" aria-hidden />
        <span className="chat-summary-legend-item" style={{ color: 'var(--color-text-disabled)' }}>
          {t('summary.notIndicated', { defaultValue: 'No indicado' })}
        </span>
      </div>

      <table className="chat-summary-table">
        <tbody>
          {displayFields.map(key => {
            const isAssumed = assumedFields.includes(key)
            const isCorrected = correctedFields.includes(key)
            const rawValue = displayValue(key)

            return (
              <tr key={key}>
                <td className="chat-summary-label">
                  {t(`summary.fields.${key}`, { defaultValue: FIELD_LABEL_ES[key] ?? key })}
                </td>
                <td className="chat-summary-value">
                  <div className="chat-summary-value-cell">
                    <span className={`chat-summary-value-text${isCorrected ? ' is-corrected' : ''}`}>{rawValue}</span>
                    {isAssumed && (
                      <span className="chat-summary-assumed-badge">
                        <IntelligenceMark size={10} variant="proposed" color="var(--color-data-proposed-text)" />
                        {t('summary.assumed', { defaultValue: 'Sugerido' })}
                      </span>
                    )}
                    {isCorrected && (
                      <span className="chat-summary-corrected-badge">
                        {t('summary.corrected', { defaultValue: 'Corregido' })}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {error && <p className="chat-card-error">{error}</p>}

      <div className="chat-summary-footer">
        <Button
          variant="primary"
          size="sm"
          onClick={handleConfirm}
          loading={resolveAction.isPending}
          disabled={resolveAction.isPending}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ marginRight: 4 }}>
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
          </svg>
          {t('summary.createRfq', { defaultValue: 'Crear solicitud de cotización' })}
        </Button>
      </div>
    </div>
  )
}
