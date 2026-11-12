import { useState, useEffect, type CSSProperties } from 'react'
import { Outlet, useLocation, useMatches } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Navbar from './Navbar'
import Seo from '../seo/Seo'
import { useShellLayout } from './useShellLayout'
import { useInboundStream } from '../../hooks/useInboundStream'
import { ensureFreshToken } from '../../api/client'

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

/** Read the `titleKey` handle from the deepest matched route, if any. */
function useRouteTitleKey(): string | undefined {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle as { titleKey?: string } | undefined
    if (handle?.titleKey) return handle.titleKey
  }
  return undefined
}

export default function AppLayout() {
  useInboundStream()
  useEffect(() => { ensureFreshToken() }, [])
  const { t } = useTranslation('common')
  const titleKey = useRouteTitleKey()
  const layout = useShellLayout()
  const location = useLocation()
  const [pref, setPref] = useState<boolean | null>(readCollapsed)
  // En tablet (< 1200) no hay espacio para la barra expandida + contenido usable:
  // se contrae siempre (responsivo). Excepción: en el Agente la lista de
  // conversaciones vive dentro del sidebar, así que ahí el usuario puede
  // expandirlo (por defecto contraído; su preferencia aplica).
  const onAsistente = location.pathname.startsWith('/asistente')
  const collapsed = layout === 'tablet'
    ? (onAsistente ? (pref ?? true) : true)
    : (pref ?? false)
  const toggle = () => {
    const next = !collapsed
    setPref(next)
    try { localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0') } catch { /* sin almacenamiento: solo esta sesión */ }
  }
  // Las páginas legacy calculan su ancho con --sidebar-width.
  const sidebarWidth = layout === 'mobile' ? '0px' : collapsed ? 'var(--nav-width-collapsed)' : 'var(--nav-width)'

  return (
    <div className={`app-shell is-${layout}`} style={{ '--sidebar-width': sidebarWidth } as CSSProperties}>
      {titleKey && <Seo titleKey={titleKey} noindex />}
      <a className="skip-link" href="#app-main">{t('a11y.skipToContent')}</a>
      <Navbar layout={layout} collapsed={collapsed} onToggle={toggle} />
      <main className="app-main" id="app-main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  )
}
