import type { RFQAttachment, RFQRead } from '../types/rfq'

export type BuyerAskRfqHint = {
  field: 'quantity' | 'incoterms' | 'delivery_date' | 'technical' | 'product' | 'reference_spec'
  text: string
}

const QUANTITY = /\b(quantity|qty|moq|volume|how much|how many|units?|amount)\b/i
const INCOTERMS = /\b(incoterm|fob|cif|exw|ddp|dap|named place|delivery point|ship from|port of|destination)\b/i
const DELIVERY_DATE = /\b(delivery date|when do you need|need by|lead time|timeline|deadline)\b/i
const TECHNICAL = /\b(technical|specification|requirements?|grade|standard|certification|assay|purity|food grade)\b/i
const PRODUCT = /\b(product name|what product|sku|item name|material name)\b/i
const SPEC_FILE = /\b(spec sheet|datasheet|attachment|pdf|reference spec|drawing)\b/i

function referenceSpecs(rfq: RFQRead): RFQAttachment[] {
  return (rfq.attachments ?? []).filter((a): a is RFQAttachment => {
    if (!('scope' in a)) return false
    return a.scope === 'rfq' && (a.kind === 'reference_specification' || !a.kind)
  })
}

/** Heuristic: surface RFQ fields that likely answer a supplier ask (SCREEN-GUIDE § buyer actions). */
export function rfqHintsForBuyerAsk(rfq: RFQRead, question: string): BuyerAskRfqHint[] {
  const q = question.trim()
  if (!q) return []

  const hints: BuyerAskRfqHint[] = []

  if (QUANTITY.test(q) && rfq.quantity != null && rfq.base_unit) {
    hints.push({ field: 'quantity', text: `${rfq.quantity} ${rfq.base_unit}` })
  }

  if (INCOTERMS.test(q) && rfq.incoterms?.rule && rfq.incoterms?.named_place) {
    hints.push({
      field: 'incoterms',
      text: `${rfq.incoterms.rule} ${rfq.incoterms.named_place}`,
    })
  }

  if (DELIVERY_DATE.test(q) && rfq.requested_delivery_date) {
    hints.push({ field: 'delivery_date', text: rfq.requested_delivery_date })
  }

  if (TECHNICAL.test(q) && rfq.technical_requirements?.trim()) {
    hints.push({ field: 'technical', text: rfq.technical_requirements.trim() })
  }

  if (PRODUCT.test(q) && rfq.name?.trim()) {
    hints.push({ field: 'product', text: rfq.name.trim() })
  }

  if (SPEC_FILE.test(q)) {
    const specs = referenceSpecs(rfq)
    if (specs.length > 0) {
      const names = specs.map((s) => s.file_name).filter(Boolean).join(', ')
      hints.push({ field: 'reference_spec', text: names })
    }
  }

  const seen = new Set<string>()
  return hints.filter((h) => {
    const key = `${h.field}:${h.text}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
