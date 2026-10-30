import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'

export type ComparisonOverviewProps = {
  title?: string
  reference?: string
  product?: string
  received?: number
  comparable?: number
  review?: number
  as?: 'h1' | 'h2'
  className?: string
  style?: CSSProperties
}

/** Encabezado de comparación: título + conteo de cotizaciones recibidas, comparables y por revisar. */
export function ComparisonOverview({ title, reference, product, received = 0, comparable, review, as: H = 'h2', className, style }: ComparisonOverviewProps) {
  const { t } = useTranslation('ds')
  const [ref, width] = useElementWidth<HTMLElement>(900)
  const parts = [
    comparable != null && t('cmp.overview.comparable', { count: comparable }),
    review ? t('cmp.overview.review', { count: review }) : null,
  ].filter(Boolean)
  return (
    <header ref={ref} className={cx('q-cmp-overview', width < 560 && 'is-stacked', className)} style={style}>
      <div className="q-cmp-overview-main">
        <H className="q-cmp-overview-title">{title ?? t('cmp.overview.title')}</H>
        {(reference || product) && <span className="q-cmp-overview-ref">{[reference, product].filter(Boolean).join(' · ')}</span>}
      </div>
      <div className="q-cmp-overview-side">
        <span className="q-cmp-overview-count">
          <span className="q-cmp-overview-figure">{received}</span>
          <span className="q-cmp-overview-caption">{t('cmp.overview.received', { count: received })}</span>
        </span>
        {parts.length > 0 && <span className="q-cmp-overview-parts">{parts.join(' · ')}</span>}
      </div>
    </header>
  )
}
