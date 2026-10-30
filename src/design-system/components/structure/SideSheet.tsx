import type { CSSProperties, ReactNode } from 'react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { IconButton } from '../actions/IconButton'

export type SideSheetProps = {
  open?: boolean
  onClose?: () => void
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  width?: number | string
  /** false = no bloquea la página (sin scrim ni foco atrapado). */
  modal?: boolean
  className?: string
  style?: CSSProperties
}

/** Hoja lateral derecha para detalle o edición sin perder el contexto. */
export function SideSheet({ open = true, onClose, title, description, children, footer, width = 'var(--struct-sheet-width)', modal = true, className, style }: SideSheetProps) {
  const { t } = useTranslation('ds')
  return (
    <Dialog.Root open={open} modal={modal} onOpenChange={(next) => !next && onClose?.()}>
      <Dialog.Portal>
        {modal && <Dialog.Overlay className="q-overlay-scrim" />}
        <Dialog.Content
          aria-describedby={undefined}
          className={cx('q-sheet', !modal && 'is-modeless', className)}
          style={{ width, ...style }}
          onInteractOutside={modal ? undefined : (e) => e.preventDefault()}
        >
          <header className="q-sheet-header">
            <div className="q-sheet-heading">
              <Dialog.Title className="q-dialog-title">{title}</Dialog.Title>
              {description && <p className="q-sheet-description">{description}</p>}
            </div>
            <Dialog.Close asChild>
              <IconButton icon="x" label={t('actions.close')} />
            </Dialog.Close>
          </header>
          <div className="q-sheet-body">{children}</div>
          {footer && <footer className="q-sheet-footer">{footer}</footer>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
