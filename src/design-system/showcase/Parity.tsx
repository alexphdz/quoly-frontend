import { createElement, type ComponentType, type ReactNode } from 'react'
import * as DS from '..'
import cases from './parity-cases.json'

/* Banco de paridad (solo desarrollo): renderiza los mismos casos que el harness
   de referencia del zip de Claude Design para comparar medidas y estilos. */
type Spec = [string, Record<string, unknown>, (string | Spec)?]

const registry = DS as unknown as Record<string, ComponentType<Record<string, unknown>>>

function props(p: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, k.startsWith('on') && v === true ? () => undefined : v]))
}

function render([name, p, child]: Spec): ReactNode {
  const ours = name.includes('|') ? name.split('|')[1] : name
  const Cmp = registry[ours]
  if (!Cmp) return `missing ${ours}`
  const children = child === undefined ? undefined : typeof child === 'string' ? child : render(child)
  return createElement(Cmp, props(p), children)
}

export default function Parity() {
  return (
    <div style={{ padding: 24, display: 'grid', gap: 12, background: 'var(--color-canvas)' }}>
      {(cases as unknown as Array<[string, Spec]>).map(([id, spec]) => (
        <div key={id} data-case={id} style={{ width: 640, padding: 16, boxSizing: 'content-box', background: 'var(--color-surface)' }}>
          {render(spec)}
        </div>
      ))}
    </div>
  )
}
