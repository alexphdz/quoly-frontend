import { useTranslation } from 'react-i18next'
import { DIMENSION_BASIS_OPTIONS, DIMENSION_UNIT_OPTIONS } from '../../../constants/corrugatedOptions'
import { Card } from '../../ui'
import { EnumSelect, FormField, TextInput, fieldError, type StepProps } from './stepShared'

export default function StepDimensions({ register, errors }: StepProps) {
  const { t } = useTranslation('corrugated')

  return (
    <Card className="card-pad grid gap-4">
      <div>
        <h2 className="qy-heading font-semibold">{t('sections.dimensions')}</h2>
        {t('sections.dimensionsHint') ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('sections.dimensionsHint')}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <EnumSelect
          name="dimension_basis"
          label={t('fields.dimensionBasis')}
          options={DIMENSION_BASIS_OPTIONS}
          register={register}
          error={fieldError(errors, 'dimension_basis', t)}
          required
        />
        <EnumSelect
          name="dimension_unit"
          label={t('fields.dimensionUnit')}
          options={DIMENSION_UNIT_OPTIONS}
          register={register}
          error={fieldError(errors, 'dimension_unit', t)}
          required
        />
        <FormField label={t('fields.length')} required error={fieldError(errors, 'length', t)}>
          <TextInput type="number" step="any" min={0} {...register('length')} />
        </FormField>
        <FormField label={t('fields.width')} required error={fieldError(errors, 'width', t)}>
          <TextInput type="number" step="any" min={0} {...register('width')} />
        </FormField>
        <FormField label={t('fields.height')} required error={fieldError(errors, 'height', t)}>
          <TextInput type="number" step="any" min={0} {...register('height')} />
        </FormField>
        <FormField label={t('fields.dimensionTolerance')} optional>
          <TextInput {...register('dimension_tolerance')} />
        </FormField>
        <FormField label={t('fields.orientationNotes')} optional>
          <TextInput {...register('orientation_notes')} />
        </FormField>
      </div>
    </Card>
  )
}
