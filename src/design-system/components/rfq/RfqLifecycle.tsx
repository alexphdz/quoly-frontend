import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'
import type { RfqStatus } from './RfqHeader'

export type RfqStage = { key: string, label?: string, icon: IconName }

export const RFQ_STAGES: RfqStage[] = [
  { key: 'draft', icon: 'pencil-simple' },
  { key: 'sent', icon: 'paper-plane-tilt' },
  { key: 'quotes', icon: 'tray-arrow-down' },
  { key: 'closed', icon: 'lock-simple' },
]

export type RfqLifecycleProps = {
  current?: RfqStatus | string
  stages?: RfqStage[]
  /** auto = vertical por debajo de 560px. */
  layout?: 'auto' | 'horizontal' | 'vertical'
  label?: string
  className?: string
  style?: CSSProperties
}

/** Etapas Borrador · Enviada · Cotizaciones · Cerrada; la actual con línea de marca. */
export function RfqLifecycle({ current = 'draft', stages = RFQ_STAGES, layout = 'auto', label, className, style }: RfqLifecycleProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLElement>()
  const vertical = layout === 'vertical' || (layout === 'auto' && width < 560)
  const currentIndex = Math.max(0, stages.findIndex((s) => s.key === current))

  // La línea crece 0→24 solo cuando cambia la etapa actual.
  const previous = useRef(current)
  const [drawn, setDrawn] = useState(true)
  useEffect(() => {
    if (previous.current === current) return
    previous.current = current
    setDrawn(false)
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setDrawn(true))
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [current])

  return (
    <nav ref={ref} aria-label={label ?? t('rfq.lifecycleLabel')} className={cx('q-rfq-lifecycle', vertical && 'is-vertical', className)} style={style}>
      <ol>
        {stages.flatMap((s, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'future'
          const item = (
            <li key={s.key} aria-current={state === 'current' ? 'step' : undefined} className={cx('q-rfq-stage', `is-${state}`)}>
              <span aria-hidden="true" className="q-rfq-stage-icon"><Icon name={state === 'done' ? 'check-circle' : s.icon} size={16} /></span>
              <span className="q-rfq-stage-label">
                {s.label ?? t(`rfq.stage.${s.key}`)}
                {state === 'current' && <span aria-hidden="true" className={cx('q-rfq-stage-line', drawn && 'is-drawn')} />}
              </span>
              <span className="q-sr-only">{t(`rfq.stageState.${state}`)}</span>
            </li>
          )
          if (i === stages.length - 1) return [item]
          return [item, <li key={`${s.key}-rule`} aria-hidden="true" className={cx('q-rfq-stage-rule', i < currentIndex && 'is-done')} />]
        })}
      </ol>
    </nav>
  )
}
