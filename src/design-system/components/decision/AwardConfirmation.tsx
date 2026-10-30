import { useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { Dialog } from 'radix-ui'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Button } from '../actions/Button'
import { useAmount } from '../comparison/shared'
import { ValidationMessage } from '../feedback/ValidationMessage'
import type { DecisionPrice } from './shared'

export type AwardConfirmationProps = {
  open?: boolean
  onCancel?: () => void
  /** Puede devolver una Promise: pendiente bloquea duplicados y cierre; el rechazo conserva el diálogo con el error. */
  onConfirm?: () => void | Promise<unknown>
  supplier: string
  reference?: string
  price?: DecisionPrice | null
  original?: string
  context?: string[]
  inline?: boolean
  initialError?: string
  title?: string
  description?: string
  className?: string
  style?: CSSProperties
}

/** Confirmación explícita de la adjudicación (registro final). */
export function AwardConfirmation({
  open = true, onCancel, onConfirm, supplier, reference, price, original, context = [], inline = false, initialError, title, description, className, style,
}: AwardConfirmationProps) {
  const { t } = useTranslation('ds')
  const fmt = useAmount()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(initialError ?? null)
  const alive = useRef(true)
  const id = useId()
  useEffect(() => () => {
    alive.current = false
  }, [])
  useEffect(() => {
    if (open && !initialError) setError(null)
  }, [open, initialError])

  const confirm = () => {
    if (pending) return
    setError(null)
    setPending(true)
    Promise.resolve()
      .then(onConfirm)
      .then(
        () => {
          if (alive.current) setPending(false)
        },
        (e: unknown) => {
          if (!alive.current) return
          setPending(false)
          setError(e instanceof Error && e.message ? e.message : t('dec.confirm.failed'))
        },
      )
  }

  const body = (
    <>
      <span className="q-dec-eyebrow is-dialog">{t('dec.confirm.eyebrow')}</span>
      <h2 id={`${id}t`} className="q-dec-confirm-title">{title ?? t('dec.confirm.title')}</h2>
      <p id={`${id}d`} className="q-dec-confirm-description">{description ?? t('dec.confirm.description')}</p>
      <div className="q-dec-confirm-recap">
        <span className="q-dec-confirm-supplier">{supplier}</span>
        {reference && <span className="q-dec-meta is-numeric">{reference}</span>}
        <span className="q-dec-confirm-price">
          {price
            ? (
                <>
                  <span className="q-dec-confirm-price-value">{fmt(price.amount)}</span>
                  <span className="q-dec-meta">{[price.currency, price.unit].filter(Boolean).join(' ')}</span>
                </>
              )
            : <span className="q-dec-confirm-nc">{t('dec.confirm.priceNotComparable')}</span>}
        </span>
        {original && <span className="q-dec-meta is-numeric">{t('dec.original', { value: original })}</span>}
        {context.length > 0 && <span className="q-dec-meta q-dec-confirm-context">{context.map((c, i) => <span key={i}>{c}</span>)}</span>}
      </div>
      {error && <div role="alert" className="q-dec-confirm-error"><ValidationMessage tone="error">{error}</ValidationMessage></div>}
      <div className="q-dec-confirm-actions">
        <Button variant="secondary" disabled={pending} onClick={onCancel}>{t('confirm.cancel')}</Button>
        <Button loading={pending} disabled={pending} onClick={confirm}>{pending ? t('dec.confirm.recording') : t('dec.confirm.record')}</Button>
      </div>
    </>
  )

  if (inline) {
    return (
      <div role="dialog" aria-labelledby={`${id}t`} aria-describedby={`${id}d`} aria-busy={pending || undefined} className={cx('q-dec-confirm', 'is-inline', className)} style={style}>
        {body}
      </div>
    )
  }
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && !pending && onCancel?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="q-overlay-scrim" />
        <div className="q-dialog-layer is-tight">
          <Dialog.Content
            aria-labelledby={`${id}t`}
            aria-describedby={`${id}d`}
            aria-busy={pending || undefined}
            onEscapeKeyDown={(e) => {
              if (pending) e.preventDefault()
            }}
            onPointerDownOutside={(e) => {
              if (pending) e.preventDefault()
            }}
            className={cx('q-dec-confirm', className)}
            style={style}
          >
            <Dialog.Title className="q-sr-only">{title ?? t('dec.confirm.title')}</Dialog.Title>
            {body}
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
