import { useTranslation } from 'react-i18next'
import { RESPONSE_FIELD_OPTIONS } from '../../../constants/corrugatedOptions'
import type { CorrugatedRFQFormValues } from '../../../schemas/corrugatedRfq'
import { Card } from '../../ui'
import type { StepProps } from './stepShared'

function SimpleRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[var(--text-muted)]">{label}</dt>
      <dd className="text-[var(--text-primary)]">{value}</dd>
    </div>
  )
}

export default function StepReview({ watch }: StepProps) {
  const { t } = useTranslation(['corrugated', 'enums'])
  const v = watch()
  const empty = t('corrugated:review.empty')

  const enumLabel = (prefix: string, value?: string) => {
    if (!value) return empty
    return t(`enums:corrugated.${prefix}.${value}` as 'corrugated.boxStyle.RSC', { defaultValue: value })
  }

  const fieldLabel = (key: string) => {
    const opt = RESPONSE_FIELD_OPTIONS.find(o => o.value === key)
    return opt ? t(`enums:${opt.labelKey}` as 'corrugated.responseField.moq') : key
  }

  return (
    <div className="grid gap-4">
      <Card className="card-pad">
        <h2 className="qy-heading font-semibold">{t('corrugated:sections.review')}</h2>
        {t('corrugated:sections.reviewHint') ? <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('corrugated:sections.reviewHint')}</p> : null}
      </Card>

      <Card className="card-pad">
        <h3 className="qy-heading font-semibold">{t('corrugated:review.header')}</h3>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <SimpleRow label={t('corrugated:fields.title')} value={v.name || empty} />
          <SimpleRow label={t('corrugated:fields.rfqNumber')} value={v.rfq_number || empty} />
          <SimpleRow label={t('corrugated:fields.responseDeadline')} value={v.response_deadline || empty} />
          <SimpleRow label={t('corrugated:fields.currency')} value={enumLabel('currency', v.base_currency)} />
          <SimpleRow label={t('corrugated:fields.deliveryDestination')} value={v.delivery_point || empty} />
          <SimpleRow label={t('corrugated:fields.incoterm')} value={enumLabel('incoterm', v.default_incoterm || undefined)} />
        </dl>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">{v.description || empty}</p>
      </Card>

      <Card className="card-pad">
        <h3 className="qy-heading font-semibold">{t('corrugated:review.product')}</h3>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <SimpleRow label={t('corrugated:fields.productName')} value={v.product_name || empty} />
          <SimpleRow label={t('corrugated:fields.fragility')} value={enumLabel('fragility', v.fragility || undefined)} />
          <SimpleRow label={t('corrugated:fields.shippingMode')} value={enumLabel('shippingMode', v.shipping_mode || undefined)} />
        </dl>
      </Card>

      <Card className="card-pad">
        <h3 className="qy-heading font-semibold">{t('corrugated:review.board')}</h3>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <SimpleRow label={t('corrugated:fields.boxStyle')} value={enumLabel('boxStyle', v.box_style)} />
          <SimpleRow label={t('corrugated:fields.wallConstruction')} value={enumLabel('wallConstruction', v.wall_construction)} />
          <SimpleRow label={t('corrugated:fields.fluteProfile')} value={enumLabel('fluteProfile', v.flute_profile)} />
          <SimpleRow
            label={t('corrugated:fields.strengthMetric')}
            value={
              v.strength_metric_type === 'supplier_recommend'
                ? enumLabel('strengthMetric', v.strength_metric_type)
                : `${enumLabel('strengthMetric', v.strength_metric_type)} ${v.strength_target_value || ''} ${enumLabel('strengthUnit', v.strength_unit || undefined)}`
            }
          />
        </dl>
      </Card>

      <Card className="card-pad">
        <h3 className="qy-heading font-semibold">{t('corrugated:review.dimensions')}</h3>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <SimpleRow label={t('corrugated:fields.dimensionBasis')} value={enumLabel('dimensionBasis', v.dimension_basis)} />
          <SimpleRow
            label={t('corrugated:fields.length')}
            value={`${v.length} × ${v.width} × ${v.height} ${enumLabel('dimensionUnit', v.dimension_unit)}`}
          />
        </dl>
      </Card>

      <Card className="card-pad">
        <h3 className="qy-heading font-semibold">{t('corrugated:review.finish')}</h3>
        <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <SimpleRow label={t('corrugated:fields.foodContact')} value={enumLabel('foodContact', v.food_contact)} />
          <SimpleRow label={t('corrugated:fields.substitutionPolicy')} value={enumLabel('substitutionPolicy', v.substitution_policy)} />
          <SimpleRow label={t('corrugated:fields.printMethod')} value={enumLabel('printMethod', v.print_method || undefined)} />
          <SimpleRow label={t('corrugated:fields.closureMethod')} value={enumLabel('closureMethod', v.closure_method || undefined)} />
        </dl>
      </Card>

      <Card className="card-pad">
        <h3 className="qy-heading font-semibold">{t('corrugated:review.tiers')}</h3>
        <ul className="mt-3 grid gap-2 text-sm">
          {(v.volume_tiers || []).map((tier: CorrugatedRFQFormValues['volume_tiers'][number], i: number) => (
            <li key={tier.id || i}>
              {tier.label}: {tier.quantity} {enumLabel('volumeTierUnit', tier.unit)}
              {tier.is_primary ? ` (${t('corrugated:fields.tierPrimary')})` : ''}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="card-pad">
        <h3 className="qy-heading font-semibold">{t('corrugated:review.checklist')}</h3>
        <p className="mt-2 text-sm">
          {(v.required_response_fields || []).map(fieldLabel).join(', ') || t('corrugated:review.none')}
        </p>
      </Card>

      <Card className="card-pad">
        <h3 className="qy-heading font-semibold">{t('corrugated:review.attachments')}</h3>
        <ul className="mt-3 grid gap-1 text-sm">
          {(v.attachments || []).length === 0 && <li>{t('corrugated:review.none')}</li>}
          {(v.attachments || []).map((a: NonNullable<CorrugatedRFQFormValues['attachments']>[number], i: number) => (
            <li key={a.id || i}>
              {enumLabel('attachmentKind', a.kind)}: {a.file_name || empty}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
