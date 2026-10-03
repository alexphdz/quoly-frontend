import { useState, type ReactNode } from 'react'
import { Icon, Skel } from '../components/ds'
import { MicrosoftOutlookLogo } from '@phosphor-icons/react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { getToken, post, type ApiError } from '../api/client'
import { SUPPORTED_LOCALES, type Locale } from '../i18n'
import { useFormat } from '../lib/format'
import { Avatar, Dialog, FormFeedback, FormField, SelectInput, toast } from '../components/ui'
import { useTheme, type ThemePreference } from '../components/ui/theme'
import ProfilePhotoDialog from '../components/settings/ProfilePhotoDialog'
import { displayNameFromEmail } from '../lib/displayName'
import GmailIcon from '../components/icons/GmailIcon'

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'settings.security.enterCurrent'),
    new_password: z.string().min(6, 'auth.passwordMin'),
    confirm_password: z.string().min(1, 'settings.security.confirmNew'),
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: 'settings.security.mismatch',
    path: ['confirm_password'],
  })

type PasswordForm = z.infer<typeof passwordSchema>

function emailFromAccessToken(): string | undefined {
  const token = getToken()
  if (!token) return undefined
  const parts = token.split('.')
  if (parts.length < 2) return undefined
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
    const json = atob(padded)
    const payload = JSON.parse(json) as { email?: unknown }
    return typeof payload.email === 'string' && payload.email.includes('@')
      ? payload.email
      : undefined
  } catch {
    return undefined
  }
}

function ProfileSection() {
  const { t } = useTranslation('common')
  const fmt = useFormat()
  const { user, userLoading } = useAuth()
  const email = user?.email?.trim() || emailFromAccessToken() || ''
  const memberSince = user?.created_at
    ? fmt.date(user.created_at, { dateStyle: 'medium' })
    : ''

  return (
    <section className="ds-form-section">
      <h2>{t('settings.profile.title')}</h2>
      <dl className="st-facts">
        <div>
          <dt>{t('settings.profile.email')}</dt>
          <dd>
            {userLoading && !email ? <Skel w="14rem" h={16} /> : (email || '—')}
          </dd>
        </div>
        <div>
          <dt>{t('settings.profile.memberSince')}</dt>
          <dd>{userLoading && !memberSince ? <Skel w="8rem" h={16} /> : (memberSince || '—')}</dd>
        </div>
      </dl>
    </section>
  )
}

function PhotoSection() {
  const { t } = useTranslation('common')
  const { user, removeAvatar } = useAuth()
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState('')

  const remove = async () => {
    setError('')
    try {
      await removeAvatar.mutateAsync()
      setConfirming(false)
      toast(t('settings.photo.removed'), 'success')
    } catch {
      setError(t('settings.photo.removeError'))
    }
  }

  return (
    <section className="ds-form-section" id="profile-photo">
      <h2>{t('settings.photo.title')}</h2>
      <div className="ds-form-fields">
        <div className="photo-profile">
          <Avatar name={user ? displayNameFromEmail(user.email) : null} src={user?.avatar_url} />
          <button type="button" className="ds-btn ds-btn-secondary" disabled={!user || removeAvatar.isPending} onClick={() => setEditing(true)}>{t('settings.photo.change')}</button>
          {user?.avatar_url && <button type="button" className="ds-btn ds-btn-quiet" disabled={removeAvatar.isPending} onClick={() => { setError(''); setConfirming(true) }}>{t('settings.photo.remove')}</button>}
        </div>
      </div>
      {editing && <ProfilePhotoDialog onClose={() => setEditing(false)} />}
      <Dialog open={confirming} onClose={() => { if (!removeAvatar.isPending) setConfirming(false) }} title={t('settings.photo.removeTitle')}>
        <p className="ds-meta">{t('settings.photo.removeHelp')}</p>
        {error && <FormFeedback>{error}</FormFeedback>}
        <div className="photo-actions">
          <button type="button" className="ds-btn ds-btn-secondary" disabled={removeAvatar.isPending} onClick={() => setConfirming(false)}>{t('actions.cancel')}</button>
          <button type="button" className="ds-btn ds-btn-primary" disabled={removeAvatar.isPending} onClick={() => void remove()}>{t('settings.photo.remove')}</button>
        </div>
      </Dialog>
    </section>
  )
}

