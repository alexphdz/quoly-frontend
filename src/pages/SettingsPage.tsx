import { useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon, Skel } from '../components/ds'
import { Button, ConfirmDialog, IconButton, Select, StatusBadge, Tabs, TextButton, TextInput } from '../design-system'
import { MicrosoftOutlookLogo, Monitor, Moon, Sun } from '@phosphor-icons/react'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../hooks/useAuth'
import { getToken, post, type ApiError } from '../api/client'
import { SUPPORTED_LOCALES, type Locale } from '../i18n'
import { useFormat } from '../lib/format'
import { Avatar, FormFeedback, toast } from '../components/ui'
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
    <section className="ds-form-section st-profile-section">
      <header className="st-profile-heading">
        <h2>{t('settings.profile.title')}</h2>
        <p className="ds-meta">{t('settings.profile.subtitle')}</p>
      </header>
      <PhotoSection />
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
    <div className="st-profile-identity" id="profile-photo">
      <Avatar name={user ? displayNameFromEmail(user.email) : null} src={user?.avatar_url} />
      <div className="st-profile-identity-copy">
        <strong>{user ? displayNameFromEmail(user.email) : '—'}</strong>
        <span>{user?.email ?? ''}</span>
        <div className="photo-profile">
          <TextButton icon={user?.avatar_url ? 'pencil-simple' : 'upload-simple'} aria-label={t('settings.photo.change')} disabled={!user || removeAvatar.isPending} onClick={() => setEditing(true)}>{user?.avatar_url ? t('settings.photo.change') : t('settings.photo.upload')}</TextButton>
          {user?.avatar_url && <Button variant="tertiary" size="sm" disabled={removeAvatar.isPending} onClick={() => { setError(''); setConfirming(true) }}>{t('settings.photo.remove')}</Button>}
        </div>
      </div>
      {editing && <ProfilePhotoDialog onClose={() => setEditing(false)} />}
      <ConfirmDialog open={confirming} title={t('settings.photo.removeTitle')} description={t('settings.photo.removeHelp')} tone="destructive" confirmLabel={t('settings.photo.remove')} cancelLabel={t('actions.cancel')} pending={removeAvatar.isPending} onCancel={() => setConfirming(false)} onConfirm={() => void remove()} />
      {error && <FormFeedback>{error}</FormFeedback>}
    </div>
  )
}

function AppearanceSection() {
  const { t } = useTranslation('common')
  const { preference, setTheme } = useTheme()
  const options = [
    { value: 'light' as const, label: t('nav.light'), Icon: Sun },
    { value: 'dark' as const, label: t('nav.dark'), Icon: Moon },
    { value: 'system' as const, label: t('nav.system'), Icon: Monitor },
  ]

  return (
    <div className="st-preference-row">
      <div className="st-preference-copy"><strong>{t('settings.appearance.title')}</strong><span>{t('settings.appearance.description')}</span></div>
      <div className="st-theme-control" role="radiogroup" aria-label={t('settings.appearance.groupLabel')}>
        {options.map(({ value, label, Icon: ThemeIcon }) => <button key={value} type="button" role="radio" aria-checked={preference === value} aria-label={label} title={label} className={`q-segment${preference === value ? ' is-active' : ''}`} onClick={() => setTheme(value as ThemePreference)}><ThemeIcon size={18} weight="regular" aria-hidden /></button>)}
      </div>
    </div>
  )
}

