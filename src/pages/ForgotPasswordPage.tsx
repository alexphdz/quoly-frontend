import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { authErrorMessage } from '../lib/authError'
import { FormFeedback, FormField } from '../components/ui'
import AuthStage from '../components/auth/AuthStage'

const schema = z.object({
  email: z.string().email('auth.invalidEmail'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const { t } = useTranslation('common')
  const { requestPasswordReset } = useAuth()
  const [submittedEmail, setSubmittedEmail] = useState('')
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Anti-enumeration: the backend returns 200 whether or not the email exists,
  // so we always show the same "if it exists, we sent a link" confirmation.
  if (requestPasswordReset.isSuccess) {
    return (
      <AuthStage>
        <h1>{t('auth.forgot.sentTitle')}</h1>
        <p className="ds-auth-note">{t('auth.forgot.sentBody', { email: submittedEmail })}</p>
        <p className="ds-auth-switch">
          <Link to="/login" className="ds-link">{t('auth.forgot.backToLogin')}</Link>
        </p>
      </AuthStage>
    )
  }

  return (
    <AuthStage>
      <h1>{t('auth.forgot.title')}</h1>
      <p className="ds-auth-note">{t('auth.forgot.subtitle')}</p>

      <form
        onSubmit={handleSubmit(data => {
          setSubmittedEmail(data.email)
          requestPasswordReset.mutate(data.email)
        })}
      >
        <FormField label={t('auth.forgot.email')} error={errors.email?.message && t(errors.email.message as 'auth.invalidEmail')}>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            className="input"
            placeholder={t('auth.login.emailPlaceholder')}
          />
        </FormField>

        {requestPasswordReset.error && (
          <FormFeedback>{authErrorMessage(requestPasswordReset.error, t)}</FormFeedback>
        )}

        <button type="submit" className="ds-btn ds-btn-primary" disabled={requestPasswordReset.isPending}>
          {requestPasswordReset.isPending ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
        </button>
      </form>

      <p className="ds-auth-switch">
        <Link to="/login" className="ds-link">{t('auth.forgot.backToLogin')}</Link>
      </p>
    </AuthStage>
  )
}
