import { useTranslation } from 'react-i18next'
import type { RFQRead } from '../../types/rfq'
import { journeyIndex } from '../../lib/rfqDisplay'
import { Icon, Tip } from '../ds'

/** Four-step mini progress; the tooltip names every step and its state. */
export function JourneyMini({ rfq }: { rfq: RFQRead }) {
  const { t } = useTranslation('rfq')
  const index = journeyIndex(rfq)
  const steps = [t('journey.draft'), t('journey.sent'), t('journey.quotes'), t('journey.decided')]
  const summary = t('journey.stepOf', { step: index + 1, total: steps.length, name: steps[index] })
  return (
    <Tip
      content={(
        <ol className="qy-journey-tip">
          {steps.map((label, step) => (
            <li key={step} className={step < index ? 'is-done' : step === index ? 'is-current' : ''}>
              <span aria-hidden>{step < index ? <Icon name="check" size={10} /> : null}</span>
              {label}
            </li>
          ))}
        </ol>
      )}
    >
      <span className="qy-journey-mini" role="img" aria-label={summary} tabIndex={0}>
        {steps.map((_, step) => (
          <span key={step} className={step < index ? 'is-done' : step === index ? 'is-current' : ''} />
        ))}
      </span>
    </Tip>
  )
}

export function JourneyDots({ rfq }: { rfq: RFQRead }) {
  const index = journeyIndex(rfq)
  return (
    <span className="journey-dots" aria-hidden="true">
      {[0, 1, 2, 3].map(step => (
        <span
          key={step}
          className={step < index ? 'is-done' : step === index ? 'is-current' : ''}
        />
      ))}
    </span>
  )
}

const JOURNEY_ICONS = ['edit', 'send', 'receipt_long', 'check_circle'] as const

export default function RequestJourney({ rfq }: { rfq: RFQRead }) {
  const { t } = useTranslation('rfq')
  const index = journeyIndex(rfq)
  const quotesLabel = rfq.supplier_count > 0
    ? t('journey.quotesIn', { received: rfq.quoted_count, total: rfq.supplier_count })
    : t('journey.quotes')
  const steps = [t('journey.draft'), t('journey.sent'), quotesLabel, t('journey.decided')]

  return (
    <ol className="journey" aria-label={t('journey.label')}>
      {steps.map((label, step) => {
        const state = step < index ? 'done' : step === index ? 'current' : 'next'
        return (
          <li key={step} className={`is-${state}`}>
            <span className="journey-mark" aria-hidden="true">
              <Icon name={JOURNEY_ICONS[step]} size={16} filled={state === 'current'} />
            </span>
            <span className="journey-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
