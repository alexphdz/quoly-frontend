import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { CODE_PATTERN, onlyCodeDigits, useResendCooldown } from '../hooks/useResendCooldown'
import { authErrorMessage } from '../lib/authError'
import { FormFeedback, FormField } from '../components/ui'
import AuthStage from '../components/auth/AuthStage'

const schema = z.object({
  email: z.string().email('auth.invalidEmail'),
  code: z.string().regex(CODE_PATTERN, 'auth.codeFormat'),
})

type FormData = z.infer<typeof schema>

/** Set by RegisterPage (email) and LoginPage (email + resend after `email_not_confirmed`). */
type LocationState = { email?: string; resend?: boolean } | null

export default function ConfirmEmailPage() {
  const { t } = useTranslation('common')
  const { confirmEmail, resendConfirmation } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const state = (location.state as LocationState) ?? null
  const knownEmail = state?.email ?? searchParams.get('email') ?? ''
  const cooldown = useResendCooldown()
  const { register, handleSubmit, watch, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: knownEmail, code: '' },
  })
  const code = watch('code')
  const codeField = register('code')

  const submit = (data: FormData) => confirmEmail.mutate({ email: data.email, code: data.code })

  const resend = () => {
    const email = getValues('email')
    if (!email) return
    resendConfirmation.mutate(email, { onSuccess: () => cooldown.start() })
  }

  // Coming from login with an unconfirmed email: the original code may be long
  // expired, so send a fresh one once on arrival.
  const autoResent = useRef(false)
  useEffect(() => {
    if (state?.resend && knownEmail && !autoResent.current) {
      autoResent.current = true
      resend()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Codes are exactly six digits: submit as soon as the last one is typed.
  useEffect(() => {
    if (CODE_PATTERN.test(code) && !confirmEmail.isPending) void handleSubmit(submit)()
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthStage titleKey="seo.confirmEmail" descriptionKey="seo.confirmEmailDesc">
      <div className="ds-auth-heading">
        <h1>{t('auth.confirm.title')}</h1>
        <p>{knownEmail ? t('auth.confirm.body', { email: knownEmail }) : t('auth.confirm.bodyNoEmail')}</p>
      </div>

      <form onSubmit={handleSubmit(submit)}>
        {knownEmail ? (
          <input type="hidden" {...register('email')} />
        ) : (
          <FormField label={t('auth.confirm.email')} error={errors.email?.message && t(errors.email.message as 'auth.invalidEmail')}>
            <input
              type="email"
              autoComplete="email"
              {...register('email')}
              className="input"
              placeholder={t('auth.login.emailPlaceholder')}
            />
          </FormField>
        )}

        <FormField
          label={t('auth.confirm.code')}
          helper={t('auth.confirm.codeHelp')}
          error={errors.code?.message && t(errors.code.message as 'auth.codeFormat')}
        >
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            autoFocus
            {...codeField}
            onChange={event => {
              event.target.value = onlyCodeDigits(event.target.value)
              void codeField.onChange(event)
            }}
            className="input"
            placeholder={t('auth.confirm.codePlaceholder')}
          />
        </FormField>

        {confirmEmail.error && (
          <FormFeedback>{authErrorMessage(confirmEmail.error, t)}</FormFeedback>
        )}

        <button type="submit" className="ds-btn ds-btn-primary" disabled={confirmEmail.isPending}>
          {confirmEmail.isPending ? t('auth.confirm.submitting') : t('auth.confirm.submit')}
        </button>

        <button
          type="button"
          className="ds-btn ds-btn-secondary"
          disabled={resendConfirmation.isPending || cooldown.coolingDown}
          onClick={resend}
        >
          {resendConfirmation.isPending
            ? t('auth.confirm.resending')
            : cooldown.coolingDown
              ? t('auth.confirm.resendIn', { seconds: cooldown.secondsLeft })
              : t('auth.confirm.resend')}
        </button>

        {resendConfirmation.isSuccess && cooldown.coolingDown && (
          <FormFeedback tone="success">{t('auth.confirm.resent')}</FormFeedback>
        )}
        {resendConfirmation.error && (
          <FormFeedback>{authErrorMessage(resendConfirmation.error, t)}</FormFeedback>
        )}
      </form>

      <p className="ds-auth-switch">
        <Link to="/login" className="ds-link">{t('auth.confirm.backToLogin')}</Link>
      </p>
    </AuthStage>
  )
}
