import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

/** Acentos disponibles. 'brand' = rosa Quoly (sin atributo data-accent).
    Las rampas alternativas viven en design-system/tokens/accent.css; el tono
    700 de todas pasa AA con texto blanco (botón primario en claro). */
export const ACCENTS = ['brand', 'violet', 'blue', 'teal', 'mint', 'pink', 'olive'] as const
export type AccentName = (typeof ACCENTS)[number]

/** Swatch representativo por acento (tono 500 light) para los selectores. */
export const ACCENT_SWATCH: Record<AccentName, string> = {
  brand: '#F34D64',
  violet: '#9A83EC',
  blue: '#649BEB',
  teal: '#45A8AB',
  mint: '#4DAA90',
  pink: '#C37CAA',
  olive: '#8AA249',
}

const ThemeContext = createContext<{
  theme: ResolvedTheme
  preference: ThemePreference
  accent: AccentName
  toggleTheme: () => void
  setTheme: (theme: ThemePreference) => void
  setAccent: (accent: AccentName) => void
} | null>(null)

function readPreference(): ThemePreference {
  const stored = window.localStorage.getItem('quoly_theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  // Default to the light (near-white) theme rather than following the OS, so the
  // brand reads the same for everyone on first visit. Users can still switch.
  return 'light'
}

function readAccent(): AccentName {
  const stored = window.localStorage.getItem('quoly_accent')
  return (ACCENTS as readonly string[]).includes(stored ?? '') ? (stored as AccentName) : 'brand'
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => readPreference())
  const [theme, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readPreference()))
  const [accent, setAccentState] = useState<AccentName>(() => readAccent())

  useEffect(() => {
    const next = resolveTheme(preference)
    setResolved(next)
    document.documentElement.dataset.theme = next
    window.localStorage.setItem('quoly_theme', preference)
  }, [preference])

  useEffect(() => {
    if (accent === 'brand') delete document.documentElement.dataset.accent
    else document.documentElement.dataset.accent = accent
    window.localStorage.setItem('quoly_accent', accent)
  }, [accent])

  useEffect(() => {
    if (preference !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const next = media.matches ? 'dark' : 'light'
      setResolved(next)
      document.documentElement.dataset.theme = next
    }
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [preference])

  const value = useMemo(() => ({
    theme,
    preference,
    accent,
    setTheme: setPreference,
    setAccent: setAccentState,
    toggleTheme: () => setPreference(theme === 'dark' ? 'light' : 'dark'),
  }), [theme, preference, accent])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used within ThemeProvider')
  return value
}
