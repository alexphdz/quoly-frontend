import type { ReactNode } from 'react'

export default function AuthStage({ children }: { children: ReactNode }) {
  return (
    <div className="ds-auth">
      <span className="brand-mark ds-auth-watermark" aria-hidden="true" />
      <header className="ds-auth-top">
        <span className="brand-mark" aria-hidden="true" />
        <span className="sr-only">Quoly</span>
      </header>
      <div className="ds-auth-stage">
        <div className="ds-auth-panel">{children}</div>
      </div>
    </div>
  )
}
