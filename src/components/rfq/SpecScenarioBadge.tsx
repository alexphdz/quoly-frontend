import { useTranslation } from 'react-i18next'
import { resolveSpecScenario, type SpecScenario } from '../../lib/specScenario'
import type { RFQAttachment } from '../../types/rfq'

const TONE: Record<SpecScenario, string> = {
  reference_file: 'ds-pill',
  text_requirements: 'ds-pill ds-pill-muted',
  ask_datasheet: 'ds-pill ds-pill-neutral',
}

export default function SpecScenarioBadge({
  technicalRequirements,
  attachments,
}: {
  technicalRequirements?: string | null
  attachments?: RFQAttachment[]
}) {
  const { t } = useTranslation('rfq')
  const scenario = resolveSpecScenario({
    technical_requirements: technicalRequirements,
    attachments,
  })
  return (
    <span className={TONE[scenario]}>{t(`commercial.specScenario.${scenario}`)}</span>
  )
}
