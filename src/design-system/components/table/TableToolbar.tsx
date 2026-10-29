import type { CSSProperties, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useFormat } from '../../../lib/format'
import { cx } from '../../utils'
import { TextButton } from '../actions/TextButton'

export type TableToolbarProps = {
  title?: ReactNode
  count?: number | string
  countLabel?: string
  /** Línea breve de contexto bajo el título. */
  context?: ReactNode
  /** Grupos de herramientas (búsqueda · filtros/orden · exportar), separados 20px. */
  groups?: ReactNode[]
  /** Un solo grupo (atajo). */
  children?: ReactNode
  variant?: 'open' | 'contained'
  selectedCount?: number
  onClearSelection?: () => void
  selectionActions?: ReactNode
  divider?: boolean
  className?: string
  style?: CSSProperties
}

/** Cabecera editorial de tabla; con selección muestra el trazo de marca + "N seleccionados". */
export function TableToolbar({
  title, count, countLabel, context, children, groups, variant = 'open', selectedCount = 0,
  onClearSelection, selectionActions, divider, className, style,
}: TableToolbarProps) {
  const { t } = useTranslation('ds')
  const { number } = useFormat()
  const selecting = selectedCount > 0
  const list = groups ?? (children ? [children] : [])
  return (
    <div
      role={selecting ? 'region' : undefined}
      aria-label={selecting ? t('table.selectionActions') : undefined}
      className={cx('q-table-toolbar', `is-${variant}`, (divider ?? variant !== 'open') && 'has-divider', className)}
      style={style}
    >
      {selecting
        ? (
            <div className="q-table-toolbar-selection">
              <span className="q-table-toolbar-selected">
                <span aria-hidden="true" className="q-table-toolbar-trace" />
                <span aria-live="polite">{t('table.selected', { count: selectedCount })}</span>
              </span>
              {onClearSelection && <TextButton onClick={onClearSelection}>{t('table.clearSelection')}</TextButton>}
            </div>
          )
        : (
            <div className="q-table-toolbar-heading">
              <div className="q-table-toolbar-title-row">
                {title && <span className="q-table-toolbar-title">{title}</span>}
                {count != null && <span aria-label={countLabel} className="q-table-toolbar-count">{typeof count === 'number' ? number(count) : count}</span>}
              </div>
              {context && <span className="q-table-toolbar-context">{context}</span>}
            </div>
          )}
      {selecting
        ? <div className="q-table-toolbar-group">{selectionActions}</div>
        : (
            <div className="q-table-toolbar-groups">
              {list.map((g, i) => <div key={i} className="q-table-toolbar-group">{g}</div>)}
            </div>
          )}
    </div>
  )
}
