import { useEffect, useState, type CSSProperties } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar, { type ShellLayout } from './Navbar'
import { useInboundStream } from '../../hooks/useInboundStream'

const COLLAPSE_KEY = 'quoly.nav.collapsed'

/** Rangos del shell: mobile < 640 (barra superior + cajón) · tablet < 1200 (menú contraído) · desktop. */
function layoutFor(w: number): ShellLayout {
  return w < 640 ? 'mobile' : w < 1200 ? 'tablet' : 'desktop'
}

function useShellLayout() {
  const [layout, setLayout] = useState<ShellLayout>(() => layoutFor(typeof window === 'undefined' ? 1440 : window.innerWidth))
  useEffect(() => {
    const onResize = () => setLayout(layoutFor(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return layout
}

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
