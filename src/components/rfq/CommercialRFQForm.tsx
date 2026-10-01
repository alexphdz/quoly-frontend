import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { deleteReferenceSpec } from '../../api/rfqs'
import {
  COMMERCIAL_CURRENCIES,
  DEFAULT_COMMERCIAL_CURRENCY,
  incotermByCode,
} from '../../constants/commercial'
import type { CommercialRFQWrite, RFQAttachment, RFQRead } from '../../types/rfq'
import type { ApiError } from '../../api/client'
import { Alert, FormField, TextArea, TextInput } from '../ui'
import { DateField, isoDateToLocal } from '../ui/DateField'
import { Icon, Segmented } from '../ds'
import IncotermPicker from './commercial/IncotermPicker'
import RequestStepArt from './commercial/RequestStepArt'
import UnitPicker from './commercial/UnitPicker'

const schema = z
  .object({
    name: z.string().trim().min(1, 'commercial.validation.required'),
    quantity: z.coerce.number().int().positive('commercial.validation.quantity'),
    base_unit: z.string().min(1, 'commercial.validation.required'),
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

const STEPS = [
  { key: 'product', label: 'commercial.sectionProduct' },
  { key: 'terms', label: 'commercial.sectionTerms' },
  { key: 'specification', label: 'commercial.sectionSpecification' },
] as const

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
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState(0)
  const [pendingSpecs, setPendingSpecs] = useState<File[]>([])
  const [savedSpecs, setSavedSpecs] = useState<RFQAttachment[]>(() => referenceSpecs(initial?.attachments))
  const [specError, setSpecError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [attempted, setAttempted] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: valuesFromRfq(initial),
  })
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = form

  useEffect(() => {
    setSavedSpecs(referenceSpecs(initial?.attachments))
  }, [initial?.attachments, initial?.id])

  const reference = watch('internal_reference') ?? ''
  const incoterm = watch('incoterm') ?? ''
  const share = watch('share_internal_reference')
  const term = incotermByCode(incoterm)
  const placeLabel = term ? t(`commercial.placeRole.${term.role}`) : t('commercial.namedPlace')
  const watchedUnit = watch('base_unit')
  const watchedCurrency = watch('base_currency')
  const deliveryDate = watch('requested_delivery_date') ?? ''
  const replyBy = watch('response_deadline') ?? ''
  const requirements = watch('technical_requirements') ?? ''

  // Date guards: nothing before today; delivery cannot precede the reply-by date.
  const startToday = new Date()
  startToday.setHours(0, 0, 0, 0)
  const deadlineDate = isoDateToLocal(replyBy)
  const deliveryMin = deadlineDate && deadlineDate > startToday ? deadlineDate : startToday

  useEffect(() => {
    if (!reference.trim()) setValue('share_internal_reference', false)
  }, [reference, setValue])

  const fieldError = (message?: string) => (message ? t(message) : undefined)

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
    const raw = formRef.current ? new FormData(formRef.current).get(name) : null
    return typeof raw === 'string' ? raw : fallback
  }

  const goToFirstError = (formErrors: Partial<Record<keyof FormValues, unknown>>) => {
    if (formErrors.name || formErrors.quantity || formErrors.base_unit) setStep(0)
    else if (formErrors.incoterm || formErrors.named_place) setStep(1)
  }

  const submit = (status: 'draft' | 'open') =>
    handleSubmit((values) => {
      setAttempted(false)
      const name = readField('name', values.name).trim()
      const quantity = Number(readField('quantity', String(values.quantity)))
      const baseUnit = readField('base_unit', values.base_unit)
      const rule = readField('incoterm', values.incoterm ?? '').trim()
      const place = readField('named_place', values.named_place ?? '').trim()
      const requirementText = readField('technical_requirements', values.technical_requirements ?? '').trim()
      const ref = readField('internal_reference', values.internal_reference ?? '').trim()
      const delivery = readField('requested_delivery_date', values.requested_delivery_date ?? '')
      const replyBy = readField('response_deadline', values.response_deadline ?? '')
      const currency = readField('base_currency', values.base_currency)
      void onSubmit(
        {
          request_kind: 'commercial',
          name,
          quantity,
          base_unit: baseUnit,
          status,
          internal_reference: ref || null,
          share_internal_reference: Boolean(ref) && values.share_internal_reference,
          incoterms: rule && place ? { rule, named_place: place } : null,
          technical_requirements: requirementText || null,
          requested_delivery_date: delivery || null,
          response_deadline: replyBy || null,
          base_currency: currency,
        },
        pendingSpecs,
      )
    }, (formErrors) => {
      setAttempted(true)
      goToFirstError(formErrors)
    })

  const goNext = async () => {
    if (step === 0) {
      const ok = await trigger(['name', 'quantity', 'base_unit'])
      if (!ok) return
    }
    setStep((current) => Math.min(2, current + 1))
  }

  const missingCount = Object.keys(errors).length
  const specScenario =
    savedSpecs.length > 0 || pendingSpecs.length > 0
      ? 'reference_file'
      : requirements.trim()
        ? 'text_requirements'
        : 'ask_datasheet'
  const canShare = Boolean(reference.trim())

  return (
    <form ref={formRef} className="cr-form" onSubmit={(event) => event.preventDefault()}>
      {error && <Alert tone="error">{error}</Alert>}
      {specError && <Alert tone="error">{specError}</Alert>}
      {attempted && missingCount > 0 && (
        <Alert tone="error">{t('commercial.validation.summary', { count: missingCount })}</Alert>
      )}

      <div className="cr-steps-wrap">
        <ol className="cr-steps" aria-label={t('commercial.stepNav')}>
          {STEPS.map((item, index) => (
            <li key={item.key}>
              <button
                type="button"
                className={`cr-step${index === step ? ' is-current' : ''}${index < step ? ' is-done' : ''}`}
                aria-current={index === step ? 'step' : undefined}
                onClick={() => setStep(index)}
              >
                <span className="cr-step-num">{index + 1}</span>
                <span className="cr-step-label">{t(item.label)}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className="cr-progress qy-num" aria-live="polite">
          {t('commercial.stepProgress', { current: step + 1, total: 3 })}
        </span>
      </div>

      <section className="cr-panel" hidden={step !== 0}>
        <div className="cr-panel-head">
          <RequestStepArt step={0} />
          <div>
            <h2>{t('commercial.sectionProduct')}</h2>
          </div>
        </div>
        <div className="cr-fields">
          <FormField label={t('commercial.productName')} required error={fieldError(errors.name?.message)}>
            <TextInput placeholder={t('commercial.productNamePlaceholder')} {...register('name')} />
          </FormField>
          <FormField
            label={t('commercial.quantity')}
            required
            error={fieldError(errors.quantity?.message ?? errors.base_unit?.message)}
          >
            <div className="cr-qty" data-invalid={Boolean(errors.quantity || errors.base_unit) || undefined}>
              <input type="number" min={1} step={1} aria-label={t('commercial.quantity')} {...register('quantity')} />
              <UnitPicker
                value={watchedUnit}
                onChange={(code) => setValue('base_unit', code, { shouldValidate: true })}
                label={t('commercial.unit')}
                error={Boolean(errors.base_unit)}
              />
            </div>
          </FormField>
          <div className="cr-share">
            <FormField label={t('commercial.internalReference')} optional>
              <TextInput placeholder={t('commercial.internalReferencePlaceholder')} {...register('internal_reference')} />
            </FormField>
            <button
              type="button"
              className="cr-share-toggle"
              role="switch"
              aria-checked={share}
              disabled={!canShare}
              onClick={() => setValue('share_internal_reference', !share)}
            >
              <span className="ds-switch" aria-hidden>
                <span />
              </span>
              {t('commercial.shareReference')}
            </button>
          </div>
        </div>
      </section>

      <section className="cr-panel" hidden={step !== 1}>
        <div className="cr-panel-head">
          <RequestStepArt step={1} />
          <div>
            <h2>{t('commercial.sectionTerms')}</h2>
          </div>
        </div>
        <div className="cr-fields">
          <FormField label={t('commercial.incoterm')} optional error={fieldError(errors.incoterm?.message)}>
            <IncotermPicker
              value={incoterm}
              onChange={(code) => {
                setValue('incoterm', code, { shouldValidate: true })
                if (!code) setValue('named_place', '', { shouldValidate: true })
              }}
              error={Boolean(errors.incoterm)}
            />
          </FormField>
          {incoterm ? (
            <FormField label={placeLabel} optional error={fieldError(errors.named_place?.message)}>
              <TextInput {...register('named_place')} />
            </FormField>
          ) : (
            <>
              {t('commercial.placePrompt') ? <p className="cr-place-prompt">{t('commercial.placePrompt')}</p> : null}
              <input type="hidden" {...register('named_place')} />
            </>
          )}
          <div className="cr-dates">
            <FormField label={t('commercial.deliveryDate')} optional error={fieldError(errors.requested_delivery_date?.message)}>
              <DateField
                name="requested_delivery_date"
                label={t('commercial.deliveryDate')}
                value={deliveryDate}
                onChange={(next) => setValue('requested_delivery_date', next, { shouldDirty: true, shouldValidate: true })}
                placeholder={t('commercial.datePlaceholder')}
                clearLabel={t('commercial.dateClear')}
                minDate={deliveryMin}
              />
            </FormField>
            <FormField label={t('commercial.responseDeadline')} optional helper={t('commercial.responseDeadlineHelp')} error={fieldError(errors.response_deadline?.message)}>
              <DateField
                name="response_deadline"
                label={t('commercial.responseDeadline')}
                value={replyBy}
                onChange={(next) => setValue('response_deadline', next, { shouldDirty: true, shouldValidate: true })}
                placeholder={t('commercial.datePlaceholder')}
                clearLabel={t('commercial.dateClear')}
                minDate={startToday}
              />
            </FormField>
          </div>
          <FormField label={t('commercial.currency')} required helper={t('commercial.currencyHelp')} error={fieldError(errors.base_currency?.message)}>
            <input type="hidden" {...register('base_currency')} />
            <Segmented
              ariaLabel={t('commercial.currency')}
              value={watchedCurrency}
              onChange={(value) => setValue('base_currency', value, { shouldValidate: true })}
              options={COMMERCIAL_CURRENCIES.map((code) => ({ value: code, label: code }))}
            />
          </FormField>
        </div>
      </section>

      <section className="cr-panel" hidden={step !== 2}>
        <div className="cr-panel-head">
          <RequestStepArt step={2} />
          <div>
            <h2>{t('commercial.sectionSpecification')}</h2>
          </div>
        </div>
        <div className="cr-fields">
          <FormField
            label={t('commercial.technicalRequirements')}
            optional
            helper={t('commercial.technicalRequirementsHelp')}
          >
            <TextArea rows={5} placeholder={t('commercial.technicalRequirementsPlaceholder')} {...register('technical_requirements')} />
          </FormField>
          <FormField label={t('commercial.specSheet')} optional helper={t('commercial.specSheetHelp')}>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              className="ds-file-input"
              data-testid="reference-spec-file"
              onChange={(event) => addPendingFiles(event.target.files)}
            />
            <button type="button" className="ds-btn ds-btn-secondary" onClick={() => fileRef.current?.click()}>
              {t('commercial.specAddPdf')}
            </button>
            {(savedSpecs.length > 0 || pendingSpecs.length > 0) && (
              <ul>
                {savedSpecs.map((spec) => (
                  <li key={spec.id} className="ds-file-row">
                    {spec.file_url ? (
                      <a href={spec.file_url} target="_blank" rel="noreferrer" className="ds-link truncate">{spec.file_name}</a>
                    ) : (
                      <span className="truncate">{spec.file_name}</span>
                    )}
                    {spec.id && (
                      <button
                        type="button"
                        className="ds-btn ds-btn-text"
                        aria-label={t('commercial.removeSpec')}
                        disabled={removingId === spec.id || isPending}
                        onClick={() => void removeSaved(spec.id!)}
                      >
                        {t('commercial.removeSpec')}
                      </button>
                    )}
                  </li>
                ))}
                {pendingSpecs.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="ds-file-row">
                    <span className="truncate">
                      {file.name}
                      <span className="ds-meta"> ({t('commercial.specPendingUpload')})</span>
                    </span>
                    <button
                      type="button"
                      className="ds-btn ds-btn-text"
                      aria-label={t('commercial.removeSpec')}
                      disabled={isPending}
                      onClick={() => removePending(index)}
                    >
                      {t('commercial.removeSpec')}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </FormField>
          <p className="cr-spec-note">{t(`commercial.specScenario.${specScenario}`)}</p>
        </div>
      </section>

      <div className="ds-form-actions">
        {step === 0 ? (
          <Link to="/requests" className="ds-btn ds-btn-text">{t('commercial.back')}</Link>
        ) : (
          <button type="button" className="ds-btn ds-btn-text" onClick={() => setStep((current) => current - 1)}>
            <Icon name="arrow_back" size={16} />
            {t('commercial.previous')}
          </button>
        )}
        <button type="button" className="ds-btn ds-btn-secondary" disabled={isPending} onClick={submit('draft')}>
          {isPending ? t('commercial.saving') : t('commercial.saveDraft')}
        </button>
        {step < 2 ? (
          <button type="button" className="ds-btn ds-btn-primary" onClick={() => void goNext()}>
            {t('commercial.continue')}
            <Icon name="arrow_forward" size={16} />
          </button>
        ) : (
          <button type="button" className="ds-btn ds-btn-primary" disabled={isPending} onClick={submit('open')}>
            {isPending ? t('commercial.saving') : t('commercial.create')}
          </button>
        )}
      </div>
    </form>
  )
}
