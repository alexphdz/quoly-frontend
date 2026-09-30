import { useTranslation } from 'react-i18next'

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
    <div style={{ marginTop: 12 }}>
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {labels.map((label) => (
            <span key={label} className="ds-pill ds-pill-muted">
              {t(`labels.${label}`, { defaultValue: label.replace(/_/g, ' ') })}
            </span>
          ))}
        </div>
      )}
      {data.summary && (
        <p style={{ marginTop: 8, color: 'var(--tx-body)', fontSize: 14, lineHeight: '22px' }}>{data.summary}</p>
      )}
      {specs.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <p className="ds-meta">{t('specParameters')}</p>
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
        <div style={{ marginTop: 12 }}>
          <p className="ds-meta" style={{ color: 'var(--warn-fg)' }}>{t('buyerAsks')}</p>
          <ul>
            {asks.map((item) => (
              <li key={item.question} style={{ marginTop: 8, color: 'var(--tx-1)' }}>
                “{item.question}”
                {item.context && <p className="ds-meta">{item.context}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
