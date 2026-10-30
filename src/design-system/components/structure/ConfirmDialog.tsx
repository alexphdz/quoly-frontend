import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../actions/Button'
import { Dialog } from './Dialog'

export type ConfirmDialogProps = {
  open?: boolean
  title: ReactNode
  description?: ReactNode
  /** Resumen de lo que se confirma (etiqueta → valor). */
  details?: Array<{ label: ReactNode, value: ReactNode }>
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  /** destructive = confirmación con relleno de error. */
  tone?: 'default' | 'destructive'
  /** Acción en curso: bloquea cierre y muestra carga. */
  pending?: boolean
  inline?: boolean
  className?: string
  style?: CSSProperties
}

/** Confirmación (alertdialog) de una acción con consecuencias. */
export function ConfirmDialog({
  open = true, title, description, details = [], confirmLabel, cancelLabel, onConfirm, onCancel,
  tone = 'default', pending = false, inline, className, style,
}: ConfirmDialogProps) {
  const { t } = useTranslation('ds')
  return (
    <Dialog
      role="alertdialog"
      open={open}
      onClose={pending ? undefined : onCancel}
      dismissible={!pending}
      width="var(--struct-confirm)"
      title={title}
      description={description}
      inline={inline}
      className={className}
      style={style}
      footer={(
        <>
          <Button variant="secondary" disabled={pending} onClick={onCancel}>{cancelLabel ?? t('confirm.cancel')}</Button>
          <Button variant={tone === 'destructive' ? 'destructive-strong' : 'primary'} loading={pending} disabled={pending} onClick={onConfirm}>
            {confirmLabel ?? t('confirm.confirm')}
          </Button>
        </>
      )}
    >
      {details.length > 0 && (
        <dl className="q-confirm-details">
          {details.map((d, i) => (
            <div key={i} className="q-confirm-detail">
              <dt>{d.label}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </Dialog>
  )
}
