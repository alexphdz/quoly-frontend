import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, EmptySection } from '../design-system'

/**
 * errorElement del router: captura errores de render/carga y rutas 404 que
 * escapen al comodín, mostrando una pantalla con marca en vez de la de React Router.
 * Se renderiza fuera del shell, así que la acción recarga en la raíz para recuperar.
 */
export default function RouteError() {
  const error = useRouteError()
  const { t } = useTranslation('common')
  const notFound = isRouteErrorResponse(error) && error.status === 404
  const prefix = notFound ? 'notFound' : 'appError'
  return (
    <div className="nf-page">
      <EmptySection
        as="h1"
        title={t(`${prefix}.title`)}
        text={t(`${prefix}.text`)}
        action={<Button icon="house" onClick={() => { window.location.href = '/' }}>{t(`${prefix}.action`)}</Button>}
      />
    </div>
  )
}
