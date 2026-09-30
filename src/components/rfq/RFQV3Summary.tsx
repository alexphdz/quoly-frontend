import { useTranslation } from 'react-i18next'
import type { IncotermsTerms, RFQAttachment, RFQHeaderData, RFQLineItem, SupplierResponseChecklist } from '../../types/rfq'
import type { RFQAttachmentV2 } from '../../types/corrugated'
import { useFormat } from '../../lib/format'
import { Badge, Card } from '../ui'

function label(value: string) {
  return value.replaceAll('_', ' ')
}

function row(labelText: string, value: unknown) {
  if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) return null
  return (
    <div>
      <span className="text-[var(--text-muted)]">{labelText}</span>{' '}
      <span className="text-[var(--text-primary)]">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
    </div>
  )
}

export default function RFQV3Summary({
  header,
  lineItems,
  incoterms,
  attachments,
  checklist,
}: {
  header?: RFQHeaderData | null
  lineItems?: RFQLineItem[]
  incoterms?: IncotermsTerms | null
  attachments?: Array<RFQAttachment | RFQAttachmentV2>
  checklist?: SupplierResponseChecklist | null
}) {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const hasV3 = !!header || !!incoterms || !!lineItems?.length || !!attachments?.length || !!checklist
  if (!hasV3) return null

  return (
    <div className="grid gap-4">
      {header && (
        <Card className="card-pad text-sm">
          <h3 className="qy-heading font-semibold">{t('summary.buyerCommercial')}</h3>
          {header.rfq_number && <p className="mt-1 text-[var(--text-muted)]">{header.rfq_number}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {row(t('summary.fields.rfqNumber'), header.rfq_number)}
            {row(t('summary.fields.buyerCompany'), header.buyer_company)}
            {row(t('summary.fields.buyerContact'), header.buyer_contact_name)}
            {row(t('summary.fields.buyerEmail'), header.buyer_contact_email)}
            {row(t('summary.fields.owner'), header.owner)}
            {row(t('summary.fields.sourceDocument'), header.source_document)}
            {row(t('summary.fields.requestedDeliveryDate'), header.requested_delivery_date)}
            {row(t('summary.fields.paymentTerms'), header.payment_terms || header.payment_terms_requested)}
            {row(t('summary.fields.quoteValidityDays'), header.quote_validity_days ?? header.quote_validity_days_requested)}
          </div>
          {header.supplier_notes && <p className="mt-4 text-[var(--text-secondary)]"><span className="text-[var(--text-muted)]">{t('summary.fields.supplierNotes')}</span><br />{header.supplier_notes}</p>}
          {header.terms_and_conditions && <p className="mt-3 text-[var(--text-secondary)]"><span className="text-[var(--text-muted)]">{t('summary.fields.termsConditions')}</span><br />{header.terms_and_conditions}</p>}
        </Card>
      )}

      {incoterms && (
        <Card className="card-pad text-sm">
          <h3 className="qy-heading font-semibold">{t('summary.incotermsDelivery')}</h3>
          {incoterms.rule && incoterms.rule !== 'not_specified' && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="brand">{incoterms.rule}</Badge>
              <span className="font-semibold">{label(incoterms.rule)}</span>
              {incoterms.named_place && <span className="text-[var(--text-muted)]">· {incoterms.named_place}</span>}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {row(t('summary.fields.incoterm'), incoterms.rule && incoterms.rule !== 'not_specified' ? incoterms.rule : null)}
            {row(t('summary.fields.namedPlace'), incoterms.named_place)}
            {row(t('summary.fields.transportMode'), incoterms.transport_mode && label(incoterms.transport_mode))}
            {row(t('summary.fields.origin'), incoterms.origin_location)}
            {row(t('summary.fields.destination'), incoterms.destination_location)}
          </div>
        </Card>
      )}

      {lineItems && lineItems.length > 0 && (
        <Card className="card-pad">
          <h3 className="qy-heading font-semibold">{t('summary.lineItems')}</h3>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t('summary.lineItemsCount', { count: lineItems.length })}</p>
          <div className="mt-4 space-y-3">
            {lineItems.map((item, index) => {
              const spec = item.technical_specification
              const dimensions = spec?.dimensions
                ? Object.entries(spec.dimensions).map(([key, m]) => `${label(key)} ${m.value} ${m.unit}`)
                : []
              return (
                <div key={item.id || index} className="rounded-[var(--radius-card)] border border-[var(--border-subtle)] p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-[var(--text-primary)]"><Badge tone="neutral">{index + 1}</Badge> <span className="ml-2">{item.product_name || t('summary.line', { index: index + 1 })}</span></p>
                    <p className="text-[var(--text-muted)]">{fmt.number(Number(item.quantity))} {item.unit}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-2">
                    {row(t('summary.fields.skuReference'), item.sku)}
                    {row(t('summary.fields.template'), item.template && label(item.template))}
                    {row(t('summary.fields.targetUnitPrice'), item.target_unit_price)}
                    {row(t('summary.fields.requestedDeliveryDate'), item.requested_delivery_date)}
                    {row(t('summary.fields.category'), spec?.packaging_category && label(spec.packaging_category))}
                    {row(t('summary.fields.material'), [spec?.material_family, spec?.material_detail].filter(Boolean).join(' / '))}
                    {row(t('summary.fields.dimensions'), dimensions)}
                    {row(t('summary.fields.foodContact'), spec?.food_contact_required == null ? null : spec.food_contact_required ? t('summary.yes') : t('summary.no'))}
                    {row(t('summary.fields.certifications'), spec?.certifications)}
                    {row(t('summary.fields.compliance'), spec?.compliance_requirements)}
                  </div>
                  {item.description && <p className="text-[var(--text-secondary)] mt-2">{item.description}</p>}
                  {item.attachments && item.attachments.length > 0 && (
                    <p className="text-[var(--text-muted)] mt-2">
                      {t('summary.attachments')}: {item.attachments.map(a => `${a.file_name} (${label(a.kind)})`).join(', ')}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {attachments && attachments.length > 0 && (
        <Card className="card-pad text-sm">
          <h3 className="qy-heading font-semibold">{t('summary.attachmentReferences')}</h3>
          {t('summary.attachmentReferencesNote') ? <p className="mt-1 text-[var(--text-muted)]">{t('summary.attachmentReferencesNote')}</p> : null}
          <ul className="mt-4 flex flex-wrap gap-2">
            {attachments.map((attachment, index) => (
              <li key={attachment.id || index}><Badge tone="neutral">{attachment.file_name} · {label(attachment.kind)}</Badge></li>
            ))}
          </ul>
        </Card>
      )}

      {checklist && (
        <Card className="card-pad text-sm">
          <h3 className="qy-heading font-semibold">{t('summary.responseChecklist')}</h3>
          {t('summary.responseChecklistNote') ? <p className="mt-1 text-[var(--text-muted)]">{t('summary.responseChecklistNote')}</p> : null}
          {checklist.required_fields.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold text-[var(--text-muted)]">{t('summary.requiredEvery')}</div>
              <div className="flex flex-wrap gap-2">{checklist.required_fields.map(field => <Badge key={field} tone="brand">{field}</Badge>)}</div>
            </div>
          )}
          {checklist.optional_fields.length > 0 && (
            <div className="mt-4">
              <div className="mb-2 text-xs font-semibold text-[var(--text-muted)]">{t('summary.niceToHave')}</div>
              <div className="flex flex-wrap gap-2">{checklist.optional_fields.map(field => <Badge key={field}>{field}</Badge>)}</div>
            </div>
          )}
          {row(t('summary.fields.preferredFormat'), checklist.preferred_response_format)}
        </Card>
      )}
    </div>
  )
}
