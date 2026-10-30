import type { CSSProperties, ReactNode } from 'react'
import { Tooltip as RadixTooltip } from 'radix-ui'
import { cx } from '../../utils'

export type TooltipBubbleProps = {
  id?: string
  children?: ReactNode
  /** Atajo de teclado mostrado tras el texto. */
  shortcut?: string
  className?: string
  style?: CSSProperties
}

/** Burbuja visual del tooltip (superficie inversa). */
export function TooltipBubble({ id, children, shortcut, className, style }: TooltipBubbleProps) {
  return (
    <span id={id} role="tooltip" className={cx('q-tooltip', className)} style={style}>
      <span>{children}</span>
      {shortcut && <span className="q-tooltip-shortcut">{shortcut}</span>}
    </span>
  )
}

export type TooltipProps = {
  /** Texto del tooltip; complementa, nunca sustituye, a una etiqueta visible o aria-label. */
  content: ReactNode
  shortcut?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  /** Elemento disparador (debe aceptar ref y foco). */
  children: ReactNode
}

export function Tooltip({ content, shortcut, side = 'top', align = 'center', delayDuration = 400, children }: TooltipProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content side={side} align={align} sideOffset={6} className="q-tooltip-layer">
            <span className="q-tooltip">
              <span>{content}</span>
              {shortcut && <span className="q-tooltip-shortcut">{shortcut}</span>}
            </span>
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  )
}
