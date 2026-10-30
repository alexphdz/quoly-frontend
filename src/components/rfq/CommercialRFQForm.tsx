import { useEffect, useRef, useState, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { deleteReferenceSpec } from '../../api/rfqs'
import {
  COMMERCIAL_CURRENCIES,
  COMMERCIAL_UNIT_GROUPS,
  DEFAULT_COMMERCIAL_CURRENCY,
  incotermByCode,
} from '../../constants/commercial'
import type { CommercialRFQWrite, RFQAttachment, RFQRead } from '../../types/rfq'
import type { ApiError } from '../../api/client'
import { isoDateToLocal } from '../ui/DateField'
import {
  Button, DateInput, Field, Icon, IconButton, InlineAlert, NumberInput, SegmentedControl, Select, Switch, TextInput, Textarea,
  type IconName,
} from '../../design-system'
import { useElementWidth } from '../../design-system/hooks'
import { useShellLayout } from '../layout/useShellLayout'
import IncotermField from './commercial/IncotermField'

const schema = z
  .object({
    name: z.string().trim().min(1, 'crear.errors.name'),
    quantity: z.coerce.number({ message: 'crear.errors.quantity' }).int('crear.errors.quantity').positive('crear.errors.quantity'),
    base_unit: z.string().min(1, 'crear.errors.unit'),
    internal_reference: z.string().optional(),
    share_internal_reference: z.boolean(),
    incoterm: z.string().optional(),
    named_place: z.string().optional(),
    requested_delivery_date: z.string().optional(),
    response_deadline: z.string().optional(),
    base_currency: z.string().min(1, 'commercial.validation.required'),
    technical_requirements: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const rule = values.incoterm?.trim() ?? ''
    const place = values.named_place?.trim() ?? ''
    if (rule && !place) {
      ctx.addIssue({ code: 'custom', path: ['named_place'], message: 'commercial.validation.place' })
    }
    if (place && !rule) {
      ctx.addIssue({ code: 'custom', path: ['incoterm'], message: 'commercial.validation.term' })
    }

    // Date rules. YYYY-MM-DD strings compare chronologically.
    const pad = (n: number) => String(n).padStart(2, '0')
    const now = new Date()
    const todayIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
    const delivery = values.requested_delivery_date?.trim() ?? ''
    const deadline = values.response_deadline?.trim() ?? ''
    if (deadline && deadline < todayIso) {
      ctx.addIssue({ code: 'custom', path: ['response_deadline'], message: 'commercial.validation.deadlinePast' })
    }
    if (delivery && delivery < todayIso) {
      ctx.addIssue({ code: 'custom', path: ['requested_delivery_date'], message: 'commercial.validation.deliveryPast' })
    } else if (delivery && deadline && delivery < deadline) {
      ctx.addIssue({ code: 'custom', path: ['requested_delivery_date'], message: 'commercial.validation.deliveryBeforeDeadline' })
    }
  })

type FormValues = z.infer<typeof schema>

const SECTIONS: { id: string, icon: IconName }[] = [
  { id: 'producto', icon: 'clipboard-text' },
  { id: 'entrega', icon: 'truck' },
  { id: 'documentos', icon: 'paperclip' },
]

function referenceSpecs(attachments?: RFQAttachment[]) {
  return (attachments ?? []).filter(
    (a) => a.scope === 'rfq' && (a.kind === 'reference_specification' || !a.kind),
  )
}

function valuesFromRfq(rfq?: RFQRead): FormValues {
  return {
    name: rfq?.name ?? '',
    quantity: rfq?.quantity ?? (undefined as unknown as number),
    base_unit: rfq?.base_unit ?? '',
    internal_reference: rfq?.internal_reference ?? '',
    share_internal_reference: Boolean(rfq?.share_internal_reference),
    incoterm: rfq?.incoterms?.rule ?? '',
    named_place: rfq?.incoterms?.named_place ?? '',
    requested_delivery_date: rfq?.requested_delivery_date ?? '',
    response_deadline: rfq?.response_deadline ?? '',
    base_currency: rfq?.base_currency || DEFAULT_COMMERCIAL_CURRENCY,
    technical_requirements: rfq?.technical_requirements ?? '',
  }
}

/** Sección visible: la última cuyo encabezado ya pasó bajo el navegador fijo. */
function useVisibleSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0]
      for (const id of ids) {
        const el = document.getElementById(`sec-${id}`)
        if (el && el.getBoundingClientRect().top <= 160) current = id
      }
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = ids[ids.length - 1]
      setActive(current)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return active
}

