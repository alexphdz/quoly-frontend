import { useEffect, useState } from 'react'

export type ShellLayout = 'mobile' | 'tablet' | 'desktop'

/** Rangos de los prototipos: mobile < 640 · tablet < 1200 · desktop. */
export function layoutFor(w: number): ShellLayout {
  return w < 640 ? 'mobile' : w < 1200 ? 'tablet' : 'desktop'
}

export function useShellLayout() {
  const [layout, setLayout] = useState<ShellLayout>(() => layoutFor(typeof window === 'undefined' ? 1440 : window.innerWidth))
  useEffect(() => {
    const onResize = () => setLayout(layoutFor(window.innerWidth))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return layout
}
