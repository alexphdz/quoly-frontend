import { Icon } from '../ds'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import {
  ATTACHMENT_KINDS,
  CURRENCIES,
  DIMENSION_UNITS,
  INCOTERM_HINTS,
  INCOTERMS,
  MARITIME_INCOTERMS,
  MATERIAL_DETAILS,
  MATERIAL_FAMILIES,
  PACKAGING_CATEGORIES,
  PACKAGING_UNITS,
  PRINTING_OPTIONS,
  RESPONSE_FIELDS,
  TECH_SPEC_TEMPLATES,
  TRANSPORT_MODES,
} from '../../constants/packaging'
import type { PackagingSpecification } from '../../types/packaging'
import type { RFQAttachment, RFQCreate, RFQLineItem } from '../../types/rfq'
import { useFormat } from '../../lib/format'
import { Alert, Badge, Card, SelectInput } from '../ui'

const optionalNumber = z.union([z.coerce.number(), z.literal('')]).optional()

const attachmentSchema = z.object({
  file_name: z.string().optional(),
  kind: z.string().optional(),
})

const lineItemSchema = z.object({
  id: z.string(),
  product_name: z.string().min(1, 'form.validation.required'),
  sku: z.string().optional(),
  description: z.string().optional(),
  quantity: z.coerce.number().positive('form.validation.mustBePositive'),
  unit: z.string().min(1, 'form.validation.required'),
  target_unit_price: optionalNumber,
  requested_delivery_date: z.string().optional(),
  template: z.string().optional(),
  notes: z.string().optional(),
  packaging_category: z.string().optional(),
  material_family: z.string().optional(),
  material_detail: z.string().optional(),
  recycled_content_percent: optionalNumber,
  food_contact_required: z.string().optional(),
  length: optionalNumber,
  width: optionalNumber,
  height: optionalNumber,
  diameter: optionalNumber,
  capacity: optionalNumber,
  thickness: optionalNumber,
  dimension_unit: z.string().optional(),
  capacity_unit: z.string().optional(),
  thickness_unit: z.string().optional(),
  color: z.string().optional(),
  finish: z.string().optional(),
  printing: z.string().optional(),
  artwork_required: z.boolean().optional(),
  tolerance_notes: z.string().optional(),
  certifications: z.string().optional(),
  compliance_requirements: z.string().optional(),
  storage_handling: z.string().optional(),
  shelf_life: z.string().optional(),
  sds_required: z.boolean().optional(),
  attachments: z.array(attachmentSchema).optional(),
})

