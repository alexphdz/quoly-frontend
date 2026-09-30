import type { RFQAttachment } from '../types/rfq'

export type SpecScenario = 'reference_file' | 'text_requirements' | 'ask_datasheet'

const REFERENCE_KIND = 'reference_specification'

export function referenceSpecificationAttachments(attachments?: RFQAttachment[]): RFQAttachment[] {
  return (attachments ?? []).filter(
    (a) => a.scope === 'rfq' && (a.kind === REFERENCE_KIND || !a.kind),
  )
}

export function resolveSpecScenario(input: {
  technical_requirements?: string | null
  attachments?: RFQAttachment[]
}): SpecScenario {
  if (referenceSpecificationAttachments(input.attachments).length > 0) {
    return 'reference_file'
  }
  if (input.technical_requirements?.trim()) {
    return 'text_requirements'
  }
  return 'ask_datasheet'
}

export function buyerHasReference(input: {
  technical_requirements?: string | null
  attachments?: RFQAttachment[]
}): boolean {
  return resolveSpecScenario(input) !== 'ask_datasheet'
}
