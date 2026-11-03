import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { FormField, FormFeedback, Avatar } from '../components/ui'
import AuthStage from '../components/auth/AuthStage'
import ProfilePhotoDialog from '../components/settings/ProfilePhotoDialog'

const schema = z
  .object({
    first_name: z.string().min(1, 'onboarding.firstNameRequired'),
    last_name: z.string().min(1, 'onboarding.lastNameRequired'),
    account_type: z.enum(['personal', 'organization']),
    company_name: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.account_type === 'organization' && !data.company_name?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['company_name'],
        message: 'onboarding.companyNameRequired',
      })
    }
  })

type FormData = z.infer<typeof schema>

export default function OnboardingPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const [showPhotoDialog, setShowPhotoDialog] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      account_type: user?.account_type ?? 'personal',
      company_name: user?.company_name ?? '',
    },
  })

  const accountType = watch('account_type')

  const onSubmit = async (data: FormData) => {
    await updateProfile.mutateAsync({
      first_name: data.first_name,
      last_name: data.last_name,
      account_type: data.account_type,
      company_name: data.account_type === 'organization' ? (data.company_name ?? null) : null,
    })
    navigate('/')
  }

  return (
    <AuthStage titleKey="seo.onboarding">
      <div className="ds-auth-heading">
        <h1>{t('onboarding.title')}</h1>
        <p>{t('onboarding.subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <FormField
            label={t('onboarding.firstName')}
            error={errors.first_name?.message && t(errors.first_name.message as 'onboarding.firstNameRequired')}
          >
            <input
              type="text"
              autoComplete="given-name"
              {...register('first_name')}
              className="input"
            />
          </FormField>

          <FormField
            label={t('onboarding.lastName')}
            error={errors.last_name?.message && t(errors.last_name.message as 'onboarding.lastNameRequired')}
          >
            <input
              type="text"
              autoComplete="family-name"
              {...register('last_name')}
              className="input"
            />
          </FormField>
        </div>

        <FormField label={t('onboarding.accountType')}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['personal', 'organization'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={`ds-btn ${accountType === type ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                style={{ flex: 1 }}
                onClick={() => setValue('account_type', type, { shouldValidate: true })}
              >
                {t(`onboarding.${type}`)}
              </button>
            ))}
          </div>
        </FormField>

        {accountType === 'organization' && (
          <FormField
            label={t('onboarding.companyName')}
            error={errors.company_name?.message && t(errors.company_name.message as 'onboarding.companyNameRequired')}
          >
            <input
              type="text"
              autoComplete="organization"
              {...register('company_name')}
              className="input"
            />
          </FormField>
        )}

        <FormField label={t('onboarding.photoLabel')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Avatar
              src={user?.avatar_url}
              name={user?.email ?? null}
              size="md"
            />
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="ds-btn ds-btn-secondary"
                onClick={() => setShowPhotoDialog(true)}
              >
                {t('onboarding.photoLabel')}
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)', alignSelf: 'center' }}>
                {t('onboarding.photoSkip')}
              </span>
            </div>
          </div>
        </FormField>

        {updateProfile.error && (
          <FormFeedback>{String(updateProfile.error)}</FormFeedback>
        )}

        <button
          type="submit"
          className="ds-btn ds-btn-primary"
          disabled={isSubmitting || updateProfile.isPending}
        >
          {isSubmitting || updateProfile.isPending
            ? t('onboarding.submitting')
            : t('onboarding.submit')}
        </button>
      </form>

      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-subtle)', marginTop: '0.75rem', textAlign: 'center' }}>
        {t('onboarding.note')}
      </p>

      {showPhotoDialog && (
        <ProfilePhotoDialog onClose={() => setShowPhotoDialog(false)} />
      )}
    </AuthStage>
  )
}
