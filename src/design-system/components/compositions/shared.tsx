import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

export type CompositionLayout = 'desktop' | 'tablet' | 'mobile'
export type SurfaceTreatment = 'open' | 'unified' | 'contrasting'

/** Rangos por ancho del contenedor: desktop ≥ 1000 · tablet 640–999 · mobile < 640. */
export const layoutOf = (w: number): CompositionLayout => (w >= 1000 ? 'desktop' : w >= 640 ? 'tablet' : 'mobile')

/** Cambio de contenido: 160ms de opacidad al cambiar `k`. */
export function Fade({ k, children, className, style }: { k?: string, children: ReactNode, className?: string, style?: CSSProperties }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    setOn(false)
    let r2 = 0
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setOn(true)) })
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2) }
  }, [k])
  return <div className={className} style={{ opacity: on ? 1 : 0, transition: 'opacity 160ms ease-out', minWidth: 0, ...style }}>{children}</div>
}
