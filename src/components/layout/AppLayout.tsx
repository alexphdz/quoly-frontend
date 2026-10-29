import { useState, type CSSProperties } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import { useShellLayout } from './useShellLayout'
import { useInboundStream } from '../../hooks/useInboundStream'

const COLLAPSE_KEY = 'quoly.nav.collapsed'

/** Preferencia explícita del usuario; null = según el ancho. */
function readCollapsed(): boolean | null {
  try {
    const v = localStorage.getItem(COLLAPSE_KEY)
    return v == null ? null : v === '1'
  } catch {
    return null
  }
}

export default function AppLayout() {
  useInboundStream()
  const layout = useShellLayout()
  const [pref, setPref] = useState<boolean | null>(readCollapsed)
  const collapsed = pref ?? layout === 'tablet'
  const toggle = () => {
    const next = !collapsed
    setPref(next)
    try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0') } catch { /* sin almacenamiento: solo esta sesión */ }
  }
  // Las páginas legacy calculan su ancho con --sidebar-width.
  const sidebarWidth = layout === 'mobile' ? '0px' : collapsed ? 'var(--nav-width-collapsed)' : 'var(--nav-width)'

  return (
    <div className={`app-shell is-${layout}`} style={{ '--sidebar-width': sidebarWidth } as CSSProperties}>
      <Navbar layout={layout} collapsed={collapsed} onToggle={toggle} />
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
