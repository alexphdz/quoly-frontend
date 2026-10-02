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

const schema = z.object({
  email: z.string().email('auth.invalidWorkEmail'),
  password: z.string().min(6, 'auth.passwordMin'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const { t } = useTranslation('common')
  const { register: registerMutation } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  return (
    <AuthStage>
      <h1>{t('auth.register.title')}</h1>

      <form onSubmit={handleSubmit(data => registerMutation.mutate(data))}>
        <FormField label={t('auth.register.email')} error={errors.email?.message && t(errors.email.message as 'auth.invalidWorkEmail')}>
          <input
            type="email"
            autoComplete="email"
            {...register('email')}
            className="input"
            placeholder={t('auth.register.emailPlaceholder')}
          />
        </FormField>

        <FormField label={t('auth.register.password')} error={errors.password?.message && t(errors.password.message as 'auth.passwordMin')}>
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

        {registerMutation.error && (
          <FormFeedback>{authErrorMessage(registerMutation.error, t)}</FormFeedback>
        )}

        <button type="submit" className="ds-btn ds-btn-primary" disabled={registerMutation.isPending}>
          {registerMutation.isPending ? t('auth.register.submitting') : t('auth.register.submit')}
        </button>
      </form>

      <p className="ds-auth-switch">
        {t('auth.register.haveAccount')}{' '}
        <Link to="/login" className="ds-link">{t('auth.register.signIn')}</Link>
      </p>
    </AuthStage>
  )
}
