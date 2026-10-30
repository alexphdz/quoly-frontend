import 'react-i18next'
import type common from './locales/en/common.json'
import type enums from './locales/en/enums.json'
import type comparison from './locales/en/comparison.json'
import type quote from './locales/en/quote.json'
import type rfq from './locales/en/rfq.json'
import type inbox from './locales/en/inbox.json'
import type quotation from './locales/en/quotation.json'
import type corrugated from './locales/en/corrugated.json'
import type ds from './locales/en/ds.json'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      enums: typeof enums
      comparison: typeof comparison
      quote: typeof quote
      rfq: typeof rfq
      inbox: typeof inbox
      quotation: typeof quotation
      corrugated: typeof corrugated
      ds: typeof ds
    }
  }
}
