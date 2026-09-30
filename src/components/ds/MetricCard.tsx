import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../ui'
import { Icon } from './Icon'

export type MetricTone = 'idle' | 'open' | 'review' | 'warn' | 'wait' | 'week' | 'rate' | 'done'

type Shared = {
  tone?: MetricTone
  icon: string
  label: string
  value: ReactNode
  helper?: ReactNode
  hint?: ReactNode
  badge?: ReactNode
  progress?: number | null
  compact?: boolean
  className?: string
}

type LinkCard = Shared & { to: string, onClick?: never, pressed?: never }
type ButtonCard = Shared & {
  to?: never
  onClick: ButtonHTMLAttributes<HTMLButtonElement>['onClick']
  pressed?: boolean
}
type StaticCard = Shared & { to?: never, onClick?: never, pressed?: never }

export type MetricCardProps = LinkCard | ButtonCard | StaticCard

function isLink(props: MetricCardProps): props is LinkCard {
  return 'to' in props && typeof props.to === 'string'
}

function isButton(props: MetricCardProps): props is ButtonCard {
  return typeof (props as ButtonCard).onClick === 'function'
}

function MetricBody({
  icon,
  label,
  value,
  helper,
  hint,
  badge,
  progress,
  compact,
  interactive,
}: Shared & { interactive: boolean }) {
  const pct = progress != null && Number.isFinite(progress) ? Math.max(0, Math.min(100, Math.round(progress * 100))) : null
  return (
    <>
      <span className="qy-metric-head">
        <Icon name={icon} size={compact ? 14 : 15} className="qy-metric-icon" />
        <span className="qy-metric-label">{label}</span>
        {badge != null && badge !== '' && <span className="qy-metric-badge">{badge}</span>}
        {interactive && <Icon name="chevron_right" size={12} className="qy-metric-go" />}
      </span>
      <span className="qy-metric-value rq-kpi-value">{value}</span>
      {helper != null && helper !== '' && (
        <span className="qy-metric-help" title={typeof helper === 'string' ? helper : undefined}>{helper}</span>
      )}
      {hint != null && hint !== '' && <span className="qy-metric-hint">{hint}</span>}
      {pct != null && (
        <span className="qy-metric-bar" role="img" aria-label={`${pct}%`}>
          <span style={{ width: `${pct}%` }} />
        </span>
      )}
    </>
  )
}

export function MetricCard(props: MetricCardProps) {
  const {
    tone = 'idle',
    icon,
    label,
    value,
    helper,
    hint,
    badge,
    progress,
    compact,
    className,
  } = props
  const interactive = isLink(props) || isButton(props)
  const classNames = cn(
    'qy-metric',
    `qy-metric-${tone}`,
    compact && 'is-compact',
    interactive && 'is-interactive',
    isButton(props) && props.pressed && 'is-pressed',
    className,
  )
  const body = (
    <MetricBody
      icon={icon}
      label={label}
      value={value}
      helper={helper}
      hint={hint}
      badge={badge}
      progress={progress}
      compact={compact}
      interactive={interactive}
    />
  )

  if (isLink(props)) {
    return (
      <Link to={props.to} className={classNames}>
        {body}
      </Link>
    )
  }
  if (isButton(props)) {
    return (
      <button
        type="button"
        className={classNames}
        aria-pressed={props.pressed ?? false}
        onClick={props.onClick}
      >
        {body}
      </button>
    )
  }
  return <div className={classNames}>{body}</div>
}
