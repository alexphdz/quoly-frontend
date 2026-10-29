import type { CSSProperties } from 'react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'
import { QuolyMark } from './QuolyMark'
import { NavAccount, type NavAccountProps, type NavItem } from './Sidebar'
import { SidebarItem } from './SidebarItem'

export type MobileNavDrawerProps = NavAccountProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: NavItem[]
  active?: string
  onNavigate?: (value: string) => void
  onSearch?: () => void
  settingsActive?: boolean
  settingsTo?: string
  onSettings?: () => void
  className?: string
  style?: CSSProperties
}

/** Cajón lateral móvil: misma anatomía que el sidebar, filas de 48px, foco atrapado y devuelto. */
export function MobileNavDrawer({
  open, onOpenChange, items, active, onNavigate, onSearch, settingsActive = false, settingsTo, onSettings,
  user, workspace, avatarSrc, onAccount, accountMenu, className, style,
}: MobileNavDrawerProps) {
  const { t } = useTranslation('ds')
  const close = () => onOpenChange(false)
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="q-drawer-scrim is-nav" />
        <Dialog.Content aria-describedby={undefined} className={cx('q-nav-drawer', className)} style={style}>
          <Dialog.Title className="q-sr-only">{t('nav.label')}</Dialog.Title>
          <div className="q-nav-head is-drawer">
            <span className="q-nav-logo"><QuolyMark size={28} /></span>
            <span aria-hidden="true" className="q-nav-wordmark">{'Quoly'}</span>
            <Dialog.Close aria-label={t('nav.close')} className="q-nav-drawer-close">
              <Icon name="x" size={20} />
            </Dialog.Close>
          </div>
          <div className="q-nav-gap is-sm" />
          {onSearch && (
            <>
              <SidebarItem
                variant="drawer"
                icon="magnifying-glass"
                label={t('nav.search')}
                onClick={() => {
                  close()
                  onSearch()
                }}
              />
              <div className="q-nav-gap is-sm" />
            </>
          )}
          <nav aria-label={t('nav.primary')} className="q-nav-list is-scroll">
            {items.map((it) => (
              <SidebarItem
                key={it.value}
                variant="drawer"
                icon={it.icon}
                label={it.label}
                count={it.count}
                countLabel={it.countLabel}
                disabled={it.disabled}
                to={it.to}
                active={!settingsActive && it.value === active}
                onClick={() => {
                  onNavigate?.(it.value)
                  close()
                }}
              />
            ))}
          </nav>
          <div className="q-nav-list">
            <SidebarItem
              variant="drawer"
              icon="gear-six"
              label={t('nav.settings')}
              active={settingsActive}
              to={settingsTo}
              onClick={() => {
                onSettings?.()
                close()
              }}
            />
            <NavAccount variant="drawer" user={user} workspace={workspace} avatarSrc={avatarSrc} onAccount={onAccount} accountMenu={accountMenu} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
