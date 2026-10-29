import { useId, type CSSProperties, type ReactNode } from 'react'
import { Popover as RadixPopover } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'

export type PopoverPanelProps = {
  title?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  onClose?: () => void
  closeLabel?: string
  width?: number
  labelledBy?: string
  className?: string
  style?: CSSProperties
}

/** Panel flotante: título, contenido y pie de acciones. */
export function PopoverPanel({ title, children, footer, onClose, closeLabel, width = 320, labelledBy, className, style }: PopoverPanelProps) {
  const { t } = useTranslation('ds')
  const id = useId()
  return (
    <div role="dialog" aria-labelledby={title ? id : labelledBy} className={cx('q-popover', className)} style={{ width, ...style }}>
      <div className="q-popover-body">
        {(title || onClose) && (
          <div className="q-popover-head">
            <div id={id} className="q-popover-title">{title}</div>
            {onClose && (
              <button type="button" aria-label={closeLabel ?? t('actions.close')} onClick={onClose} className="q-dismiss">
                <Icon name="x" size={16} />
              </button>
            )}
          </div>
        )}
        {children && <div className="q-popover-content">{children}</div>}
      </div>
      {footer && <div className="q-popover-footer">{footer}</div>}
    </div>
  )
}

export type PopoverProps = Omit<PopoverPanelProps, 'onClose'> & {
  /** Elemento disparador. */
  trigger: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Muestra el botón de cierre en la cabecera. */
  closable?: boolean
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

/** Popover anclado (Radix) con el panel Quoly. */
export function Popover({ trigger, open, defaultOpen, onOpenChange, closable = false, side = 'bottom', align = 'start', ...panel }: PopoverProps) {
  const { t } = useTranslation('ds')
  return (
    <RadixPopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content side={side} align={align} sideOffset={6} className="q-popover-layer">
          <PopoverPanel {...panel} />
          {closable && (
            <RadixPopover.Close aria-label={panel.closeLabel ?? t('actions.close')} className="q-dismiss q-popover-close">
              <Icon name="x" size={16} />
            </RadixPopover.Close>
          )}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
