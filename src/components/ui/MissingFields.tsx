import { useTranslation } from 'react-i18next'
import { useEnumLabels } from '../../i18n/labels'
import { Badge, cn } from './index'

interface MissingFieldsProps {
  fields: string[]
  /** When there are no missing fields, render a "Complete" success badge instead of nothing. */
  showComplete?: boolean
  className?: string
}

/**
 * Renders a quote's `missing_fields` as legible, translated warning chips.
 * Single source of truth for how missing data is surfaced across the app
 * (comparison table, quote detail…). Empty + `showComplete` → success badge.
 */
export default function MissingFields({ fields, showComplete = false, className }: MissingFieldsProps) {
  const { t } = useTranslation('common')
  const labels = useEnumLabels()

  if (fields.length === 0) {
    if (!showComplete) return null
    return <Badge tone="success" dot>{t('states.complete')}</Badge>
  }

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {fields.map(field => (
        <Badge key={field} tone="warning">{labels.missingField(field)}</Badge>
      ))}
    </div>
  )
}
