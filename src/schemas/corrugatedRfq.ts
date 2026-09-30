import { z } from 'zod'
import {
  BOX_STYLES,
  CLOSURE_METHODS,
  CORRUGATED_ATTACHMENT_KINDS,
  DEFAULT_CURRENCIES,
  DIMENSION_BASES,
  DIMENSION_UNITS,
  FLUTE_PROFILES,
  FOOD_CONTACT_OPTIONS,
  FRAGILITY_OPTIONS,
  INCOTERM_RULES,
  OPTIONAL_RESPONSE_FIELD_KEYS,
  PREFERRED_RESPONSE_FORMATS,
  PRINT_METHODS,
  REQUIRED_RESPONSE_FIELD_KEYS,
  SHIPPING_MODES,
  STACKING_SCENARIOS,
  STRENGTH_METRIC_TYPES,
  STRENGTH_UNITS,
  SUBSTITUTION_POLICIES,
  VOLUME_TIER_UNITS,
  WALL_CONSTRUCTIONS,
} from '../constants/corrugatedOptions'

const optionalText = z.string().optional().or(z.literal(''))
const optionalPositive = z.union([z.coerce.number().positive(), z.literal(''), z.nan()]).optional()
const optionalNonNeg = z.union([z.coerce.number().min(0), z.literal(''), z.nan()]).optional()

const volumeTierSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, 'validation.required'),
  quantity: z.coerce.number().int().positive('validation.mustBePositive'),
  unit: z.enum(VOLUME_TIER_UNITS),
  is_primary: z.boolean().optional(),
  notes: optionalText,
})

const attachmentSchema = z.object({
  id: z.string().optional(),
  kind: z.enum(CORRUGATED_ATTACHMENT_KINDS),
  file_name: z.string().min(1, 'validation.required'),
})

/** Full form values for the corrugated wizard (flat for RHF). */
export const corrugatedRfqFormSchema = z
  .object({
    name: z.string().min(1, 'validation.required'),
    rfq_number: optionalText,
    description: z.string().min(1, 'validation.required'),
    buyer_company: optionalText,
    buyer_contact_name: optionalText,
    buyer_contact_email: z
      .string()
      .email('validation.invalidEmail')
      .optional()
      .or(z.literal('')),
    response_deadline: z.string().min(1, 'validation.required'),
    quote_validity_days_requested: optionalPositive,
    base_currency: z.enum(DEFAULT_CURRENCIES),
    default_incoterm: z.enum(INCOTERM_RULES).optional().or(z.literal('')),
    incoterm_named_place: optionalText,
    delivery_point: z.string().min(1, 'validation.required'),
    payment_terms_requested: optionalText,
    email_locale: z.enum(['en', 'es']),

    product_name: z.string().min(1, 'validation.required'),
    product_description: optionalText,
    product_weight_value: optionalPositive,
    product_weight_unit: z.enum(['g', 'kg']).optional().or(z.literal('')),
    units_per_carton: optionalPositive,
    max_carton_gross_weight_value: optionalPositive,
    max_carton_gross_weight_unit: z.enum(['kg', 'lb']).optional().or(z.literal('')),
    fragility: z.enum(FRAGILITY_OPTIONS).optional().or(z.literal('')),
    stacking_scenario: z.enum(STACKING_SCENARIOS).optional().or(z.literal('')),
    shipping_mode: z.enum(SHIPPING_MODES).optional().or(z.literal('')),

    box_style: z.enum(BOX_STYLES),
    wall_construction: z.enum(WALL_CONSTRUCTIONS),
    flute_profile: z.enum(FLUTE_PROFILES),
    liner_grade: optionalText,
    medium_grade: optionalText,
    recycled_content_target_pct: optionalNonNeg,
    strength_metric_type: z.enum(STRENGTH_METRIC_TYPES),
    strength_target_value: optionalPositive,
    strength_unit: z.enum(STRENGTH_UNITS).optional().or(z.literal('')),
    strength_test_method: optionalText,
    board_caliper_target: optionalText,

    dimension_basis: z.enum(DIMENSION_BASES),
    length: z.coerce.number().positive('validation.mustBePositive'),
    width: z.coerce.number().positive('validation.mustBePositive'),
    height: z.coerce.number().positive('validation.mustBePositive'),
    dimension_unit: z.enum(DIMENSION_UNITS),
    dimension_tolerance: optionalText,
    orientation_notes: optionalText,

    food_contact: z.enum(FOOD_CONTACT_OPTIONS),
    substitution_policy: z.enum(SUBSTITUTION_POLICIES),
    print_method: z.enum(PRINT_METHODS).optional().or(z.literal('')),
    print_colors: optionalText,
    closure_method: z.enum(CLOSURE_METHODS).optional().or(z.literal('')),
    coating_finish: optionalText,
    inserts_dividers: optionalText,
    golden_sample_required: z.boolean().optional(),

    volume_tiers: z.array(volumeTierSchema).min(1, 'validation.atLeastOneTier'),

    required_response_fields: z.array(z.enum([...REQUIRED_RESPONSE_FIELD_KEYS, ...OPTIONAL_RESPONSE_FIELD_KEYS])).min(1, 'validation.checklistRequired'),
    optional_response_fields: z.array(z.enum([...REQUIRED_RESPONSE_FIELD_KEYS, ...OPTIONAL_RESPONSE_FIELD_KEYS])).optional(),
    preferred_response_format: z.enum(PREFERRED_RESPONSE_FORMATS).optional().or(z.literal('')),

    attachments: z.array(attachmentSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.strength_metric_type !== 'supplier_recommend') {
      if (data.strength_target_value === '' || data.strength_target_value == null || Number.isNaN(Number(data.strength_target_value))) {
        ctx.addIssue({
          code: 'custom',
          path: ['strength_target_value'],
          message: 'validation.strengthTargetRequired',
        })
      }
      if (!data.strength_unit) {
        ctx.addIssue({
          code: 'custom',
          path: ['strength_unit'],
          message: 'validation.strengthUnitRequired',
        })
      }
    }

    const rule = data.default_incoterm
    if (rule && rule !== 'not_specified' && !(data.incoterm_named_place || '').trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['incoterm_named_place'],
        message: 'validation.incotermPlaceRequired',
      })
    }

    const recycled = data.recycled_content_target_pct
    if (recycled !== '' && recycled != null && !Number.isNaN(Number(recycled))) {
      const n = Number(recycled)
      if (n < 0 || n > 100) {
        ctx.addIssue({
          code: 'custom',
          path: ['recycled_content_target_pct'],
          message: 'validation.pctRange',
        })
      }
    }
  })

