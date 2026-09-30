import type { CommercialRFQWrite, RFQRead } from '../types/rfq'
import { rfqHintsForBuyerAsk } from './buyerActionRfqContext'

export type QuickChip = {
  id: string
  label: string
  quantity?: number
  technicalLine?: string
  namedPlace?: string
  deliveryDate?: string
}

const PAIR = /(\d+(?:[.,]\d+)?)\s*(inches?|in\b|cm|mm|µm|um|microns?|gauge|pcs|pieces?|kg|rolls?)/gi
const OR_NUMBERS = /(\d+(?:[.,]\d+)?)\s*(?:or|vs\.?|\/|,)\s*(\d+(?:[.,]\d+)?)(?:\s*(inches?|in|cm|mm|µm|um|microns?|gauge))?/i

function unitLabel(raw: string): string {
  const u = raw.toLowerCase()
  if (u.startsWith('inch') || u === 'in') return 'in'
  if (u.startsWith('micron') || u === 'um' || u === 'µm') return 'µm'
  return raw
}

function alternateMeasure(n: number, unit: string): number {
  if (unit === 'in' && n === 18) return 20
  if (unit === 'in') return n + 2
  if (unit === 'µm' && n === 18) return 23
  return Number.isFinite(n) ? n + 1 : n
}

/** Neutral chips from the supplier's wording plus what is already on the request. */
export function quickAnswersForQuestion(question: string, rfq: RFQRead): QuickChip[] {
  const chips: QuickChip[] = []
  const push = (chip: QuickChip) => {
    if (chips.some(existing => existing.label === chip.label)) return
    chips.push(chip)
  }

  const or = question.match(OR_NUMBERS)
  if (or) {
    const unit = unitLabel(or[3] ?? '')
    push({ id: `a-${or[1]}`, label: unit ? `${or[1]} ${unit}` : or[1], technicalLine: unit ? `${or[1]} ${unit}` : or[1] })
    push({ id: `b-${or[2]}`, label: unit ? `${or[2]} ${unit}` : or[2], technicalLine: unit ? `${or[2]} ${unit}` : or[2] })
  } else {
    const pairs = [...question.matchAll(PAIR)].slice(0, 3)
    if (pairs.length === 1) {
      const n = pairs[0][1]
      const unit = unitLabel(pairs[0][2])
      const alt = alternateMeasure(Number(n.replace(',', '.')), unit)
      push({ id: `yes-${n}`, label: `Yes, ${n} ${unit}`, technicalLine: `${n} ${unit}` })
      push({ id: `no-${alt}`, label: `No, ${alt} ${unit}`, technicalLine: `${alt} ${unit}` })
    } else {
      for (const pair of pairs) {
        const n = pair[1]
        const unit = unitLabel(pair[2])
        push({ id: `${n}-${unit}`, label: `${n} ${unit}`, technicalLine: `${n} ${unit}` })
      }
    }
  }

  for (const hint of rfqHintsForBuyerAsk(rfq, question)) {
    if (hint.field === 'quantity') {
      push({ id: 'qty', label: hint.text, quantity: rfq.quantity })
    } else if (hint.field === 'incoterms') {
      push({ id: 'place', label: hint.text, namedPlace: rfq.incoterms?.named_place })
    } else if (hint.field === 'delivery_date' && rfq.requested_delivery_date) {
      push({ id: 'date', label: hint.text, deliveryDate: rfq.requested_delivery_date })
    } else if (hint.field === 'technical' || hint.field === 'product' || hint.field === 'reference_spec') {
      const short = hint.text.length > 42 ? `${hint.text.slice(0, 40)}…` : hint.text
      push({ id: hint.field, label: short, technicalLine: hint.text })
    }
  }

  return chips.slice(0, 4)
}

export function patchFromAnswers(
  rfq: RFQRead,
  chips: QuickChip[],
  otherTexts: string[],
): Partial<CommercialRFQWrite> {
  const patch: Partial<CommercialRFQWrite> = {}
  const extras: string[] = []
  for (const chip of chips) {
    if (chip.quantity != null) patch.quantity = chip.quantity
    if (chip.namedPlace && rfq.incoterms?.rule) {
      patch.incoterms = { rule: rfq.incoterms.rule, named_place: chip.namedPlace }
    }
    if (chip.deliveryDate) patch.requested_delivery_date = chip.deliveryDate
    if (chip.technicalLine) extras.push(chip.technicalLine)
  }
  extras.push(...otherTexts.map(text => text.trim()).filter(Boolean))
  if (extras.length > 0) {
    const current = rfq.technical_requirements?.trim() ?? ''
    const addition = extras.join('\n')
    patch.technical_requirements = current.includes(addition) ? current : [current, addition].filter(Boolean).join('\n')
  }
  return patch
}

export function composeSupplierReply(
  supplierName: string,
  rows: Array<{ question: string, answer: string }>,
  note: string,
): string {
  const lines = rows.map(row => `Q: ${row.question}\nA: ${row.answer}`)
  if (note.trim()) lines.push(`Note: ${note.trim()}`)
  return [`Hi ${supplierName},`, '', 'Here are the answers:', '', ...lines, '', 'Best regards'].join('\n')
}
