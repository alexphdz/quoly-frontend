import { useTranslation } from 'react-i18next'
import { AiMark, Icon } from '../ds'

export interface ExtractionPassData {
  message_labels?: string[]
  spec_parameters?: Array<{ name: string; value: string; source?: string | null }>
  buyer_actions?: Array<{ question: string; context?: string | null }>
  summary?: string | null
}

export default function ExtractionPassSummary({ data }: { data: ExtractionPassData }) {
  const { t } = useTranslation('extraction')

  const labels = data.message_labels ?? []
  const specs = data.spec_parameters ?? []
  const asks = data.buyer_actions ?? []

  if (!data.summary && labels.length === 0 && specs.length === 0 && asks.length === 0) {
    return null
  }

  return (
    <section className="ai-panel" aria-label={t('panelTitle')}>
      <header className="ai-panel-head">
        <AiMark kind="read" />
        {labels.length > 0 && (
          <div className="ai-panel-labels">
            {labels.map((label) => (
              <span key={label} className="ds-pill ds-pill-muted">
                {t(`labels.${label}`, { defaultValue: label.replace(/_/g, ' ') })}
              </span>
            ))}
          </div>
        )}
      </header>

      {data.summary && <p className="ai-panel-summary">{data.summary}</p>}

      {specs.length > 0 && (
        <div className="ai-panel-block">
          <p className="ai-panel-label">{t('specParameters')}</p>
          <dl className="ds-facts">
            {specs.map((entry) => (
              <div key={`${entry.name}-${entry.value}`}>
                <dt>{entry.name}</dt>
                <dd>{entry.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {asks.length > 0 && (
        <div className="ai-panel-block">
          <p className="ai-panel-label ai-panel-label-warn">
            <Icon name="warning" size={13} />
            {t('buyerAsks')}
          </p>
          <ul className="ai-panel-asks">
            {asks.map((item) => (
              <li key={item.question}>
                <span className="ai-panel-ask-q">{item.question}</span>
                {item.context && <span className="ai-panel-ask-ctx">{item.context}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
