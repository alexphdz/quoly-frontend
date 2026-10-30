import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import type { ApiError } from '../../api/client'
import type { QuoteRead, QuoteUpdate } from '../../types/quote'
import type { RFQRead } from '../../types/rfq'
import {
  useConfirmQuote,
  useDeleteQuote,
  useRejectQuote,
  useRetryQuoteExtraction,
  useRestoreQuote,
  useUpdateQuote,
} from '../../hooks/useQuotes'
import { useFormat } from '../../lib/format'
import { useRelativeTime } from '../../lib/relativeTime'
import { useUnitLabel } from '../../lib/units'
import {
  REVIEW_FIELD_TO_QUOTE,
  extractedValue,
  findSnippet,
  normalizationSteps,
  sameValue,
  type ReviewFieldKey,
} from '../../lib/quoteReview'
import { COMMERCIAL_CURRENCIES } from '../../constants/commercial'
import {
  Breadcrumbs, Button, ConfirmDialog, Icon, IconButton, InlineAlert, Menu, MenuItem, NumberInput, Select, SideSheet,
  StatusBadge, TextButton, TextInput, Textarea, type IconName, type StatusTone,
} from '../../design-system'
import { toast } from '../ui'
import OriginalDocument from '../documents/OriginalDocument'
import ExtractionPassSummary from '../extraction/ExtractionPassSummary'
import TechnicalReview from './TechnicalReview'

type FormValues = Record<ReviewFieldKey | 'notes', string>
type FieldType = 'number' | 'text' | 'currency'

const FIELD_TYPE: Record<ReviewFieldKey, FieldType> = {
  price: 'number',
  currency: 'currency',
  unit: 'text',
  quantity_per_unit: 'number',
  quantity_moq: 'number',
  delivery_lead_time_days: 'number',
  payment_terms: 'text',
  delivery_point: 'text',
}
const FIELDS = Object.keys(FIELD_TYPE) as ReviewFieldKey[]
const NUMERIC: ReviewFieldKey[] = ['price', 'quantity_per_unit', 'quantity_moq', 'delivery_lead_time_days']

/* Grupos de la pantalla 06; el precio se edita como un solo dato (importe, moneda y unidad). */
const GROUPS: { id: string, rows: { id: string, fields: ReviewFieldKey[] }[] }[] = [
  { id: 'quantity', rows: [{ id: 'quantity_per_unit', fields: ['quantity_per_unit'] }, { id: 'quantity_moq', fields: ['quantity_moq'] }] },
  { id: 'delivery', rows: [{ id: 'delivery_lead_time_days', fields: ['delivery_lead_time_days'] }] },
  { id: 'other', rows: [{ id: 'delivery_point', fields: ['delivery_point'] }, { id: 'payment_terms', fields: ['payment_terms'] }] },
]
const PRICE_ROW = { id: 'price', fields: ['price', 'currency', 'unit'] as ReviewFieldKey[] }

const STATUS: Record<string, { tone: StatusTone, icon: IconName }> = {
  draft: { tone: 'ai', icon: 'quoly-proposed' },
  confirmed: { tone: 'success', icon: 'check-circle' },
  rejected: { tone: 'neutral', icon: 'prohibit' },
}

function toForm(quote: QuoteRead): FormValues {
  const values = {} as FormValues
  for (const key of FIELDS) {
    const value = quote[REVIEW_FIELD_TO_QUOTE[key]]
    values[key] = value == null ? '' : String(value)
  }
  values.notes = quote.raw_notes ?? ''
  return values
}

function toUpdate(values: FormValues): QuoteUpdate {
  const out: Record<string, unknown> = {}
  for (const key of FIELDS) {
    const raw = values[key].trim()
    out[REVIEW_FIELD_TO_QUOTE[key]] = raw === '' ? null : NUMERIC.includes(key) ? Number(raw) : raw
  }
  out.raw_notes = values.notes.trim() || null
  return out as QuoteUpdate
}

