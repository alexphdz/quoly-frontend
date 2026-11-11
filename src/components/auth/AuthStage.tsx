import type { ReactNode } from 'react'
import Seo from '../seo/Seo'

type AuthStageProps = {
  children: ReactNode
  titleKey?: string
  descriptionKey?: string
  noindex?: boolean
}

/**
 * Escenario compartido de las páginas de auth (login, registro, recuperación,
 * onboarding). Tarjeta centrada con la marca dentro, sobre la atmósfera Quoly:
 * glow de acento, velo del polo opuesto, eje de comparación roto y marca de
 * agua. Sigue el tema activo (light/dark) y el acento elegido.
 */
export default function AuthStage({ children, titleKey, descriptionKey, noindex }: AuthStageProps) {
  return (
    <div className="ds-auth">
      {titleKey && <Seo titleKey={titleKey} descriptionKey={descriptionKey} noindex={noindex} />}

      <div className="ds-auth-backdrop" aria-hidden="true">
        <span className="ds-auth-glow" />
        <span className="ds-auth-veil" />
        <span className="ds-auth-watermark" />
        <span className="ds-auth-axis" />
        <span className="ds-auth-ghost is-left">
          <i /><i /><i /><i />
        </span>
        <span className="ds-auth-ghost is-right">
          <i /><i /><i className="is-accent" /><i />
        </span>
      </div>

      <main className="ds-auth-stage">
        <div className="ds-auth-panel">
          <a className="ds-auth-brand" href="/" aria-label="Quoly">
            <span className="brand-mark" aria-hidden="true" />
            <span>Quoly</span>
          </a>
          {children}
        </div>
        <footer className="ds-auth-footer">
          {`© ${new Date().getFullYear()} Quoly`}
        </footer>
      </main>
    </div>
  )
}
