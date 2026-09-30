import { useFieldArray } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { VOLUME_TIER_UNIT_OPTIONS } from '../../../constants/corrugatedOptions'
import { newVolumeTier, type CorrugatedRFQFormValues } from '../../../schemas/corrugatedRfq'
import { Button, Card } from '../../ui'
import { EnumSelect, FormField, TextInput, fieldError, type StepProps } from './stepShared'

export default function StepVolumeTiers({ register, control, errors, setValue, watch }: StepProps) {
  const { t } = useTranslation('corrugated')
  const { fields, append, remove } = useFieldArray({ control, name: 'volume_tiers' })
  const tiers = watch('volume_tiers')

  const setPrimary = (index: number) => {
    tiers.forEach((_tier: CorrugatedRFQFormValues['volume_tiers'][number], i: number) => {
      setValue(`volume_tiers.${i}.is_primary`, i === index, { shouldDirty: true })
    })
  }

  return (
    <Card className="card-pad grid gap-4">
      <div>
        <h2 className="qy-heading font-semibold">{t('sections.tiers')}</h2>
        {t('sections.tiersHint') ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('sections.tiersHint')}</p> : null}
        {errors.volume_tiers?.message && (
          <p className="field-error mt-2">{t(String(errors.volume_tiers.message))}</p>
        )}
        {errors.volume_tiers?.root?.message && (
          <p className="field-error mt-2">{t(String(errors.volume_tiers.root.message))}</p>
        )}
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="grid gap-3 rounded border border-[var(--border-subtle)] p-3">
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="primary_tier"
                checked={!!tiers[index]?.is_primary}
                onChange={() => setPrimary(index)}
              />
              <span>{t('fields.tierPrimary')}</span>
            </label>
            {fields.length > 1 && (
              <Button type="button" variant="ghost" onClick={() => remove(index)}>
                {t('actions.removeTier')}
              </Button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <FormField
              label={t('fields.tierLabel')}
              required
              error={fieldError(errors, `volume_tiers.${index}.label` as 'volume_tiers', t)}
            >
              <TextInput {...register(`volume_tiers.${index}.label`)} placeholder={t('fields.tierLabelPlaceholder')} />
            </FormField>
            <FormField
              label={t('fields.tierQuantity')}
              required
              error={fieldError(errors, `volume_tiers.${index}.quantity` as 'volume_tiers', t)}
            >
              <TextInput type="number" min={1} {...register(`volume_tiers.${index}.quantity`)} />
            </FormField>
            <EnumSelect
              name={`volume_tiers.${index}.unit`}
              label={t('fields.tierUnit')}
              options={VOLUME_TIER_UNIT_OPTIONS}
              register={register}
              required
            />
            <FormField label={t('fields.tierNotes')} optional>
              <TextInput {...register(`volume_tiers.${index}.notes`)} />
            </FormField>
          </div>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => append(newVolumeTier('', false))}>
        {t('actions.addTier')}
      </Button>
    </Card>
  )
}
