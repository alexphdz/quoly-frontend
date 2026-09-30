import type {
  BoxStyle,
  ClosureMethod,
  CorrugatedAttachmentKind,
  DefaultCurrency,
  DimensionBasis,
  DimensionUnit,
  FluteProfile,
  FoodContact,
  Fragility,
  IncotermRule,
  PreferredResponseFormat,
  PrintMethod,
  ResponseFieldKey,
  ShippingMode,
  StackingScenario,
  StrengthMetricType,
  StrengthUnit,
  SubstitutionPolicy,
  VolumeTierUnit,
  WallConstruction,
} from '../types/corrugated'

export interface CorrugatedOption<T extends string = string> {
  value: T
  labelKey: string
}

function opts<T extends string>(values: readonly T[], prefix: string): CorrugatedOption<T>[] {
  return values.map(value => ({ value, labelKey: `${prefix}.${value}` }))
}

export const BOX_STYLES = [
  'RSC',
  'FOL',
  'HSC',
  'CSSC',
  'die_cut',
  'telescope',
  'tray',
  'pad',
  'supplier_recommend',
] as const satisfies readonly BoxStyle[]

export const WALL_CONSTRUCTIONS = [
  'single_wall',
  'double_wall',
  'triple_wall',
] as const satisfies readonly WallConstruction[]

export const FLUTE_PROFILES = [
  'A',
  'B',
  'C',
  'E',
  'F',
  'BC',
  'EB',
  'AC',
  'other',
  'supplier_recommend',
] as const satisfies readonly FluteProfile[]

export const STRENGTH_METRIC_TYPES = [
  'ECT',
  'BCT',
  'burst_mullen',
  'supplier_recommend',
] as const satisfies readonly StrengthMetricType[]

export const STRENGTH_UNITS = ['kN_per_m', 'N', 'kPa'] as const satisfies readonly StrengthUnit[]

export const FOOD_CONTACT_OPTIONS = [
  'yes',
  'no',
  'not_applicable',
] as const satisfies readonly FoodContact[]

export const SUBSTITUTION_POLICIES = [
  'no_without_approval',
  'equivalent_with_data',
] as const satisfies readonly SubstitutionPolicy[]

export const PRINT_METHODS = [
  'none',
  'flexo_1',
  'flexo_2_4',
  'litho',
  'digital',
  'other',
] as const satisfies readonly PrintMethod[]

export const CLOSURE_METHODS = [
  'tape',
  'glue',
  'self_lock',
  'stitch',
  'other',
] as const satisfies readonly ClosureMethod[]

export const DIMENSION_BASES = ['internal', 'external'] as const satisfies readonly DimensionBasis[]

export const DIMENSION_UNITS = ['mm', 'cm', 'in'] as const satisfies readonly DimensionUnit[]

export const DEFAULT_CURRENCIES = ['USD', 'MXN', 'EUR'] as const satisfies readonly DefaultCurrency[]

export const VOLUME_TIER_UNITS = [
  'piece',
  'thousand_piece',
] as const satisfies readonly VolumeTierUnit[]

export const INCOTERM_RULES = [
  'EXW',
  'FCA',
  'FOB',
  'CFR',
  'CIF',
  'CPT',
  'CIP',
  'DAP',
  'DPU',
  'DDP',
  'not_specified',
] as const satisfies readonly IncotermRule[]

export const FRAGILITY_OPTIONS = [
  'standard',
  'fragile',
  'heavy',
] as const satisfies readonly Fragility[]

export const STACKING_SCENARIOS = [
  'single_stack',
  'warehouse_pallet',
  'export_container',
] as const satisfies readonly StackingScenario[]

export const SHIPPING_MODES = [
  'parcel',
  'ltl_ftl',
  'export_ocean',
  'export_air',
] as const satisfies readonly ShippingMode[]

export const PRODUCT_WEIGHT_UNITS = ['g', 'kg'] as const satisfies readonly ('g' | 'kg')[]

export const GROSS_WEIGHT_UNITS = ['kg', 'lb'] as const satisfies readonly ('kg' | 'lb')[]

export const PREFERRED_RESPONSE_FORMATS = [
  'excel_template',
  'pdf_ok',
  'any_with_extraction',
] as const satisfies readonly PreferredResponseFormat[]

export const CORRUGATED_ATTACHMENT_KINDS = [
  'dieline_drawing',
  'reference_photo',
  'spec_sheet',
  'other',
] as const satisfies readonly CorrugatedAttachmentKind[]

