import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

/** Dato ausente: "—" + "No indicado". Nunca 0. */
export function MissingValue() {
  const { t } = useTranslation('ds')
  return (
    <span className="q-missing">
      <span className="q-missing-dash">{'—'}</span>
      <span className="q-missing-reason">{t('table.notProvided')}</span>
    </span>
  )
}

/** Rejilla que reparte n columnas con mínimo `min` px y colapsa por ancho disponible. */
export function gridColumns(n: number, min: number): CSSProperties {
  return { gridTemplateColumns: `repeat(auto-fit, minmax(max(${min}px, calc((100% - ${(n - 1) * 24}px) / ${n})), 1fr))` }
}
