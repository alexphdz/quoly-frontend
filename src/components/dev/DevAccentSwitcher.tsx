import { useState, type CSSProperties } from 'react'
import { ACCENTS, ACCENT_SWATCH, useTheme } from '../ui/theme'

/**
 * Switcher flotante de acentos — SOLO desarrollo (gateado con import.meta.env.DEV
 * en App.tsx; Vite lo elimina del bundle de producción). Permite probar cada
 * acento y light/dark en cualquier pantalla sin pasar por Settings.
 * La elección persiste en localStorage (quoly_accent / quoly_theme), igual que
 * si se hubiera elegido en Settings.
 */
export default function DevAccentSwitcher() {
  const { accent, setAccent, theme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(true)

  const wrap: CSSProperties = {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    boxShadow: 'var(--elevation-2)',
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Acentos (dev)"
        style={{ ...wrap, padding: 0, width: 28, height: 28, justifyContent: 'center', cursor: 'pointer' }}
      >
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: ACCENT_SWATCH[accent] }} />
      </button>
    )
  }

  return (
    <div style={wrap} data-dev-accent-switcher>
      {ACCENTS.map(name => (
        <button
          key={name}
          type="button"
          title={name}
          onClick={() => setAccent(name)}
          className={`st-accent-swatch${accent === name ? ' is-active' : ''}`}
          style={{ '--swatch': ACCENT_SWATCH[name] } as CSSProperties}
        />
      ))}
      <span style={{ width: 1, height: 16, background: 'var(--color-border)' }} />
      <button
        type="button"
        title={theme === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}
        onClick={toggleTheme}
        style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 14, lineHeight: 1, padding: 2 }}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <button
        type="button"
        title="Ocultar"
        onClick={() => setOpen(false)}
        style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 12, lineHeight: 1, padding: 2 }}
      >
        {'×'}
      </button>
    </div>
  )
}