/** Required checklist keys for MVP template (01-form-fields §F). */
export const REQUIRED_RESPONSE_FIELD_KEYS = [
  'unit_price_per_tier',
  'currency',
  'price_basis',
  'moq',
  'tooling_die',
  'freight',
  'other_one_time',
  'lead_time_days',
  'incoterm_quoted',
  'payment_terms',
  'quote_validity',
  'board_spec_quoted',
  'no_substitution_ack',
] as const satisfies readonly ResponseFieldKey[]

export const OPTIONAL_RESPONSE_FIELD_KEYS = [
  'sample_cost_time',
  'certifications',
  'test_report',
  'capacity_per_month',
  'master_carton',
] as const satisfies readonly ResponseFieldKey[]

export const ALL_RESPONSE_FIELD_KEYS = [
  ...REQUIRED_RESPONSE_FIELD_KEYS,
  ...OPTIONAL_RESPONSE_FIELD_KEYS,
] as const satisfies readonly ResponseFieldKey[]

export const BOX_STYLE_OPTIONS = opts(BOX_STYLES, 'corrugated.boxStyle')
export const WALL_CONSTRUCTION_OPTIONS = opts(WALL_CONSTRUCTIONS, 'corrugated.wallConstruction')
export const FLUTE_PROFILE_OPTIONS = opts(FLUTE_PROFILES, 'corrugated.fluteProfile')
export const STRENGTH_METRIC_OPTIONS = opts(STRENGTH_METRIC_TYPES, 'corrugated.strengthMetric')
export const STRENGTH_UNIT_OPTIONS = opts(STRENGTH_UNITS, 'corrugated.strengthUnit')
export const FOOD_CONTACT_OPTION_LIST = opts(FOOD_CONTACT_OPTIONS, 'corrugated.foodContact')
export const SUBSTITUTION_POLICY_OPTIONS = opts(SUBSTITUTION_POLICIES, 'corrugated.substitutionPolicy')
export const PRINT_METHOD_OPTIONS = opts(PRINT_METHODS, 'corrugated.printMethod')
export const CLOSURE_METHOD_OPTIONS = opts(CLOSURE_METHODS, 'corrugated.closureMethod')
export const DIMENSION_BASIS_OPTIONS = opts(DIMENSION_BASES, 'corrugated.dimensionBasis')
export const DIMENSION_UNIT_OPTIONS = opts(DIMENSION_UNITS, 'corrugated.dimensionUnit')
export const CURRENCY_OPTIONS = opts(DEFAULT_CURRENCIES, 'corrugated.currency')
export const VOLUME_TIER_UNIT_OPTIONS = opts(VOLUME_TIER_UNITS, 'corrugated.volumeTierUnit')
export const INCOTERM_OPTIONS = opts(INCOTERM_RULES, 'corrugated.incoterm')
export const FRAGILITY_OPTION_LIST = opts(FRAGILITY_OPTIONS, 'corrugated.fragility')
export const STACKING_SCENARIO_OPTIONS = opts(STACKING_SCENARIOS, 'corrugated.stackingScenario')
export const SHIPPING_MODE_OPTIONS = opts(SHIPPING_MODES, 'corrugated.shippingMode')
export const PREFERRED_FORMAT_OPTIONS = opts(PREFERRED_RESPONSE_FORMATS, 'corrugated.preferredFormat')
export const ATTACHMENT_KIND_OPTIONS = opts(CORRUGATED_ATTACHMENT_KINDS, 'corrugated.attachmentKind')
export const RESPONSE_FIELD_OPTIONS = opts(ALL_RESPONSE_FIELD_KEYS, 'corrugated.responseField')

export const EMAIL_LOCALE_OPTIONS: CorrugatedOption<'en' | 'es'>[] = [
  { value: 'en', labelKey: 'corrugated.emailLocale.en' },
  { value: 'es', labelKey: 'corrugated.emailLocale.es' },
]

export const PRODUCT_WEIGHT_UNIT_OPTIONS = opts(PRODUCT_WEIGHT_UNITS, 'corrugated.productWeightUnit')

export const GROSS_WEIGHT_UNIT_OPTIONS = opts(GROSS_WEIGHT_UNITS, 'corrugated.grossWeightUnit')

/** Map corrugated volume tier unit → legacy RFQ base_unit scalar. */
export function tierUnitToBaseUnit(unit: VolumeTierUnit): string {
  return unit === 'thousand_piece' ? 'thousand' : 'piece'
}
