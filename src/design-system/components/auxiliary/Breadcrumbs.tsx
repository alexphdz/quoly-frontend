import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { Icon } from '../core/Icon'

export type BreadcrumbItemProps = {
  /** Ruta interna (react-router). */
  to?: string
  /** Enlace externo o ancla. */
  href?: string
  current?: boolean
  last?: boolean
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

export function BreadcrumbItem({ to, href, current = false, last = false, children, className, style }: BreadcrumbItemProps) {
  return (
    <li className={cx('q-crumb', className)} style={style}>
      {current
        ? <span aria-current="page" className="q-crumb-current">{children}</span>
        : to
          ? <Link to={to} className="q-crumb-link">{children}</Link>
          : <a href={href ?? '#'} className="q-crumb-link">{children}</a>}
      {!last && !current && <span aria-hidden="true" className="q-crumb-sep"><Icon name="caret-right" size={12} /></span>}
    </li>
  )
}

export type BreadcrumbsProps = {
  items: Array<{ label: ReactNode, to?: string, href?: string }>
  label?: string
  className?: string
  style?: CSSProperties
}

/** Ruta jerárquica; el último elemento es la página actual. */
export function Breadcrumbs({ items, label, className, style }: BreadcrumbsProps) {
  const { t } = useTranslation('ds')
  return (
    <nav aria-label={label ?? t('breadcrumbs.label')} className={className} style={style}>
      <ol className="q-crumbs">
        {items.map((it, i) => (
          <BreadcrumbItem key={i} to={it.to} href={it.href} current={i === items.length - 1} last={i === items.length - 1}>
            {it.label}
          </BreadcrumbItem>
        ))}
      </ol>
    </nav>
  )
}
