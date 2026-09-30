import { useTranslation } from 'react-i18next'

/** Map supplier/API unit strings onto commercial catalog codes when we can. */
const ALIASES: Record<string, string> = {
  piece: 'piece',
  pieces: 'piece',
  pieza: 'piece',
  piezas: 'piece',
  pcs: 'piece',
  pc: 'piece',
  pza: 'piece',
  pzas: 'piece',
  pz: 'piece',
  each: 'piece',
  ea: 'piece',
  unit: 'unit',
  units: 'unit',
  unidad: 'unit',
  unidades: 'unit',
  box: 'box',
  boxes: 'box',
  caja: 'box',
  cajas: 'box',
  roll: 'roll',
  rolls: 'roll',
  rollo: 'roll',
  rollos: 'roll',
  bag: 'bag',
  bags: 'bag',
  bolsa: 'bag',
  bolsas: 'bag',
  drum: 'drum',
  drums: 'drum',
  tambor: 'drum',
  tambores: 'drum',
  pallet: 'pallet',
  pallets: 'pallet',
  tarima: 'pallet',
  tarimas: 'pallet',
  pack: 'pack',
  packs: 'pack',
  paquete: 'pack',
  paquetes: 'pack',
  set: 'set',
  sets: 'set',
  juego: 'set',
  juegos: 'set',
  container: 'container',
  containers: 'container',
  contenedor: 'container',
  contenedores: 'container',
  kg: 'kg',
  g: 'g',
  mg: 'mg',
  lb: 'lb',
  oz: 'oz',
  l: 'L',
  ml: 'mL',
  m: 'm',
  cm: 'cm',
  mm: 'mm',
  m2: 'm2',
  m3: 'm3',
}

export function canonicalUnit(raw: string | null | undefined): string | null {
  const value = raw?.trim()
  if (!value) return null
  return ALIASES[value.toLowerCase()] ?? value
}

export function useUnitLabel() {
  const { t, i18n } = useTranslation(['rfq', 'comparison'])

  const count = (raw: string | null | undefined) => {
    const code = canonicalUnit(raw)
    if (!code) return ''
    const key = `rfq:commercial.units.${code}`
    return i18n.exists(key) ? t(key) : code
  }

  const per = (raw: string | null | undefined) => {
    const code = canonicalUnit(raw)
    if (!code) return ''
    const singularKey = `comparison:cmp.unitSingular.${code}`
    if (i18n.exists(singularKey)) return t(singularKey)
    const countKey = `rfq:commercial.units.${code}`
    return i18n.exists(countKey) ? t(countKey) : code
  }

  return { count, per }
}
