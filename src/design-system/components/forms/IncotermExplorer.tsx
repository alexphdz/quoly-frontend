import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useElementWidth } from '../../hooks'
import { cx } from '../../utils'
import { TextButton } from '../actions/TextButton'
import { Icon, type IconName } from '../core/Icon'
import { TextInput } from '../inputs/TextInput'

export type IncotermPlace = 'delivery' | 'destination' | 'loadingPort' | 'destinationPort'

export type IncotermOption = {
  code: string
  /** Nombre oficial Incoterms 2020 (no se traduce). */
  name: string
  icon: IconName
  mode: 'any' | 'sea'
  place: IncotermPlace
  /** Default: traducción ds:form.incoterm.desc.<code>. */
  description?: string
}

/** Los 11 Incoterms 2020 con iconos aprobados (asignación provisional del DS). */
export const INCOTERMS: IncotermOption[] = [
  { code: 'EXW', name: 'Ex Works', icon: 'factory', mode: 'any', place: 'delivery' },
  { code: 'FCA', name: 'Free Carrier', icon: 'truck', mode: 'any', place: 'delivery' },
  { code: 'CPT', name: 'Carriage Paid To', icon: 'path', mode: 'any', place: 'destination' },
  { code: 'CIP', name: 'Carriage and Insurance Paid To', icon: 'shield-check', mode: 'any', place: 'destination' },
  { code: 'DAP', name: 'Delivered at Place', icon: 'map-pin', mode: 'any', place: 'destination' },
  { code: 'DPU', name: 'Delivered at Place Unloaded', icon: 'warehouse', mode: 'any', place: 'destination' },
  { code: 'DDP', name: 'Delivered Duty Paid', icon: 'stamp', mode: 'any', place: 'destination' },
  { code: 'FAS', name: 'Free Alongside Ship', icon: 'anchor-simple', mode: 'sea', place: 'loadingPort' },
  { code: 'FOB', name: 'Free on Board', icon: 'boat', mode: 'sea', place: 'loadingPort' },
  { code: 'CFR', name: 'Cost and Freight', icon: 'coins', mode: 'sea', place: 'destinationPort' },
  { code: 'CIF', name: 'Cost, Insurance and Freight', icon: 'umbrella', mode: 'sea', place: 'destinationPort' },
]

export type IncotermExplorerProps = {
  options?: IncotermOption[]
  value?: string | null
  defaultValue?: string | null
  onChange?: (code: string | null) => void
  onRemove?: () => void
  /** Texto del lugar asociado; se conserva al cambiar de término. */
  place?: string
  defaultPlace?: string
  onPlaceChange?: (text: string) => void
  /** Etiquetas/placeholders por código; default por tipo de lugar (i18n). */
  placeLabels?: Record<string, string>
  placeHints?: Record<string, string>
  expanded?: boolean
  defaultExpanded?: boolean
  onExpandedChange?: (open: boolean) => void
  title?: string
  description?: string
  /** Documentación: fuerza hover. */
  hoverCode?: string
  triggerState?: 'hover'
  id?: string
  className?: string
  style?: CSSProperties
}

