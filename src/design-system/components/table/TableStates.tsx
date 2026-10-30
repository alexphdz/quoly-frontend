import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormat } from '../../../lib/format'
import { cx } from '../../utils'
import { Button } from '../actions/Button'
import { TextButton } from '../actions/TextButton'
import { Icon } from '../core/Icon'

export type RecoveryStateProps = {
  label?: string
  title?: ReactNode
  text?: ReactNode
  /** Puede devolver una Promise: pendiente → botón en carga; rechazo → se mantiene el error con aviso. */
  onRetry?: () => void | Promise<unknown>
  retryLabel?: string
  pendingLabel?: string
  icon?: boolean
  narrow?: boolean
}

/** Estado de recuperación integrado en el cuerpo del grid (sin tarjeta). */
export function RecoveryState({ label, title, text, onRetry, retryLabel, pendingLabel, icon = true, narrow = false }: RecoveryStateProps) {
  const { t } = useTranslation('ds')
  const { locale } = useFormat()
  const [pending, setPending] = useState(false)
  const [failedAt, setFailedAt] = useState<string | null>(null)
  const alive = useRef(true)
  useEffect(() => () => {
    alive.current = false
  }, [])

  const retry = () => {
    if (pending || !onRetry) return
    setPending(true)
    Promise.resolve()
      .then(onRetry)
      .then(
        () => {
          if (alive.current) setPending(false)
        },
        () => {
          if (!alive.current) return
          setPending(false)
          setFailedAt(new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date()))
        },
      )
  }

  return (
    <div role="alert" aria-busy={pending || undefined} className={cx('q-table-state', 'is-error', narrow && 'is-narrow')}>
      <p className="q-table-state-eyebrow">
        {icon && <Icon name="warning-circle" size={16} />}
        {label ?? t('table.error.label')}
      </p>
      <h3 className="q-table-state-title">{title ?? t('table.error.title')}</h3>
      <p className="q-table-state-text">{text ?? t('table.error.text')}</p>
      {onRetry && (
        <div className="q-table-state-retry">
          <Button variant="secondary" icon={pending ? undefined : 'arrow-clockwise'} loading={pending} disabled={pending} onClick={retry}>
            {pending ? pendingLabel ?? t('table.error.retrying') : retryLabel ?? t('table.error.retry')}
          </Button>
          <p aria-live="polite" className="q-table-state-note">{failedAt && !pending ? t('table.error.failedAgain', { time: failedAt }) : ''}</p>
        </div>
      )}
    </div>
  )
}

export type EmptyRegionProps = { label?: string, title?: ReactNode, text?: ReactNode, action?: ReactNode, narrow?: boolean }

/** Vacío: todavía no existen registros. */
export function EmptyRegion({ label, title, text, action, narrow = false }: EmptyRegionProps) {
  const { t } = useTranslation('ds')
  return (
    <div role="status" className={cx('q-table-state', 'is-empty', narrow && 'is-narrow')}>
      <p className="q-table-state-eyebrow">{label ?? t('table.empty.label')}</p>
      <h3 className="q-table-state-title">{title ?? t('table.empty.title')}</h3>
      {text && <p className="q-table-state-text">{text}</p>}
      {action && <div className="q-table-state-actions">{action}</div>}
    </div>
  )
}

export type NoResultsRegionProps = EmptyRegionProps & { onClear?: () => void, clearLabel?: string }

/** Sin resultados: hay datos pero la búsqueda o filtros no coinciden. */
export function NoResultsRegion({ label, title, text, action, onClear, clearLabel, narrow = false }: NoResultsRegionProps) {
  const { t } = useTranslation('ds')
  return (
    <div role="status" className={cx('q-table-state', 'is-no-results', narrow && 'is-narrow')}>
      <p className="q-table-state-eyebrow">{label ?? t('table.noResults.label')}</p>
      <h3 className="q-table-state-title">{title ?? t('table.noResults.title')}</h3>
      <p className="q-table-state-text">{text ?? t('table.noResults.text')}</p>
      {(action || onClear) && (
        <div className="q-table-state-actions is-text">
          {action ?? <TextButton icon="x" onClick={onClear}>{clearLabel ?? t('table.noResults.clear')}</TextButton>}
        </div>
      )}
    </div>
  )
}

const RANGE = {
  name: [140, 180], id: [70, 90], money: [80, 110], qty: [55, 80], status: [90, 120], date: [76, 96], text: [96, 150], action: [48, 60],
} as const

function pick(kind: keyof typeof RANGE, seed: number) {
  const [a, b] = RANGE[kind]
  const r = ((seed * 9301 + 49297) % 233280) / 233280
  return Math.round(a + (b - a) * r)
}

export function SkelBar({ w, h = 12, end, secondary }: { w: number, h?: number, end?: boolean, secondary?: boolean }) {
  return <span aria-hidden="true" className={cx('q-skel-bar', end && 'is-end', secondary && 'is-secondary')} style={{ width: w, height: h }} />
}

/** Esqueleto por tipo de dato con anchos deterministas. */
export function skeletonCell(type: string | undefined, row: number, col: number, end: boolean) {
  const s = row * 7 + col * 13 + 3
  if (type === 'identity') {
    return <span className="q-skel-stack"><SkelBar w={pick('name', s)} /><SkelBar w={pick('id', s + 5)} h={10} secondary /></span>
  }
  if (type === 'money') return <SkelBar w={pick('money', s)} end />
  if (type === 'number') return <SkelBar w={pick('qty', s)} end />
  if (type === 'status') return <SkelBar w={pick('status', s)} />
  if (type === 'date') return <SkelBar w={pick('date', s)} />
  if (type === 'actions') return <SkelBar w={pick('action', s)} h={10} end />
  return <SkelBar w={pick('text', s)} end={end} />
}
