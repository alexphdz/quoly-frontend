import type { CSSProperties, ReactNode, RefObject } from 'react'
import { AlertDialog, Dialog as RadixDialog } from 'radix-ui'
import { cx } from '../../utils'

export type DialogSize = 'sm' | 'md' | 'lg'

export type DialogProps = {
  open?: boolean
  onClose?: () => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: DialogSize
  width?: number | string
  /** false = Escape y clic fuera no cierran (p. ej. acción en curso). */
  dismissible?: boolean
  /** Renderiza el panel en línea, sin capa (documentación / catálogo). */
  inline?: boolean
  /** Elemento que recibe el foco al abrir. */
  initialFocusRef?: RefObject<HTMLElement | null>
  role?: 'dialog' | 'alertdialog'
  className?: string
  style?: CSSProperties
}

const WIDTH: Record<DialogSize, string> = { sm: 'var(--struct-dialog-sm)', md: 'var(--struct-dialog-md)', lg: 'var(--struct-dialog-lg)' }

function DialogBody({ title, description, children, footer, Title, Description }: Pick<DialogProps, 'title' | 'description' | 'children' | 'footer'> & {
  Title: (p: { children: ReactNode, className: string }) => ReactNode
  Description: (p: { children: ReactNode, className: string }) => ReactNode
}) {
  return (
    <>
      {(title || description) && (
        <div className="q-dialog-head">
          {title && <Title className="q-dialog-title">{title}</Title>}
          {description && <Description className="q-dialog-description">{description}</Description>}
        </div>
      )}
      {children && <div className={cx('q-dialog-body', !(title || description) && 'is-flush')}>{children}</div>}
      {footer && <div className="q-dialog-footer">{footer}</div>}
    </>
  )
}

/** Diálogo modal centrado (Radix): foco atrapado y devuelto, Escape/scrim cierran si dismissible. */
export function Dialog({
  open = true, onClose, title, description, children, footer, size = 'md', width, dismissible = true, inline = false,
  initialFocusRef, role = 'dialog', className, style,
}: DialogProps) {
  const panelStyle = { width: width ?? WIDTH[size], ...style }

  if (inline) {
    return (
      <div role={role} className={cx('q-dialog', 'is-inline', className)} style={panelStyle}>
        <DialogBody
          title={title}
          description={description}
          footer={footer}
          Title={({ children: c, className: k }) => <h2 className={k}>{c}</h2>}
          Description={({ children: c, className: k }) => <p className={k}>{c}</p>}
        >
          {children}
        </DialogBody>
      </div>
    )
  }

  const onOpenChange = (next: boolean) => {
    if (!next && dismissible) onClose?.()
  }
  const focusInitial = initialFocusRef
    ? (e: Event) => {
        e.preventDefault()
        initialFocusRef.current?.focus()
      }
    : undefined

  if (role === 'alertdialog') {
    return (
      <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="q-overlay-scrim" />
          <div className="q-dialog-layer">
            <AlertDialog.Content
              className={cx('q-dialog', className)}
              style={panelStyle}
              onOpenAutoFocus={focusInitial}
              onEscapeKeyDown={(e) => {
                if (!dismissible) e.preventDefault()
              }}
              {...(description ? {} : { 'aria-describedby': undefined })}
            >
              <DialogBody
                title={title}
                description={description}
                footer={footer}
                Title={({ children: c, className: k }) => <AlertDialog.Title className={k}>{c}</AlertDialog.Title>}
                Description={({ children: c, className: k }) => <AlertDialog.Description className={k}>{c}</AlertDialog.Description>}
              >
                {children}
              </DialogBody>
            </AlertDialog.Content>
          </div>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    )
  }

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="q-overlay-scrim" />
        <div className="q-dialog-layer">
          <RadixDialog.Content
            className={cx('q-dialog', className)}
            style={panelStyle}
            onOpenAutoFocus={focusInitial}
            onEscapeKeyDown={(e) => {
              if (!dismissible) e.preventDefault()
            }}
            onPointerDownOutside={(e) => {
              if (!dismissible) e.preventDefault()
            }}
            {...(description ? {} : { 'aria-describedby': undefined })}
          >
            <DialogBody
              title={title}
              description={description}
              footer={footer}
              Title={({ children: c, className: k }) => <RadixDialog.Title className={k}>{c}</RadixDialog.Title>}
              Description={({ children: c, className: k }) => <RadixDialog.Description className={k}>{c}</RadixDialog.Description>}
            >
              {children}
            </DialogBody>
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
