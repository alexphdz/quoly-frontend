import { Skeleton } from '../../design-system'
import { useShellLayout } from '../layout/useShellLayout'

/**
 * Esqueleto del detalle (04) que calca la estructura real de CommercialRequestDetail:
 * breadcrumb → cabecera (título + estado + acción) → pestañas → cuerpo a 2 columnas
 * (resumen + panel «Datos de la solicitud»). Reusa las mismas clases de layout para que
 * las posiciones coincidan y la transición a contenido real no produzca saltos.
 */
export default function CommercialRequestDetailSkeleton() {
  const layout = useShellLayout()
  const stacked = layout !== 'desktop'
  return (
    <div className={`rd2-page is-${layout}`} aria-busy="true" aria-hidden="true">
      <Skeleton shape="text" width="190px" height={12} />

      <header className="q-rfq-header rd2-header">
        <div className="q-rfq-header-main">
          <Skeleton shape="text" width="min(360px, 70%)" height={30} />
          <div className="rd2-skel-row">
            <Skeleton shape="text" width="90px" height={13} />
            <Skeleton shape="text" width="64px" height={13} />
          </div>
        </div>
        <div className="q-rfq-header-action"><Skeleton shape="control" width={150} height={40} /></div>
      </header>

      <div className="rd2-tabs">
        <div className="rd2-skel-tabs">
          {[64, 96, 96, 104, 112].map((w, i) => <Skeleton key={i} shape="text" width={w} height={14} />)}
        </div>
      </div>

      <div className={`rd2-body${stacked ? ' is-stacked' : ''}`}>
        <div className="rd2-main">
          <div className="rd2-skel-section">
            <Skeleton shape="text" width="130px" height={22} />
            <Skeleton shape="text" width="60%" height={13} />
          </div>
          <div className="rd2-skel-section">
            <Skeleton shape="text" width="150px" height={12} />
            <Skeleton shape="block" width="120px" height={44} />
            <Skeleton shape="block" height={10} />
          </div>
          <div className="rd2-skel-section">
            <Skeleton shape="text" width="120px" height={18} />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rd2-skel-line"><Skeleton shape="text" width="40%" height={14} /><Skeleton shape="text" width="18%" height={14} /></div>
            ))}
          </div>
        </div>

        <aside className="rd2-panel">
          <Skeleton shape="text" width="170px" height={18} />
          <div className="rd2-skel-kv">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rd2-skel-kv-row">
                <Skeleton shape="text" width="45%" height={11} />
                <Skeleton shape="text" width="72%" height={14} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
