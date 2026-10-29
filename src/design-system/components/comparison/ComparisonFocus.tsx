import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { ComparisonMatrix, type ComparisonMatrixProps } from './ComparisonMatrix'

export type ComparisonFocusProps = Omit<ComparisonMatrixProps, 'selectedSupplier' | 'onSelectSupplier'> & {
  defaultGroup?: string
  allLabel?: string
}

/** Matriz con pestañas por grupo de atributos (columnas estables). */
export function ComparisonFocus({ groups, defaultGroup = 'all', allLabel, defaultSelected = null, ...rest }: ComparisonFocusProps) {
  const { t } = useTranslation('ds')
  const tabs = [{ key: 'all', title: allLabel ?? t('cmp.focus.all') }, ...groups]
  const [current, setCurrent] = useState(defaultGroup)
  const [selected, setSelected] = useState<string | null>(defaultSelected)
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})
  const id = useId()

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next == null) return
    e.preventDefault()
    setCurrent(tabs[next].key)
    refs.current[tabs[next].key]?.focus()
  }
  const shown = current === 'all' ? groups : groups.filter((g) => g.key === current)

  return (
    <div className="q-cmp-focus">
      <div role="tablist" aria-label={t('cmp.focus.label')} className="q-cmp-focus-tabs">
        {tabs.map((tab, i) => {
          const on = current === tab.key
          return (
            <button
              key={tab.key}
              ref={(el) => {
                refs.current[tab.key] = el
              }}
              type="button"
              role="tab"
              id={`${id}${tab.key}`}
              aria-selected={on}
              aria-controls={`${id}p`}
              tabIndex={on ? 0 : -1}
              onClick={() => setCurrent(tab.key)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cx('q-cmp-focus-tab', on && 'is-on')}
            >
              {tab.title}
              <span aria-hidden="true" className="q-cmp-focus-line" />
            </button>
          )
        })}
      </div>
      <div role="tabpanel" id={`${id}p`} aria-labelledby={`${id}${current}`} key={current} className="q-cmp-focus-panel">
        <ComparisonMatrix {...rest} groups={shown} selectedSupplier={selected} onSelectSupplier={setSelected} />
      </div>
    </div>
  )
}
