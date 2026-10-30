import type { ReactNode } from 'react'
import type { TFunction } from 'i18next'
import { cx } from '../../utils'
import { Icon, type IconName } from '../core/Icon'

export type EvidenceSource = 'email' | 'pdf' | 'document' | 'attachment'

export const SOURCE_ICON: Record<EvidenceSource, IconName> = {
  email: 'envelope-simple',
  pdf: 'file-pdf',
  document: 'file-text',
  attachment: 'paperclip',
}

export type FieldState = 'proposed' | 'confirmed' | 'missing' | 'noncomparable'
export type FieldTone = 'ai' | 'confirmed' | 'muted' | 'primary'

/** Marca de estado/procedencia: icono (o símbolo) + texto, nunca solo color. */
export function QiMark({ icon, mark, tone, children, size = 'md', strong }: {
  icon?: IconName | null
  mark?: ReactNode
  tone: FieldTone
  children: ReactNode
  size?: 'sm' | 'md'
  strong?: boolean
}) {
  return (
    <span className={cx('q-qi-mark', `is-${tone}`, `is-${size}`, strong && 'is-strong')}>
      {mark ?? (icon && <Icon name={icon} size={14} />)}
      {children}
    </span>
  )
}

/** Valor corto numérico (cifras, rangos, porcentajes) → tipografía de cifra. */
export function isNumericValue(v: unknown) {
  return typeof v === 'number' || (typeof v === 'string' && v.length <= 14 && /^[\d.,\s%–-]+$/.test(v))
}

export function isMissing(state: FieldState, value: unknown) {
  return state === 'missing' || (value == null && state !== 'noncomparable')
}

/** Estado de revisión visible en la región C de un campo. */
export function fieldStatus(t: TFunction<'ds'>, { state, corrected, value }: { state: FieldState, corrected?: boolean, value: unknown }): { label: string, tone: FieldTone, icon: IconName | null } {
  if (isMissing(state, value)) return { label: t('qi.state.missing'), tone: 'muted', icon: null }
  if (state === 'noncomparable') return { label: t('qi.state.noncomparable'), tone: 'muted', icon: null }
  if (state === 'confirmed') return { label: t('qi.state.confirmed'), tone: 'confirmed', icon: 'check' }
  return { label: corrected ? t('qi.state.toConfirm') : t('qi.state.toReview'), tone: 'ai', icon: null }
}

export function SkeletonBar({ width, height = 10 }: { width: number | string, height?: number }) {
  return <span aria-hidden="true" className="q-qi-skel" style={{ width, height }} />
}
