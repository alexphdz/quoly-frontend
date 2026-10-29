import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'
import { Menu } from '../auxiliary/Menu'
import { QuolyMark } from './QuolyMark'
import { SidebarItem } from './SidebarItem'

export type NavItem = {
  value: string
  label: string
  icon?: IconName
  count?: number
  countLabel?: string
  disabled?: boolean
  /** Ruta interna (react-router). */
  to?: string
}

export type NavAccountProps = {
  user?: string
  /** Organización actual (selector de cuenta/workspace). */
  workspace?: string
  /** Imagen real de la cuenta; iniciales solo como respaldo. */
  avatarSrc?: string | null
  onAccount?: () => void
  /** Elementos de menú (MenuItem) del selector de cuenta. */
  accountMenu?: ReactNode
}

export type SidebarProps = NavAccountProps & {
  collapsed?: boolean
  items: NavItem[]
  active?: string
  onNavigate?: (value: string) => void
  onSearch?: () => void
  searchShortcut?: string
  settingsActive?: boolean
  settingsTo?: string
  onSettings?: () => void
  onToggle?: () => void
  height?: number | string
  className?: string
  style?: CSSProperties
}

function AvatarImg({ user, src }: { user?: string, src?: string | null }) {
  const initials = (user ?? '').split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase()
  return <span aria-hidden="true" className="q-nav-avatar">{src ? <img src={src} alt="" /> : initials}</span>
}

export function NavAccount({ collapsed = false, variant = 'sidebar', user, workspace, avatarSrc, onAccount, accountMenu }: NavAccountProps & { collapsed?: boolean, variant?: 'sidebar' | 'drawer' }) {
  const { t } = useTranslation('ds')
  const summary = workspace ? `${user ?? ''} · ${workspace}` : user ?? ''
  const button = (
    <button
      type="button"
      aria-haspopup="menu"
      aria-label={t('nav.account', { summary })}
      onClick={onAccount}
      className="q-nav-account-hit"
    >
      <AvatarImg user={user} src={avatarSrc} />
      <span className="q-nav-account-body">
        <span className="q-nav-account-text">
          <span className="q-nav-account-user">{user}</span>
          {workspace && <span className="q-nav-account-workspace">{workspace}</span>}
        </span>
        <span className="q-nav-account-caret"><Icon name="caret-up-down" size={16} /></span>
      </span>
    </button>
  )
  return (
    <div className={cx('q-nav-account', `is-${variant}`, collapsed && 'is-collapsed')}>
      {accountMenu ? <Menu trigger={button} side="top" align="start" minWidth={240}>{accountMenu}</Menu> : button}
      {collapsed && <span role="tooltip" className="q-nav-tip">{summary}</span>}
    </div>
  )
}

/** Sidebar unificado: 256 expandido / 68 contraído, una superficie, un divisor derecho. */
export function Sidebar({
  collapsed = false, items, active, onNavigate, onSearch, searchShortcut = '⌘K',
  workspace, user, avatarSrc, onAccount, accountMenu, onToggle, settingsActive = false, settingsTo, onSettings,
  height = '100dvh', className, style,
}: SidebarProps) {
  const { t } = useTranslation('ds')
  return (
    <aside aria-label={t('nav.label')} className={cx('q-sidebar', collapsed && 'is-collapsed', className)} style={{ height, ...style }}>
      {collapsed
        ? (
            <div className="q-nav-head is-collapsed">
              <button type="button" aria-label={t('nav.expand')} aria-expanded={false} onClick={onToggle} className="q-nav-brand-toggle">
                <span className="q-nav-brand-mark"><QuolyMark size={28} /></span>
                <span className="q-nav-brand-icon"><Icon name="sidebar-simple" size={20} /></span>
              </button>
              <span role="tooltip" className="q-nav-tip">{t('nav.expand')}</span>
            </div>
          )
        : (
            <div className="q-nav-head">
              <span className="q-nav-logo"><QuolyMark size={28} /></span>
              <span aria-hidden="true" className="q-nav-wordmark">{'Quoly'}</span>
              {onToggle && (
                <button type="button" aria-label={t('nav.collapse')} aria-expanded onClick={onToggle} className="q-nav-toggle">
                  <Icon name="sidebar-simple" size={20} />
                </button>
              )}
            </div>
          )}
      <div className="q-nav-gap" />
      {onSearch && (
        <>
          <SidebarItem
            icon="magnifying-glass"
            label={t('nav.search')}
            tooltip={`${t('nav.search')} (${searchShortcut})`}
            shortcut={searchShortcut}
            keyShortcuts="Meta+K Control+K"
            collapsed={collapsed}
            onClick={onSearch}
          />
          <div className="q-nav-gap" />
        </>
      )}
      <nav aria-label={t('nav.primary')} className="q-nav-list">
        {items.map((it) => (
          <SidebarItem
            key={it.value}
            icon={it.icon}
            label={it.label}
            count={it.count}
            countLabel={it.countLabel}
            disabled={it.disabled}
            to={it.to}
            active={!settingsActive && it.value === active}
            collapsed={collapsed}
            onClick={() => onNavigate?.(it.value)}
          />
        ))}
      </nav>
      <span className="q-nav-flex" />
      <div className="q-nav-list">
        <SidebarItem icon="gear-six" label={t('nav.settings')} active={settingsActive} collapsed={collapsed} to={settingsTo} onClick={onSettings} />
        <NavAccount collapsed={collapsed} user={user} workspace={workspace} avatarSrc={avatarSrc} onAccount={onAccount} accountMenu={accountMenu} />
      </div>
    </aside>
  )
}
