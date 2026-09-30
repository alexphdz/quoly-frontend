/** Corrugated RFQ types — mirror Backend corrugated schemas (02-data-model §5). */

export type BoxStyle =
  | 'RSC'
  | 'FOL'
  | 'HSC'
  | 'CSSC'
  | 'die_cut'
  | 'telescope'
  | 'tray'
  | 'pad'
  | 'supplier_recommend'

export type WallConstruction = 'single_wall' | 'double_wall' | 'triple_wall'

export type FluteProfile =
  | 'A'
  | 'B'
  | 'C'
  | 'E'
  | 'F'
  | 'BC'
  | 'EB'
  | 'AC'
  | 'other'
  | 'supplier_recommend'

export type StrengthMetricType = 'ECT' | 'BCT' | 'burst_mullen' | 'supplier_recommend'

export type StrengthUnit = 'kN_per_m' | 'N' | 'kPa'

export type FoodContact = 'yes' | 'no' | 'not_applicable'

export type SubstitutionPolicy = 'no_without_approval' | 'equivalent_with_data'

export type PrintMethod = 'none' | 'flexo_1' | 'flexo_2_4' | 'litho' | 'digital' | 'other'

export type ClosureMethod = 'tape' | 'glue' | 'self_lock' | 'stitch' | 'other'

export type DimensionBasis = 'internal' | 'external'

export type DimensionUnit = 'mm' | 'cm' | 'in'

export type DefaultCurrency = 'USD' | 'MXN' | 'EUR'

export type VolumeTierUnit = 'piece' | 'thousand_piece'

export type IncotermRule =
  | 'EXW'
  | 'FCA'
  | 'FOB'
  | 'CFR'
  | 'CIF'
  | 'CPT'
  | 'CIP'
  | 'DAP'
  | 'DPU'
  | 'DDP'
  | 'not_specified'

export type Fragility = 'standard' | 'fragile' | 'heavy'

export type StackingScenario = 'single_stack' | 'warehouse_pallet' | 'export_container'

export type ShippingMode = 'parcel' | 'ltl_ftl' | 'export_ocean' | 'export_air'

export type PreferredResponseFormat = 'excel_template' | 'pdf_ok' | 'any_with_extraction'

export type CorrugatedAttachmentKind =
  | 'dieline_drawing'
  | 'reference_photo'
  | 'spec_sheet'
  | 'other'

export type ResponseFieldKey =
  | 'unit_price_per_tier'
  | 'currency'
  | 'price_basis'
  | 'moq'
  | 'tooling_die'
  | 'freight'
  | 'other_one_time'
  | 'lead_time_days'
  | 'incoterm_quoted'
  | 'payment_terms'
  | 'quote_validity'
  | 'board_spec_quoted'
  | 'no_substitution_ack'
  | 'sample_cost_time'
  | 'certifications'
  | 'test_report'
  | 'capacity_per_month'
  | 'master_carton'

export interface CorrugatedStrength {
  metric_type: StrengthMetricType
  target_value?: number
  unit?: StrengthUnit
  test_method?: string
}

export interface BoxDimensions {
  basis: DimensionBasis
  length: number
  width: number
  height: number
  unit: DimensionUnit
  tolerance?: string
  orientation_notes?: string
}

export interface CorrugatedProductSpec {
  version: 1
  packaging_type: 'corrugated_box'
  product_name: string
  product_description?: string
  product_weight?: { value: number; unit: 'g' | 'kg' }
  units_per_carton?: number
  max_carton_gross_weight?: { value: number; unit: 'kg' | 'lb' }
  fragility?: Fragility
  stacking_scenario?: StackingScenario
  shipping_mode?: ShippingMode
  box_style: BoxStyle
  wall_construction: WallConstruction
  flute_profile: FluteProfile
  liner_grade?: string
  medium_grade?: string
  recycled_content_target_pct?: number
  food_contact: FoodContact
  strength: CorrugatedStrength
  board_caliper_target?: string
  substitution_policy: SubstitutionPolicy
  print_method?: PrintMethod
  print_colors?: string
  closure_method?: ClosureMethod
  coating_finish?: string
  inserts_dividers?: string
  golden_sample_required?: boolean
  dimensions: BoxDimensions
}

export interface VolumeTier {
  id?: string
  label: string
  quantity: number
  unit: VolumeTierUnit
  is_primary?: boolean
  notes?: string
  sort_order?: number
}

export interface RFQHeaderDataV2 {
  rfq_number?: string
  buyer_company?: string
  buyer_contact_name?: string
  buyer_contact_email?: string
  quote_validity_days_requested?: number
  payment_terms_requested?: string
  owner?: string
  source_document?: string
  terms_and_conditions?: string
  supplier_notes?: string
}

export interface SupplierResponseChecklistV2 {
  required_fields: ResponseFieldKey[]
  optional_fields: ResponseFieldKey[]
  preferred_response_format?: PreferredResponseFormat
}

export interface RFQAttachmentV2 {
  id?: string
  kind: CorrugatedAttachmentKind
  file_name: string
  content_type?: string
  size_bytes?: number
  storage_bucket?: string
  storage_path?: string
  uploaded_at?: string
}

export interface CorrugatedIncoterms {
  rule?: IncotermRule | string
  named_place?: string
  transport_mode?: string
  origin_location?: string
  destination_location?: string
}

export type RfqStatusWrite = 'draft' | 'open'

/** POST/PATCH body for corrugated wizard create/update. */
export interface CorrugatedRFQCreate {
  name: string
  description: string
  response_deadline: string
  email_locale: 'en' | 'es'
  base_currency: DefaultCurrency | string
  delivery_point: string
  packaging_type: 'corrugated_box'
  status?: RfqStatusWrite
  header_data?: RFQHeaderDataV2 | null
  incoterms?: CorrugatedIncoterms | null
  volume_tiers: VolumeTier[]
  corrugated_spec: CorrugatedProductSpec
  response_checklist?: SupplierResponseChecklistV2 | null
  attachments?: RFQAttachmentV2[]
  /** Derived from primary tier for legacy clients / backends that still require them. */
  quantity?: number
  base_unit?: string
}

export type CorrugatedRFQUpdate = Partial<CorrugatedRFQCreate>
