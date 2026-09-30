import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { QuoteRead, QuoteUpdate } from '../../types/quote'
import type { ApiError } from '../../api/client'
import { Alert, Button, FormField, TextArea, TextInput } from '../ui'

interface Props {
  quote: QuoteRead
  onSubmit: (data: QuoteUpdate) => void
  isPending: boolean
  error: Error | null
  onCancel: () => void
}

export default function QuoteEditForm({ quote, onSubmit, isPending, error, onCancel }: Props) {
  const { t } = useTranslation(['quote', 'common'])
  const { register, handleSubmit } = useForm({
    defaultValues: {
      raw_price: quote.raw_price ?? '',
      raw_currency: quote.raw_currency ?? '',
      raw_unit: quote.raw_unit ?? '',
      raw_quantity_moq: quote.raw_quantity_moq ?? '',
      raw_quantity_per_unit: quote.raw_quantity_per_unit ?? '',
      raw_delivery_lead_time_days: quote.raw_delivery_lead_time_days ?? '',
      raw_delivery_point: quote.raw_delivery_point ?? '',
      raw_payment_terms: quote.raw_payment_terms ?? '',
      raw_notes: quote.raw_notes ?? '',
    },
  })

  const handleValid = (data: Record<string, unknown>) => {
    const update: QuoteUpdate = {
      raw_price: data.raw_price !== '' ? Number(data.raw_price) : null,
      raw_currency: data.raw_currency !== '' ? String(data.raw_currency) : null,
      raw_unit: data.raw_unit !== '' ? String(data.raw_unit) : null,
      raw_quantity_moq: data.raw_quantity_moq !== '' ? Number(data.raw_quantity_moq) : null,
      raw_quantity_per_unit: data.raw_quantity_per_unit !== '' ? Number(data.raw_quantity_per_unit) : null,
      raw_delivery_lead_time_days: data.raw_delivery_lead_time_days !== '' ? Number(data.raw_delivery_lead_time_days) : null,
      raw_delivery_point: data.raw_delivery_point !== '' ? String(data.raw_delivery_point) : null,
      raw_payment_terms: data.raw_payment_terms !== '' ? String(data.raw_payment_terms) : null,
      raw_notes: data.raw_notes !== '' ? String(data.raw_notes) : null,
    }
    onSubmit(update)
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="grid gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('edit.title')}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t('fields.price')}>
          <TextInput type="number" step="any" {...register('raw_price')} />
        </FormField>
        <FormField label={t('fields.currency')}>
          <TextInput {...register('raw_currency')} />
        </FormField>
        <FormField label={t('fields.unit')}>
          <TextInput {...register('raw_unit')} />
        </FormField>
        <FormField label={t('fields.moq')}>
          <TextInput type="number" {...register('raw_quantity_moq')} />
        </FormField>
        <FormField label={t('fields.qtyPerUnit')}>
          <TextInput type="number" {...register('raw_quantity_per_unit')} />
        </FormField>
        <FormField label={t('fields.leadTimeDays')}>
          <TextInput type="number" {...register('raw_delivery_lead_time_days')} />
        </FormField>
        <FormField label={t('fields.deliveryPoint')}>
          <TextInput {...register('raw_delivery_point')} />
        </FormField>
        <FormField label={t('fields.paymentTerms')}>
          <TextInput {...register('raw_payment_terms')} />
        </FormField>
      </div>

      <FormField label={t('fields.notes')}>
        <TextArea rows={2} {...register('raw_notes')} />
      </FormField>

      {error && (
        <Alert tone="error">{(error as ApiError).detail || t('edit.failed')}</Alert>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? t('edit.saving') : t('edit.save')}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          {t('common:actions.cancel')}
        </Button>
      </div>
    </form>
  )
}
