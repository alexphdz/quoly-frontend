import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { QuoteRead, QuoteUpdate } from '../../types/quote'
import type { QuoteLineItemsV2 } from '../../types/quoteIntake'
import type { VolumeTier } from '../../types/rfq'
import type { ApiError } from '../../api/client'
import { Alert, Button, FormField, TextArea, TextInput } from '../ui'

interface Props {
  quote: QuoteRead
  lineItems: QuoteLineItemsV2
  volumeTiers: VolumeTier[]
  onSubmit: (data: QuoteUpdate) => void
  isPending: boolean
  error: Error | null
  onCancel: () => void
}

type TierField = {
  volume_tier_id: string
  unit_price: string
  currency: string
  moq: string
}

const asText = (value?: string | number | null) => (value === null || value === undefined ? '' : String(value))

type FormValues = {
  tiers: TierField[]
  tooling_amount: string
  tooling_currency: string
  freight_included: boolean
  freight_amount: string
  freight_currency: string
  lead_time_days: string
  incoterm_quoted: string
  board_spec_quoted: string
  raw_notes: string
}

export default function CorrugatedQuoteEditForm({
  quote,
  lineItems,
  volumeTiers,
  onSubmit,
  isPending,
  error,
  onCancel,
}: Props) {
  const { t } = useTranslation(['quote', 'common'])
  const cb = lineItems.cost_breakdown

  const tierLabel = (id: string) =>
    volumeTiers.find(t => t.id === id)?.label ?? id.slice(0, 8)

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      tiers: lineItems.tiers.map(tier => ({
        volume_tier_id: tier.volume_tier_id,
        unit_price: asText(tier.unit_price),
        currency: tier.currency ?? quote.raw_currency ?? '',
        moq: asText(tier.moq),
      })),
      tooling_amount: asText(cb?.tooling_die?.amount),
      tooling_currency: cb?.tooling_die?.currency ?? quote.raw_currency ?? 'USD',
      freight_included: cb?.freight?.included ?? false,
      freight_amount: asText(cb?.freight?.amount),
      freight_currency: cb?.freight?.currency ?? '',
      lead_time_days: asText(cb?.lead_time_days ?? quote.raw_delivery_lead_time_days),
      incoterm_quoted: cb?.incoterm_quoted ?? quote.raw_delivery_point ?? '',
      board_spec_quoted: cb?.board_spec_quoted ?? '',
      raw_notes: quote.raw_notes ?? '',
    },
  })

  const handleValid = (data: FormValues) => {
    const v2: QuoteLineItemsV2 = {
      version: 1,
      tiers: data.tiers.map(row => ({
        volume_tier_id: row.volume_tier_id,
        unit_price: row.unit_price !== '' ? Number(row.unit_price) : null,
        currency: row.currency !== '' ? row.currency : null,
        moq: row.moq !== '' ? Number(row.moq) : null,
      })),
      cost_breakdown: {
        tooling_die:
          data.tooling_amount !== ''
            ? { amount: Number(data.tooling_amount), currency: data.tooling_currency || 'USD' }
            : undefined,
        freight: {
          included: data.freight_included,
          amount: data.freight_amount !== '' ? Number(data.freight_amount) : undefined,
          currency: data.freight_currency !== '' ? data.freight_currency : undefined,
        },
        lead_time_days: data.lead_time_days !== '' ? Number(data.lead_time_days) : undefined,
        incoterm_quoted: data.incoterm_quoted !== '' ? data.incoterm_quoted : undefined,
        board_spec_quoted: data.board_spec_quoted !== '' ? data.board_spec_quoted : undefined,
        payment_terms: cb?.payment_terms,
        quote_validity: cb?.quote_validity,
        no_substitution_ack: cb?.no_substitution_ack,
      },
    }

    onSubmit({
      line_items: v2,
      raw_notes: data.raw_notes !== '' ? data.raw_notes : null,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleValid)} className="grid gap-6">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{t('edit.title')}</h3>

      <div>
        <h4 className="qy-heading text-sm font-semibold">{t('intake.tiersTitle')}</h4>
        <div className="mt-3 grid gap-4">
          {lineItems.tiers.map((tier, index) => (
            <div key={tier.volume_tier_id} className="rounded-[var(--radius-control)] border border-[var(--border-subtle)] p-3">
              <p className="mb-2 text-sm font-medium">{tierLabel(tier.volume_tier_id)}</p>
              <input type="hidden" {...register(`tiers.${index}.volume_tier_id`)} />
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField label={t('intake.unitPrice')}>
                  <TextInput type="number" step="any" {...register(`tiers.${index}.unit_price`)} />
                </FormField>
                <FormField label={t('intake.currency')}>
                  <TextInput {...register(`tiers.${index}.currency`)} />
                </FormField>
                <FormField label={t('intake.moq')}>
                  <TextInput type="number" {...register(`tiers.${index}.moq`)} />
                </FormField>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="qy-heading text-sm font-semibold">{t('intake.breakdownTitle')}</h4>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <FormField label={t('intake.tooling')}>
            <div className="flex gap-2">
              <TextInput type="number" step="any" {...register('tooling_amount')} />
              <TextInput className="w-20" {...register('tooling_currency')} />
            </div>
          </FormField>
          <FormField label={t('intake.freight')}>
            <label className="mb-2 flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('freight_included')} />
              {t('intake.freightIncluded')}
            </label>
            <div className="flex gap-2">
              <TextInput type="number" step="any" {...register('freight_amount')} />
              <TextInput className="w-20" {...register('freight_currency')} />
            </div>
          </FormField>
          <FormField label={t('fields.leadTimeDays')}>
            <TextInput type="number" {...register('lead_time_days')} />
          </FormField>
          <FormField label={t('intake.incoterm')}>
            <TextInput {...register('incoterm_quoted')} />
          </FormField>
          <FormField label={t('intake.boardSpec')}>
            <TextInput {...register('board_spec_quoted')} />
          </FormField>
        </div>
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
