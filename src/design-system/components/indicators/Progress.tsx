import { useId, type CSSProperties } from 'react'
import { cx } from '../../utils'

export type ProgressProps = {
  /** linear · ratio (n de m casillas) · steps (segmentos) · indeterminate. */
  variant?: 'linear' | 'ratio' | 'steps' | 'indeterminate'
  label?: string
  value?: number
  max?: number
  valueText?: string
  steps?: number
  stepLabels?: string[]
  tone?: 'neutral' | 'success' | 'ai' | 'info'
  /** Color de relleno explícito (anula tone). */
  color?: string
  className?: string
  style?: CSSProperties
}

export function Progress({
  variant = 'linear', label, value = 0, max = 100, valueText, steps, stepLabels, tone = 'neutral', color, className, style,
}: ProgressProps) {
  const id = useId()
  const pct = Math.max(0, Math.min(1, value / max))
  const indeterminate = variant === 'indeterminate'
  const total = variant === 'steps' ? steps ?? max : max
  const fillStyle = color ? ({ '--q-progress-fill': color } as CSSProperties) : undefined

  let bar
  if (variant === 'ratio') {
    bar = (
      <div className="q-progress-ratio">
        {Array.from({ length: max }, (_, i) => <span key={i} className={i < value ? 'is-on' : undefined} />)}
      </div>
    )
  } else if (variant === 'steps') {
    bar = (
      <div className="q-progress-steps">
        <div className="q-progress-segments">
          {Array.from({ length: total }, (_, i) => <span key={i} className={i < value ? 'is-on' : undefined} />)}
        </div>
        {stepLabels && (
          <div className="q-progress-step-labels" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
            {stepLabels.map((s, i) => (
              <span key={i} className={cx(i < value && 'is-done', i === value - 1 && 'is-current')}>
                {i < value - 1 ? `✓ ${s}` : s}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  } else if (indeterminate) {
    bar = <span className="q-progress-track is-thin"><span className="q-progress-runner" /></span>
  } else {
    bar = <span className="q-progress-track"><span className="q-progress-fill" style={{ width: `${pct * 100}%` }} /></span>
  }

  return (
    <div className={cx('q-progress', `is-${tone}`, className)} style={{ ...fillStyle, ...style }}>
      {(label || valueText) && (
        <div className="q-progress-head">
          <span id={id} className="q-progress-label">{label}</span>
          {valueText && <span className="q-progress-value">{valueText}</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-labelledby={label ? id : undefined}
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : total}
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuetext={valueText}
      >
        {bar}
      </div>
    </div>
  )
}
