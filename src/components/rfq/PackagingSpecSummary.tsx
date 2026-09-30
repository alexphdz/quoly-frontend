import { useTranslation } from 'react-i18next'
import type { PackagingSpecification } from '../../types/packaging'

function label(value: string) {
  return value.replaceAll('_', ' ')
}

function row(labelText: string, value: unknown) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null
  return (
    <div>
      <span className="text-gray-400">{labelText}:</span>{' '}
      <span className="text-gray-900">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
    </div>
  )
}

export default function PackagingSpecSummary({ spec }: { spec: PackagingSpecification | null }) {
  const { t } = useTranslation('rfq')
  if (!spec) return null

  const yesNo = (value: boolean | null | undefined) => {
    if (value == null) return null
    return value ? t('summary.yes') : t('summary.no')
  }

  const dimensions = spec.dimensions
    ? Object.entries(spec.dimensions).map(([key, m]) => `${label(key)} ${m.value} ${m.unit}`)
    : []

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
        {row(t('summary.fields.rfqNumber'), spec.rfq_number)}
        {row(t('summary.fields.buyerCompany'), spec.buyer_company)}
        {row(t('summary.fields.buyerContactName'), spec.buyer_contact_name)}
        {row(t('summary.fields.category'), spec.packaging_category && label(spec.packaging_category))}
        {row(t('summary.fields.materialFamily'), spec.material_family && label(spec.material_family))}
        {row(t('summary.fields.materialDetail'), spec.material_detail)}
        {row(t('summary.fields.recycledContent'), spec.recycled_content_percent != null ? `${spec.recycled_content_percent}%` : null)}
        {row(t('summary.fields.foodContactRequired'), yesNo(spec.food_contact_required))}
        {row(t('summary.fields.dimensions'), dimensions)}
        {row(t('summary.fields.color'), spec.color)}
        {row(t('summary.fields.finish'), spec.finish)}
        {row(t('summary.fields.printing'), spec.printing && label(spec.printing))}
        {row(t('summary.fields.artworkRequired'), yesNo(spec.artwork_required))}
        {row(t('summary.fields.targetMoq'), spec.target_moq)}
        {row(t('summary.fields.quoteValidityDays'), spec.quote_validity_days)}
        {row(t('summary.fields.incoterm'), spec.incoterm && `${spec.incoterm}${spec.incoterm_place ? ` ${spec.incoterm_place}` : ''}`)}
        {row(t('summary.fields.targetDeliveryDate'), spec.target_delivery_date)}
        {row(t('summary.fields.maxLeadTime'), spec.max_lead_time_days)}
        {row(t('summary.fields.requestedPaymentTerms'), spec.requested_payment_terms)}
        {row(t('summary.fields.preferredResponseFormat'), spec.preferred_response_format)}
      </div>

      {spec.tolerance_notes && (
        <p className="text-sm text-gray-700">
          <span className="text-gray-400">{t('summary.fields.qualityNotes')}:</span> {spec.tolerance_notes}
        </p>
      )}
    </div>
  )
}
