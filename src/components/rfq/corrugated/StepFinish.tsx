import { useTranslation } from 'react-i18next'
import {
  CLOSURE_METHOD_OPTIONS,
  FOOD_CONTACT_OPTION_LIST,
  PRINT_METHOD_OPTIONS,
  SUBSTITUTION_POLICY_OPTIONS,
} from '../../../constants/corrugatedOptions'
import { Card } from '../../ui'
import { EnumSelect, FormField, TextArea, TextInput, fieldError, type StepProps } from './stepShared'

export default function StepFinish({ register, errors }: StepProps) {
  const { t } = useTranslation('corrugated')

  return (
    <Card className="card-pad grid gap-4">
      <div>
        <h2 className="qy-heading font-semibold">{t('sections.finish')}</h2>
        {t('sections.finishHint') ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('sections.finishHint')}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <EnumSelect
          name="food_contact"
          label={t('fields.foodContact')}
          options={FOOD_CONTACT_OPTION_LIST}
          register={register}
          error={fieldError(errors, 'food_contact', t)}
          required
        />
        <EnumSelect
          name="substitution_policy"
          label={t('fields.substitutionPolicy')}
          options={SUBSTITUTION_POLICY_OPTIONS}
          register={register}
          error={fieldError(errors, 'substitution_policy', t)}
          required
        />
        <EnumSelect
          name="print_method"
          label={t('fields.printMethod')}
          options={PRINT_METHOD_OPTIONS}
          register={register}
          optional
        />
        <FormField label={t('fields.printColors')} optional>
          <TextInput {...register('print_colors')} />
        </FormField>
        <EnumSelect
          name="closure_method"
          label={t('fields.closureMethod')}
          options={CLOSURE_METHOD_OPTIONS}
          register={register}
          optional
        />
        <FormField label={t('fields.coatingFinish')} optional>
          <TextInput {...register('coating_finish')} />
        </FormField>
      </div>
      <FormField label={t('fields.insertsDividers')} optional>
        <TextArea {...register('inserts_dividers')} rows={2} />
      </FormField>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('golden_sample_required')} />
        <span>{t('fields.goldenSample')}</span>
      </label>
    </Card>
  )
}
