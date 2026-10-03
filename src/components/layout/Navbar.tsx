import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DropdownMenu } from 'radix-ui'
import { Icon } from '../ds'
import { Avatar } from '../ui'
import CommandPalette, { useCommandPalette } from './CommandPalette'
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

function Item({
  to,
  icon,
  label,
  count,
  end,
}: {
  to: string
  icon: string
  label: string
  count?: number
  end?: boolean
}) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}>
      <Icon name={icon} size={18} className="nav-item-icon" />
      <span className="nav-item-text">{label}</span>
      {count != null && count > 0 && <span className="nav-badge">{count}</span>}
    </NavLink>
  )
}

export default function Navbar() {
  const { t } = useTranslation('common')
  const { user, logout } = useAuth()
  const { data: rfqs } = useRFQs()
  const { data: allQuotes } = useAllQuotes()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const palette = useCommandPalette()
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const requestsAttention = useMemo(
    () => countRequestsNeedingBuyer(rfqs ?? []),
    [rfqs],
  )
  const toReviewCount = allQuotes?.filter(q => q.status === 'draft').length ?? 0
  const workspaceOrg = useMemo(() => {
    const list = rfqs ?? []
    for (const rfq of list) {
      const company = rfq.header_data?.buyer_company?.trim()
      if (company) return company
    }
    return null
  }, [rfqs])

  const displayName = user ? displayNameFromEmail(user.email) : ''

  return (
    <>
      <header className="mobile-bar">
        <button
          type="button"
          className="mobile-menu"
          aria-expanded={open}
          aria-controls="app-nav"
          aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          onClick={() => setOpen(value => !value)}
        >
          <Icon name={open ? 'close' : 'menu'} size={18} />
        </button>
        <Link to="/" className="mobile-brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-name">Quoly</span>
        </Link>
      </header>

      {open && (
        <button type="button" className="sidebar-scrim" aria-label={t('nav.closeMenu')} onClick={() => setOpen(false)} />
      )}

      <aside id="app-nav" className={`app-sidebar${open ? ' is-open' : ''}`}>
        <Link to="/" className="sidebar-brand" aria-label={t('nav.brand')}>
          <span className="brand-mark" aria-hidden="true" />
        </Link>

        <div className="sidebar-actions">
          <button type="button" className={`sidebar-search${palette.open ? ' is-open' : ''}`} onClick={() => palette.setOpen(true)}>
            <Icon name="search" size={16} />
            <span>{t('palette.search')}</span>
            <kbd>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
        </div>

        <nav className="nav-list nav-list-main" aria-label={t('nav.main')}>
          <Item to="/" end icon="home" label={t('nav.dashboard')} />
          <Item to="/requests" icon="files" label={t('nav.rfqs')} count={requestsAttention} />
          <Item to="/quotations" icon="quotes" label={t('nav.quotations')} count={toReviewCount} />
          <Item to="/suppliers" icon="suppliers" label={t('nav.suppliers')} />
        </nav>

        <div className="sidebar-bottom">
          <nav className="nav-list" aria-label={t('nav.settings')}>
            <Item to="/settings" icon="sliders" label={t('nav.settings')} />
          </nav>

          {user && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button type="button" className="sidebar-user-button">
                  <span className="sidebar-avatar" aria-hidden="true">
                    <Avatar name={displayName} src={user.avatar_url} size="sm" />
                  </span>
                  <span className="sidebar-user-copy">
                    <span className="sidebar-user-name">{displayName}</span>
                    <span className="sidebar-user-email truncate">{user.email}</span>
                    {workspaceOrg ? (
                      <span className="sidebar-user-org">
                        <Icon name="apartment" size={12} />
                        <span className="sidebar-user-org-name">{workspaceOrg}</span>
                      </span>
                    ) : null}
                  </span>
                  <Icon name="unfold_more" size={14} />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content side="top" align="start" sideOffset={6} className="qy-popover" style={{ minWidth: 200 }}>
                  <DropdownMenu.Item className="qy-item" onSelect={() => navigate('/settings')}>
                    <Icon name="sliders" size={16} />{t('nav.settings')}
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="qy-menu-sep" />
                  <DropdownMenu.Item className="qy-item qy-item-danger" onSelect={logout}>
                    <Icon name="logout" size={16} />{t('nav.signOut')}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </aside>
      <CommandPalette open={palette.open} onOpenChange={palette.setOpen} />
    </>
  )
}
