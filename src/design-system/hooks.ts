import { useLayoutEffect, useRef, useState } from 'react'

/** Ancho del elemento (ResizeObserver) para cortes responsivos por contenedor. */
export function useElementWidth<T extends HTMLElement>(initial = 1200) {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(initial)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}
