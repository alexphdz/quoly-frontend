import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { CODE_PATTERN, onlyCodeDigits } from '../hooks/useResendCooldown'
import { authErrorMessage } from '../lib/authError'
import { FormFeedback, FormField } from '../components/ui'
import { Icon } from '../design-system'
import AuthStage from '../components/auth/AuthStage'

const schema = z
  .object({
    email: z.string().email('auth.invalidEmail'),
    code: z.string().regex(CODE_PATTERN, 'auth.codeFormat'),
    password: z.string().min(6, 'auth.passwordMin'),
    confirm: z.string().min(6, 'auth.passwordMin'),
  })
  .refine(data => data.password === data.confirm, {
    path: ['confirm'],
    message: 'auth.reset.mismatch',
  })

type FormData = z.infer<typeof schema>

/** Set by ForgotPasswordPage after the code was requested. */
type LocationState = { email?: string } | null

export default function ResetPasswordPage() {
  const { t } = useTranslation('common')
  const { confirmPasswordReset } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const knownEmail = ((location.state as LocationState) ?? null)?.email ?? searchParams.get('email') ?? ''
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: knownEmail, code: '', password: '', confirm: '' },
  })
  const codeField = register('code')

  // Password updated.
  if (confirmPasswordReset.isSuccess) {
    return (
      <AuthStage titleKey="seo.resetPassword" noindex>
        <h1>{t('auth.reset.successTitle')}</h1>
        <p className="ds-auth-note">{t('auth.reset.successBody')}</p>
        <p className="ds-auth-switch">
          <Link to="/login" className="ds-link">{t('auth.reset.goToLogin')}</Link>
        </p>
      </AuthStage>
    )
  }

  return (
    <AuthStage titleKey="seo.resetPassword" noindex>
      <h1>{t('auth.reset.title')}</h1>
      <p className="ds-auth-note">{t('auth.reset.subtitle')}</p>

      <form
        onSubmit={handleSubmit(data =>
          confirmPasswordReset.mutate({ email: data.email, code: data.code, newPassword: data.password }),
        )}
      >
        <FormField label={t('auth.reset.email')} error={errors.email?.message && t(errors.email.message as 'auth.invalidEmail')}>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            className="input"
            placeholder={t('auth.login.emailPlaceholder')}
          />
        </FormField>

        <FormField
          label={t('auth.reset.code')}
          helper={t('auth.confirm.codeHelp')}
          error={errors.code?.message && t(errors.code.message as 'auth.codeFormat')}
        >
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            autoFocus={!!knownEmail}
            {...codeField}
            onChange={event => {
              event.target.value = onlyCodeDigits(event.target.value)
              void codeField.onChange(event)
            }}
            className="input"
            placeholder={t('auth.confirm.codePlaceholder')}
          />
        </FormField>

        <FormField label={t('auth.reset.password')} error={errors.password?.message && t(errors.password.message as 'auth.passwordMin')}>
          <div className="ds-auth-pass">
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              {...register('password')}
              className="input"
              placeholder={t('auth.register.passwordPlaceholder')}
            />
            <button
              type="button"
              className="ds-auth-reveal"
              aria-pressed={showPassword}
              aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
              onClick={() => setShowPassword(value => !value)}
            >
              <Icon name={showPassword ? 'eye-slash' : 'eye'} size={16} />
            </button>
          </div>
        </FormField>

        <FormField label={t('auth.reset.confirm')} error={errors.confirm?.message && t(errors.confirm.message as 'auth.passwordMin')}>
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            {...register('confirm')}
            className="input"
            placeholder={t('auth.register.passwordPlaceholder')}
          />
        </FormField>

        {confirmPasswordReset.error && (
          <FormFeedback>{authErrorMessage(confirmPasswordReset.error, t)}</FormFeedback>
        )}

        <button type="submit" className="ds-btn ds-btn-primary" disabled={confirmPasswordReset.isPending}>
          {confirmPasswordReset.isPending ? t('auth.reset.submitting') : t('auth.reset.submit')}
        </button>
      </form>

      <p className="ds-auth-switch">
        <Link to="/forgot-password" className="ds-link">{t('auth.reset.requestNew')}</Link>
      </p>
      <p className="ds-auth-switch">
        <Link to="/login" className="ds-link">{t('auth.forgot.backToLogin')}</Link>
      </p>
    </AuthStage>
  )
}
