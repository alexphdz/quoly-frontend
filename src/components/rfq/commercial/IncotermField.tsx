import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon, IconButton, TextButton, type IconName } from '../../../design-system'
import { useElementWidth } from '../../../design-system/hooks'
import { COMMERCIAL_INCOTERMS } from '../../../constants/commercial'

/* Íconos aprobados en la pantalla 03 (set curado de Phosphor, sin barco ni ancla). */
const ICON: Record<string, IconName> = {
  EXW: 'buildings', FCA: 'handshake', CPT: 'truck', CIP: 'stamp', DAP: 'flag', DPU: 'tray-arrow-down',
  DDP: 'receipt', FAS: 'stack', FOB: 'export', CFR: 'coins', CIF: 'stamp',
}
const NAME: Record<string, string> = {
  EXW: 'Ex Works', FCA: 'Free Carrier', CPT: 'Carriage Paid To', CIP: 'Carriage and Insurance Paid To', DAP: 'Delivered at Place',
  DPU: 'Delivered at Place Unloaded', DDP: 'Delivered Duty Paid', FAS: 'Free Alongside Ship', FOB: 'Free on Board',
  CFR: 'Cost and Freight', CIF: 'Cost, Insurance and Freight',
}
const MODES = [
  { key: 'any', sea: false },
  { key: 'sea', sea: true },
] as const

/** Selector de Incoterm de la pantalla 03: disparador, panel en la misma página con mosaicos por modo y resumen al elegir. */
export default function IncotermField({
  value,
  onChange,
  invalid,
  labelId,
}: {
  value: string
  onChange: (code: string) => void
  invalid?: boolean
  labelId: string
}) {
  const { t } = useTranslation('rfq')
  const [open, setOpen] = useState(false)
  const [panelRef, panelW] = useElementWidth<HTMLDivElement>(780)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const tiles = useRef<Record<string, HTMLButtonElement | null>>({})
  const cols = panelW >= 640 ? 4 : panelW >= 440 ? 3 : 2
  const order = COMMERCIAL_INCOTERMS.map(i => i.code)
  const selected = COMMERCIAL_INCOTERMS.find(i => i.code === value)

  const focusTile = (code?: string) => requestAnimationFrame(() => tiles.current[code ?? value ?? order[0]]?.focus() ?? tiles.current[order[0]]?.focus())
  useEffect(() => {
    if (open) focusTile(value || order[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const pick = (code: string) => {
    onChange(code)
    setOpen(false)
  }
  const clear = () => {
    onChange('')
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }
  const onTileKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = (document.activeElement as HTMLElement | null)?.dataset.tile
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      requestAnimationFrame(() => triggerRef.current?.focus())
      return
    }
    if (!current) return
    const i = order.indexOf(current)
    let j = i
    if (e.key === 'ArrowRight') j = Math.min(order.length - 1, i + 1)
    else if (e.key === 'ArrowLeft') j = Math.max(0, i - 1)
    else if (e.key === 'ArrowDown') j = Math.min(order.length - 1, i + cols)
    else if (e.key === 'ArrowUp') j = Math.max(0, i - cols)
    else if (e.key === 'Home') j = 0
    else if (e.key === 'End') j = order.length - 1
    else return
    e.preventDefault()
    tiles.current[order[j]]?.focus()
  }

  const short = (code: string) => t(`crear.incoterm.short.${code}`)
  const modeLabel = (sea: boolean) => t(sea ? 'crear.incoterm.modeSea' : 'crear.incoterm.modeAny')

  return (
    <div className={`cr2-inc${open ? ' is-open' : ''}${invalid ? ' is-invalid' : ''}`}>
      {!selected
        ? (
          <button
            ref={triggerRef}
            type="button"
            aria-expanded={open}
            aria-controls="cr2-inc-panel"
            aria-labelledby={`${labelId} cr2-inc-trigger-text`}
            className="cr2-inc-trigger"
            onClick={() => setOpen(o => !o)}
            onKeyDown={e => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setOpen(true) } }}
          >
            <span className="cr2-inc-icon"><Icon name="truck" size={18} /></span>
            <span id="cr2-inc-trigger-text" className="cr2-inc-text">
              <span className="cr2-inc-title">{t('crear.incoterm.select')}</span>
              <span className="cr2-inc-desc">{t('crear.incoterm.count')}</span>
            </span>
            <span className="cr2-inc-caret"><Icon name="caret-down" size={16} /></span>
          </button>
        )
        : (
          <div className="cr2-inc-summary">
            <span className="cr2-inc-icon is-strong"><Icon name={ICON[selected.code] ?? 'truck'} size={18} /></span>
            <span role="status" className="cr2-inc-text is-summary">
              <span className="cr2-inc-name">
                <strong>{selected.code}</strong>
                <span className="cr2-inc-dash">{' — '}</span>
                <span className="cr2-inc-full">{NAME[selected.code]}</span>
              </span>
              <span className="cr2-inc-desc">{`${short(selected.code)} ${modeLabel(selected.sea)}.`}</span>
            </span>
            <span className="cr2-inc-actions">
              <span className="cr2-nowrap">
                <TextButton size="sm" iconEnd={open ? 'caret-up' : 'caret-down'} aria-expanded={open} aria-controls="cr2-inc-panel" onClick={() => setOpen(o => !o)}>
                  {open ? t('crear.incoterm.close') : t('crear.incoterm.change')}
                </TextButton>
              </span>
              <IconButton icon="x" label={t('crear.incoterm.remove')} size="sm" onClick={clear} />
            </span>
          </div>
        )}
      <div className="cr2-inc-reveal">
        <div className="cr2-inc-clip">
          <div id="cr2-inc-panel" ref={panelRef} className="cr2-inc-panel">
            <div role="radiogroup" aria-labelledby={labelId} className="cr2-inc-groups" onKeyDown={onTileKey}>
              {MODES.map(m => (
                <div key={m.key} className="cr2-inc-group">
                  <span aria-hidden="true" className="cr2-inc-group-label">{t(`crear.incoterm.group.${m.key}`)}</span>
                  <div className="cr2-inc-grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                    {COMMERCIAL_INCOTERMS.filter(i => i.sea === m.sea).map(i => {
                      const on = i.code === value
                      return (
                        <button
                          key={i.code}
                          ref={el => { tiles.current[i.code] = el }}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          aria-label={`${i.code}, ${NAME[i.code]}. ${short(i.code)}`}
                          tabIndex={on || (!value && i.code === order[0]) ? 0 : -1}
                          data-tile={i.code}
                          className={`cr2-inc-tile${on ? ' is-selected' : ''}`}
                          onClick={() => pick(i.code)}
                        >
                          <span className="cr2-inc-tile-top">
                            <span className="cr2-inc-tile-icon"><Icon name={ICON[i.code] ?? 'truck'} size={18} /></span>
                            {on && <span className="cr2-inc-tile-check"><Icon name="check" size={14} weight="bold" /></span>}
                          </span>
                          <span className="cr2-inc-tile-text">
                            <span className="cr2-inc-tile-code">{i.code}</span>
                            <span className="cr2-inc-tile-name">{NAME[i.code]}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
