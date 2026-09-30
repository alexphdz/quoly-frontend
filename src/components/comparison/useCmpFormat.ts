import { useFormat } from '../../lib/format'
import { useUnitLabel } from '../../lib/units'

/** Text formatters for the comparison screen: amounts read as "12,400 MXN". */
export function useCmpFormat(baseUnit: string, baseCurrency: string) {
  const fmt = useFormat()
  const units = useUnitLabel()
  return {
    fmt,
    currency: baseCurrency,
    unit: units.per(baseUnit) || baseUnit,
    units: units.count(baseUnit) || baseUnit,
    total: (value: number, currency = baseCurrency) => `${fmt.number(value, { maximumFractionDigits: 0 })} ${currency}`,
    unitPrice: (value: number, currency = baseCurrency) => `${fmt.unitNumber(value)} ${currency}`,
    qty: (value: number) => fmt.number(value),
  }
}

export type CmpFormat = ReturnType<typeof useCmpFormat>
