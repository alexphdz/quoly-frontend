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
  const { t, i18n } = useTranslation('enums')
  const label = (section: EnumSection, value?: string) =>
    value ? t(`${section}.${value}` as Parameters<typeof t>[0], { defaultValue: value }) : ''
  // Missing-field codes come from several backend paths (normalization,
  // comparison flags, checklist keys). An unknown one gets generic text so a
  // raw code like `unquoted_xyz` never reaches the screen.
  const missingField = (value?: string) => {
    if (!value) return ''
    const key = `enums:missingField.${value}`
    return i18n.exists(key) ? t(key as Parameters<typeof t>[0]) : t('missingField.unknown')
  }

  return {
    rfqStatus: (v?: string) => label('rfqStatus', v),
    supplierStatus: (v?: string) => label('supplierStatus', v),
    quoteStatus: (v?: string) => label('quoteStatus', v),
    messageStatus: (v?: string) => label('messageStatus', v),
    messageType: (v?: string) => label('messageType', v),
    extractionStatus: (v?: string) => label('extractionStatus', v),
    missingField,
    alertType: (v?: string) => label('alertType', v),
  }
}
