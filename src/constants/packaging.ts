export const PACKAGING_CATEGORIES = [
  'caps_closures',
  'bottles_jars',
  'flexible_pouch',
  'label',
  'corrugated_box',
  'folding_carton',
  'tray',
  'can',
  'film_roll',
  'bag_sack',
  'pallet_crate',
  'other',
]

export const MATERIAL_FAMILIES = [
  'plastic',
  'paper_cardboard',
  'metal',
  'glass',
  'wood',
  'compostable_biobased',
  'composite_multilayer',
  'other',
]

export const MATERIAL_DETAILS = [
  'PET',
  'HDPE',
  'LDPE',
  'PP',
  'PVC',
  'aluminum',
  'tinplate',
  'kraft',
  'corrugated',
  'cartonboard',
  'glass',
  'wood',
  'other',
]

export const PACKAGING_UNITS = [
  { value: 'piece', label: 'piece' },
  { value: 'thousand_piece', label: 'thousand pieces' },
  { value: 'box', label: 'box/case' },
  { value: 'roll', label: 'roll' },
  { value: 'sheet', label: 'sheet' },
  { value: 'pallet', label: 'pallet' },
  { value: 'kg', label: 'kg' },
  { value: 'metric_ton', label: 'metric ton' },
  { value: 'gram', label: 'gram' },
  { value: 'liter', label: 'liter' },
  { value: 'milliliter', label: 'milliliter' },
  { value: 'meter', label: 'meter' },
  { value: 'square_meter', label: 'square meter' },
]

export const DIMENSION_UNITS = ['mm', 'cm', 'm', 'in', 'ml', 'l', 'micron', 'gauge']
export const CURRENCIES = ['USD', 'MXN', 'EUR']
export const INCOTERMS = ['not_specified', 'EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']
export const TRANSPORT_MODES = ['not_specified', 'road', 'rail', 'air', 'sea', 'inland_waterway', 'multimodal']
export const MARITIME_INCOTERMS = ['FAS', 'FOB', 'CFR', 'CIF']
export const INCOTERM_HINTS: Record<string, string> = {
  EXW: 'Buyer takes most transport responsibility from seller premises.',
  FCA: 'Seller delivers to carrier or named place; useful for container freight.',
  FOB: 'Sea/inland waterway only. Seller delivers goods on board at named port.',
  CFR: 'Sea/inland waterway only. Seller pays cost and freight to destination port.',
  CIF: 'Sea/inland waterway only. Seller pays cost, insurance and freight to destination port.',
  CPT: 'Seller pays carriage to named destination, risk transfers earlier.',
  CIP: 'Like CPT, with seller-paid insurance.',
  DAP: 'Seller delivers to named destination, not unloaded.',
  DPU: 'Seller delivers unloaded at named destination.',
  DDP: 'Seller delivers with import duties/taxes handled by seller if agreed.',
}
export const PRINTING_OPTIONS = ['none', '1_color', '2_4_colors', 'full_color', 'label_only']

export const TECH_SPEC_TEMPLATES = [
  { value: 'generic_product', label: 'Generic product' },
  { value: 'packaging_generic', label: 'Packaging generic' },
  { value: 'flexible_pouch', label: 'Flexible pouch' },
  { value: 'folding_carton', label: 'Folding carton' },
  { value: 'corrugated_box', label: 'Corrugated box' },
  { value: 'bottle_jar', label: 'Bottle / jar' },
  { value: 'cap_closure', label: 'Cap / closure' },
  { value: 'label_sleeve', label: 'Label / sleeve' },
  { value: 'food_contact_packaging', label: 'Food-contact packaging' },
  { value: 'chemical_ink_adhesive', label: 'Chemical / ink / adhesive' },
]

export const ATTACHMENT_KINDS = [
  'technical_data_sheet',
  'drawing',
  'artwork',
  'reference_photo',
  'current_quote',
  'certificate',
  'sds',
  'other',
]

export const RESPONSE_FIELDS = [
  'price',
  'currency',
  'unit',
  'MOQ',
  'lead time',
  'delivery point / Incoterm',
  'payment terms',
  'certifications',
  'samples',
  'tooling or mold cost',
  'freight included',
  'taxes included',
  'quote validity',
  'tooling or mold cost',
  'sample cost/time',
  'capacity per month',
  'packaging/master carton',
  'compliance declarations',
]
