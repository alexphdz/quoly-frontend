import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const SITE_NAME = 'Quoly'

type SeoProps = {
  /** i18n key (namespace `common`) resolving to the page title, e.g. `seo.dashboard`. */
  titleKey?: string
  /** Literal title, used when no i18n key is appropriate. Takes precedence over `titleKey`. */
  title?: string
  /** i18n key (namespace `common`) resolving to the meta description. */
  descriptionKey?: string
  /**
   * Keep the page out of search indexes. Authenticated, private pages should
   * always set this — their content is user-specific and must never be indexed.
   */
  noindex?: boolean
}

/**
 * Updates the single <title>/<meta> elements imperatively and restores them on
 * unmount. Deterministic in a client-rendered SPA: no duplicate head tags, and
 * document.title always reflects the current route (which also helps screen
 * readers announce page changes). The static defaults live in index.html; this
 * component only overrides them for the current route.
 */
function applyMeta(selector: string, make: () => HTMLMetaElement, content: string): () => void {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  const existed = el != null
  const prev = el?.getAttribute('content') ?? null
  if (!el) {
    el = make()
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
  return () => {
    if (!el) return
    if (existed && prev != null) el.setAttribute('content', prev)
    else el.remove()
  }
}

export default function Seo({ titleKey, title, descriptionKey, noindex }: SeoProps) {
  const { t } = useTranslation('common')

  const resolvedTitle = title ?? (titleKey ? t(titleKey) : undefined)
  const fullTitle = resolvedTitle ? `${resolvedTitle} · ${SITE_NAME}` : SITE_NAME
  const description = descriptionKey ? t(descriptionKey) : undefined

  useEffect(() => {
    const prev = document.title
    document.title = fullTitle
    return () => { document.title = prev }
  }, [fullTitle])

  useEffect(() => {
    if (description == null) return
    return applyMeta(
      'meta[name="description"]',
      () => {
        const m = document.createElement('meta')
        m.setAttribute('name', 'description')
        return m
      },
      description,
    )
  }, [description])

  useEffect(() => {
    if (!noindex) return
    return applyMeta(
      'meta[name="robots"]',
      () => {
        const m = document.createElement('meta')
        m.setAttribute('name', 'robots')
        return m
      },
      'noindex, nofollow',
    )
  }, [noindex])

  return null
}
