import { useTranslation } from 'react-i18next'
import type { CorrugatedProductSpec, VolumeTier } from '../../../types/corrugated'
import { Card } from '../../ui'

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value == null || value === '' || value === false) return null
  return (
    <div>
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="text-[var(--text-primary)]">{typeof value === 'boolean' ? String(value) : String(value)}</dd>
    </div>
  )
}

export default function CorrugatedSpecSummary({
  spec,
  volumeTiers,
}: {
  spec: CorrugatedProductSpec | null | undefined
  volumeTiers?: VolumeTier[] | null
}) {
  const { t } = useTranslation(['corrugated', 'enums', 'rfq'])
  if (!spec) return null

  const el = (section: string, value?: string) =>
    value
      ? t(`enums:corrugated.${section}.${value}` as 'corrugated.boxStyle.RSC', { defaultValue: value })
      : undefined

  const dims = spec.dimensions
  const strength = spec.strength

  return (
    <div className="grid gap-4">
      <Card className="card-pad text-sm">
        <h3 className="qy-heading font-semibold">{t('corrugated:detail.title')}</h3>
        <dl className="mt-3 grid gap-2 md:grid-cols-2">
          <Row label={t('corrugated:fields.productName')} value={spec.product_name} />
          <Row label={t('corrugated:fields.boxStyle')} value={el('boxStyle', spec.box_style)} />
          <Row label={t('corrugated:fields.wallConstruction')} value={el('wallConstruction', spec.wall_construction)} />
          <Row label={t('corrugated:fields.fluteProfile')} value={el('fluteProfile', spec.flute_profile)} />
          <Row label={t('corrugated:fields.foodContact')} value={el('foodContact', spec.food_contact)} />
          <Row label={t('corrugated:fields.substitutionPolicy')} value={el('substitutionPolicy', spec.substitution_policy)} />
          <Row
            label={t('corrugated:fields.strengthMetric')}
            value={
              strength
                ? `${el('strengthMetric', strength.metric_type)}${
                    strength.target_value != null
                      ? ` ${strength.target_value} ${el('strengthUnit', strength.unit) || ''}`
                      : ''
                  }`
                : undefined
            }
          />
          <Row
            label={t('corrugated:fields.length')}
            value={
              dims
                ? `${el('dimensionBasis', dims.basis)} ${dims.length}×${dims.width}×${dims.height} ${el('dimensionUnit', dims.unit)}`
                : undefined
            }
          />
          <Row label={t('corrugated:fields.printMethod')} value={el('printMethod', spec.print_method)} />
          <Row label={t('corrugated:fields.closureMethod')} value={el('closureMethod', spec.closure_method)} />
          <Row label={t('corrugated:fields.fragility')} value={el('fragility', spec.fragility)} />
          <Row label={t('corrugated:fields.shippingMode')} value={el('shippingMode', spec.shipping_mode)} />
          <Row label={t('corrugated:fields.linerGrade')} value={spec.liner_grade} />
          <Row label={t('corrugated:fields.printColors')} value={spec.print_colors} />
          <Row label={t('corrugated:fields.coatingFinish')} value={spec.coating_finish} />
          <Row label={t('corrugated:fields.insertsDividers')} value={spec.inserts_dividers} />
          <Row label={t('corrugated:fields.goldenSample')} value={spec.golden_sample_required ? t('rfq:summary.yes') : null} />
        </dl>
        {spec.product_description && (
          <p className="mt-3 text-[var(--text-secondary)]">{spec.product_description}</p>
        )}
      </Card>

      {volumeTiers && volumeTiers.length > 0 && (
        <Card className="card-pad text-sm">
          <h3 className="qy-heading font-semibold">{t('corrugated:detail.volumeTiers')}</h3>
          <ul className="mt-3 grid gap-1">
            {volumeTiers.map((tier, i) => (
              <li key={tier.id || i}>
                {tier.label}: {tier.quantity}{' '}
                {el('volumeTierUnit', tier.unit) || tier.unit}
                {tier.is_primary ? ` (${t('corrugated:detail.primary')})` : ''}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
