import { useEffect, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useFormat } from '../../../lib/format'

/** Orden de series Colorfield; se mantiene el mismo mapeo categoría → color en toda la app. */
export const SERIES = ['violet', 'coral', 'yellow', 'mint', 'blue', 'pink', 'olive', 'teal'] as const
export type SeriesColor = (typeof SERIES)[number]

/** Nombre Colorfield → var(--chart-*); cualquier otro string se usa como color CSS. Sin color → serie por índice. */
export function chartColor(c?: string | number | null, i = 0) {
  if (typeof c === 'string' && c) return (SERIES as readonly string[]).includes(c) ? `var(--chart-${c})` : c
  const idx = typeof c === 'number' ? c : i
  return `var(--chart-${SERIES[idx % SERIES.length]})`
}

/** Formato numérico en el locale de la app; null/NaN → “—”. */
export function useChartFormat() {
  const { locale } = useFormat()
  return (v: number | null | undefined, dec?: number) => {
    if (v == null || Number.isNaN(v)) return '—'
    return new Intl.NumberFormat(locale, { minimumFractionDigits: dec ?? 0, maximumFractionDigits: dec ?? 2 }).format(v)
  }
}

export function niceStep(span: number, count: number) {
  const raw = (span || 1) / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const n = raw / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag
}

/** Escala desde cero con ~count intervalos “redondos”. */
export function niceTicks(max: number, count = 4) {
  const m = max > 0 ? max : 1
  const step = niceStep(m, count)
  const top = Math.max(step, Math.ceil(m / step - 1e-9) * step)
  const ticks: number[] = []
  for (let v = 0; v <= top + step * 1e-6; v += step) ticks.push(+v.toFixed(6))
  return { top, ticks, step }
}

/** Rango “redondo” que cubre [min, max] (no parte de cero). */
export function niceRange(min: number, max: number, count = 4) {
  if (min === max) { min -= 1; max += 1 }
  const step = niceStep(max - min, count)
  const lo = Math.floor(min / step + 1e-9) * step
  const hi = Math.ceil(max / step - 1e-9) * step
  const ticks: number[] = []
  for (let v = lo; v <= hi + step * 1e-6; v += step) ticks.push(+v.toFixed(6))
  return { lo, hi, ticks, step }
}

/** Ancho aproximado de la columna de eje Y según las etiquetas. */
export function axisWidth(labels: string[], min = 24) {
  return Math.max(min, ...labels.map((l) => l.length * 6.4)) + 8
}

/* Modalidad de entrada: el foco por teclado activa la inspección, el clic no. */
let modality: 'pointer' | 'keyboard' = 'pointer'
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => { if (e.key === 'Tab' || e.key.startsWith('Arrow')) modality = 'keyboard' }, true)
  window.addEventListener('pointerdown', () => { modality = 'pointer' }, true)
}

/** Inspección compartida: puntero + teclado (flechas, Inicio, Fin, Escape). `forced` fija el índice para documentación. */
export function useInspect(n: number, forced?: number | null) {
  const [a, setA] = useState<number | null>(null)
  const [ring, setRing] = useState(false)
  const active = forced != null && a == null ? forced : a
  const onKeyDown = (e: KeyboardEvent) => {
    let i = a == null ? (forced ?? -1) : a
    const k = e.key
    if (k === 'ArrowRight' || k === 'ArrowDown') i = Math.min(n - 1, i + 1)
    else if (k === 'ArrowLeft' || k === 'ArrowUp') i = Math.max(0, i < 0 ? 0 : i - 1)
    else if (k === 'Home') i = 0
    else if (k === 'End') i = n - 1
    else if (k === 'Escape') { setA(null); return }
    else return
    e.preventDefault()
    setRing(true)
    setA(i)
  }
  const bind = {
    tabIndex: 0,
    onKeyDown,
    onFocus: () => { if (modality === 'keyboard') { setRing(true); setA((x) => x ?? forced ?? 0) } },
    onBlur: () => { setRing(false); setA(null) },
    onMouseLeave: () => { if (!ring) setA(null) },
  }
  return { active, set: setA, ring, bind }
}

/** true tras el primer frame pintado: dispara la entrada una sola vez. */
export function useReveal() {
  const [on, setOn] = useState(false)
  useEffect(() => {
    let r2 = 0
    const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setOn(true)) })
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2) }
  }, [])
  return on
}

/** Tabla de datos solo para lectores de pantalla. */
export function SrTable({ caption, columns, rows }: { caption?: ReactNode, columns: ReactNode[], rows: ReactNode[][] }) {
  return (
    <table className="q-sr-only">
      {caption && <caption>{caption}</caption>}
      <thead><tr>{columns.map((c, i) => <th key={i} scope="col">{c}</th>)}</tr></thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((v, j) => (j === 0 ? <th key={j} scope="row">{v}</th> : <td key={j}>{v}</td>))}</tr>
        ))}
      </tbody>
    </table>
  )
}

/** Anuncia el elemento inspeccionado. */
export function Live({ text }: { text?: string }) {
  return <span aria-live="polite" className="q-sr-only">{text ?? ''}</span>
}

/** Reparto por resto mayor: los porcentajes enteros suman 100. */
export function sharePct(vals: (number | null | undefined)[]) {
  const t = vals.reduce<number>((a, v) => a + (v || 0), 0)
  if (!t) return vals.map(() => 0)
  const raw = vals.map((v) => ((v || 0) / t) * 100)
  const fl = raw.map(Math.floor)
  let rem = 100 - fl.reduce((a, b) => a + b, 0)
  raw.map((r, i) => [r - fl[i], i] as const).sort((x, y) => y[0] - x[0]).forEach(([, i]) => { if (rem > 0) { fl[i]++; rem-- } })
  return fl
}
