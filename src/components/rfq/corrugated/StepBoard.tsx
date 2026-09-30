import { useTranslation } from 'react-i18next'
import {
  BOX_STYLE_OPTIONS,
  FLUTE_PROFILE_OPTIONS,
  STRENGTH_METRIC_OPTIONS,
  STRENGTH_UNIT_OPTIONS,
  WALL_CONSTRUCTION_OPTIONS,
} from '../../../constants/corrugatedOptions'
import { Card } from '../../ui'
import { EnumSelect, FormField, TextInput, fieldError, type StepProps } from './stepShared'

export default function StepBoard({ register, errors, watch }: StepProps) {
  const { t } = useTranslation('corrugated')
  const metric = watch('strength_metric_type')
  const needsTarget = metric !== 'supplier_recommend'

  return (
    <Card className="card-pad grid gap-4">
      <div>
        <h2 className="qy-heading font-semibold">{t('sections.board')}</h2>
        {t('sections.boardHint') ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('sections.boardHint')}</p> : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <EnumSelect
          name="box_style"
          label={t('fields.boxStyle')}
          options={BOX_STYLE_OPTIONS}
          register={register}
          error={fieldError(errors, 'box_style', t)}
          required
        />
        <EnumSelect
          name="wall_construction"
          label={t('fields.wallConstruction')}
          options={WALL_CONSTRUCTION_OPTIONS}
          register={register}
          error={fieldError(errors, 'wall_construction', t)}
          required
        />
        <EnumSelect
          name="flute_profile"
          label={t('fields.fluteProfile')}
          options={FLUTE_PROFILE_OPTIONS}
          register={register}
          error={fieldError(errors, 'flute_profile', t)}
          required
        />
        <FormField label={t('fields.linerGrade')} optional>
          <TextInput {...register('liner_grade')} />
        </FormField>
        <FormField label={t('fields.mediumGrade')} optional>
          <TextInput {...register('medium_grade')} />
        </FormField>
        <FormField label={t('fields.recycledContent')} optional error={fieldError(errors, 'recycled_content_target_pct', t)}>
          <TextInput type="number" min={0} max={100} {...register('recycled_content_target_pct')} />
        </FormField>
        <EnumSelect
          name="strength_metric_type"
          label={t('fields.strengthMetric')}
          options={STRENGTH_METRIC_OPTIONS}
          register={register}
          error={fieldError(errors, 'strength_metric_type', t)}
          required
        />
        <FormField
          label={t('fields.strengthTarget')}
          required={needsTarget}
          optional={!needsTarget}
          error={fieldError(errors, 'strength_target_value', t)}
        >
          <TextInput type="number" step="any" min={0} {...register('strength_target_value')} disabled={!needsTarget} />
        </FormField>
        <EnumSelect
          name="strength_unit"
          label={t('fields.strengthUnit')}
          options={STRENGTH_UNIT_OPTIONS}
          register={register}
          error={fieldError(errors, 'strength_unit', t)}
          required={needsTarget}
          optional={!needsTarget}
          includeEmpty={!needsTarget}
        />
        <FormField label={t('fields.strengthTestMethod')} optional>
          <TextInput {...register('strength_test_method')} />
        </FormField>
        <FormField label={t('fields.boardCaliper')} optional>
          <TextInput {...register('board_caliper_target')} />
        </FormField>
      </div>
    </Card>
  )
}
