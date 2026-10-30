import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IconButton, MenuItem, MenuSeparator, MobileNavDrawer, QuolyMark, Sidebar, type NavItem } from '../../design-system'
import CommandPalette, { useCommandPalette } from './CommandPalette'
import type { ShellLayout } from './useShellLayout'
import { useAuth } from '../../hooks/useAuth'
import { useRFQs } from '../../hooks/useRFQs'
import { useAllQuotes } from '../../hooks/useQuotes'
import { displayNameFromEmail } from '../../lib/displayName'

function countRequestsNeedingBuyer(rfqs: { status: string; supplier_stage_counts?: Record<string, number> }[]) {
  return rfqs.filter(rfq => {
    if (rfq.status === 'draft' || rfq.status === 'decided') return false
    const n = rfq.supplier_stage_counts?.buyer_action_required ?? 0
    return n > 0
  }).length
}

/** Destino activo del menú según la ruta. */
function activeFor(pathname: string) {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/requests') || pathname.startsWith('/rfqs')) return 'rfq'
  if (pathname.startsWith('/quotations') || pathname.startsWith('/quotes')) return 'quotes'
  if (pathname.startsWith('/suppliers')) return 'suppliers'
  return undefined
}

export default function Navbar({ layout, collapsed, onToggle }: { layout: ShellLayout, collapsed: boolean, onToggle: () => void }) {
  const { t } = useTranslation('common')
  const { user, logout } = useAuth()
  const { data: rfqs } = useRFQs()
  const { data: allQuotes } = useAllQuotes()
  const location = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const palette = useCommandPalette()
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const requestsAttention = useMemo(() => countRequestsNeedingBuyer(rfqs ?? []), [rfqs])
  const toReviewCount = allQuotes?.filter(q => q.status === 'draft').length ?? 0
  const workspaceOrg = useMemo(() => {
    for (const rfq of rfqs ?? []) {
      const company = rfq.header_data?.buyer_company?.trim()
      if (company) return company
    }
    return undefined
  }, [rfqs])

  const items: NavItem[] = [
    { value: 'home', label: t('nav.dashboard'), icon: 'house', to: '/' },
    { value: 'rfq', label: t('nav.rfqs'), icon: 'files', to: '/requests', count: requestsAttention || undefined },
    { value: 'quotes', label: t('nav.quotations'), icon: 'quotes', to: '/quotations', count: toReviewCount || undefined },
    { value: 'suppliers', label: t('nav.suppliers'), icon: 'users-three', to: '/suppliers' },
  ]
  const active = activeFor(location.pathname)
  const settingsActive = location.pathname.startsWith('/settings')
  const displayName = user ? displayNameFromEmail(user.email) : ''
  const accountMenu = (
    <>
      <MenuItem icon="gear-six" onSelect={() => navigate('/settings')}>{t('nav.settings')}</MenuItem>
      <MenuSeparator />
      <MenuItem icon="door-open" tone="destructive" onSelect={logout}>{t('nav.signOut')}</MenuItem>
    </>
  )
  const account = { user: displayName, workspace: workspaceOrg, avatarSrc: user?.avatar_url, accountMenu }

  return (
    <>
      {layout === 'mobile'
        ? (
          <>
            <header className="app-topbar">
              <IconButton icon="list" label={t('nav.openMenu')} size="lg" onClick={() => setDrawerOpen(true)} />
              <span className="app-topbar-brand">
                <QuolyMark size={24} />
                <span className="app-topbar-name">{t('nav.brand')}</span>
              </span>
            </header>
            <MobileNavDrawer
              open={drawerOpen}
              onOpenChange={setDrawerOpen}
              items={items}
              active={active}
              settingsActive={settingsActive}
              settingsTo="/settings"
              onSearch={() => palette.setOpen(true)}
              {...account}
            />
          </>
        )
        : (
          <div className="app-sidebar-slot">
            <Sidebar
              collapsed={collapsed}
              onToggle={onToggle}
              items={items}
              active={active}
              settingsActive={settingsActive}
              settingsTo="/settings"
              onSearch={() => palette.setOpen(true)}
              searchShortcut={isMac ? '⌘K' : 'Ctrl K'}
              height="100dvh"
              {...account}
            />
          </div>
        )}
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
    </>
  )
}
