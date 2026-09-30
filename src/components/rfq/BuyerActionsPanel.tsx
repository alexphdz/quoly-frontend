import { useTranslation } from 'react-i18next'
import type { BuyerActionRead } from '../../types/buyerAction'
import type { RFQRead } from '../../types/rfq'
import { rfqHintsForBuyerAsk } from '../../lib/buyerActionRfqContext'
import { EmptyState } from '../ui'

export default function BuyerActionsPanel({
  actions,
  rfq,
  onResolve,
  resolvingId,
}: {
  actions: BuyerActionRead[]
  rfq?: RFQRead | null
  onResolve: (id: string) => void
  resolvingId?: string | null
}) {
  const { t } = useTranslation('rfq')
  const open = actions.filter(action => action.status === 'open')
  const resolved = actions.filter(action => action.status === 'resolved')

  if (actions.length === 0) {
    return (
      <EmptyState
        title={t('buyerActions.emptyTitle')}
        description={t('buyerActions.emptyDescription')}
      />
    )
  }

  return (
    <div>
      {open.length > 0 && (
        <div className="ds-ask-head">
          <h2 className="request-section-title">{t('buyerActions.openTitle')}</h2>
          <p className="ds-meta">
            {t('buyerActions.openCount', { count: open.length })}
            {' · '}
            {t('buyerActions.resolveSendsNothing')}
          </p>
        </div>
      )}
      {open.map(action => {
        const hints = rfq ? rfqHintsForBuyerAsk(rfq, action.question) : []
        return (
          <article key={action.id} className="ds-ask">
            <span className="ds-ask-mark" aria-hidden="true" />
            <div className="ds-ask-kind is-open">{action.supplier_name ?? t('buyerActions.unknownSupplier')}</div>
            <p className="ds-ask-quote">“{action.question}”</p>
            {action.context && <p className="ds-meta">{action.context}</p>}
            {hints.length > 0 && (
              <p className="ds-meta">
                {t('buyerActions.onThisRequest')}: {hints.map(hint => hint.text).join(' · ')}
              </p>
            )}
            <div>
              <button
                type="button"
                className="ds-btn ds-btn-secondary"
                disabled={resolvingId === action.id}
                onClick={() => onResolve(action.id)}
              >
                {resolvingId === action.id ? t('buyerActions.resolving') : t('buyerActions.resolve')}
              </button>
            </div>
          </article>
        )
      })}
      {resolved.length > 0 && (
        <div>
          <h3 className="request-section-title">{t('buyerActions.resolvedTitle')}</h3>
          {resolved.map(action => (
            <article key={action.id} className="ds-ask">
              <span className="ds-ask-check" aria-hidden="true" />
              <p className="ds-ask-quote">{action.question}</p>
              <p className="ds-meta">
                {action.supplier_name ?? t('buyerActions.unknownSupplier')}
                {' · '}
                {t('buyerActions.resolvedByYou')}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
