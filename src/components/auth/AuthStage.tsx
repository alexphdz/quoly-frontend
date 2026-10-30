import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

const EDITORIAL_EXAMPLES: Array<[string, number]> = [['andina', 78], ['delta', 54], ['norte', 66], ['prisma', 41]]

export default function AuthStage({ children }: { children: ReactNode }) {
  const { t } = useTranslation('common')
  return (
    <div className="ds-auth" data-theme="light">
      <main className="ds-auth-form-region">
        <a className="ds-auth-brand" href="/" aria-label="Quoly"><span className="brand-mark" aria-hidden="true" /><span>Quoly</span></a>
        <div className="ds-auth-panel">{children}</div>
      </main>
      <aside className="ds-auth-editorial" data-theme="dark" aria-hidden="true">
        <div className="ds-auth-editorial-brand"><span className="ds-auth-editorial-dot" aria-hidden="true" />{t('auth.editorial.eyebrow')}</div>
        <div className="ds-auth-editorial-copy">
          <h2>{t('auth.editorial.title')}</h2>
          <p>{t('auth.editorial.body')}</p>
          <ul className="ds-auth-editorial-data">
            {EDITORIAL_EXAMPLES.map(([name, width]) => (
              <li key={name}>
                <span>{t(`auth.editorial.examples.${name}`)}</span>
                <i><b className={name === 'andina' ? 'is-highlight' : undefined} style={{ width: `${width}%` }} /></i>
              </li>
            ))}
          </ul>
        </div>
        <span className="ds-auth-editorial-footnote">{t('auth.editorial.footnote')}</span>
      </aside>
    </div>
  )
}