/** Selector opcional de un Incoterm 2020 + lugar designado. Sin cálculos de flete o seguro. */
export function IncotermExplorer({
  options = INCOTERMS, value, defaultValue = null, onChange, onRemove, place, defaultPlace = '', onPlaceChange, placeLabels, placeHints,
  expanded, defaultExpanded = false, onExpandedChange, title, description, hoverCode, triggerState, id = 'incoterm', className, style,
}: IncotermExplorerProps) {
  const { t } = useTranslation('ds')
  const [ref, w] = useElementWidth<HTMLDivElement>(780)
  const cols = w >= 640 ? 4 : w >= 440 ? 3 : 2
  const [inner, setInner] = useState(defaultValue)
  const code = value !== undefined ? value : inner
  const [innerPlace, setInnerPlace] = useState(defaultPlace)
  const pl = place ?? innerPlace
  const [innerOpen, setInnerOpen] = useState(defaultExpanded)
  const open = expanded ?? innerOpen
  const setOpen = (o: boolean) => { setInnerOpen(o); onExpandedChange?.(o) }
  const sel = options.find((o) => o.code === code)
  const tiles = useRef<(HTMLButtonElement | null)[]>([])
  const trigger = useRef<HTMLButtonElement>(null)
  const summary = useRef<HTMLDivElement>(null)
  const gridId = `${id}-grid`
  const desc = (o: IncotermOption) => o.description ?? t(`form.incoterm.desc.${o.code}`, { defaultValue: o.name })
  const mode = (o: IncotermOption) => t(`form.incoterm.mode.${o.mode}`)

  const focusSummary = () => requestAnimationFrame(() => summary.current?.querySelector('button')?.focus())
  const pick = (o: IncotermOption) => { setInner(o.code); onChange?.(o.code); setOpen(false); focusSummary() }
  const remove = () => {
    setInner(null)
    onChange?.(null)
    onRemove?.()
    setOpen(false)
    requestAnimationFrame(() => trigger.current?.focus())
  }
  const onKey = (i: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const k = e.key
    let j = i
    if (k === 'ArrowRight') j = Math.min(options.length - 1, i + 1)
    else if (k === 'ArrowLeft') j = Math.max(0, i - 1)
    else if (k === 'ArrowDown') j = Math.min(options.length - 1, i + cols)
    else if (k === 'ArrowUp') j = Math.max(0, i - cols)
    else if (k === 'Home') j = 0
    else if (k === 'End') j = options.length - 1
    else if (k === 'Escape') {
      e.preventDefault()
      setOpen(false)
      if (sel) focusSummary()
      else trigger.current?.focus()
      return
    } else return
    e.preventDefault()
    tiles.current[j]?.focus()
  }

  // Al abrir desde el teclado, el foco pasa a la opción seleccionada (o la primera).
  useEffect(() => {
    if (!open) return
    const i = Math.max(0, options.findIndex((o) => o.code === code))
    const r = requestAnimationFrame(() => {
      if (document.activeElement?.closest(`[data-incoterm="${id}"]`)) tiles.current[i]?.focus()
    })
    return () => cancelAnimationFrame(r)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <div ref={ref} data-incoterm={id} className={cx('q-incoterm', open && 'is-open', className)} style={style}>
      {!sel
        ? (
          <button
            ref={trigger}
            type="button"
            aria-expanded={open}
            aria-controls={gridId}
            onClick={() => setOpen(!open)}
            className={cx('q-incoterm-trigger', triggerState === 'hover' && 'is-hover')}
          >
            <span className="q-incoterm-trigger-icon"><Icon name="truck" size={20} /></span>
            <span className="q-incoterm-text">
              <span className="q-incoterm-title">{title ?? t('form.incoterm.title')}</span>
              <span className="q-incoterm-desc">{description ?? t('form.incoterm.description')}</span>
            </span>
            <span className="q-incoterm-caret"><Icon name="caret-down" size={16} /></span>
          </button>
        )
        : (
          <div ref={summary} className="q-incoterm-summary">
            <span className="q-incoterm-summary-icon"><Icon name={sel.icon} size={20} /></span>
            <span className="q-incoterm-text is-summary">
              <span className="q-incoterm-summary-name">
                <span className="q-incoterm-title">{sel.code}</span>
                <span className="q-incoterm-fullname">{sel.name}</span>
              </span>
              <span className="q-incoterm-desc">{`${desc(sel)} · ${mode(sel)}`}</span>
            </span>
            <span className="q-incoterm-actions">
              <TextButton icon="arrows-down-up" aria-expanded={open} aria-controls={gridId} onClick={() => setOpen(!open)}>{t('form.incoterm.change')}</TextButton>
              <TextButton icon="x" onClick={remove}>{t('form.incoterm.remove')}</TextButton>
            </span>
          </div>
        )}
      <div id={gridId} className="q-incoterm-reveal" aria-hidden={!open}>
        <div className="q-incoterm-clip">
          <div role="radiogroup" aria-label={t('form.incoterm.group')} className="q-incoterm-grid" style={{ gridTemplateColumns: `repeat(${cols},minmax(0,1fr))` }}>
            {open && options.map((o, i) => {
              const on = o.code === code
              return (
                <button
                  key={o.code}
                  ref={(el) => { tiles.current[i] = el }}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  tabIndex={(code ? on : i === 0) ? 0 : -1}
                  onClick={() => pick(o)}
                  onKeyDown={onKey(i)}
                  title={`${o.name} · ${mode(o)}`}
                  className={cx('q-incoterm-tile', on && 'is-selected', hoverCode === o.code && 'is-hover')}
                >
                  <span className="q-incoterm-tile-icon"><Icon name={o.icon} size={18} /></span>
                  <span className="q-incoterm-tile-code">{o.code}</span>
                  <span className="q-incoterm-tile-desc">{desc(o)}</span>
                  {on && <span aria-hidden="true" className="q-incoterm-tile-check"><Icon name="check" size={16} weight="bold" /></span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      {sel && (
        <TextInput
          id={`${id}-place`}
          label={placeLabels?.[sel.code] ?? t(`form.incoterm.place.${sel.place}`)}
          placeholder={placeHints?.[sel.code] ?? t(`form.incoterm.hint.${sel.code}`)}
          value={pl}
          onChange={(e) => { setInnerPlace(e.target.value); onPlaceChange?.(e.target.value) }}
          icon="map-pin"
        />
      )}
    </div>
  )
}