export default function CommercialRFQForm({
  initial,
  isPending,
  error,
  onSubmit,
}: {
  initial?: RFQRead
  isPending: boolean
  error: string | null
  onSubmit: (data: CommercialRFQWrite, specFiles: File[]) => void | Promise<void>
}) {
  const { t } = useTranslation(['rfq', 'common'])
  const navigate = useNavigate()
  const layout = useShellLayout()
  const mobile = layout === 'mobile'
  const [contentRef, contentW] = useElementWidth<HTMLFormElement>(1080)
  const wide = contentW >= 940
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingSpecs, setPendingSpecs] = useState<File[]>([])
  const [savedSpecs, setSavedSpecs] = useState<RFQAttachment[]>(() => referenceSpecs(initial?.attachments))
  const [specError, setSpecError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState<'draft' | 'open' | null>(null)
  const dragDepth = useRef(0)
  const active = useVisibleSection(SECTIONS.map(s => s.id))
  const editing = Boolean(initial)
  const isDraft = !initial || initial.status === 'draft'

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: valuesFromRfq(initial),
  })
  const { register, handleSubmit, watch, setValue, formState: { errors } } = form

  useEffect(() => {
    setSavedSpecs(referenceSpecs(initial?.attachments))
  }, [initial?.attachments, initial?.id])

  useEffect(() => {
    if (!isPending) setSubmitting(null)
  }, [isPending])

  const reference = watch('internal_reference') ?? ''
  const incoterm = watch('incoterm') ?? ''
  const share = watch('share_internal_reference')
  const term = incotermByCode(incoterm)
  const unit = watch('base_unit')
  const currency = watch('base_currency')
  const deliveryDate = watch('requested_delivery_date') ?? ''
  const replyBy = watch('response_deadline') ?? ''

  // Date guards: nothing before today; delivery cannot precede the reply-by date.
  const startToday = new Date()
  startToday.setHours(0, 0, 0, 0)
  const deadlineDate = isoDateToLocal(replyBy)
  const deliveryMin = deadlineDate && deadlineDate > startToday ? deadlineDate : startToday

  useEffect(() => {
    if (!reference.trim()) setValue('share_internal_reference', false)
  }, [reference, setValue])

  const fieldError = (message?: string) => (message ? t(message) : undefined)
  const status = (message?: string) => (message ? 'error' as const : undefined)

  const addPendingFiles = (files: FileList | null) => {
    if (!files?.length) return
    setSpecError(null)
    const next: File[] = []
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setSpecError(t('commercial.specPdfOnly'))
        continue
      }
      next.push(file)
    }
    if (next.length) setPendingSpecs((prev) => [...prev, ...next])
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePending = (index: number) => {
    setPendingSpecs((prev) => prev.filter((_, i) => i !== index))
  }

  const removeSaved = async (attachmentId: string) => {
    if (!initial?.id || !attachmentId) return
    setSpecError(null)
    setRemovingId(attachmentId)
    try {
      const rfq = await deleteReferenceSpec(initial.id, attachmentId)
      setSavedSpecs(referenceSpecs(rfq.attachments))
    } catch (err) {
      setSpecError((err as ApiError).detail)
    } finally {
      setRemovingId(null)
    }
  }

  const readField = (name: string, fallback: string) => {
    const raw = contentRef.current ? new FormData(contentRef.current).get(name) : null
    return typeof raw === 'string' ? raw : fallback
  }

  const submit = (nextStatus: 'draft' | 'open') =>
    handleSubmit((values) => {
      setSubmitting(nextStatus)
      const name = readField('name', values.name).trim()
      const quantity = Number(readField('quantity', String(values.quantity)))
      const baseUnit = readField('base_unit', values.base_unit)
      const rule = readField('incoterm', values.incoterm ?? '').trim()
      const place = readField('named_place', values.named_place ?? '').trim()
      const requirementText = readField('technical_requirements', values.technical_requirements ?? '').trim()
      const ref = readField('internal_reference', values.internal_reference ?? '').trim()
      const delivery = values.requested_delivery_date ?? ''
      const replyByValue = values.response_deadline ?? ''
      const currencyValue = readField('base_currency', values.base_currency)
      void onSubmit(
        {
          request_kind: 'commercial',
          name,
          quantity,
          base_unit: baseUnit,
          status: nextStatus,
          internal_reference: ref || null,
          share_internal_reference: Boolean(ref) && values.share_internal_reference,
          incoterms: rule && place ? { rule, named_place: place } : null,
          technical_requirements: requirementText || null,
          requested_delivery_date: delivery || null,
          response_deadline: replyByValue || null,
          base_currency: currencyValue,
        },
        pendingSpecs,
      )
    })

  const goSection = (id: string) => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    window.setTimeout(() => document.getElementById(`h-${id}`)?.focus({ preventScroll: true }), reduce ? 0 : 280)
  }

  const onDrop = (event: DragEvent) => {
    event.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    addPendingFiles(event.dataTransfer.files)
  }

  const units = COMMERCIAL_UNIT_GROUPS.flatMap(group => group.codes.map(code => ({ value: code, label: t(`commercial.units.${code}`) })))
  const placeKey = term ? term.role : 'none'
  const span = (desktop: number, narrow: number) => ({ gridColumn: `span ${mobile ? 12 : wide ? desktop : narrow}` })
  const hasFiles = savedSpecs.length > 0 || pendingSpecs.length > 0

  return (
    <>
      <nav aria-label={t('crear.nav.label')} className="cr2-nav">
        <ol className="cr2-nav-list">
          {SECTIONS.map((s, i) => (
            <li key={s.id} className="cr2-nav-item">
              <a
                href={`#sec-${s.id}`}
                aria-current={active === s.id ? 'true' : undefined}
                className={`cr2-nav-link${active === s.id ? ' is-active' : ''}`}
                onClick={(event) => { event.preventDefault(); goSection(s.id) }}
              >
                <span className="cr2-nav-top">
                  <span className="cr2-nav-num">{String(i + 1).padStart(2, '0')}</span>
                  <Icon name={s.icon} size={18} />
                  <span aria-hidden="true" className={`cr2-nav-line${i === SECTIONS.length - 1 ? ' is-last' : ''}`} />
                </span>
                <span className="cr2-nav-label">{t(`crear.sections.${s.id}.nav`)}</span>
                <span className="cr2-nav-desc">{t(`crear.sections.${s.id}.desc`)}</span>
                <span aria-hidden="true" className="cr2-nav-trace" />
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <form ref={contentRef} noValidate aria-label={editing ? t('crear.editTitle') : t('crear.title')} className="cr2-form" onSubmit={(event) => event.preventDefault()}>
        {error && <InlineAlert prominence="blocking" tone="error">{error}</InlineAlert>}

        <section id="sec-producto" aria-labelledby="h-producto" className="cr2-section is-first">
          <div className="cr2-section-head is-row">
            <h2 id="h-producto" tabIndex={-1} className="cr2-h2">{t('crear.sections.producto.title')}</h2>
            <span className="cr2-required-note">{t('crear.requiredNote')}</span>
          </div>
          <div className="cr2-grid">
            <div className="cr2-cell is-product">
              <TextInput
                label={t('crear.fields.product')}
                required
                placeholder={t('crear.fields.productPlaceholder')}
                autoComplete="off"
                message={fieldError(errors.name?.message)}
                status={status(errors.name?.message)}
                {...register('name')}
              />
            </div>
            <div className="cr2-cell" style={span(5, 6)}>
              <NumberInput
                label={t('crear.fields.quantity')}
                required
                placeholder={t('crear.fields.quantityPlaceholder')}
                message={fieldError(errors.quantity?.message)}
                status={status(errors.quantity?.message)}
                {...register('quantity')}
              />
            </div>
            <div className="cr2-cell" style={span(4, 6)}>
              <Select
                label={t('crear.fields.unit')}
                required
                placeholder={t('crear.fields.unitPlaceholder')}
                options={units}
                value={unit}
                message={fieldError(errors.base_unit?.message)}
                status={status(errors.base_unit?.message)}
                {...register('base_unit')}
              />
            </div>
            <div className="cr2-cell is-stack" style={span(7, 8)}>
              <TextInput
                label={t('crear.fields.reference')}
                placeholder={t('crear.fields.referencePlaceholder')}
                autoComplete="off"
                {...register('internal_reference')}
              />
              <Switch
                label={t('crear.fields.shareReference')}
                description={share ? t('crear.fields.shareOn') : t('crear.fields.shareOff')}
                checked={share}
                disabled={!reference.trim()}
                onChange={(event) => setValue('share_internal_reference', event.target.checked)}
              />
            </div>
          </div>
        </section>

        <section id="sec-entrega" aria-labelledby="h-entrega" className="cr2-section">
          <div className="cr2-section-head">
            <h2 id="h-entrega" tabIndex={-1} className="cr2-h2">{t('crear.sections.entrega.title')}</h2>
            <p className="cr2-section-lead">{t('crear.sections.entrega.lead')}</p>
          </div>
          <div className="cr2-inc-field">
            <span id="cr2-lbl-inc" className="cr2-label">
              {t('crear.fields.incoterm')}
              <span className="cr2-optional">{t('crear.optional')}</span>
            </span>
            <input type="hidden" {...register('incoterm')} />
            <IncotermField
              labelId="cr2-lbl-inc"
              value={incoterm}
              invalid={Boolean(errors.incoterm)}
              onChange={(code) => {
                setValue('incoterm', code, { shouldValidate: Boolean(errors.incoterm || errors.named_place) })
                if (!code) setValue('named_place', '', { shouldValidate: Boolean(errors.named_place) })
              }}
            />
            {errors.incoterm && <span role="alert" className="cr2-field-error"><Icon name="warning-circle" size={14} />{fieldError(errors.incoterm.message)}</span>}
          </div>
          <div className="cr2-grid">
            <div className="cr2-cell" style={span(6, 7)}>
              <TextInput
                label={t(`crear.place.${placeKey}.label`)}
                required={Boolean(term)}
                placeholder={t(`crear.place.${placeKey}.placeholder`)}
                autoComplete="off"
                message={fieldError(errors.named_place?.message)}
                status={status(errors.named_place?.message)}
                {...register('named_place')}
              />
            </div>
            <div className="cr2-cell" style={span(4, 5)}>
              <DateInput
                name="requested_delivery_date"
                label={t('crear.fields.deliveryDate')}
                value={deliveryDate}
                minDate={deliveryMin}
                message={fieldError(errors.requested_delivery_date?.message)}
                status={status(errors.requested_delivery_date?.message)}
                onChange={(next) => setValue('requested_delivery_date', next, { shouldDirty: true, shouldValidate: true })}
              />
            </div>
            <div className="cr2-cell" style={span(6, 7)}>
              <Field label={t('commercial.currency')} required description={t('commercial.currencyHelp')} message={fieldError(errors.base_currency?.message)} status={status(errors.base_currency?.message)}>
                <input type="hidden" {...register('base_currency')} />
                <SegmentedControl
                  label={t('commercial.currency')}
                  size="sm"
                  value={currency}
                  onChange={(value) => setValue('base_currency', value, { shouldValidate: true })}
                  options={COMMERCIAL_CURRENCIES.map((code) => ({ value: code, label: code }))}
                />
              </Field>
            </div>
            <div className="cr2-cell" style={span(4, 5)}>
              <DateInput
                name="response_deadline"
                label={t('commercial.responseDeadline')}
                description={t('commercial.responseDeadlineHelp')}
                value={replyBy}
                minDate={startToday}
                message={fieldError(errors.response_deadline?.message)}
                status={status(errors.response_deadline?.message)}
                onChange={(next) => setValue('response_deadline', next, { shouldDirty: true, shouldValidate: true })}
              />
            </div>
          </div>
        </section>

        <section id="sec-documentos" aria-labelledby="h-documentos" className="cr2-section">
          <h2 id="h-documentos" tabIndex={-1} className="cr2-h2">{t('crear.sections.documentos.title')}</h2>
          <div className="cr2-docs">
            <Textarea
              label={t('crear.fields.requirements')}
              description={t('crear.fields.requirementsHelp')}
              placeholder={t('crear.fields.requirementsPlaceholder')}
              rows={6}
              {...register('technical_requirements')}
            />
            <Field
              label={t('crear.fields.file')}
              description={t('crear.fields.fileHelp')}
              message={specError ?? undefined}
              status={specError ? 'error' : undefined}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="q-sr-only"
                tabIndex={-1}
                aria-label={t('crear.fields.file')}
                data-testid="reference-spec-file"
                onChange={(event) => addPendingFiles(event.target.files)}
              />
              <div
                className={`cr2-drop${dragging ? ' is-drag' : ''}${specError ? ' is-error' : ''}`}
                onClick={() => fileRef.current?.click()}
                onDragEnter={(event) => { event.preventDefault(); dragDepth.current += 1; setDragging(true) }}
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy' }}
                onDragLeave={() => { dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false) }}
                onDrop={onDrop}
              >
                <span className="cr2-drop-icon"><Icon name="upload-simple" size={24} /></span>
                <span className="cr2-drop-text">
                  <span className="cr2-drop-title">{dragging ? t('crear.file.release') : t('crear.file.title')}</span>
                  <span className="cr2-drop-desc">{t('crear.file.text')}</span>
                </span>
                <Button variant="secondary" size="sm" icon="paperclip" onClick={(event) => { event.stopPropagation(); fileRef.current?.click() }}>
                  {t('crear.file.select')}
                </Button>
              </div>
              {hasFiles && (
                <ul className="cr2-files">
                  {savedSpecs.map((spec) => (
                    <li key={spec.id ?? spec.file_name} className="cr2-file">
                      <span className="cr2-file-icon"><Icon name="file-pdf" size={24} /></span>
                      <span className="cr2-file-text">
                        {spec.file_url
                          ? <a href={spec.file_url} target="_blank" rel="noreferrer" className="cr2-file-name" title={spec.file_name}>{spec.file_name}</a>
                          : <span className="cr2-file-name" title={spec.file_name}>{spec.file_name}</span>}
                        <span className="cr2-file-meta">{t('crear.file.saved')}</span>
                      </span>
                      {spec.id && (
                        <IconButton
                          icon="x"
                          size="sm"
                          label={t('crear.file.remove', { name: spec.file_name })}
                          disabled={removingId === spec.id || isPending}
                          onClick={() => void removeSaved(spec.id!)}
                        />
                      )}
                    </li>
                  ))}
                  {pendingSpecs.map((file, index) => (
                    <li key={`${file.name}-${index}`} className="cr2-file">
                      <span className="cr2-file-icon"><Icon name="file-pdf" size={24} /></span>
                      <span className="cr2-file-text">
                        <span className="cr2-file-name" title={file.name}>{file.name}</span>
                        <span className="cr2-file-meta">{t('commercial.specPendingUpload')}</span>
                      </span>
                      <IconButton icon="x" size="sm" label={t('crear.file.remove', { name: file.name })} disabled={isPending} onClick={() => removePending(index)} />
                    </li>
                  ))}
                </ul>
              )}
            </Field>
            {hasFiles && <p className="cr2-file-note">{t('crear.file.note')}</p>}
          </div>
        </section>

        <footer className="cr2-actions">
          <Button variant="tertiary" fullWidth={mobile} onClick={() => navigate('/requests')}>{t('crear.actions.cancel')}</Button>
          <div className="cr2-actions-main">
            {isDraft && (
              <Button variant="secondary" fullWidth={mobile} loading={submitting === 'draft'} disabled={isPending} onClick={submit('draft')}>
                {t('crear.actions.saveDraft')}
              </Button>
            )}
            <Button fullWidth={mobile} loading={submitting === 'open'} disabled={isPending} onClick={submit('open')}>
              {isDraft ? t('crear.actions.create') : t('crear.actions.saveChanges')}
            </Button>
          </div>
        </footer>
      </form>
    </>
  )
}