function AppearanceSection() {
  const { t } = useTranslation('common')
  const { preference, setTheme } = useTheme()
  const options = [
    { id: 'light' as const, label: t('nav.light'), icon: 'sun' },
    { id: 'dark' as const, label: t('nav.dark'), icon: 'moon' },
    { id: 'system' as const, label: t('nav.system'), icon: 'desktop' },
  ]

  return (
    <section className="ds-form-section">
      <h2>{t('settings.appearance.title')}</h2>
      <div className="ds-form-fields">
        <div className="ds-segmented st-theme" role="group" aria-label={t('settings.appearance.title')}>
          {options.map(option => (
            <button
              key={option.id}
              type="button"
              aria-label={option.label}
              title={option.label}
              aria-pressed={preference === option.id}
              onClick={() => setTheme(option.id as ThemePreference)}
            >
              <Icon name={option.icon} size={18} />
              <span className="sr-only">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function SecuritySection() {
  const { t } = useTranslation('common')
  const { changePassword } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const onSubmit = (data: PasswordForm) => {
    changePassword.mutate(
      { currentPassword: data.current_password, newPassword: data.new_password },
      {
        onSuccess: () => {
          toast(t('settings.security.updated'))
          reset()
        },
      },
    )
  }

  return (
    <section className="ds-form-section">
      <h2>{t('settings.security.title')}</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="ds-form-fields">
        <FormField label={t('settings.security.currentPassword')} error={errors.current_password?.message && t(errors.current_password.message as 'settings.security.enterCurrent')}>
          <input type="password" {...register('current_password')} className="input" autoComplete="current-password" />
        </FormField>
        <FormField label={t('settings.security.newPassword')} error={errors.new_password?.message && t(errors.new_password.message as 'auth.passwordMin')}>
          <input type="password" {...register('new_password')} className="input" autoComplete="new-password" />
        </FormField>
        <FormField label={t('settings.security.confirmPassword')} error={errors.confirm_password?.message && t(errors.confirm_password.message as 'settings.security.confirmNew')}>
          <input type="password" {...register('confirm_password')} className="input" autoComplete="new-password" />
        </FormField>

        {changePassword.error && (
          <FormFeedback>
            {changePassword.error instanceof Error && 'detail' in changePassword.error
              ? (changePassword.error as ApiError).detail
              : t('settings.security.error')}
          </FormFeedback>
        )}

        <div>
          <button type="submit" className="ds-btn ds-btn-primary" disabled={changePassword.isPending}>
            {changePassword.isPending ? t('settings.security.updating') : t('settings.security.update')}
          </button>
        </div>
      </form>
    </section>
  )
}

function PreferencesSection() {
  const { t, i18n } = useTranslation()
  const { user, updateProfile } = useAuth()

  const changeLanguage = (locale: Locale) => {
    void i18n.changeLanguage(locale)
  }

  const changeEmailLocale = (locale: Locale) => {
    updateProfile.mutate(
      { default_email_locale: locale },
      { onSuccess: () => toast(t('settings.preferences.saved')) },
    )
  }

  return (
    <section className="ds-form-section">
      <h2>{t('language.label')}</h2>
      <div className="ds-form-fields">
        <FormField label={t('language.label')}>
          <SelectInput
            value={i18n.resolvedLanguage}
            onChange={event => changeLanguage(event.target.value as Locale)}
          >
            {SUPPORTED_LOCALES.map(locale => (
              <option key={locale} value={locale}>
                {t(`language.${locale}`)}
              </option>
            ))}
          </SelectInput>
        </FormField>
        <FormField label={t('settings.preferences.emailLanguage')} helper={t('settings.preferences.emailLanguageHelper')}>
          <SelectInput
            value={user?.default_email_locale ?? 'en'}
            onChange={event => changeEmailLocale(event.target.value as Locale)}
            disabled={updateProfile.isPending}
          >
            {SUPPORTED_LOCALES.map(locale => (
              <option key={locale} value={locale}>
                {t(`language.${locale}`)}
              </option>
            ))}
          </SelectInput>
        </FormField>
        {updateProfile.error && (
          <FormFeedback>{t('settings.preferences.saveError')}</FormFeedback>
        )}
      </div>
    </section>
  )
}

function IntegrationRow({
  mark,
  name,
  description,
  connected,
  action,
}: {
  mark: ReactNode
  name: string
  description: string
  connected: boolean
  action: ReactNode
}) {
  const { t } = useTranslation('common')
  return (
    <div className="st-integration">
      <span className="st-integration-mark">{mark}</span>
      <div className="st-integration-copy">
        <div className="st-integration-name">
          <strong>{name}</strong>
          <span className={connected ? 'ds-pill ds-pill-success' : 'ds-pill ds-pill-muted'}>
            {connected ? t('settings.integrations.connected') : t('settings.integrations.notConnected')}
          </span>
        </div>
        {description ? <p className="ds-meta">{description}</p> : null}
      </div>
      <div className="st-integration-action">{action}</div>
    </div>
  )
}

function MailboxAction({
  loading,
  connected,
  connectPending,
  disconnectPending,
  onConnect,
  onDisconnect,
}: {
  loading: boolean
  connected: boolean
  connectPending: boolean
  disconnectPending: boolean
  onConnect: () => void
  onDisconnect: () => void
}) {
  const { t } = useTranslation('common')
  if (loading) return <Skel w="6.5rem" h={36} r={6} />
  if (connected) {
    return (
      <button type="button" className="ds-btn ds-btn-quiet" onClick={onDisconnect} disabled={disconnectPending}>
        {disconnectPending ? t('settings.integrations.disconnecting') : t('settings.integrations.disconnect')}
      </button>
    )
  }
  return (
    <button type="button" className="ds-btn ds-btn-primary" onClick={onConnect} disabled={connectPending}>
      {connectPending ? t('settings.integrations.connecting') : t('settings.integrations.connect')}
    </button>
  )
}

function IntegrationsSection() {
  const { t } = useTranslation('common')
  const {
    user,
    userLoading,
    connectGoogle,
    disconnectGoogle,
    connectOutlook,
    disconnectOutlook,
  } = useAuth()
  const gmailConnected = !!user?.google_connected
  const outlookConnected = !!user?.outlook_connected

  return (
    <section id="integrations" className="ds-form-section">
      <h2>{t('settings.integrations.title')}</h2>
      <div className="ds-form-fields">
        <div className="st-integrations">
          <IntegrationRow
            mark={<GmailIcon size={28} />}
            name={t('settings.integrations.gmail')}
            description={t('settings.integrations.gmailDescription')}
            connected={gmailConnected}
            action={(
              <MailboxAction
                loading={userLoading}
                connected={gmailConnected}
                connectPending={connectGoogle.isPending}
                disconnectPending={disconnectGoogle.isPending}
                onConnect={() => connectGoogle.mutate()}
                onDisconnect={() => disconnectGoogle.mutate()}
              />
            )}
          />
          <IntegrationRow
            mark={<MicrosoftOutlookLogo size={24} weight="fill" color="#0F6CBD" aria-hidden />}
            name={t('settings.integrations.outlook')}
            description={t('settings.integrations.outlookDescription')}
            connected={outlookConnected}
            action={(
              <MailboxAction
                loading={userLoading}
                connected={outlookConnected}
                connectPending={connectOutlook.isPending}
                disconnectPending={disconnectOutlook.isPending}
                onConnect={() => connectOutlook.mutate()}
                onDisconnect={() => disconnectOutlook.mutate()}
              />
            )}
          />
        </div>
      </div>
    </section>
  )
}

function DemoDataSection() {
  const { t } = useTranslation('common')
  const queryClient = useQueryClient()
  const load = useMutation({
    mutationFn: () => post<{ quotes: number }>('/dev/demo-data'),
    onSuccess: () => {
      void queryClient.invalidateQueries()
      toast(t('settings.demo.loaded'), 'success')
    },
    onError: (err: ApiError) => {
      toast(err.detail === 'demo_already_loaded' ? t('settings.demo.already') : err.detail, 'error')
    },
  })

  return (
    <section className="ds-form-section">
      <h2>{t('settings.demo.title')}</h2>
      <div className="ds-form-fields">
        <p className="ds-meta">{t('settings.demo.description')}</p>
        <div>
          <button
            type="button"
            className="ds-btn ds-btn-secondary"
            onClick={() => load.mutate()}
            disabled={load.isPending}
          >
            <Icon name="database" size={16} />
            {load.isPending ? t('settings.demo.loading') : t('settings.demo.load')}
          </button>
        </div>
      </div>
    </section>
  )
}

export default function SettingsPage() {
  const { t } = useTranslation('common')
  return (
    <div className="ds-page st-page">
      <header className="st-head">
        <h1 className="ds-detail-title">{t('settings.title')}</h1>
      </header>
      <ProfileSection />
      <PhotoSection />
      <AppearanceSection />
      <PreferencesSection />
      <SecuritySection />
      <IntegrationsSection />
      {import.meta.env.DEV && <DemoDataSection />}
    </div>
  )
}
