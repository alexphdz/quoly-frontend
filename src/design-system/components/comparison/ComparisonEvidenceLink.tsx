import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import { cx } from '../../utils'
import { EvidenceReference } from '../intelligence/EvidenceReference'
import type { EvidenceSource } from '../intelligence/shared'

export type ComparisonEvidence = { source?: EvidenceSource, label?: string, location?: string, passage?: string }

export type ComparisonEvidenceLinkProps = {
  evidence?: ComparisonEvidence | null
  active?: boolean
  onOpen?: () => void
  controls?: string
  className?: string
  style?: CSSProperties
}

/** "Ver fuente" de una celda de comparación; sin evidencia: "Sin fuente asociada". */
export function ComparisonEvidenceLink({ evidence, active = false, onOpen, controls, className, style }: ComparisonEvidenceLinkProps) {
  const { t } = useTranslation('ds')
  if (!evidence) return <span className={cx('q-cmp-no-source', className)} style={style}>{t('cmp.noSource')}</span>
  return (
    <EvidenceReference
      source={evidence.source}
      label={evidence.label}
      location={evidence.location}
      text={t('cmp.viewSource')}
      active={active}
      onClick={onOpen}
      controls={controls}
      className={cx('q-cmp-evidence', className)}
      style={style}
    />
  )
}
