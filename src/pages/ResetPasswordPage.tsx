import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { authErrorMessage } from '../lib/authError'
import { FormFeedback, FormField } from '../components/ui'
import { Icon } from '../components/ds'
import AuthStage from '../components/auth/AuthStage'

const schema = z
  .object({
    password: z.string().min(6, 'auth.passwordMin'),
    confirm: z.string().min(6, 'auth.passwordMin'),
  })
  .refine(data => data.password === data.confirm, {
    path: ['confirm'],
    message: 'auth.reset.mismatch',
  })

type FormData = z.infer<typeof schema>

/** Supabase's recovery email lands here with the session in the URL hash
 * (#access_token=...&type=recovery), or an error (#error_description=...). */
function readRecoveryToken(): { accessToken: string | null; error: string | null } {
  const raw = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
  const params = new URLSearchParams(raw)
  return {
    accessToken: params.get('access_token'),
    error: params.get('error_description') || params.get('error'),
  }
}

export default function ResetPasswordPage() {
  const { t } = useTranslation('common')
  const { confirmPasswordReset } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [{ accessToken, error }] = useState(readRecoveryToken)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // No/invalid token in the link.
  if (!accessToken) {
    return (
      <AuthStage>
        <h1>{t('auth.reset.invalidTitle')}</h1>
        <p className="ds-auth-note">{error || t('auth.reset.invalidBody')}</p>
        <p className="ds-auth-switch">
          <Link to="/forgot-password" className="ds-link">{t('auth.reset.requestNew')}</Link>
        </p>
      </AuthStage>
    )
  }

  // Password updated.
  if (confirmPasswordReset.isSuccess) {
    return (
      <AuthStage>
        <h1>{t('auth.reset.successTitle')}</h1>
        <p className="ds-auth-note">{t('auth.reset.successBody')}</p>
        <p className="ds-auth-switch">
          <Link to="/login" className="ds-link">{t('auth.reset.goToLogin')}</Link>
        </p>
      </AuthStage>
    )
  }

  return (
    <AuthStage>
      <h1>{t('auth.reset.title')}</h1>

      <form
        onSubmit={handleSubmit(data =>
          confirmPasswordReset.mutate({ accessToken, newPassword: data.password }),
        )}
      >
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
              <Icon name={showPassword ? 'visibility_off' : 'visibility'} size={16} />
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
    </AuthStage>
  )
}