function SecuritySection() {
  const { t } = useTranslation('common')
  const { changePassword } = useAuth()
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false })
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
    <section className="st-settings-section">
      <header className="st-settings-heading"><h2>{t('settings.security.title')}</h2><p>{t('settings.security.subtitle')}</p></header>
      <form onSubmit={handleSubmit(onSubmit)} className="st-security-form">
        <div className="st-password-input"><TextInput type={visible.current ? 'text' : 'password'} {...register('current_password')} label={t('settings.security.currentPassword')} optionalLabel="" autoComplete="current-password" status={errors.current_password ? 'error' : undefined} message={errors.current_password?.message ? t(errors.current_password.message as 'settings.security.enterCurrent') : undefined} /><IconButton type="button" icon={visible.current ? 'eye-slash' : 'eye'} label={t(visible.current ? 'settings.security.hidePassword' : 'settings.security.showPassword')} size="sm" variant="tertiary" onClick={() => setVisible(value => ({ ...value, current: !value.current }))} /></div>
        <div className="st-password-input"><TextInput type={visible.next ? 'text' : 'password'} {...register('new_password')} label={t('settings.security.newPassword')} optionalLabel="" autoComplete="new-password" status={errors.new_password ? 'error' : undefined} message={errors.new_password?.message ? t(errors.new_password.message as 'auth.passwordMin') : undefined} /><IconButton type="button" icon={visible.next ? 'eye-slash' : 'eye'} label={t(visible.next ? 'settings.security.hidePassword' : 'settings.security.showPassword')} size="sm" variant="tertiary" onClick={() => setVisible(value => ({ ...value, next: !value.next }))} /></div>
        <div className="st-password-input"><TextInput type={visible.confirm ? 'text' : 'password'} {...register('confirm_password')} label={t('settings.security.confirmPassword')} optionalLabel="" autoComplete="new-password" status={errors.confirm_password ? 'error' : undefined} message={errors.confirm_password?.message ? t(errors.confirm_password.message as 'settings.security.confirmNew') : undefined} /><IconButton type="button" icon={visible.confirm ? 'eye-slash' : 'eye'} label={t(visible.confirm ? 'settings.security.hidePassword' : 'settings.security.showPassword')} size="sm" variant="tertiary" onClick={() => setVisible(value => ({ ...value, confirm: !value.confirm }))} /></div>

        {changePassword.error && (
          <FormFeedback>
            {changePassword.error instanceof Error && 'detail' in changePassword.error
              ? (changePassword.error as ApiError).detail
              : t('settings.security.error')}
          </FormFeedback>
        )}

        <div>
          <Button type="submit" variant="primary" loading={changePassword.isPending}>{changePassword.isPending ? t('settings.security.updating') : t('settings.security.update')}</Button>
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
    <section className="st-settings-section">
      <header className="st-settings-heading"><h2>{t('settings.preferences.title')}</h2><p>{t('settings.preferences.subtitle')}</p></header>
      <div className="st-preference-list">
        <AppearanceSection />
        <div className="st-preference-row"><div className="st-preference-copy"><strong>{t('settings.preferences.interfaceLanguage')}</strong><span>{t('settings.preferences.interfaceLanguageHelper')}</span></div>
          <div className="st-preference-select"><Select aria-label={t('settings.preferences.interfaceLanguage')} value={i18n.resolvedLanguage}
            onChange={event => changeLanguage(event.target.value as Locale)} options={SUPPORTED_LOCALES.map(locale => ({ value: locale, label: t(`language.${locale}`) }))}
          /></div>
        </div>
        <div className="st-preference-row"><div className="st-preference-copy"><strong>{t('settings.preferences.emailLanguage')}</strong><span>{t('settings.preferences.emailLanguageHelper')}</span></div>
          <div className="st-preference-select"><Select aria-label={t('settings.preferences.emailLanguage')}
            value={user?.default_email_locale ?? 'en'}
            onChange={event => changeEmailLocale(event.target.value as Locale)}
            disabled={updateProfile.isPending}
            options={SUPPORTED_LOCALES.map(locale => ({ value: locale, label: t(`language.${locale}`) }))}
          /></div>
        </div>
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
          <StatusBadge tone={connected ? 'success' : 'neutral'}>{connected ? t('settings.integrations.connected') : t('settings.integrations.notConnected')}</StatusBadge>
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
      <Button type="button" variant="secondary" onClick={onDisconnect} disabled={disconnectPending} loading={disconnectPending}>
        {disconnectPending ? t('settings.integrations.disconnecting') : t('settings.integrations.disconnect')}
      </Button>
    )
  }
  return (
    <Button type="button" variant="primary" onClick={onConnect} disabled={connectPending} loading={connectPending}>
      {connectPending ? t('settings.integrations.connecting') : t('settings.integrations.connect')}
    </Button>
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
    <section id="integrations" className="st-settings-section st-integrations-section">
      <header className="st-settings-heading"><h2>{t('settings.integrations.title')}</h2><p>{t('settings.integrations.subtitle')}</p></header>
      <div>
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
        <p className="st-integration-note">{t('settings.integrations.note')}</p>
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
  const [searchParams, setSearchParams] = useSearchParams()
  const section = searchParams.get('seccion') ?? searchParams.get('section')
  const current = section === 'seguridad' || section === 'security'
    ? 'security'
    : section === 'preferencias' || section === 'preferences'
      ? 'preferences'
      : section === 'correo' || section === 'email'
        ? 'email'
        : 'profile'
  const tabs = [
    { value: 'profile', label: t('settings.profile.title') },
    { value: 'security', label: t('settings.security.title') },
    { value: 'preferences', label: t('settings.preferences.title') },
    { value: 'email', label: t('settings.integrations.title') },
  ]
  return (
    <div className="ds-page st-page">
      <header className="st-head">
        <h1 className="ds-detail-title">{t('settings.title')}</h1>
        <p className="ds-meta">{t('settings.subtitle')}</p>
      </header>
      <Tabs label={t('settings.title')} variant="secondary" items={tabs.map(item => ({ ...item, icon: item.value === 'profile' ? 'user-circle' : item.value === 'security' ? 'lock-simple' : item.value === 'preferences' ? 'gear-six' : 'envelope-simple' }))} value={current} onChange={value => setSearchParams(value === 'profile' ? {} : { seccion: value === 'security' ? 'seguridad' : value === 'preferences' ? 'preferencias' : 'correo' }, { replace: true })} />
      <div className="st-panel" role="tabpanel">
        {current === 'profile' && <ProfileSection />}
        {current === 'security' && <SecuritySection />}
        {current === 'preferences' && <PreferencesSection />}
        {current === 'email' && <IntegrationsSection />}
      </div>
      {import.meta.env.DEV && <DemoDataSection />}
    </div>
  )
}
