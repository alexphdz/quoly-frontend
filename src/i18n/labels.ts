import { useTranslation } from 'react-i18next'

type EnumSection =
  | 'rfqStatus'
  | 'supplierStatus'
  | 'quoteStatus'
  | 'messageStatus'
  | 'messageType'
  | 'extractionStatus'
  | 'missingField'
  | 'alertType'

/**
 * Translated labels for backend enum tokens. The UI must never render raw
 * tokens (e.g. `delivery_lead_time_days`, `quoted`) — always go through here.
 * `statusTone()` (visual tone) stays in components/ui as it is logic, not text.
 */
export function useEnumLabels() {
  const { t } = useTranslation('enums')
  const label = (section: EnumSection, value?: string) =>
    value ? t(`${section}.${value}` as Parameters<typeof t>[0], { defaultValue: value }) : ''

  return {
    rfqStatus: (v?: string) => label('rfqStatus', v),
    supplierStatus: (v?: string) => label('supplierStatus', v),
    quoteStatus: (v?: string) => label('quoteStatus', v),
    messageStatus: (v?: string) => label('messageStatus', v),
    messageType: (v?: string) => label('messageType', v),
    extractionStatus: (v?: string) => label('extractionStatus', v),
    missingField: (v?: string) => label('missingField', v),
    alertType: (v?: string) => label('alertType', v),
  }
}
