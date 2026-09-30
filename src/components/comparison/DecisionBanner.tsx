import { useTranslation } from 'react-i18next'
import type { DecisionRead, ComparisonRow } from '../../types/comparison'
import { useFormat } from '../../lib/format'
import { Alert } from '../ui'

interface Props {
  decision: DecisionRead
  rows: ComparisonRow[]
  baseCurrency: string
}

export default function DecisionBanner({ decision, rows, baseCurrency }: Props) {
  const { t } = useTranslation('comparison')
  const fmt = useFormat()
  const winner = rows.find(r => r.quote_id === decision.quote_id)

  return (
    <Alert tone="success">
      <div className="flex flex-wrap items-center gap-2">
        <strong>{t('decision.recordedTitle')}</strong>
        <span className="ds-pill ds-pill-success">{t('decision.auditReady')}</span>
      </div>
      <p>
        {t('decision.winnerLabel')} <strong>{winner?.supplier_name ?? t('decision.unknown')}</strong>
        {winner?.normalized_price != null && ` — ${fmt.unitMoney(winner.normalized_price, baseCurrency)}`}
      </p>
      {decision.reasoning && <p>“{decision.reasoning}”</p>}
      <p className="ds-meta">
        {t('decision.decidedAt', { date: fmt.date(decision.decided_at, { dateStyle: 'medium', timeStyle: 'short' }) })}
      </p>
    </Alert>
  )
}
