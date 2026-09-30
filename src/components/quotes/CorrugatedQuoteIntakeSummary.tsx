import { useTranslation } from 'react-i18next'
import type { QuoteLineItemsV2 } from '../../types/quoteIntake'
import type { VolumeTier } from '../../types/rfq'
import { Badge } from '../ui'

interface Props {
  lineItems: QuoteLineItemsV2
  missingFields: string[]
  volumeTiers?: VolumeTier[]
}

export default function CorrugatedQuoteIntakeSummary({ lineItems, missingFields, volumeTiers }: Props) {
  const { t } = useTranslation(['quote', 'enums'])
  const missing = new Set(missingFields)
  const tierLabel = (id: string) =>
    volumeTiers?.find(t => t.id === id)?.label ?? `${id.slice(0, 8)}…`

  const cb = lineItems.cost_breakdown

  return (
    <div className="space-y-6">
      <div>
        <h3 className="qy-heading font-semibold">{t('intake.tiersTitle')}</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-[var(--text-muted)]">
                <th className="pb-2 pr-3">{t('intake.tierId')}</th>
                <th className="pb-2 pr-3">{t('intake.unitPrice')}</th>
                <th className="pb-2 pr-3">{t('intake.currency')}</th>
                <th className="pb-2">{t('intake.moq')}</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.tiers.map(tier => (
                <tr key={tier.volume_tier_id} className="border-t border-[var(--border-subtle)]">
                  <td className="py-2 pr-3">{tierLabel(tier.volume_tier_id)}</td>
                  <td className="py-2 pr-3">{tier.unit_price ?? '—'}</td>
                  <td className="py-2 pr-3">{tier.currency ?? '—'}</td>
                  <td className="py-2">{tier.moq ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {missing.has('unit_price_per_tier') && (
          <p className="mt-2 text-sm text-[var(--error-text)]">{t('intake.missingTierPrices')}</p>
        )}
      </div>

      {cb && (
        <div>
          <h3 className="qy-heading font-semibold">{t('intake.breakdownTitle')}</h3>
          <dl className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            {cb.tooling_die && (
              <div>
                <dt className="text-[var(--text-muted)]">{t('intake.tooling')}</dt>
                <dd>{cb.tooling_die.amount} {cb.tooling_die.currency}</dd>
              </div>
            )}
            {cb.freight && (
              <div>
                <dt className="text-[var(--text-muted)]">{t('intake.freight')}</dt>
                <dd>
                  {cb.freight.included
                    ? t('intake.freightIncluded')
                    : `${cb.freight.amount ?? '—'} ${cb.freight.currency ?? ''}`.trim()}
                </dd>
              </div>
            )}
            {cb.lead_time_days != null && (
              <div>
                <dt className="text-[var(--text-muted)]">{t('fields.leadTimeDays')}</dt>
                <dd>{cb.lead_time_days}</dd>
              </div>
            )}
            {cb.incoterm_quoted && (
              <div>
                <dt className="text-[var(--text-muted)]">{t('intake.incoterm')}</dt>
                <dd>{cb.incoterm_quoted}</dd>
              </div>
            )}
            {cb.board_spec_quoted && (
              <div>
                <dt className="text-[var(--text-muted)]">{t('intake.boardSpec')}</dt>
                <dd>{cb.board_spec_quoted}</dd>
              </div>
            )}
            {cb.no_substitution_ack === true && (
              <div>
                <dt className="text-[var(--text-muted)]">{t('intake.substitution')}</dt>
                <dd>{t('intake.acknowledged')}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {missingFields.length > 0 && (
        <div>
          <h3 className="qy-heading font-semibold">{t('intake.checklistGaps')}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {missingFields.map(key => (
              <Badge key={key} tone="warning">
                {t(`corrugated.responseField.${key}`, { ns: 'enums', defaultValue: key })}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
