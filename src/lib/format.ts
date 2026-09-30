import { useTranslation } from 'react-i18next'

/** Adaptive precision for per-unit prices: at least 2 decimals, more when the amount is small. */
export function unitPriceFractionDigits(value: number): number {
  const abs = Math.abs(value)
  if (abs === 0 || abs >= 10) return 2
  if (abs >= 1) return 3
  return 4
}

export function useFormat() {
  const { i18n } = useTranslation()
  const locale = i18n.resolvedLanguage === 'es' ? 'es-MX' : 'en-US'

  const number = (value: number, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, options).format(value)

  const unitNumber = (value: number) =>
    number(value, {
      minimumFractionDigits: 2,
      maximumFractionDigits: unitPriceFractionDigits(value),
    })

  const date = (value: string | Date, options?: Intl.DateTimeFormatOptions) => {
    const parsed = typeof value === 'string' ? new Date(value) : value
    if (Number.isNaN(parsed.getTime())) return ''
    return new Intl.DateTimeFormat(locale, options ?? { dateStyle: 'medium' }).format(parsed)
  }

  const money = (value: number, currency: string, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, ...options }).format(value)

  const unitMoney = (value: number, currency: string) => `${unitNumber(value)} ${currency}`

  const percent = (value: number) =>
    new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 0 }).format(value)

  return { locale, number, unitNumber, date, money, unitMoney, percent }
}
