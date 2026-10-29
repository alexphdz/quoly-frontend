import { Fragment, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type FormSection = {
  id: string
  title: string
  description?: string
  icon?: IconName
  /** Default 01, 02… */
  number?: string
  /** Id del DOM al que salta; default `id`. */
  target?: string
}

export type FormSectionNavigatorProps = {
  sections: FormSection[]
  active?: string
  onNavigate?: (id: string) => void
  label?: string
  numbered?: boolean
  /** Documentación: fuerza hover en un elemento. */
  hoverId?: string
  className?: string
  style?: CSSProperties
}

/** Navegación por anclas en formularios largos de una página. No es un asistente: no valida, no bloquea, no oculta secciones. */
export function FormSectionNavigator({ sections, active, onNavigate, label, numbered = true, hoverId, className, style }: FormSectionNavigatorProps) {
  const { t } = useTranslation('ds')
  const wrap = useRef<HTMLDivElement>(null)
  const items = useRef<Record<string, HTMLLIElement | null>>({})

  // Mantiene visible el elemento activo cuando la lista se desplaza en horizontal.
  useEffect(() => {
    const el = active ? items.current[active] : null
    const w = wrap.current
    if (!el || !w || w.scrollWidth <= w.clientWidth) return
    const l = el.offsetLeft - 16
    const r = el.offsetLeft + el.offsetWidth + 16
    if (l < w.scrollLeft) w.scrollTo({ left: l, behavior: 'smooth' })
    else if (r > w.scrollLeft + w.clientWidth) w.scrollTo({ left: r - w.clientWidth, behavior: 'smooth' })
  }, [active])

  const go = (s: FormSection, e: MouseEvent) => {
    e.preventDefault()
    if (onNavigate) { onNavigate(s.id); return }
    const target = document.getElementById(s.target ?? s.id)
    if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 24, behavior: 'smooth' })
  }

  return (
    <nav aria-label={label ?? t('form.nav.label')} className={cx('q-form-nav', className)} style={style}>
      <div ref={wrap} className="q-form-nav-scroll">
        <ol className="q-form-nav-list">
          {sections.map((s, i) => {
            const on = s.id === active
            return (
              <Fragment key={s.id}>
                {i > 0 && <li aria-hidden="true" className="q-form-nav-connector" />}
                <li ref={(el) => { items.current[s.id] = el }} className="q-form-nav-item">
                  <a
                    href={`#${s.target ?? s.id}`}
                    aria-current={on ? 'step' : undefined}
                    onClick={(e) => go(s, e)}
                    className={cx('q-form-nav-link', on && 'is-active', hoverId === s.id && 'is-hover')}
                  >
                    <span className="q-form-nav-icon"><Icon name={s.icon ?? 'circle-dashed'} size={18} /></span>
                    <span className="q-form-nav-text">
                      <span className="q-form-nav-row">
                        {numbered && <span className="q-form-nav-num">{s.number ?? String(i + 1).padStart(2, '0')}</span>}
                        <span className="q-form-nav-title">
                          {s.title}
                          <span aria-hidden="true" className="q-form-nav-underline" />
                        </span>
                      </span>
                      {s.description && <span className="q-form-nav-desc">{s.description}</span>}
                    </span>
                  </a>
                </li>
              </Fragment>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

/** Scroll-spy opcional: devuelve [idActivo, setIdActivo] según la sección visible. */
export function useActiveSection(ids: string[], { root = null, offset = 0.35 }: { root?: Element | null, offset?: number } = {}) {
  const [a, setA] = useState(ids[0])
  const key = ids.join(',')
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((es) => {
      const v = es.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)
      if (v[0]) setA(v[0].target.id)
    }, { root, rootMargin: `0px 0px -${Math.round((1 - offset) * 100)}% 0px` })
    key.split(',').forEach((id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [key, root, offset])
  return [a, setA] as const
}
