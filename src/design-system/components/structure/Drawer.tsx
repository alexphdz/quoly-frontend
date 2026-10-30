import type { CSSProperties, ReactNode } from 'react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { IconButton } from '../actions/IconButton'

export type DrawerProps = {
  open?: boolean
  onClose?: () => void
  side?: 'right' | 'left' | 'bottom'
  title: ReactNode
  children?: ReactNode
  footer?: ReactNode
  /** Ancho (laterales) o alto máximo (bottom). */
  size?: string
  modal?: boolean
  className?: string
  style?: CSSProperties
}

/** Cajón táctil (móvil/tablet): lateral o inferior, cabecera 64 y botón de cierre 44. */
export function Drawer({ open = true, onClose, side = 'right', title, children, footer, size, modal = true, className, style }: DrawerProps) {
  const { t } = useTranslation('ds')
  const bottom = side === 'bottom'
  const geometry: CSSProperties = bottom ? { maxHeight: size ?? '85%' } : { width: size ?? 'min(400px, calc(100% - 48px))' }
  return (
    <Dialog.Root open={open} modal={modal} onOpenChange={(next) => !next && onClose?.()}>
      <Dialog.Portal>
        {modal && <Dialog.Overlay className="q-overlay-scrim is-nav" />}
        <Dialog.Content aria-describedby={undefined} className={cx('q-drawer', `is-${side}`, className)} style={{ ...geometry, ...style }}>
          <header className="q-drawer-header">
            <Dialog.Title className="q-drawer-title">{title}</Dialog.Title>
            <Dialog.Close asChild>
              <IconButton icon="x" label={t('actions.close')} size="lg" />
            </Dialog.Close>
          </header>
          <div className="q-drawer-body">{children}</div>
          {footer && <footer className="q-drawer-footer">{footer}</footer>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
