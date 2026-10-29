import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../../utils'

export type KbdProps = {
  keys?: string[]
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

/** Tecla o combinación de teclas. */
export function Kbd({ keys = [], children, className, style }: KbdProps) {
  const list: ReactNode[] = keys.length ? keys : [children]
  return (
    <span className={cx('q-kbd-group', className)} style={style}>
      {list.map((k, i) => <kbd key={i} className="q-kbd">{k}</kbd>)}
    </span>
  )
}
