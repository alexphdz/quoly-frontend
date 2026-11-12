import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '../design-system'
import Seo from '../components/seo/Seo'

/** 404 sobrio: marca, la cifra en display Outfit sobre el eje roto y una salida clara. */
export default function NotFoundPage() {
  const { t } = useTranslation('common')
  const navigate = useNavigate()
  return (
    <div className="nf-page">
      <Seo titleKey="seo.notFound" noindex />
      <a className="nf-brand" href="/" aria-label="Quoly">
        <span className="brand-mark" aria-hidden="true" />
        <span>Quoly</span>
      </a>
      <p className="nf-code" aria-hidden="true">{'404'}</p>
      <h1 className="nf-title">{t('notFound.title')}</h1>
      <p className="nf-text">{t('notFound.text')}</p>
      <Button icon="house-simple" onClick={() => navigate('/')}>
        {t('notFound.action')}
      </Button>
    </div>
  )
}
