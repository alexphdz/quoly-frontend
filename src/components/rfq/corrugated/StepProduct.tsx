import { useTranslation } from 'react-i18next'
import {
  FRAGILITY_OPTION_LIST,
  GROSS_WEIGHT_UNIT_OPTIONS,
  PRODUCT_WEIGHT_UNIT_OPTIONS,
  SHIPPING_MODE_OPTIONS,
  STACKING_SCENARIO_OPTIONS,
} from '../../../constants/corrugatedOptions'
import { Card } from '../../ui'
import { EnumSelect, FormField, TextArea, TextInput, fieldError, type StepProps } from './stepShared'

export default function StepProduct({ register, errors }: StepProps) {
  const { t } = useTranslation('corrugated')

  return (
    <Card className="card-pad grid gap-4">
      <div>
        <h2 className="qy-heading font-semibold">{t('sections.product')}</h2>
        {t('sections.productHint') ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('sections.productHint')}</p> : null}
      </div>
      <FormField label={t('fields.productName')} required error={fieldError(errors, 'product_name', t)}>
        <TextInput {...register('product_name')} placeholder={t('fields.productNamePlaceholder')} />
      </FormField>
      <FormField label={t('fields.productDescription')} optional>
        <TextArea {...register('product_description')} rows={3} />
      </FormField>
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label={t('fields.productWeight')} optional>
          <TextInput type="number" step="any" min={0} {...register('product_weight_value')} />
        </FormField>
        <EnumSelect
          name="product_weight_unit"
          label={t('fields.productWeightUnit')}
          options={PRODUCT_WEIGHT_UNIT_OPTIONS}
          register={register}
          optional
        />
        <FormField label={t('fields.unitsPerCarton')} optional>
          <TextInput type="number" min={1} {...register('units_per_carton')} />
        </FormField>
        <FormField label={t('fields.maxGrossWeight')} optional>
          <TextInput type="number" step="any" min={0} {...register('max_carton_gross_weight_value')} />
        </FormField>
        <EnumSelect
          name="max_carton_gross_weight_unit"
          label={t('fields.grossWeightUnit')}
          options={GROSS_WEIGHT_UNIT_OPTIONS}
          register={register}
          optional
        />
        <EnumSelect
          name="fragility"
          label={t('fields.fragility')}
          options={FRAGILITY_OPTION_LIST}
          register={register}
          optional
          includeEmpty
        />
        <EnumSelect
          name="stacking_scenario"
          label={t('fields.stackingScenario')}
          options={STACKING_SCENARIO_OPTIONS}
          register={register}
          optional
          includeEmpty
        />
        <EnumSelect
          name="shipping_mode"
          label={t('fields.shippingMode')}
          options={SHIPPING_MODE_OPTIONS}
          register={register}
          optional
          includeEmpty
        />
      </div>
    </Card>
  )
}
