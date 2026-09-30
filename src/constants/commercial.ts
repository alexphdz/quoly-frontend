/** Commercial unit codes. Keep in step with Backend/app/services/commercial.py. */

export const COMMERCIAL_UNITS = [
  'kg',
  'g',
  'mg',
  'lb',
  'oz',
  'L',
  'mL',
  'piece',
  'unit',
  'm',
  'cm',
  'mm',
  'm2',
  'm3',
  'roll',
  'box',
  'bag',
  'drum',
  'pallet',
  'container',
  'set',
  'pack',
] as const

export type CommercialUnit = (typeof COMMERCIAL_UNITS)[number]

/** Existing catalog only — grouping for the unit picker, not new units. */
export const COMMERCIAL_UNIT_GROUPS: { id: string; codes: readonly CommercialUnit[] }[] = [
  { id: 'weight', codes: ['kg', 'g', 'mg', 'lb', 'oz'] },
  { id: 'volume', codes: ['L', 'mL', 'm3'] },
  { id: 'count', codes: ['piece', 'unit', 'set', 'pack'] },
  { id: 'length', codes: ['m', 'cm', 'mm'] },
  { id: 'area', codes: ['m2'] },
  { id: 'package', codes: ['roll', 'box', 'bag', 'drum', 'pallet', 'container'] },
]

/** Quote currencies. Keep in step with COMMERCIAL_CURRENCIES in the backend. */
export const COMMERCIAL_CURRENCIES = ['USD', 'MXN', 'EUR', 'CAD', 'GBP', 'CNY'] as const
export const DEFAULT_COMMERCIAL_CURRENCY = 'USD'

export type PlaceRole =
  | 'place_of_delivery'
  | 'place_of_destination'
  | 'port_of_shipment'
  | 'port_of_destination'

export const COMMERCIAL_INCOTERMS: { code: string; role: PlaceRole; sea: boolean }[] = [
  { code: 'EXW', role: 'place_of_delivery', sea: false },
  { code: 'FCA', role: 'place_of_delivery', sea: false },
  { code: 'CPT', role: 'place_of_destination', sea: false },
  { code: 'CIP', role: 'place_of_destination', sea: false },
  { code: 'DAP', role: 'place_of_destination', sea: false },
  { code: 'DPU', role: 'place_of_destination', sea: false },
  { code: 'DDP', role: 'place_of_destination', sea: false },
  { code: 'FAS', role: 'port_of_shipment', sea: true },
  { code: 'FOB', role: 'port_of_shipment', sea: true },
  { code: 'CFR', role: 'port_of_destination', sea: true },
  { code: 'CIF', role: 'port_of_destination', sea: true },
]

export function incotermByCode(code: string) {
  return COMMERCIAL_INCOTERMS.find((term) => term.code === code)
}
