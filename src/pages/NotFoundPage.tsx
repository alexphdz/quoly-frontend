import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button, EmptySection } from '../design-system'
import Seo from '../components/seo/Seo'

/** 404 con la marca y una salida clara; reemplaza la pantalla de error cruda del router. */
export default function NotFoundPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  return (
    <div className="nf-page">
      <Seo titleKey="seo.notFound" noindex />
      <EmptySection
        as="h1"
        title={t('notFound.title')}
        text={t('notFound.text')}
        action={<Button icon="house" onClick={() => navigate('/')}>{t('notFound.action')}</Button>}
      />
    </div>
  )
}
