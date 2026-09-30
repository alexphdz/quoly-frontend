import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enCommon from './locales/en/common.json'
import enEnums from './locales/en/enums.json'
import enComparison from './locales/en/comparison.json'
import enQuote from './locales/en/quote.json'
import enRfq from './locales/en/rfq.json'
import enInbox from './locales/en/inbox.json'
import enQuotation from './locales/en/quotation.json'
import enCorrugated from './locales/en/corrugated.json'
import enExtraction from './locales/en/extraction.json'
import enSpecEvidence from './locales/en/specEvidence.json'
import esCommon from './locales/es/common.json'
import esEnums from './locales/es/enums.json'
import esComparison from './locales/es/comparison.json'
import esQuote from './locales/es/quote.json'
import esRfq from './locales/es/rfq.json'
import esInbox from './locales/es/inbox.json'
import esQuotation from './locales/es/quotation.json'
import esCorrugated from './locales/es/corrugated.json'
import esExtraction from './locales/es/extraction.json'
import esSpecEvidence from './locales/es/specEvidence.json'

export const SUPPORTED_LOCALES = ['en', 'es'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'
export const LOCALE_STORAGE_KEY = 'quoly_locale'

export const resources = {
  en: {
    common: enCommon,
    enums: enEnums,
    comparison: enComparison,
    quote: enQuote,
    rfq: enRfq,
    inbox: enInbox,
    quotation: enQuotation,
    corrugated: enCorrugated,
    extraction: enExtraction,
    specEvidence: enSpecEvidence,
  },
  es: {
    common: esCommon,
    enums: esEnums,
    comparison: esComparison,
    quote: esQuote,
    rfq: esRfq,
    inbox: esInbox,
    quotation: esQuotation,
    corrugated: esCorrugated,
    extraction: esExtraction,
    specEvidence: esSpecEvidence,
  },
} as const

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES,
    defaultNS: 'common',
    ns: ['common', 'enums', 'comparison', 'quote', 'rfq', 'inbox', 'quotation', 'corrugated', 'extraction', 'specEvidence'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LOCALE_STORAGE_KEY,
      caches: ['localStorage'],
    },
  })

// Keep <html lang> in sync for accessibility/SEO.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})
document.documentElement.lang = i18n.resolvedLanguage ?? DEFAULT_LOCALE

export default i18n
