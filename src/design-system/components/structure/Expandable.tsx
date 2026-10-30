import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'

export type ExpandableProps = {
  title: ReactNode
  meta?: ReactNode
  children?: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onToggle?: (open: boolean) => void
  divider?: boolean
  className?: string
  style?: CSSProperties
}

/** Disclosure: cabecera 48 + panel animado (grid-rows 0fr→1fr). */
export function Expandable({ title, meta, children, defaultOpen = false, open: controlled, onToggle, divider = true, className, style }: ExpandableProps) {
  const [own, setOwn] = useState(defaultOpen)
  const open = controlled ?? own
  const id = useId()
  const toggle = () => {
    const next = !open
    if (controlled === undefined) setOwn(next)
    onToggle?.(next)
  }
  return (
    <div className={cx('q-expandable', open && 'is-open', divider && 'has-divider', className)} style={style}>
      <h4 className="q-expandable-heading">
        <button type="button" aria-expanded={open} aria-controls={`${id}p`} id={`${id}h`} onClick={toggle} className="q-expandable-trigger">
          <span className="q-expandable-text">
            <span className="q-expandable-title">{title}</span>
            {meta && <span className="q-expandable-meta">{meta}</span>}
          </span>
          <span aria-hidden="true" className="q-expandable-chevron"><Icon name="caret-down" size={16} /></span>
        </button>
      </h4>
      <div id={`${id}p`} role="region" aria-labelledby={`${id}h`} inert={!open} aria-hidden={!open} className="q-expandable-panel">
        <div className="q-expandable-clip">
          <div className="q-expandable-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
