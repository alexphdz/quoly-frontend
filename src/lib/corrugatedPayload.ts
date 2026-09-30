import { tierUnitToBaseUnit } from '../constants/corrugatedOptions'
import type {
  CorrugatedProductSpec,
  CorrugatedRFQCreate,
  PreferredResponseFormat,
  ResponseFieldKey,
  RfqStatusWrite,
  VolumeTier,
} from '../types/corrugated'
import type { CorrugatedRFQFormValues } from '../schemas/corrugatedRfq'

function numOrUndefined(value: unknown): number | undefined {
  if (value === '' || value == null) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function textOrUndefined(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed || undefined
}

function derivePrimaryTier(tiers: VolumeTier[]): VolumeTier {
  return tiers.find(t => t.is_primary) ?? tiers[0]
}

export function buildCorrugatedSpec(values: CorrugatedRFQFormValues): CorrugatedProductSpec {
  const productWeightValue = numOrUndefined(values.product_weight_value)
  const maxGrossValue = numOrUndefined(values.max_carton_gross_weight_value)
  const recycled = numOrUndefined(values.recycled_content_target_pct)
  const strengthTarget = numOrUndefined(values.strength_target_value)

  const strength =
    values.strength_metric_type === 'supplier_recommend'
      ? {
          metric_type: 'supplier_recommend' as const,
          test_method: textOrUndefined(values.strength_test_method),
        }
      : {
          metric_type: values.strength_metric_type,
          target_value: strengthTarget,
          unit: textOrUndefined(values.strength_unit) as CorrugatedProductSpec['strength']['unit'],
          test_method: textOrUndefined(values.strength_test_method),
        }

  return {
    version: 1,
    packaging_type: 'corrugated_box',
    product_name: values.product_name,
    product_description: textOrUndefined(values.product_description),
    product_weight:
      productWeightValue != null && values.product_weight_unit
        ? { value: productWeightValue, unit: values.product_weight_unit as 'g' | 'kg' }
        : undefined,
    units_per_carton: numOrUndefined(values.units_per_carton),
    max_carton_gross_weight:
      maxGrossValue != null && values.max_carton_gross_weight_unit
        ? { value: maxGrossValue, unit: values.max_carton_gross_weight_unit as 'kg' | 'lb' }
        : undefined,
    fragility: textOrUndefined(values.fragility) as CorrugatedProductSpec['fragility'],
    stacking_scenario: textOrUndefined(values.stacking_scenario) as CorrugatedProductSpec['stacking_scenario'],
    shipping_mode: textOrUndefined(values.shipping_mode) as CorrugatedProductSpec['shipping_mode'],
    box_style: values.box_style,
    wall_construction: values.wall_construction,
    flute_profile: values.flute_profile,
    liner_grade: textOrUndefined(values.liner_grade),
    medium_grade: textOrUndefined(values.medium_grade),
    recycled_content_target_pct: recycled,
    food_contact: values.food_contact,
    strength,
    board_caliper_target: textOrUndefined(values.board_caliper_target),
    substitution_policy: values.substitution_policy,
    print_method: textOrUndefined(values.print_method) as CorrugatedProductSpec['print_method'],
    print_colors: textOrUndefined(values.print_colors),
    closure_method: textOrUndefined(values.closure_method) as CorrugatedProductSpec['closure_method'],
    coating_finish: textOrUndefined(values.coating_finish),
    inserts_dividers: textOrUndefined(values.inserts_dividers),
    golden_sample_required: values.golden_sample_required || undefined,
    dimensions: {
      basis: values.dimension_basis,
      length: Number(values.length) || 0,
      width: Number(values.width) || 0,
      height: Number(values.height) || 0,
      unit: values.dimension_unit,
      tolerance: textOrUndefined(values.dimension_tolerance),
      orientation_notes: textOrUndefined(values.orientation_notes),
    },
  }
}

/** Map wizard form → API create/update body. Sends derived scalars + volume_tiers for either backend. */
export function formValuesToCorrugatedPayload(
  values: CorrugatedRFQFormValues,
  status: RfqStatusWrite,
): CorrugatedRFQCreate {
  const volume_tiers: VolumeTier[] = values.volume_tiers.map((tier, index) => ({
    id: tier.id || crypto.randomUUID(),
    label: tier.label || `Tier ${index + 1}`,
    quantity: Number(tier.quantity) || 1,
    unit: tier.unit,
    is_primary: tier.is_primary ?? index === 0,
    notes: textOrUndefined(tier.notes),
    sort_order: index,
  }))

  const primary = derivePrimaryTier(volume_tiers)
  const rule = textOrUndefined(values.default_incoterm)
  const preferred = textOrUndefined(values.preferred_response_format) as PreferredResponseFormat | undefined

  return {
    name: values.name.trim(),
    description: (values.description || '').trim() || values.name.trim(),
    response_deadline: values.response_deadline || new Date().toISOString().slice(0, 10),
    email_locale: values.email_locale,
    base_currency: values.base_currency,
    delivery_point: (values.delivery_point || '').trim() || 'TBD',
    packaging_type: 'corrugated_box',
    status,
    header_data: {
      rfq_number: textOrUndefined(values.rfq_number),
      buyer_company: textOrUndefined(values.buyer_company),
      buyer_contact_name: textOrUndefined(values.buyer_contact_name),
      buyer_contact_email: textOrUndefined(values.buyer_contact_email),
      quote_validity_days_requested: numOrUndefined(values.quote_validity_days_requested),
      payment_terms_requested: textOrUndefined(values.payment_terms_requested),
    },
    incoterms: rule
      ? {
          rule,
          named_place: textOrUndefined(values.incoterm_named_place),
        }
      : null,
    volume_tiers,
    corrugated_spec: buildCorrugatedSpec({
      ...values,
      product_name: values.product_name.trim() || values.name.trim() || 'Draft',
    }),
    response_checklist: {
      required_fields: (values.required_response_fields || []) as ResponseFieldKey[],
      optional_fields: (values.optional_response_fields || []) as ResponseFieldKey[],
      preferred_response_format: preferred,
    },
    attachments: (values.attachments || [])
      .filter(a => a.file_name?.trim())
      .map(a => ({
        id: a.id || crypto.randomUUID(),
        kind: a.kind,
        file_name: a.file_name.trim(),
      })),
    quantity: primary.quantity,
    base_unit: tierUnitToBaseUnit(primary.unit),
  }
}