const schema = z.object({
  name: z.string().min(1, 'form.validation.required'),
  description: z.string().min(1, 'form.validation.required'),
  quantity: z.coerce.number().int().positive('form.validation.mustBePositive'),
  base_unit: z.string().min(1, 'form.validation.required'),
  base_currency: z.string().min(1, 'form.validation.required'),
  delivery_point: z.string().min(1, 'form.validation.required'),
  response_deadline: z.string().min(1, 'form.validation.required'),
  rfq_number: z.string().optional(),
  buyer_company: z.string().optional(),
  buyer_contact_name: z.string().optional(),
  buyer_contact_email: z.string().optional(),
  owner: z.string().optional(),
  source_document: z.string().optional(),
  requested_delivery_date: z.string().optional(),
  payment_terms: z.string().optional(),
  quote_validity_days: optionalNumber,
  terms_and_conditions: z.string().optional(),
  supplier_notes: z.string().optional(),
  incoterm_rule: z.string().optional(),
  incoterm_named_place: z.string().optional(),
  transport_mode: z.string().optional(),
  origin_location: z.string().optional(),
  destination_location: z.string().optional(),
  required_response_fields: z.array(z.string()).optional(),
  optional_response_fields: z.array(z.string()).optional(),
  preferred_response_format: z.string().optional(),
  email_locale: z.enum(['en', 'es']),
  line_items: z.array(lineItemSchema).min(1, 'form.validation.atLeastOneLine'),
  rfq_attachments: z.array(attachmentSchema).optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (data: RFQCreate) => void
  isPending: boolean
  error: string | null
  defaultEmailLocale?: 'en' | 'es'
}

const defaultRequired = ['price', 'currency', 'unit', 'MOQ', 'lead time', 'delivery point / Incoterm', 'payment terms']
const defaultOptional = ['certifications', 'samples', 'tooling or mold cost', 'sample cost/time']

function newLineItem(index: number): FormValues['line_items'][number] {
  return {
    id: `line-${Date.now()}-${index}`,
    product_name: '',
    sku: '',
    description: '',
    quantity: 1,
    unit: 'piece',
    target_unit_price: '',
    requested_delivery_date: '',
    template: 'packaging_generic',
    notes: '',
    packaging_category: '',
    material_family: '',
    material_detail: '',
    recycled_content_percent: '',
    food_contact_required: '',
    length: '',
    width: '',
    height: '',
    diameter: '',
    capacity: '',
    thickness: '',
    dimension_unit: 'mm',
    capacity_unit: 'ml',
    thickness_unit: 'micron',
    color: '',
    finish: '',
    printing: 'none',
    artwork_required: false,
    tolerance_notes: '',
    certifications: '',
    compliance_requirements: '',
    storage_handling: '',
    shelf_life: '',
    sds_required: false,
    attachments: [],
  }
}

function cleanNumber(value: unknown): number | null {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function cleanString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function label(value: string) {
  return value.replaceAll('_', ' ')
}

function csv(value?: string) {
  return value?.split(',').map(v => v.trim()).filter(Boolean) ?? []
}

export default function RFQForm({ onSubmit, isPending, error, defaultEmailLocale = 'en' }: Props) {
  const { t } = useTranslation('rfq')
  const fmt = useFormat()
  const [showAdvanced, setShowAdvanced] = useState(true)
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as unknown as Resolver<FormValues>,
    defaultValues: {
      base_currency: 'USD',
      base_unit: 'piece',
      incoterm_rule: 'not_specified',
      transport_mode: 'not_specified',
      required_response_fields: defaultRequired,
      optional_response_fields: defaultOptional,
      preferred_response_format: 'email body or attached quote',
      email_locale: defaultEmailLocale,
      line_items: [newLineItem(1)],
      rfq_attachments: [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'line_items' })
  const { fields: rfqAttachments, append: appendRfqAttachment, remove: removeRfqAttachment } = useFieldArray({ control, name: 'rfq_attachments' })
  const watched = watch()

  useEffect(() => {
    setValue('email_locale', defaultEmailLocale)
  }, [defaultEmailLocale, setValue])

  const incotermWarning = useMemo(() => {
    const rule = watched.incoterm_rule
    if (rule && MARITIME_INCOTERMS.includes(rule) && !['sea', 'inland_waterway'].includes(watched.transport_mode || '')) {
      return t('form.validation.maritimeIncoterm', { rule })
    }
    if (rule && rule !== 'not_specified' && !watched.incoterm_named_place?.trim()) {
      return t('form.validation.incotermNamedPlace')
    }
    return null
  }, [watched.incoterm_rule, watched.transport_mode, watched.incoterm_named_place, t])

  const completeness = useMemo(() => {
    const blockers: string[] = []
    const hints: string[] = []
    if (!watched.name) blockers.push(t('form.validation.titleRequired'))
    if (!watched.response_deadline) blockers.push(t('form.validation.deadlineRequired'))
    if (!watched.delivery_point) blockers.push(t('form.validation.deliveryRequired'))
    if (!watched.line_items?.length) blockers.push(t('form.validation.addLineItem'))
    watched.line_items?.forEach((line, index) => {
      if (!line.product_name) blockers.push(t('form.validation.lineNeedsName', { index: index + 1 }))
      if (!line.quantity || Number(line.quantity) <= 0) blockers.push(t('form.validation.lineNeedsQuantity', { index: index + 1 }))
      if (!line.unit) blockers.push(t('form.validation.lineNeedsUnit', { index: index + 1 }))
    })
    if (!watched.description) hints.push(t('form.validation.noDescription'))
    if (incotermWarning) hints.push(incotermWarning)
    if (!watched.required_response_fields?.length) hints.push(t('form.validation.noRequiredFields'))
    watched.line_items?.forEach((line, index) => {
      if ((line.artwork_required || line.sds_required) && !line.attachments?.some(a => a.file_name)) {
        hints.push(t('form.validation.lineDocMissing', { index: index + 1 }))
      }
    })
    return { blockers, hints }
  }, [watched, incotermWarning, t])

  const handleValid = (data: FormValues) => {
    const firstLine = data.line_items[0]
    const lineItems = data.line_items.map((line, index): RFQLineItem => {
      const dimensions: PackagingSpecification['dimensions'] = {}
      const dimensionUnit = line.dimension_unit || 'mm'
      for (const key of ['length', 'width', 'height', 'diameter'] as const) {
        const value = cleanNumber(line[key])
        if (value != null) dimensions[key] = { value, unit: dimensionUnit }
      }
      const capacity = cleanNumber(line.capacity)
      if (capacity != null) dimensions.capacity = { value: capacity, unit: line.capacity_unit || 'ml' }
      const thickness = cleanNumber(line.thickness)
      if (thickness != null) dimensions.thickness = { value: thickness, unit: line.thickness_unit || 'micron' }
      const attachments = (line.attachments ?? [])
        .filter(a => cleanString(a.file_name))
        .map((a, attachmentIndex): RFQAttachment => ({
          id: `${line.id}-attachment-${attachmentIndex}`,
          file_name: cleanString(a.file_name)!,
          kind: cleanString(a.kind) ?? 'other',
          scope: 'line',
          line_item_id: line.id,
        }))
      return {
        id: line.id || `line-${index + 1}`,
        product_name: line.product_name,
        sku: cleanString(line.sku),
        description: cleanString(line.description),
        quantity: Number(line.quantity),
        unit: line.unit,
        target_unit_price: cleanNumber(line.target_unit_price),
        requested_delivery_date: cleanString(line.requested_delivery_date),
        template: cleanString(line.template),
        notes: cleanString(line.notes),
        required_response_fields: data.required_response_fields ?? [],
        optional_response_fields: data.optional_response_fields ?? [],
        attachments,
        technical_specification: {
          version: 1,
          template: cleanString(line.template),
          packaging_category: cleanString(line.packaging_category),
          material_family: cleanString(line.material_family),
          material_detail: cleanString(line.material_detail),
          recycled_content_percent: cleanNumber(line.recycled_content_percent),
          food_contact_required: line.food_contact_required === 'yes' ? true : line.food_contact_required === 'no' ? false : null,
          dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined,
          color: cleanString(line.color),
          finish: cleanString(line.finish),
          printing: cleanString(line.printing),
          artwork_required: !!line.artwork_required,
          tolerance_notes: cleanString(line.tolerance_notes),
          certifications: csv(line.certifications),
          compliance_requirements: csv(line.compliance_requirements),
          storage_handling: cleanString(line.storage_handling),
          shelf_life: cleanString(line.shelf_life),
          sds_required: !!line.sds_required,
        },
      }
    })

    const legacySpec: PackagingSpecification = {
      version: 1,
      rfq_number: cleanString(data.rfq_number),
      buyer_company: cleanString(data.buyer_company),
      buyer_contact_name: cleanString(data.buyer_contact_name),
      buyer_contact_email: cleanString(data.buyer_contact_email),
      issue_date: new Date().toISOString().slice(0, 10),
      ...lineItems[0]?.technical_specification,
      target_delivery_date: cleanString(data.requested_delivery_date),
      requested_payment_terms: cleanString(data.payment_terms),
      quote_validity_days: cleanNumber(data.quote_validity_days),
      incoterm: cleanString(data.incoterm_rule),
      incoterm_place: cleanString(data.incoterm_named_place),
      required_response_fields: data.required_response_fields ?? [],
      optional_response_fields: data.optional_response_fields ?? [],
      preferred_response_format: cleanString(data.preferred_response_format),
    }

    const rfqAttachments = (data.rfq_attachments ?? [])
      .filter(a => cleanString(a.file_name))
      .map((a, index): RFQAttachment => ({
        id: `rfq-attachment-${index}`,
        file_name: cleanString(a.file_name)!,
        kind: cleanString(a.kind) ?? 'other',
        scope: 'rfq',
      }))

    onSubmit({
      name: data.name,
      description: data.description,
      quantity: Number(data.quantity || firstLine?.quantity || 1),
      base_unit: data.base_unit,
      base_currency: data.base_currency,
      delivery_point: data.delivery_point,
      response_deadline: data.response_deadline,
      specification: legacySpec,
      header_data: {
        rfq_number: cleanString(data.rfq_number),
        buyer_company: cleanString(data.buyer_company),
        buyer_contact_name: cleanString(data.buyer_contact_name),
        buyer_contact_email: cleanString(data.buyer_contact_email),
        owner: cleanString(data.owner),
        source_document: cleanString(data.source_document),
        requested_delivery_date: cleanString(data.requested_delivery_date),
        payment_terms: cleanString(data.payment_terms),
        quote_validity_days: cleanNumber(data.quote_validity_days),
        terms_and_conditions: cleanString(data.terms_and_conditions),
        supplier_notes: cleanString(data.supplier_notes),
      },
      line_items: lineItems,
      incoterms: {
        rule: cleanString(data.incoterm_rule),
        named_place: cleanString(data.incoterm_named_place),
        transport_mode: cleanString(data.transport_mode),
        origin_location: cleanString(data.origin_location),
        destination_location: cleanString(data.destination_location),
      },
      attachments: rfqAttachments,
      response_checklist: {
        required_fields: data.required_response_fields ?? [],
        optional_fields: data.optional_response_fields ?? [],
        preferred_response_format: cleanString(data.preferred_response_format),
      },
      email_locale: data.email_locale,
    })
  }

  const totalLines = watched.line_items?.length ?? 0
  const totalQty = watched.line_items?.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0) ?? 0

  return (
    <form onSubmit={handleSubmit(handleValid)} className="grid-2">
      <div className="grid gap-4">
      <section className="card card-pad space-y-4">
        <SectionTitle title={t('form.sections.header')} subtitle={t('form.sections.headerSubtitle')} icon={<Icon name="assignment" size={18} />} />
        <Field label={t('form.fields.whatQuoting')} error={errors.name?.message}>
          <input {...register('name')} className="input" placeholder={t('form.fields.whatQuotingPlaceholder')} />
        </Field>
        <Field label={t('form.fields.describeNeed')} error={errors.description?.message}>
          <textarea {...register('description')} rows={4} className="input" placeholder={t('form.fields.describeNeedPlaceholder')} />
        </Field>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label={t('form.fields.totalQuantity')} error={errors.quantity?.message}>
            <input type="number" {...register('quantity')} className="input" placeholder={t('form.fields.totalQuantityPlaceholder')} />
          </Field>
          <Field label={t('form.fields.baseUnit')} error={errors.base_unit?.message}>
            <SelectInput {...register('base_unit')}>
              {PACKAGING_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </SelectInput>
          </Field>
          <Select label={t('form.fields.currency')} name="base_currency" register={register} options={CURRENCIES} />
          <Field label={t('form.fields.responseDeadline')} error={errors.response_deadline?.message}>
            <input type="date" {...register('response_deadline')} className="input" />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label={t('form.fields.deliveryLocation')} error={errors.delivery_point?.message}>
            <input {...register('delivery_point')} className="input" placeholder={t('form.fields.deliveryLocationPlaceholder')} />
          </Field>
          <Field label={t('form.fields.requestedDeliveryDate')}>
            <input type="date" {...register('requested_delivery_date')} className="input" />
          </Field>
          <Field label={t('form.fields.paymentTerms')}>
            <input {...register('payment_terms')} className="input" placeholder={t('form.fields.paymentTermsPlaceholder')} />
          </Field>
          <Field label={t('form.fields.emailLanguage')}>
            <SelectInput {...register('email_locale')}>
              <option value="en">{t('form.fields.emailLanguageEn')}</option>
              <option value="es">{t('form.fields.emailLanguageEs')}</option>
            </SelectInput>
          </Field>
        </div>
      </section>

      <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="card card-pad flex items-center gap-3 text-left">
        <span className="section-icon"><Icon name="apartment" size={18} /></span>
        <span className="flex-1">
          <span className="qy-heading block font-semibold">{t('form.sections.buyerDetails')} <span className="text-sm font-normal text-[var(--text-muted)]">{t('form.sections.optional')}</span></span>
          <span className="text-sm text-[var(--text-muted)]">{t('form.sections.buyerDetailsSubtitle')}</span>
        </span>
        <span className="text-[var(--text-muted)]">{showAdvanced ? <Icon name="expand_less" size={18} /> : <Icon name="expand_more" size={18} />}</span>
      </button>

      {showAdvanced && (
        <section className="card card-pad space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label={t('form.fields.rfqNumber')}>
              <input {...register('rfq_number')} className="input" placeholder={t('form.fields.rfqNumberPlaceholder')} />
            </Field>
            <Field label={t('form.fields.buyerCompany')}>
              <input {...register('buyer_company')} className="input" />
            </Field>
            <Field label={t('form.fields.buyerOwner')}>
              <input {...register('owner')} className="input" />
            </Field>
            <Field label={t('form.fields.contactName')}>
              <input {...register('buyer_contact_name')} className="input" />
            </Field>
            <Field label={t('form.fields.contactEmail')}>
              <input type="email" {...register('buyer_contact_email')} className="input" />
            </Field>
            <Field label={t('form.fields.sourceDocument')}>
              <input {...register('source_document')} className="input" />
            </Field>
            <Field label={t('form.fields.quoteValidity')}>
              <input type="number" {...register('quote_validity_days')} className="input" />
            </Field>
          </div>
          <Field label={t('form.fields.termsConditions')}>
            <textarea {...register('terms_and_conditions')} rows={3} className="input" />
          </Field>
          <Field label={t('form.fields.supplierNotes')}>
            <textarea {...register('supplier_notes')} rows={2} className="input" placeholder={t('form.fields.supplierNotesPlaceholder')} />
          </Field>
        </section>
      )}

      <section className="card card-pad space-y-4">
        <SectionTitle title={t('form.sections.incoterms')} subtitle={t('form.sections.incotermsSubtitle')} icon={<Icon name="directions_boat" size={18} />} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label={t('form.fields.incoterm')} name="incoterm_rule" register={register} options={INCOTERMS} />
          <Field label={t('form.fields.namedPlace')}>
            <input {...register('incoterm_named_place')} className="input" placeholder={t('form.fields.namedPlacePlaceholder')} />
          </Field>
          <Select label={t('form.fields.transportMode')} name="transport_mode" register={register} options={TRANSPORT_MODES} />
          <Field label={t('form.fields.origin')}>
            <input {...register('origin_location')} className="input" placeholder={t('form.fields.originPlaceholder')} />
          </Field>
          <Field label={t('form.fields.destination')}>
            <input {...register('destination_location')} className="input" placeholder={t('form.fields.destinationPlaceholder')} />
          </Field>
        </div>
        {watched.incoterm_rule && INCOTERM_HINTS[watched.incoterm_rule] && (
          <Alert>{INCOTERM_HINTS[watched.incoterm_rule]}</Alert>
        )}
        {incotermWarning && <Alert tone="warning">{incotermWarning}</Alert>}
      </section>

      <section className="card card-pad space-y-5">
        <div className="flex items-center justify-between">
          <SectionTitle title={t('form.sections.lineItems')} subtitle={t('form.sections.lineItemsSubtitle')} icon={<Icon name="layers" size={18} />} />
          <Badge>{t('form.lineBadge', { count: fields.length })}</Badge>
        </div>
        {fields.map((field, index) => (
          <LineItemEditor key={field.id} index={index} register={register} control={control} errors={errors} canRemove={fields.length > 1} onRemove={() => remove(index)} />
        ))}
        <button type="button" onClick={() => append(newLineItem(fields.length + 1))} className="btn btn-secondary w-full">
          {t('form.addLineItem')}
        </button>
      </section>

      <section className="card card-pad space-y-4">
        <SectionTitle title={t('form.sections.attachments')} subtitle={t('form.sections.attachmentsSubtitle')} icon={<Icon name="attach_file" size={18} />} />
        <AttachmentFields fields={rfqAttachments} register={register} remove={removeRfqAttachment} prefix="rfq_attachments" />
        <button type="button" onClick={() => appendRfqAttachment({ file_name: '', kind: 'technical_data_sheet' })} className="btn btn-secondary">
          {t('form.addAttachmentRef')}
        </button>
        {rfqAttachments.length === 0 && <p className="text-sm text-[var(--text-muted)]">{t('form.noAttachmentRefs')}</p>}
      </section>

      <section className="card card-pad space-y-4">
        <SectionTitle title={t('form.sections.checklist')} subtitle={t('form.sections.checklistSubtitle')} icon={<Icon name="checklist" size={18} />} />
        <Field label={t('form.fields.preferredResponseFormat')}>
          <input {...register('preferred_response_format')} className="input" />
        </Field>
        <ResponseFieldChecklist watch={watch} setValue={setValue} />
      </section>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-3 text-center">
        <button type="submit" disabled={isPending} className="btn btn-primary w-full">
          <Icon name="check" size={17} />
          {isPending ? t('form.creating') : t('form.create')}
        </button>
        {t('form.createHint') ? <p className="text-sm text-[var(--text-muted)]">{t('form.createHint')}</p> : null}
      </div>
      </div>

      <aside className="right-rail">
        <Card className="card-pad">
          <h3 className="qy-heading font-semibold">{t('form.completeness.title')}</h3>
          {t('form.completeness.subtitle') ? <p className="mt-1 text-sm text-[var(--text-muted)]">{t('form.completeness.subtitle')}</p> : null}
          <div className={`mt-4 font-semibold ${completeness.blockers.length ? 'text-[var(--error-text)]' : 'text-[var(--success-text)]'}`}>
            {completeness.blockers.length ? t('form.completeness.blockers', { count: completeness.blockers.length }) : t('form.completeness.ready')}
          </div>
          {completeness.blockers.length > 0 && (
            <ul className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)]">
              {completeness.blockers.map(item => <li key={item} className="flex gap-2"><span className="text-[var(--error-text)]">•</span>{item}</li>)}
            </ul>
          )}
          {completeness.hints.length > 0 && (
            <>
              <div className="mt-4 text-sm font-semibold text-[var(--warning-text)]">{t('form.completeness.worthLook')} · {completeness.hints.length}</div>
              <ul className="mt-2 grid gap-2 text-sm text-[var(--text-secondary)]">
                {completeness.hints.map(item => <li key={item} className="flex gap-2"><span className="text-[var(--warning-text)]">•</span>{item}</li>)}
              </ul>
              <p className="mt-2 text-xs text-[var(--text-muted)]">{t('form.completeness.warningsNote')}</p>
            </>
          )}
          {completeness.blockers.length === 0 && completeness.hints.length === 0 && (
            <p className="mt-3 text-sm text-[var(--success-text)]">{t('form.completeness.allComplete')}</p>
          )}
        </Card>

        <Card className="card-pad">
          <h3 className="qy-heading font-semibold">{t('form.preview.title')}</h3>
          <div className="mt-5 border-b border-[var(--border-subtle)] pb-4">
            <div className="qy-heading text-lg font-semibold text-[var(--text-secondary)]">{watched.name || t('form.preview.untitled')}</div>
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">{t('form.preview.lineItems')}</dt><dd className="tnum">{t('form.preview.unitsValue', { lines: totalLines, units: fmt.number(totalQty) })}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">{t('form.preview.currency')}</dt><dd>{watched.base_currency || 'USD'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">{t('form.preview.deadline')}</dt><dd>{watched.response_deadline || '—'}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-[var(--text-muted)]">{t('form.preview.delivery')}</dt><dd>{watched.delivery_point || '—'}</dd></div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            {(watched.required_response_fields ?? []).slice(0, 5).map(field => <Badge key={field} tone="brand">{field}</Badge>)}
          </div>
        </Card>
      </aside>
    </form>
  )
}

function LineItemEditor({ index, register, control, errors, canRemove, onRemove }: {
  index: number
  register: ReturnType<typeof useForm<FormValues>>['register']
  control: ReturnType<typeof useForm<FormValues>>['control']
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors']
  canRemove: boolean
  onRemove: () => void
}) {
  const { t } = useTranslation('rfq')
  const [showSpec, setShowSpec] = useState(false)

  return (
    <div className="card card-soft p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="qy-heading font-semibold text-[var(--text-primary)]"><span className="badge badge-brand mr-2">{index + 1}</span>{t('form.lineItem', { index: index + 1 })}</h3>
        {canRemove && <button type="button" onClick={onRemove} className="btn btn-ghost">{t('form.remove')}</button>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label={t('form.fields.productName')} error={errors.line_items?.[index]?.product_name?.message}>
          <input {...register(`line_items.${index}.product_name`)} className="input" placeholder={t('form.fields.productNamePlaceholder')} />
        </Field>
        <Field label={t('form.fields.skuReference')}>
          <input {...register(`line_items.${index}.sku`)} className="input" />
        </Field>
        <Field label={t('form.fields.quantity')} error={errors.line_items?.[index]?.quantity?.message}>
          <input type="number" step="0.01" {...register(`line_items.${index}.quantity`)} className="input" />
        </Field>
        <Field label={t('form.fields.unit')} error={errors.line_items?.[index]?.unit?.message}>
          <SelectInput {...register(`line_items.${index}.unit`)}>
            {PACKAGING_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
          </SelectInput>
        </Field>
      </div>
      <Field label={t('form.fields.lineDescription')}>
        <textarea {...register(`line_items.${index}.description`)} rows={2} className="input" placeholder={t('form.fields.lineDescriptionPlaceholder')} />
      </Field>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Select label={t('form.fields.specTemplate')} name={`line_items.${index}.template`} register={register} options={TECH_SPEC_TEMPLATES.map(tpl => tpl.value)} />
        <Field label={t('form.fields.targetUnitPrice')}>
          <input type="number" step="0.0001" {...register(`line_items.${index}.target_unit_price`)} className="input" />
        </Field>
        <Field label={t('form.fields.requestedDeliveryDate')}>
          <input type="date" {...register(`line_items.${index}.requested_delivery_date`)} className="input" />
        </Field>
        <Field label={t('form.fields.lineNotes')}>
          <input {...register(`line_items.${index}.notes`)} className="input" />
        </Field>
      </div>

      <button type="button" onClick={() => setShowSpec(!showSpec)} className="flex items-center gap-2 text-sm font-medium text-[var(--brand)] hover:underline">
        {showSpec ? <Icon name="expand_more" size={16} /> : <Icon name="chevron_right" size={16} />} {t('form.fields.technicalSpec')}
      </button>

      {showSpec && (
        <div className="space-y-4 rounded-[var(--radius-control)] border border-[var(--border-subtle)] bg-[var(--surface-card-subtle)] p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label={t('form.fields.packagingCategory')} name={`line_items.${index}.packaging_category`} register={register} options={PACKAGING_CATEGORIES} />
            <Select label={t('form.fields.materialFamily')} name={`line_items.${index}.material_family`} register={register} options={MATERIAL_FAMILIES} />
            <Select label={t('form.fields.materialDetail')} name={`line_items.${index}.material_detail`} register={register} options={MATERIAL_DETAILS} />
            <Field label={t('form.fields.recycledContent')}>
              <input type="number" step="0.1" {...register(`line_items.${index}.recycled_content_percent`)} className="input" />
            </Field>
            <Field label={t('form.fields.foodContact')}>
              <SelectInput {...register(`line_items.${index}.food_contact_required`)}>
                <option value="">{t('form.fields.foodContactUnknown')}</option>
                <option value="yes">{t('form.fields.foodContactRequired')}</option>
                <option value="no">{t('form.fields.foodContactNotRequired')}</option>
              </SelectInput>
            </Field>
            <Select label={t('form.fields.printing')} name={`line_items.${index}.printing`} register={register} options={PRINTING_OPTIONS} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {(['length', 'width', 'height', 'diameter'] as const).map(key => (
              <Field key={key} label={t(`form.fields.${key}`)}>
                <input type="number" step="0.01" {...register(`line_items.${index}.${key}`)} className="input" />
              </Field>
            ))}
            <Select label={t('form.fields.dimUnit')} name={`line_items.${index}.dimension_unit`} register={register} options={DIMENSION_UNITS} />
            <Field label={t('form.fields.capacity')}>
              <input type="number" step="0.01" {...register(`line_items.${index}.capacity`)} className="input" />
            </Field>
            <Select label={t('form.fields.capacityUnit')} name={`line_items.${index}.capacity_unit`} register={register} options={['ml', 'l']} />
            <Field label={t('form.fields.thickness')}>
              <input type="number" step="0.01" {...register(`line_items.${index}.thickness`)} className="input" />
            </Field>
            <Select label={t('form.fields.thicknessUnit')} name={`line_items.${index}.thickness_unit`} register={register} options={['micron', 'mm', 'gauge']} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label={t('form.fields.color')}>
              <input {...register(`line_items.${index}.color`)} className="input" />
            </Field>
            <Field label={t('form.fields.finish')}>
              <input {...register(`line_items.${index}.finish`)} className="input" />
            </Field>
            <Field label={t('form.fields.certificationsCsv')}>
              <input {...register(`line_items.${index}.certifications`)} className="input" placeholder={t('form.fields.certificationsPlaceholder')} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t('form.fields.complianceRequirements')}>
              <input {...register(`line_items.${index}.compliance_requirements`)} className="input" placeholder={t('form.fields.compliancePlaceholder')} />
            </Field>
            <Field label={t('form.fields.storageHandling')}>
              <input {...register(`line_items.${index}.storage_handling`)} className="input" />
            </Field>
            <Field label={t('form.fields.shelfLife')}>
              <input {...register(`line_items.${index}.shelf_life`)} className="input" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" {...register(`line_items.${index}.artwork_required`)} />
              {t('form.fields.artworkRequired')}
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
              <input type="checkbox" {...register(`line_items.${index}.sds_required`)} />
              {t('form.fields.sdsRequired')}
            </label>
          </div>
          <Field label={t('form.fields.toleranceNotes')}>
            <textarea {...register(`line_items.${index}.tolerance_notes`)} rows={2} className="input" />
          </Field>
        </div>
      )}

      <LineAttachments index={index} register={register} control={control} />
    </div>
  )
}

function SectionTitle({ title, subtitle, icon }: { title: string, subtitle?: string, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      {icon && <span className="section-icon">{icon}</span>}
      <div>
        <h2 className="qy-heading font-semibold text-[var(--text-primary)]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
      </div>
    </div>
  )
}

function LineAttachments({ index, register, control }: {
  index: number
  register: ReturnType<typeof useForm<FormValues>>['register']
  control: ReturnType<typeof useForm<FormValues>>['control']
}) {
  const { t } = useTranslation('rfq')
  const { fields, append, remove } = useFieldArray({ control, name: `line_items.${index}.attachments` as 'rfq_attachments' })

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">{t('form.fields.attachments')}</span>
        <button type="button" onClick={() => append({ file_name: '', kind: 'technical_data_sheet' })} className="text-sm font-medium text-[var(--brand)] hover:underline">{t('form.add')}</button>
      </div>
      {fields.length === 0 && <p className="text-sm text-[var(--text-muted)]">{t('form.noAttachmentRefs')}</p>}
      {fields.map((field, aIdx) => (
        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 items-end">
          <Field label={t('form.fields.fileName')}>
            <input {...register(`line_items.${index}.attachments.${aIdx}.file_name`)} className="input" placeholder={t('form.fields.fileNamePlaceholder')} />
          </Field>
          <Select label={t('form.fields.kind')} name={`line_items.${index}.attachments.${aIdx}.kind`} register={register} options={ATTACHMENT_KINDS} />
          <button type="button" onClick={() => remove(aIdx)} className="text-sm text-[var(--error-text)] hover:underline pb-2">{t('form.remove')}</button>
        </div>
      ))}
    </div>
  )
}

function AttachmentFields({ fields, register, remove, prefix }: {
  fields: { id: string }[]
  register: ReturnType<typeof useForm<FormValues>>['register']
  remove: (index: number) => void
  prefix: 'rfq_attachments'
}) {
  const { t } = useTranslation('rfq')
  if (fields.length === 0) return null
  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 items-end">
          <Field label={t('form.fields.attachmentFileName')}>
            <input {...register(`${prefix}.${index}.file_name`)} className="input" placeholder={t('form.fields.attachmentFileNamePlaceholder')} />
          </Field>
          <Select label={t('form.fields.kind')} name={`${prefix}.${index}.kind`} register={register} options={ATTACHMENT_KINDS} />
          <button type="button" onClick={() => remove(index)} className="text-sm text-[var(--error-text)] hover:underline pb-2">{t('form.remove')}</button>
        </div>
      ))}
    </div>
  )
}

