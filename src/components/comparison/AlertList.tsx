import type { Alert } from '../../types/comparison'
import { useEnumLabels } from '../../i18n/labels'
import { Alert as UiAlert } from '../ui'

function toneFor(type: string): 'info' | 'warning' {
  if (type === 'cheapest') return 'info'
  return 'warning'
}

function pillFor(type: string): string {
  return toneFor(type) === 'warning' ? 'ds-pill ds-pill-warn' : 'ds-pill'
}

export default function AlertList({ alerts }: { alerts: Alert[] }) {
  const labels = useEnumLabels()
  if (alerts.length === 0) return null

  return (
    <div className="grid gap-2">
      {alerts.map((alert, i) => (
        <UiAlert key={i} tone={toneFor(alert.type)}>
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className={pillFor(alert.type)}>{labels.alertType(alert.type)}</span>
            {alert.message}
          </span>
        </UiAlert>
      ))}
    </div>
  )
}
