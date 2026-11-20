import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { ApiError } from '../api/client'
import { authErrorMessage } from '../lib/authError'
import { FormFeedback, FormField } from '../components/ui'
import { Icon } from '../design-system'
import AuthStage from '../components/auth/AuthStage'

const schema = z.object({
  email: z.string().email('auth.invalidEmail'),
  password: z.string().min(6, 'auth.passwordMin'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { t } = useTranslation('common')
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  // Unconfirmed account: offer the code screen (which resends a fresh code on
  // arrival) instead of leaving the user stuck on the error.
  const emailNotConfirmed = login.error instanceof ApiError && login.error.code === 'email_not_confirmed'

  return (
    <AuthStage titleKey="seo.login" descriptionKey="seo.loginDesc">
      <div className="ds-auth-heading">
        <h1>{t('auth.login.welcomeTitle')}</h1>
        <p>{t('auth.login.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(data => login.mutate(data))}>
        <FormField label={t('auth.login.email')} error={errors.email?.message && t(errors.email.message as 'auth.invalidEmail')}>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            className="input"
            placeholder={t('auth.login.emailPlaceholder')}
          />
        </FormField>

        <div className="field">
          <div className="ds-auth-label-row">
            <label className="field-label" htmlFor="login-password">{t('auth.login.password')}</label>
            <Link to="/forgot-password" className="ds-link">{t('auth.login.forgotPassword')}</Link>
          </div>
          <div className="ds-auth-pass">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...register('password')}
              className="input"
              placeholder={t('auth.login.passwordPlaceholder')}
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
          {errors.password?.message && (
            <div className="field-error" role="alert">{t(errors.password.message as 'auth.passwordMin')}</div>
          )}
        </div>

        {login.error && (
          <FormFeedback>{authErrorMessage(login.error, t)}</FormFeedback>
        )}

        <button type="submit" className="ds-btn ds-btn-primary" disabled={login.isPending}>
          {login.isPending ? t('auth.login.submitting') : t('auth.login.submit')}
        </button>

        {emailNotConfirmed && (
          <button
            type="button"
            className="ds-btn ds-btn-secondary"
            onClick={() => navigate('/confirm-email', { state: { email: getValues('email'), resend: true } })}
          >
            {t('auth.login.confirmEmail')}
          </button>
        )}
      </form>

      <p className="ds-auth-switch">
        {t('auth.login.newToQuoly')}{' '}
        <Link to="/register" className="ds-link">{t('auth.login.createAccount')}</Link>
      </p>
    </AuthStage>
  )
}