export type CorrugatedRFQFormValues = z.infer<typeof corrugatedRfqFormSchema>

/** Relaxed schema for draft save — only needs a title. */
export const corrugatedDraftSchema = z.object({
  name: z.string().min(1, 'validation.required'),
}).passthrough()

/** Per-step field groups for wizard navigation validation. */
export const STEP_FIELDS: (keyof CorrugatedRFQFormValues)[][] = [
  // 1 Header
  [
    'name',
    'description',
    'response_deadline',
    'base_currency',
    'delivery_point',
    'email_locale',
    'default_incoterm',
    'incoterm_named_place',
  ],
  // 2 Product
  ['product_name'],
  // 3 Board / strength
  [
    'box_style',
    'wall_construction',
    'flute_profile',
    'strength_metric_type',
    'strength_target_value',
    'strength_unit',
  ],
  // 4 Dimensions
  ['dimension_basis', 'length', 'width', 'height', 'dimension_unit'],
  // 5 Finish
  ['food_contact', 'substitution_policy'],
  // 6 Volume tiers
  ['volume_tiers'],
  // 7 Checklist
  ['required_response_fields'],
  // 8 Attachments (optional — no required fields)
  [],
  // 9 Review
  [],
]

export function newVolumeTier(label = '', primary = true): CorrugatedRFQFormValues['volume_tiers'][number] {
  return {
    id: crypto.randomUUID(),
    label,
    quantity: 1,
    unit: 'piece',
    is_primary: primary,
    notes: '',
  }
}

export function defaultCorrugatedFormValues(
  emailLocale: 'en' | 'es' = 'en',
): CorrugatedRFQFormValues {
  return {
    name: '',
    rfq_number: '',
    description: '',
    buyer_company: '',
    buyer_contact_name: '',
    buyer_contact_email: '',
    response_deadline: '',
    quote_validity_days_requested: '',
    base_currency: 'USD',
    default_incoterm: 'not_specified',
    incoterm_named_place: '',
    delivery_point: '',
    payment_terms_requested: '',
    email_locale: emailLocale,

    product_name: '',
    product_description: '',
    product_weight_value: '',
    product_weight_unit: 'kg',
    units_per_carton: '',
    max_carton_gross_weight_value: '',
    max_carton_gross_weight_unit: 'kg',
    fragility: '',
    stacking_scenario: '',
    shipping_mode: '',

    box_style: 'RSC',
    wall_construction: 'single_wall',
    flute_profile: 'C',
    liner_grade: '',
    medium_grade: '',
    recycled_content_target_pct: '',
    strength_metric_type: 'ECT',
    strength_target_value: '',
    strength_unit: 'kN_per_m',
    strength_test_method: '',
    board_caliper_target: '',

    dimension_basis: 'internal',
    length: 0,
    width: 0,
    height: 0,
    dimension_unit: 'mm',
    dimension_tolerance: '',
    orientation_notes: '',

    food_contact: 'not_applicable',
    substitution_policy: 'no_without_approval',
    print_method: 'none',
    print_colors: '',
    closure_method: 'tape',
    coating_finish: '',
    inserts_dividers: '',
    golden_sample_required: false,

    volume_tiers: [newVolumeTier('Launch', true)],

    required_response_fields: [...REQUIRED_RESPONSE_FIELD_KEYS],
    optional_response_fields: [...OPTIONAL_RESPONSE_FIELD_KEYS],
    preferred_response_format: 'any_with_extraction',

    attachments: [],
  }
}