function Field({ label, error, children }: { label: string, error?: string, children: React.ReactNode }) {
  const { t } = useTranslation('rfq')
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">{label}</label>
      {children}
      {error && <p className="text-[var(--error-text)] text-xs mt-1">{t(error as 'form.validation.required')}</p>}
    </div>
  )
}

function Select({ label: fieldLabel, name, register, options }: {
  label: string
  name: Parameters<ReturnType<typeof useForm<FormValues>>['register']>[0]
  register: ReturnType<typeof useForm<FormValues>>['register']
  options: string[]
}) {
  const { t } = useTranslation('rfq')
  return (
    <Field label={fieldLabel}>
      <SelectInput {...register(name)}>
        <option value="">{t('form.select')}</option>
        {options.map(option => <option key={option} value={option}>{label(option)}</option>)}
      </SelectInput>
    </Field>
  )
}

function ResponseFieldChecklist({ watch, setValue }: {
  watch: ReturnType<typeof useForm<FormValues>>['watch']
  setValue: ReturnType<typeof useForm<FormValues>>['setValue']
}) {
  const { t } = useTranslation('rfq')
  const required = watch('required_response_fields') ?? []
  const optional = watch('optional_response_fields') ?? []

  const getState = (field: string): 'off' | 'optional' | 'required' => {
    if (required.includes(field)) return 'required'
    if (optional.includes(field)) return 'optional'
    return 'off'
  }

  const cycle = (field: string) => {
    const current = getState(field)
    const nextRequired = required.filter(f => f !== field)
    const nextOptional = optional.filter(f => f !== field)
    if (current === 'off') {
      nextOptional.push(field)
    } else if (current === 'optional') {
      nextRequired.push(field)
    }
    setValue('required_response_fields', nextRequired)
    setValue('optional_response_fields', nextOptional)
  }

  const stateLabel: Record<string, string> = { off: t('form.state.off'), optional: t('form.state.optional'), required: t('form.state.required') }
  const stateColor: Record<string, string> = {
    off: 'text-[var(--text-muted)] bg-[var(--surface-muted)]',
    optional: 'text-[var(--info-text)] bg-[var(--info-bg)]',
    required: 'text-[var(--success-text)] bg-[var(--success-bg)]',
  }

  return (
    <div>
      <div className="text-sm font-medium text-[var(--text-secondary)] mb-3">{t('form.checklistHint')}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {RESPONSE_FIELDS.map(field => {
          const state = getState(field)
          return (
            <button
              key={field}
              type="button"
              onClick={() => cycle(field)}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-[var(--border-subtle)] px-3 py-2 text-left text-sm transition-colors hover:border-[var(--border-strong)]"
            >
              <span className="text-[var(--text-primary)]">{field}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stateColor[state]}`}>{stateLabel[state]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
