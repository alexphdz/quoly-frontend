import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { useCreateCorrugatedRFQ, useUpdateCorrugatedRFQ } from '../hooks/useRFQs'
import {
  corrugatedRfqFormSchema,
  defaultCorrugatedFormValues,
  STEP_FIELDS,
  type CorrugatedRFQFormValues,
} from '../schemas/corrugatedRfq'
import { formValuesToCorrugatedPayload } from '../lib/corrugatedPayload'
import type { ApiError } from '../api/client'
import { Button, FormFeedback, PageHeader, toast } from '../components/ui'
import StepHeader from '../components/rfq/corrugated/StepHeader'
import StepProduct from '../components/rfq/corrugated/StepProduct'
import StepBoard from '../components/rfq/corrugated/StepBoard'
import StepDimensions from '../components/rfq/corrugated/StepDimensions'
import StepFinish from '../components/rfq/corrugated/StepFinish'
import StepVolumeTiers from '../components/rfq/corrugated/StepVolumeTiers'
import StepChecklist from '../components/rfq/corrugated/StepChecklist'
import StepAttachments from '../components/rfq/corrugated/StepAttachments'
import StepReview from '../components/rfq/corrugated/StepReview'

const STEP_KEYS = [
  'header',
  'product',
  'board',
  'dimensions',
  'finish',
  'tiers',
  'checklist',
  'attachments',
  'review',
] as const

const TOTAL_STEPS = STEP_KEYS.length

export default function RFQCorrugatedCreatePage() {
  const { t } = useTranslation('corrugated')
  const navigate = useNavigate()
  const { user } = useAuth()
  const createRFQ = useCreateCorrugatedRFQ()
  const updateRFQ = useUpdateCorrugatedRFQ()
  const [step, setStep] = useState(0)
  const [draftId, setDraftId] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [stepError, setStepError] = useState(false)

  const form = useForm<CorrugatedRFQFormValues>({
    resolver: zodResolver(corrugatedRfqFormSchema) as unknown as Resolver<CorrugatedRFQFormValues>,
    defaultValues: defaultCorrugatedFormValues(user?.default_email_locale ?? 'en'),
    mode: 'onSubmit',
  })

  const { register, control, handleSubmit, watch, setValue, trigger, formState: { errors } } = form
  const stepProps = { register, control, errors, watch, setValue }

  const pending = createRFQ.isPending || updateRFQ.isPending

  const validateCurrentStep = async () => {
    const fields = STEP_FIELDS[step]
    if (!fields.length) {
      setStepError(false)
      return true
    }
    const ok = await trigger(fields)
    setStepError(!ok)
    return ok
  }

  const goNext = async () => {
    const ok = await validateCurrentStep()
    if (!ok) return
    setStep(s => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  const goBack = () => {
    setStepError(false)
    setStep(s => Math.max(s - 1, 0))
  }

  const persist = async (values: CorrugatedRFQFormValues, status: 'draft' | 'open') => {
    setSubmitError(null)
    const payload = formValuesToCorrugatedPayload(values, status)
    try {
      if (draftId) {
        const rfq = await updateRFQ.mutateAsync({ id: draftId, data: payload })
        return rfq
      }
      const rfq = await createRFQ.mutateAsync(payload)
      setDraftId(rfq.id)
      return rfq
    } catch (err) {
      const detail = (err as ApiError).detail || String(err)
      setSubmitError(detail)
      throw err
    }
  }

  const onSaveDraft = async () => {
    const values = watch()
    if (!(values.name || '').trim()) {
      await trigger('name')
      setStep(0)
      setStepError(true)
      return
    }
    try {
      await persist(values, 'draft')
      toast(t('wizard.draftSaved'))
    } catch {
      /* error shown via submitError */
    }
  }

  const onCreate = handleSubmit(async (values) => {
    try {
      const rfq = await persist(values, 'open')
      toast(t('wizard.created'))
      navigate(`/rfqs/${rfq.id}`)
    } catch {
      /* error shown via submitError */
    }
  })

  const steps = [
    <StepHeader key="header" {...stepProps} />,
    <StepProduct key="product" {...stepProps} />,
    <StepBoard key="board" {...stepProps} />,
    <StepDimensions key="dimensions" {...stepProps} />,
    <StepFinish key="finish" {...stepProps} />,
    <StepVolumeTiers key="tiers" {...stepProps} />,
    <StepChecklist key="checklist" {...stepProps} />,
    <StepAttachments key="attachments" {...stepProps} />,
    <StepReview key="review" {...stepProps} />,
  ]

  return (
    <div className="page page-wide">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-sm text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <Link to="/">{t('wizard.breadcrumb')}</Link>
          <span>›</span>
          <span className="text-[var(--text-primary)]">{t('wizard.newRfq')}</span>
        </div>
        <Link to="/rfqs/new/legacy" className="text-[var(--brand)]">
          {t('wizard.legacyLink')}
        </Link>
      </div>

      <PageHeader title={t('wizard.title')} subtitle={t('wizard.subtitle')} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span className="font-medium text-[var(--text-primary)]">
          {t(`wizard.steps.${STEP_KEYS[step]}`)}
        </span>
        <span className="text-[var(--text-muted)]">
          {t('wizard.stepOf', { current: step + 1, total: TOTAL_STEPS })}
        </span>
      </div>

      <ol className="mb-5 flex flex-wrap gap-1 text-xs text-[var(--text-muted)]">
        {STEP_KEYS.map((key, i) => (
          <li key={key}>
            <button
              type="button"
              className={i === step ? 'font-semibold text-[var(--brand)]' : ''}
              onClick={() => setStep(i)}
            >
              {i + 1}. {t(`wizard.steps.${key}`)}
            </button>
            {i < TOTAL_STEPS - 1 ? <span className="mx-1">·</span> : null}
          </li>
        ))}
      </ol>

      {stepError && <FormFeedback className="mb-4">{t('validation.fixStep')}</FormFeedback>}
      {submitError && <FormFeedback className="mb-4">{submitError}</FormFeedback>}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (step === TOTAL_STEPS - 1) void onCreate()
          else void goNext()
        }}
      >
        {steps[step]}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="secondary" onClick={goBack} disabled={step === 0 || pending}>
            {t('wizard.back')}
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" onClick={() => void onSaveDraft()} disabled={pending}>
              {pending ? t('wizard.savingDraft') : t('wizard.saveDraft')}
            </Button>
            {step < TOTAL_STEPS - 1 ? (
              <Button type="submit" disabled={pending}>
                {t('wizard.next')}
              </Button>
            ) : (
              <Button type="submit" disabled={pending}>
                {pending ? t('wizard.creating') : t('wizard.create')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
