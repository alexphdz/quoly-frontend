import type { CSSProperties } from 'react'

/* Quoly Intelligence Graph — símbolo canónico de procedencia IA.
   Rejilla 24: nodos A(5,12) B(11,5) C(19,9) D(15,19); aristas AB BC CD DA BD;
   trazo 1.6, nodos r 2. "extracted" = nodos sólidos, "proposed" = nodos vacíos
   con aristas recortadas al borde. Estático salvo `processing`. */
export const GRAPH_NODES: ReadonlyArray<readonly [number, number]> = [[5, 12], [11, 5], [19, 9], [15, 19]]
export const GRAPH_EDGES: ReadonlyArray<readonly [number, number]> = [[0, 1], [1, 2], [2, 3], [3, 0], [1, 3]]

function segment(a: number, b: number, cut: boolean) {
  let [x1, y1] = GRAPH_NODES[a]
  let [x2, y2] = GRAPH_NODES[b]
  if (cut) {
    const dx = x2 - x1
    const dy = y2 - y1
    const o = 2 / Math.hypot(dx, dy)
    x1 += dx * o
    y1 += dy * o
    x2 -= dx * o
    y2 -= dy * o
  }
  return { x1, y1, x2, y2 }
}

export type IntelligenceMarkProps = {
  size?: number
  variant?: 'extracted' | 'proposed'
  processing?: boolean
  color?: string
  /** Nombre accesible; omitir cuando acompaña a un texto. */
  label?: string
  className?: string
  style?: CSSProperties
}

export function IntelligenceMark({
  size = 16,
  variant = 'extracted',
  processing = false,
  color = 'var(--qi-ai)',
  label,
  className,
  style,
}: IntelligenceMarkProps) {
  const hollow = variant === 'proposed'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      data-icon={hollow ? 'quoly-proposed' : 'quoly-intelligence'}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      className={className}
      style={{ display: 'block', flexShrink: 0, color, ...style }}
    >
      {GRAPH_EDGES.map(([a, b], i) => (
        <line
          key={i}
          {...segment(a, b, hollow)}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          style={processing ? { opacity: 0.45, animation: 'var(--qi-edge-anim)', animationDelay: `${i * 360}ms` } : undefined}
        />
      ))}
      {GRAPH_NODES.map(([x, y], i) => hollow
        ? <circle key={i} cx={x} cy={y} r="2" stroke="currentColor" strokeWidth="1.6" />
        : <circle key={i} cx={x} cy={y} r="2" fill="currentColor" />)}
    </svg>
  )
}