/** 06 · Revisión de una cotización: datos del proveedor con su procedencia, edición por fila y confirmación. */
export default function QuoteReview({ quote, rfq, embedded = false }: { quote: QuoteRead, rfq?: RFQRead, embedded?: boolean }) {
  const { t } = useTranslation('quote')
  const fmt = useFormat()
  const units = useUnitLabel()
  const relative = useRelativeTime()
  const navigate = useNavigate()
  const updateQuote = useUpdateQuote(quote.id)
  const confirmQuote = useConfirmQuote(quote.id, quote.rfq_id)
  const rejectQuote = useRejectQuote(quote.id, quote.rfq_id)
  const restoreQuote = useRestoreQuote(quote.id, quote.rfq_id)
  const retryExtraction = useRetryQuoteExtraction(quote.id, quote.rfq_id)
  const deleteQuote = useDeleteQuote(quote.id, quote.rfq_id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editingRow, setEditingRow] = useState<string | null>(null)
  const [sourceOpen, setSourceOpen] = useState(false)
  const [pinned, setPinned] = useState<string | null>(null)

  const form = useForm<FormValues>({ defaultValues: toForm(quote) })
  const { register, handleSubmit, watch, reset, setValue, formState: { isDirty } } = form
  useEffect(() => { reset(toForm(quote)) }, [quote, reset])
  const values = watch()

  const sources = quote.commercial_offer?.field_sources ?? {}
  const steps = normalizationSteps(quote, rfq?.base_unit)
  const priceMissing = values.price.trim() === ''
  const sourceKind = quote.file_type && quote.file_type !== 'text' ? quote.file_type : 'email'
  const status = STATUS[quote.status] ?? STATUS.draft
  const readOnly = rfq?.status === 'decided' || rfq?.status === 'closed'
  const needsPrice = priceMissing && rfq?.request_kind !== 'commercial'
  const toReview = FIELDS.filter(key => extractedValue(quote, key) != null && quote.status === 'draft').length

  const save = (after?: () => void) =>
    handleSubmit(data => {
      updateQuote.mutate({ ...toUpdate(data), expected_approved_revision: quote.approved_revision ?? 0 }, {
        onSuccess: () => {
          setEditingRow(null)
          if (after) after()
          else toast(t('review.saved'))
        },
      })
    })()

  const cancelEdit = () => {
    reset(toForm(quote))
    setEditingRow(null)
  }

  const include = () => {
    const run = () => confirmQuote.mutate(undefined, { onSuccess: () => toast(t('review.includedToast')) })
    if (isDirty) save(run)
    else run()
  }

  const showSource = (snippet?: string | null) => {
    setPinned(snippet ?? null)
    setSourceOpen(true)
  }

  /* Procedencia de un dato: leído por Quoly (por revisar / confirmado), corregido por ti o no indicado. */
  const provenance = (key: ReviewFieldKey) => {
    const saved = quote[REVIEW_FIELD_TO_QUOTE[key]]
    const original = extractedValue(quote, key)
    const empty = saved == null || String(saved).trim() === ''
    if (empty) return null
    const edited = original != null ? !sameValue(saved, original) : true
    if (edited) {
      return (
        <span className="qr2-prov is-edited">
          <Icon name="pencil-simple" size={14} />
          {t('v2.prov.edited')}
          {original != null && <span className="qr2-prov-original">{t('v2.prov.original', { value: String(original) })}</span>}
        </span>
      )
    }
    return quote.status === 'confirmed'
      ? <span className="qr2-prov is-confirmed"><Icon name="quoly-intelligence" size={14} />{t('v2.prov.confirmed')}</span>
      : <span className="qr2-prov is-ai"><Icon name="quoly-proposed" size={14} />{t('v2.prov.read')}</span>
  }

  const display = (key: ReviewFieldKey): ReactNode => {
    const raw = values[key].trim()
    if (!raw) return null
    if (key === 'delivery_lead_time_days') return t('v2.days', { count: Number(raw) })
    if (key === 'quantity_moq' || key === 'quantity_per_unit') return fmt.number(Number(raw))
    if (key === 'currency') return raw.toUpperCase()
    return raw
  }

  const fieldInput = (key: ReviewFieldKey, autoFocus: boolean) => {
    const label = t(`review.field.${key}`)
    const type = FIELD_TYPE[key]
    if (type === 'currency') {
      return (
        <Select
          key={key}
          label={label}
          optionalLabel=""
          size="sm"
          value={values.currency.toUpperCase()}
          onChange={event => setValue('currency', event.target.value, { shouldDirty: true })}
          options={currencyOptions(values.currency)}
          placeholder={t('review.state.notStated')}
        />
      )
    }
    const Input = type === 'number' ? NumberInput : TextInput
    return <Input key={key} label={label} optionalLabel="" size="sm" autoFocus={autoFocus} {...register(key)} />
  }

  const onEditorKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') { event.preventDefault(); cancelEdit() }
  }

  const rowActions = (row: { id: string, fields: ReviewFieldKey[] }, empty: boolean) => {
    const snippet = sources[row.fields[0]]
    return (
      <span className="qr2-row-actions">
        {snippet && <TextButton size="sm" icon="envelope-simple" onClick={() => showSource(snippet)}>{t('v2.viewSource')}</TextButton>}
        {!readOnly && (
          <TextButton size="sm" icon="pencil-simple" onClick={() => setEditingRow(row.id)}>
            {empty ? t('v2.addData') : t('v2.editData')}
          </TextButton>
        )}
      </span>
    )
  }

  const editor = (row: { id: string, fields: ReviewFieldKey[] }) => (
    <form
      className="qr2-editor"
      onKeyDown={onEditorKey}
      onSubmit={event => { event.preventDefault(); save() }}
    >
      <div className="qr2-editor-fields">{row.fields.map((key, i) => fieldInput(key, i === 0))}</div>
      {updateQuote.error && <InlineAlert tone="error">{(updateQuote.error as ApiError).detail || t('edit.failed')}</InlineAlert>}
      <div className="qr2-editor-actions">
        <Button variant="tertiary" size="sm" onClick={cancelEdit}>{t('v2.cancel')}</Button>
        <Button type="submit" size="sm" loading={updateQuote.isPending} disabled={!isDirty}>{t('v2.saveChange')}</Button>
      </div>
    </form>
  )

  const dataRow = (row: { id: string, fields: ReviewFieldKey[] }) => {
    const key = row.fields[0]
    const value = display(key)
    return (
      <div key={row.id} className="qr2-row">
        <span className="qr2-row-label">{t(`v2.label.${key}`, { defaultValue: t(`review.field.${key}`) })}</span>
        {editingRow === row.id
          ? editor(row)
          : (
            <>
              <span className="qr2-row-value">
                {value != null ? <span className="qr2-value">{value}</span> : <span className="qr2-missing">{t('review.state.notStated')}</span>}
                {provenance(key)}
              </span>
              {rowActions(row, value == null)}
            </>
          )}
      </div>
    )
  }

  const priceUnit = values.unit.trim() ? (units.per(values.unit.trim()) || values.unit.trim()) : ''
  const fileName = quote.file_url ? (quote.raw_text?.match(/^\[ATTACHMENT: (.+)\]$/m)?.[1] ?? null) : null

  const header = (
    <header className="qr2-head">
      <div className="qr2-head-main">
        {embedded
          ? <h3 className="qr2-title">{quote.supplier_name}</h3>
          : <h1 className="qr2-title is-page">{quote.supplier_name}</h1>}
        <p className="qr2-sub">
          {t('v2.sub', { request: rfq?.name ?? t('breadcrumb.rfq'), when: relative(quote.created_at) })}
          {' · '}
          {t(`review.sourceKind.${sourceKind}`, { defaultValue: sourceKind.toUpperCase() })}
        </p>
        <span className="qr2-badges">
          <StatusBadge tone={status.tone} variant="quiet" icon={status.icon}>{t(`v2.status.${quote.status}`, { defaultValue: quote.status })}</StatusBadge>
          {fileName && <span className="qr2-file"><Icon name="file-text" size={14} />{fileName}</span>}
          <TextButton size="sm" icon="envelope-simple" onClick={() => showSource(null)}>{t('v2.viewOriginal')}</TextButton>
        </span>
        {quote.status === 'draft' && toReview > 0 && (
          <p className="qr2-ai-note"><Icon name="quoly-proposed" size={14} />{t('v2.aiNote', { count: toReview })}</p>
        )}
      </div>
      {!readOnly && (
        <div className="qr2-head-actions">
          {quote.status === 'draft' && (
            <Button icon="check" loading={confirmQuote.isPending} disabled={needsPrice} onClick={include}>{t('v2.confirm')}</Button>
          )}
          {quote.status === 'rejected' && (
            <Button variant="secondary" icon="arrow-counter-clockwise" loading={restoreQuote.isPending} onClick={() => restoreQuote.mutate(undefined, { onSuccess: () => toast(t('toast.updated')) })}>
              {t('actions.restore')}
            </Button>
          )}
          <Menu align="end" trigger={<IconButton icon="dots-three" label={t('review.more')} variant="secondary" />}>
            {quote.status !== 'rejected' && (
              <MenuItem icon="prohibit" onSelect={() => rejectQuote.mutate(undefined, { onSuccess: () => toast(t('review.excluded')) })}>
                {t('actions.reject')}
              </MenuItem>
            )}
            <MenuItem icon="trash" tone="destructive" onSelect={() => setConfirmDelete(true)}>{t('actions.delete')}</MenuItem>
          </Menu>
        </div>
      )}
    </header>
  )

  const body = (
    <div className="qr2">
      {header}

      {quote.status === 'confirmed' && <InlineAlert tone="success">{priceMissing ? t('v2.confirmedNoPrice') : t('banner.confirmed')}</InlineAlert>}
      {quote.status === 'rejected' && <InlineAlert tone="warning">{t('banner.rejected')}</InlineAlert>}
      {confirmQuote.error && <InlineAlert tone="error">{(confirmQuote.error as ApiError).detail === 'quote_price_required' ? t('review.needsPrice') : t('actions.acceptFailed')}</InlineAlert>}
      {quote.commercial_offer?.price_applicability
        && quote.commercial_offer.price_applicability.status !== 'applicable'
        && quote.commercial_offer.price_applicability.status !== 'not_available' && (
        <InlineAlert tone="warning">
          {t(`review.priceApplicability.${quote.commercial_offer.price_applicability.reason}`, {
            offered: quote.commercial_offer.price_applicability.offered_quantity,
            offeredUnit: quote.commercial_offer.price_applicability.offered_unit ?? '',
            requested: quote.commercial_offer.price_applicability.requested_quantity,
            requestedUnit: quote.commercial_offer.price_applicability.requested_unit ?? '',
          })}
        </InlineAlert>
      )}

      <section className="qr2-price" aria-labelledby={`qr2-price-${quote.id}`}>
        <div className="qr2-price-main">
          <span id={`qr2-price-${quote.id}`} className="qr2-eyebrow">{t('v2.priceStated')}</span>
          {editingRow === 'price'
            ? editor(PRICE_ROW)
            : (
              <>
                {priceMissing
                  ? <span className="qr2-price-missing">{t('v2.priceNotStated')}</span>
                  : (
                    <span className="qr2-price-figure">
                      <span className="qr2-price-cur">{values.currency.trim().toUpperCase()}</span>
                      <span className="qr2-price-num">{fmt.number(Number(values.price), { maximumFractionDigits: 4 })}</span>
                      {priceUnit && <span className="qr2-price-unit">{t('v2.per', { unit: priceUnit })}</span>}
                    </span>
                  )}
                {provenance('price')}
                {rowActions(PRICE_ROW, priceMissing)}
              </>
            )}
        </div>
        <NormalizationBlock quote={quote} steps={steps} />
      </section>

      {GROUPS.map(group => (
        <section key={group.id} className="qr2-group" aria-labelledby={`qr2-g-${group.id}-${quote.id}`}>
          <h4 id={`qr2-g-${group.id}-${quote.id}`} className="qr2-group-title">{t(`v2.group.${group.id}`)}</h4>
          <div className="qr2-rows">{group.rows.map(dataRow)}</div>
        </section>
      ))}

      {(values.notes.trim() || !readOnly) && (
        <section className="qr2-group">
          <h4 className="qr2-group-title">{t('fields.notes')}</h4>
          {editingRow === 'notes'
            ? (
              <form className="qr2-editor" onKeyDown={onEditorKey} onSubmit={event => { event.preventDefault(); save() }}>
                <Textarea label={t('fields.notes')} optionalLabel="" rows={3} {...register('notes')} />
                <div className="qr2-editor-actions">
                  <Button variant="tertiary" size="sm" onClick={cancelEdit}>{t('v2.cancel')}</Button>
                  <Button type="submit" size="sm" loading={updateQuote.isPending} disabled={!isDirty}>{t('v2.saveChange')}</Button>
                </div>
              </form>
            )
            : (
              <div className="qr2-notes">
                {values.notes.trim() ? <p className="qr2-notes-text">{values.notes}</p> : <span className="qr2-missing">{t('review.state.notStated')}</span>}
                {!readOnly && <TextButton size="sm" icon="pencil-simple" onClick={() => setEditingRow('notes')}>{values.notes.trim() ? t('v2.editData') : t('v2.addData')}</TextButton>}
              </div>
            )}
        </section>
      )}

      {(quote.commercial_offer?.cost_lines?.length ?? 0) > 0 && (
        <section className="qr2-group">
          <h4 className="qr2-group-title">{t('review.costLines')}</h4>
          <table className="qr2-table">
            <thead>
              <tr>
                <th scope="col">{t('review.lineName')}</th>
                <th scope="col" className="is-num">{t('review.lineAmount')}</th>
                <th scope="col">{t('review.lineBasis')}</th>
              </tr>
            </thead>
            <tbody>
              {quote.commercial_offer!.cost_lines!.map((line, index) => (
                <tr key={index}>
                  <td>
                    <span className="qr2-value">{line.name}</span>
                    {line.source_wording && <TextButton size="sm" icon="envelope-simple" onClick={() => showSource(line.source_wording)}>{t('v2.viewSource')}</TextButton>}
                  </td>
                  <td className="is-num">
                    {line.included
                      ? <StatusBadge tone="neutral" variant="quiet" icon={false}>{t('review.included')}</StatusBadge>
                      : line.amount == null
                        ? <span className="qr2-missing">{t('review.state.notStated')}</span>
                        : `${line.currency ?? ''} ${fmt.number(line.amount, { maximumFractionDigits: line.basis === 'lot' ? 2 : 4 })}`.trim()}
                  </td>
                  <td className="qr2-muted">{t(`review.basis.${line.basis ?? 'per_unit'}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {(quote.commercial_offer?.conditions?.length ?? 0) > 0 && (
        <section className="qr2-group">
          <h4 className="qr2-group-title">{t('review.conditions')}</h4>
          <ul className="qr2-list">
            {quote.commercial_offer!.conditions!.map((condition, index) => (
              <li key={`${condition.kind}-${index}`}>
                <span className="qr2-row-label">{t(`review.conditionType.${condition.kind}`, { defaultValue: t('review.conditionType.other') })}</span>
                <span className="qr2-value">{condition.wording}</span>
                {condition.field_name && <span className="qr2-muted">{t('review.conditionField', { field: condition.field_name })}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {(quote.commercial_offer?.payment_milestones?.length ?? 0) > 0 && (
        <section className="qr2-group">
          <h4 className="qr2-group-title">{t('review.paymentMilestones')}</h4>
          <ul className="qr2-list">
            {quote.commercial_offer!.payment_milestones!.map((milestone, index) => (
              <li key={`payment-${index}`}>
                <span className="qr2-row-label">{milestone.percentage != null ? `${milestone.percentage}%` : t('review.paymentMilestone')}</span>
                <span className="qr2-value">{[milestone.trigger, milestone.due].filter(Boolean).join(' · ')}</span>
                {milestone.source_wording && <TextButton size="sm" icon="envelope-simple" onClick={() => showSource(milestone.source_wording)}>{t('v2.viewSource')}</TextButton>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <TechnicalReview quoteId={quote.id} onSource={snippet => showSource(snippet)} />

      {quote.extraction_pass && (
        <section className="qr2-group qr2-ai">
          <ExtractionPassSummary
            data={quote.extraction_pass}
            onEvidenceSelect={snippet => showSource(snippet)}
            retrying={retryExtraction.isPending}
            onRetry={quote.extraction_pass.processing?.status === 'failed'
              ? () => retryExtraction.mutate(undefined, {
                  onSuccess: result => toast(result.extraction_pass?.processing?.status === 'failed'
                    ? t('review.retryStillFailed')
                    : t('review.retryComplete')),
                })
              : undefined}
          />
        </section>
      )}

      {quote.status === 'draft' && !readOnly && (
        <footer className="qr2-footer">
          <p className="qr2-muted">{priceMissing ? t('v2.confirmNoPrice') : t('v2.confirmNote')}</p>
          <Button icon="check" loading={confirmQuote.isPending} disabled={needsPrice} onClick={include}>{t('v2.confirm')}</Button>
        </footer>
      )}

      <SideSheet open={sourceOpen} onClose={() => setSourceOpen(false)} title={t('v2.sourceTitle')} description={`${quote.supplier_name} · ${fmt.date(quote.created_at, { dateStyle: 'medium', timeStyle: 'short' })}`} width={560}>
        <div className="qr2-source">
          {quote.file_url && <OriginalDocument endpoint={`/quotes/${quote.id}/original`} fileType={quote.file_type} />}
          <SourceText text={quote.raw_text ?? ''} highlight={pinned} emptyLabel={t('review.noText')} />
        </div>
      </SideSheet>

      <ConfirmDialog
        open={confirmDelete}
        tone="destructive"
        title={t('actions.deleteConfirm')}
        description={t('actions.deleteWarning')}
        confirmLabel={t('actions.delete')}
        cancelLabel={t('v2.cancel')}
        pending={deleteQuote.isPending}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteQuote.mutate(undefined, { onSuccess: () => navigate(`/rfqs/${quote.rfq_id}?tab=quotations`) })}
      />
    </div>
  )

  if (embedded) return body
  return (
    <div className="rd2-page">
      <Breadcrumbs
        items={[
          { label: t('review.crumbRequests'), to: '/requests' },
          { label: rfq?.name ?? t('breadcrumb.rfq'), to: `/rfqs/${quote.rfq_id}` },
          { label: quote.supplier_name },
        ]}
      />
      <div className="qr2-page-body">{body}</div>
    </div>
  )
}

function currencyOptions(current: string) {
  const codes: string[] = [...COMMERCIAL_CURRENCIES]
  const code = current.trim().toUpperCase()
  if (code && !codes.includes(code)) codes.push(code)
  return codes.map(value => ({ value, label: value }))
}

function readableSource(text: string, attachmentLabel: (name: string) => string) {
  return text
    .replace(/^\[BODY\]\n?/m, '')
    .replace(/^\[ATTACHMENT: (.+)\]$/gm, (_, name: string) => `\n── ${attachmentLabel(name)} ──`)
}

function SourceText({ text: raw, highlight, emptyLabel }: { text: string, highlight: string | null, emptyLabel: string }) {
  const { t } = useTranslation('quote')
  const text = readableSource(raw, name => t('review.attachment', { name }))
  const markRef = useRef<HTMLElement>(null)
  const range = findSnippet(text, highlight)
  useEffect(() => {
    markRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [range?.[0], range?.[1]])
  if (!text.trim()) return <p className="qr2-muted">{emptyLabel}</p>
  let body: ReactNode = text
  if (range) {
    body = (
      <>
        {text.slice(0, range[0])}
        <mark ref={markRef} className="qr2-mark">{text.slice(range[0], range[1])}</mark>
        {text.slice(range[1])}
      </>
    )
  }
  return <pre className="qr2-source-text" tabIndex={0}>{body}</pre>
}

/** Precio normalizado: solo cuando hay moneda y unidad comparables; si no, el motivo. */
function NormalizationBlock({ quote, steps }: { quote: QuoteRead, steps: ReturnType<typeof normalizationSteps> }) {
  const { t } = useTranslation('quote')
  const fmt = useFormat()
  const units = useUnitLabel()
  const rawUnit = units.per(steps?.raw.unit) || steps?.raw.unit || ''
  const resultUnit = units.per(steps?.result.unit) || steps?.result.unit || ''
  const blocked = quote.missing_fields.filter(field => field === 'currency_conversion' || field === 'unit_conversion')
  const noConversion = steps != null && steps.rate == null && steps.divisor == null
  return (
    <div className="qr2-norm">
      <span className="qr2-eyebrow">{t('v2.normalized')}</span>
      {steps
        ? (
          <>
            <span className="qr2-norm-value">{`${fmt.unitNumber(steps.result.price)} ${steps.result.currency} / ${resultUnit}`}</span>
            {noConversion
              ? <p className="qr2-muted">{t('review.normSame')}</p>
              : (
                <p className="qr2-muted" aria-label={t('review.normAria')}>
                  {[
                    `${fmt.unitNumber(steps.raw.price)} ${steps.raw.currency} / ${rawUnit}`,
                    steps.rate != null ? `× ${fmt.number(steps.rate, { maximumFractionDigits: 4 })} ${steps.result.currency}/${steps.raw.currency}` : null,
                    steps.divisor != null ? `÷ ${fmt.number(steps.divisor)}` : null,
                  ].filter(Boolean).join(' ')}
                  {'. '}
                  {t('review.normNote')}
                </p>
              )}
          </>
        )
        : (
          <>
            <span className="qr2-norm-value is-missing">{t('v2.notComparableYet')}</span>
            <p className="qr2-muted">{blocked.length > 0 ? blocked.map(field => t(`review.blocked.${field}`)).join(' ') : t('review.normNeedsPrice')}</p>
          </>
        )}
    </div>
  )
}
