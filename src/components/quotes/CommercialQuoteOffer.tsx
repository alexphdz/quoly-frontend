import { useTranslation } from 'react-i18next'
import type { CommercialOfferShape } from '../../types/quote'
import { useFormat } from '../../lib/format'

export default function CommercialQuoteOffer({ offer }: { offer: CommercialOfferShape }) {
  const { t } = useTranslation('quote')
  const fmt = useFormat()
  const lead = offer.lead_time

  const hasTiers = (offer.price_tiers?.length ?? 0) > 0
  const hasLead =
    lead &&
    (lead.production_days != null || lead.transit_days != null || lead.total_days != null || lead.source_wording)
  const hasValidity = Boolean(offer.quote_validity?.trim())
  const hasMoqWording = Boolean(offer.moq_source_wording?.trim())

  if (!hasTiers && !hasLead && !hasValidity && !hasMoqWording) return null

  return (
    <section className="ds-section">
      <h2>{t('commercialOffer.title')}</h2>

      {hasTiers && (
        <div className="ds-table-wrap">
          <p className="ds-meta" style={{ marginBottom: 8 }}>{t('commercialOffer.priceTiers')}</p>
          <table className="ds-table">
            <thead>
              <tr>
                <th>{t('commercialOffer.tierQuantity')}</th>
                <th>{t('commercialOffer.tierPrice')}</th>
                <th>{t('commercialOffer.supplierWording')}</th>
              </tr>
            </thead>
            <tbody>
              {offer.price_tiers!.map((tier, index) => (
                <tr key={index}>
                  <td>
                    {tier.quantity != null ? fmt.number(tier.quantity) : '—'} {tier.unit ?? ''}
                  </td>
                  <td>
                    {tier.price != null ? fmt.unitNumber(tier.price) : '—'} {tier.currency ?? ''}
                  </td>
                  <td>{tier.source_wording ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasMoqWording && (
        <div style={{ marginTop: 16 }}>
          <p className="ds-meta">{t('commercialOffer.moqWording')}</p>
          <p style={{ margin: '4px 0 0', color: 'var(--tx-1)' }}>{offer.moq_source_wording}</p>
        </div>
      )}

      {hasLead && (
        <div style={{ marginTop: 16 }}>
          <p className="ds-meta">{t('commercialOffer.leadTime')}</p>
          <dl className="ds-facts">
            {lead!.production_days != null && (
              <div>
                <dt>{t('commercialOffer.production')}</dt>
                <dd>{t('commercialOffer.days', { count: lead!.production_days })}</dd>
              </div>
            )}
            {lead!.transit_days != null && (
              <div>
                <dt>{t('commercialOffer.transit')}</dt>
                <dd>{t('commercialOffer.days', { count: lead!.transit_days })}</dd>
              </div>
            )}
            {lead!.total_days != null && (
              <div>
                <dt>{t('commercialOffer.total')}</dt>
                <dd>{t('commercialOffer.days', { count: lead!.total_days })}</dd>
              </div>
            )}
          </dl>
          {lead!.source_wording && <p className="ds-meta" style={{ marginTop: 8 }}>{lead!.source_wording}</p>}
        </div>
      )}

      {hasValidity && (
        <div style={{ marginTop: 16 }}>
          <p className="ds-meta">{t('commercialOffer.validity')}</p>
          <p style={{ margin: '4px 0 0', color: 'var(--tx-1)' }}>{offer.quote_validity}</p>
        </div>
      )}
    </section>
  )
}
