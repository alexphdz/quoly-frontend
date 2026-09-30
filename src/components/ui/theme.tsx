import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type ThemePreference = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: ResolvedTheme
  preference: ThemePreference
  toggleTheme: () => void
  setTheme: (theme: ThemePreference) => void
} | null>(null)

function readPreference(): ThemePreference {
  const stored = window.localStorage.getItem('quoly_theme')
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  return 'system'
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => readPreference())
  const [theme, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readPreference()))

  useEffect(() => {
    const next = resolveTheme(preference)
    setResolved(next)
    document.documentElement.dataset.theme = next
    window.localStorage.setItem('quoly_theme', preference)
  }, [preference])

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
    setTheme: setPreference,
    toggleTheme: () => setPreference(theme === 'dark' ? 'light' : 'dark'),
  }), [theme, preference])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme must be used within ThemeProvider')
  return value
}
