import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ComparisonRow } from '../../types/comparison'
import type { ApiError } from '../../api/client'
import { useFormat } from '../../lib/format'
import { Alert, Dialog, FormField } from '../ui'

interface Props {
  quoteId: string
  rows: ComparisonRow[]
  baseCurrency: string
  onConfirm: (quoteId: string, reasoning: string) => void
  onCancel: () => void
  isPending: boolean
  error: Error | null
}

export default function DecisionForm({ quoteId, rows, baseCurrency, onConfirm, onCancel, isPending, error }: Props) {
  const { t } = useTranslation(['comparison', 'common'])
  const fmt = useFormat()
  const [reasoning, setReasoning] = useState('')
  const supplier = rows.find(r => r.quote_id === quoteId)

  return (
    <Dialog open title={t('decision.formTitle')} onClose={onCancel}>
      <p>
        {t('decision.selectingPrefix')} <strong>{supplier?.supplier_name ?? t('decision.unknown')}</strong> {t('decision.selectingSuffix')}
        {supplier?.normalized_price != null && ` ${t('decision.atPrice', { price: fmt.unitMoney(supplier.normalized_price, baseCurrency) })}`}
      </p>
      <p className="ds-meta" style={{ marginTop: 8 }}>{t('ai.youDecide')}</p>

      <FormField label={t('decision.reasoning')} optional>
        <textarea
          value={reasoning}
          onChange={e => setReasoning(e.target.value)}
          rows={2}
          placeholder={t('decision.reasoningPlaceholder')}
          className="input"
        />
      </FormField>

      {error && (
        <Alert tone="error">{(error as ApiError).detail || t('decision.failed')}</Alert>
      )}

      <div className="ds-dialog-actions">
        <button type="button" className="ds-btn ds-btn-secondary" onClick={onCancel}>
          {t('common:actions.cancel')}
        </button>
        <button type="button" className="ds-btn ds-btn-primary" onClick={() => onConfirm(quoteId, reasoning)} disabled={isPending}>
          {isPending ? t('decision.saving') : t('decision.save')}
        </button>
      </div>
    </Dialog>
  )
}
