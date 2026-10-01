import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  useRestoreQuote,
  useUpdateQuote,
} from '../../hooks/useQuotes'
import { rfqDisplayNumber } from '../../lib/rfqDisplay'
import { useFormat } from '../../lib/format'
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
import { AiMark, Breadcrumbs, Btn, Chip, ConfirmDialog, Icon, Menu, Money, SectionCard, Segmented, Select, Tip } from '../ds'
import { QuoteStatusChip } from '../ds/StatusChips'
import { Alert, cn, toast } from '../ui'

interface FieldDef {
  key: ReviewFieldKey
  type: 'number' | 'text' | 'currency'
  wide?: boolean
  addon?: (values: FormValues) => string | undefined
}

type FormValues = Record<ReviewFieldKey | 'notes', string>

const FIELDS: FieldDef[] = [
  { key: 'price', type: 'number', addon: v => v.currency || undefined },
  { key: 'currency', type: 'currency' },
  { key: 'unit', type: 'text' },
  { key: 'quantity_per_unit', type: 'number' },
  { key: 'quantity_moq', type: 'number' },
  { key: 'delivery_lead_time_days', type: 'number' },
  { key: 'payment_terms', type: 'text', wide: true },
  { key: 'delivery_point', type: 'text', wide: true },
]

const NUMERIC: ReviewFieldKey[] = ['price', 'quantity_per_unit', 'quantity_moq', 'delivery_lead_time_days']

function toForm(quote: QuoteRead): FormValues {
  const values = {} as FormValues
  for (const field of FIELDS) {
    const value = quote[REVIEW_FIELD_TO_QUOTE[field.key]]
    values[field.key] = value == null ? '' : String(value)
  }
  values.notes = quote.raw_notes ?? ''
  return values
}

function toUpdate(values: FormValues): QuoteUpdate {
  const out: Record<string, unknown> = {}
  for (const field of FIELDS) {
    const raw = values[field.key].trim()
    out[REVIEW_FIELD_TO_QUOTE[field.key]] = raw === '' ? null : NUMERIC.includes(field.key) ? Number(raw) : raw
  }
  out.raw_notes = values.notes.trim() || null
  return out as QuoteUpdate
}

const SOURCE_ICON: Record<string, string> = { pdf: 'description', xlsx: 'table_chart', csv: 'table_chart', docx: 'description', text: 'mail' }

export default function QuoteReview({ quote, rfq }: { quote: QuoteRead, rfq?: RFQRead }) {
  const { t } = useTranslation('quote')
  const fmt = useFormat()
  const navigate = useNavigate()
  const updateQuote = useUpdateQuote(quote.id)
  const confirmQuote = useConfirmQuote(quote.id, quote.rfq_id)
  const rejectQuote = useRejectQuote(quote.id, quote.rfq_id)
  const restoreQuote = useRestoreQuote(quote.id, quote.rfq_id)
  const deleteQuote = useDeleteQuote(quote.id, quote.rfq_id)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)
  const [view, setView] = useState<'original' | 'text'>('text')
  const inputs = useRef<Partial<Record<ReviewFieldKey, HTMLElement | null>>>({})

  const form = useForm<FormValues>({ defaultValues: toForm(quote) })
  const { register, handleSubmit, watch, reset, setValue, formState: { isDirty } } = form
  useEffect(() => { reset(toForm(quote)) }, [quote, reset])
  const values = watch()

  const sources = quote.commercial_offer?.field_sources ?? {}
  const highlight = pinned ?? active
  const steps = normalizationSteps(quote, rfq?.base_unit)
  const priceMissing = values.price.trim() === ''
  const sourceIcon = SOURCE_ICON[quote.file_type ?? 'text'] ?? 'description'
  const sourceKind = quote.file_type && quote.file_type !== 'text' ? quote.file_type : 'email'

  const save = (after?: () => void) =>
    handleSubmit(data => {
      updateQuote.mutate(toUpdate(data), {
        onSuccess: () => {
          setEditing(false)
          if (after) after()
          else toast(t('review.saved'))
        },
      })
    })()

  const cancelEdit = () => {
    reset(toForm(quote))
    setEditing(false)
  }

  const include = () => {
    const run = () => confirmQuote.mutate(undefined, { onSuccess: () => toast(t('review.includedToast')) })
    if (isDirty) save(run)
    else run()
  }

  const showInSource = (snippet: string) => {
    setPinned(current => (current === snippet ? null : snippet))
    setView('text')
  }

  return (
    <div className="ds-page qr-page">
      <Breadcrumbs
        backTo={`/rfqs/${quote.rfq_id}`}
        items={[
          { label: t('review.crumbRequests'), to: '/' },
          { label: rfq?.name ?? t('breadcrumb.rfq'), to: `/rfqs/${quote.rfq_id}` },
          { label: t('title') },
        ]}
      />
      <header className="qr-head">
        <div className="qr-title-row">
          <h1 className="ds-detail-title">{t('title')}</h1>
          <QuoteStatusChip status={quote.status} />
          {rfq && <span className="ds-id">{rfqDisplayNumber(rfq)}</span>}
        </div>
        <p className="qr-sub">
          <span className="qr-sub-name">{quote.supplier_name}</span>
          {' · '}
          {t(`review.sourceKind.${sourceKind}`, { defaultValue: sourceKind.toUpperCase() })}
          {' · '}
          {t('review.received', { date: fmt.date(quote.created_at, { dateStyle: 'medium', timeStyle: 'short' }) })}
        </p>
      </header>

      {quote.status === 'rejected' && <Alert tone="warning">{t('banner.rejected')}</Alert>}

      <div className="qr-grid">
        <SectionCard
          icon={sourceIcon}
          title={t('review.sourceTitle')}
          className="qr-source-card"
          flush
          actions={(
            <div className="qr-source-actions">
              {quote.file_type === 'pdf' && quote.file_url && (
                <Segmented
                  ariaLabel={t('review.viewLabel')}
                  value={view}
                  onChange={setView}
                  options={[
                    { value: 'original', label: t('review.viewOriginal') },
                    { value: 'text', label: t('review.viewText') },
                  ]}
                />
              )}
              {quote.file_url && (
                <a className="ds-btn ds-btn-ghost ds-btn-sm" href={quote.file_url} target="_blank" rel="noreferrer">
                  <Icon name="open_in_new" size={16} />
                  {t('review.openOriginal')}
                </a>
              )}
            </div>
          )}
        >
          {view === 'original' && quote.file_url ? (
            <iframe className="qr-pdf" src={quote.file_url} title={t('review.sourceTitle')} />
          ) : (
            <SourceText text={quote.raw_text ?? ''} highlight={highlight} emptyLabel={t('review.noText')} />
          )}
        </SectionCard>

        <div className="qr-side">
          {quote.faithful_summary && (
            <SectionCard icon="format_list_bulleted" title={t('supplierSummary')} actions={<AiMark kind="read" />}>
              <p className="qr-summary">{quote.faithful_summary}</p>
            </SectionCard>
          )}

          <SectionCard
            icon="description"
            title={t('review.fieldsTitle')}
            actions={editing ? (
              <Btn variant="ghost" icon="close" onClick={cancelEdit}>{t('review.cancelEdit')}</Btn>
            ) : (
              <div className="qr-fields-actions">
                <AiMark kind="read" />
                <Btn variant="ghost" icon="edit" onClick={() => setEditing(true)}>{t('review.editFields')}</Btn>
              </div>
            )}
          >
            {editing ? (
            <form className="qr-fields" onSubmit={event => { event.preventDefault(); save() }}>
              {FIELDS.map(field => {
                const saved = quote[REVIEW_FIELD_TO_QUOTE[field.key]]
                const original = extractedValue(quote, field.key)
                const snippet = sources[field.key]
                const empty = values[field.key].trim() === ''
                const edited = original != null ? !sameValue(saved, original) : saved != null
                const required = quote.missing_fields.includes(field.key) || (field.key === 'price' && empty)
                const { ref, ...rest } = register(field.key)
                return (
                  <div
                    key={field.key}
                    className={cn('qr-field', field.wide && 'is-wide', highlight && snippet === highlight && 'is-active')}
                    onMouseEnter={() => snippet && setActive(snippet)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => snippet && setActive(snippet)}
                    onBlur={() => setActive(null)}
                  >
                    <div className="qr-field-head">
                      <label htmlFor={`qr-${field.key}`}>{t(`review.field.${field.key}`)}</label>
                      <FieldState empty={empty} required={required} edited={edited} read={original != null} />
                    </div>
                    {field.type === 'currency' ? (
                      <Select
                        id={`qr-${field.key}`}
                        value={values.currency.toUpperCase()}
                        onValueChange={value => setValue('currency', value, { shouldDirty: true })}
                        options={currencyOptions(values.currency)}
                        placeholder={t('review.state.notStated')}
                        invalid={required && empty}
                      />
                    ) : (
                    <div className={cn('qr-input', required && empty && 'is-missing')}>
                        <input
                          id={`qr-${field.key}`}
                          type={field.type === 'number' ? 'number' : 'text'}
                          step="any"
                          inputMode={field.type === 'number' ? 'decimal' : undefined}
                          className={cn(field.type === 'number' && 'qy-num')}
                          {...rest}
                          ref={el => { ref(el); inputs.current[field.key] = el }}
                        />
                      {field.addon?.(values) && <span className="qr-addon">{field.addon(values)}</span>}
                    </div>
                    )}
                    {empty && required ? (
                      <button type="button" className="qr-add" onClick={() => (inputs.current[field.key] ?? document.getElementById(`qr-${field.key}`))?.focus()}>
                        <Icon name="add" size={14} /> {t('review.add')}
                      </button>
                    ) : snippet ? (
                      <button type="button" className="qr-snippet" onClick={() => showInSource(snippet)} aria-pressed={pinned === snippet}>
                        “{snippet}”
                      </button>
                    ) : null}
                  </div>
                )
              })}
              <div className="qr-field is-wide">
                <div className="qr-field-head"><label htmlFor="qr-notes">{t('fields.notes')}</label></div>
                <div className="qr-input"><textarea id="qr-notes" rows={2} {...register('notes')} /></div>
              </div>
            </form>
            ) : (
            <div className="qr-fields">
              {FIELDS.map(field => {
                const snippet = sources[field.key]
                const raw = values[field.key].trim()
                const empty = raw === ''
                const required = quote.missing_fields.includes(field.key) || (field.key === 'price' && empty)
                const display = field.type === 'currency' ? raw.toUpperCase() : raw
                const addon = field.addon?.(values)
                return (
                  <div
                    key={field.key}
                    className={cn('qr-field', field.wide && 'is-wide', highlight && snippet === highlight && 'is-active')}
                    onMouseEnter={() => snippet && setActive(snippet)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <div className="qr-field-head">
                      <span className="qr-field-label">{t(`review.field.${field.key}`)}</span>
                      {empty && required && <Chip tone="warn" icon="warning">{t('review.state.missing')}</Chip>}
                    </div>
                    {empty ? (
                      <p className="qr-value is-empty">{t('review.state.notStated')}</p>
                    ) : (
                      <p className="qr-value">{display}{addon && <span className="qr-value-unit"> {addon}</span>}</p>
                    )}
                    {snippet && (
                      <button type="button" className="qr-snippet" onClick={() => showInSource(snippet)} aria-pressed={pinned === snippet}>
                        “{snippet}”
                      </button>
                    )}
                  </div>
                )
              })}
              <div className="qr-field is-wide">
                <div className="qr-field-head"><span className="qr-field-label">{t('fields.notes')}</span></div>
                {values.notes.trim()
                  ? <p className="qr-value qr-value-notes">{values.notes}</p>
                  : <p className="qr-value is-empty">{t('review.state.notStated')}</p>}
              </div>
            </div>
            )}
          </SectionCard>

          <NormalizationCard quote={quote} steps={steps} />

          {(quote.commercial_offer?.cost_lines?.length ?? 0) > 0 && (
            <SectionCard icon="format_list_bulleted" title={t('review.costLines')} flush>
              <table className="ds-table qr-lines">
                <thead>
                  <tr>
                    <th scope="col">{t('review.lineName')}</th>
                    <th scope="col" className="qy-num">{t('review.lineAmount')}</th>
                    <th scope="col">{t('review.lineBasis')}</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.commercial_offer!.cost_lines!.map((line, index) => (
                    <tr
                      key={index}
                      className={cn(highlight && line.source_wording === highlight && 'is-active')}
                      onMouseEnter={() => line.source_wording && setActive(line.source_wording)}
                      onMouseLeave={() => setActive(null)}
                    >
                      <td>
                        <div className="qr-line-name">{line.name}</div>
                        {line.source_wording && (
                          <button type="button" className="qr-snippet" onClick={() => showInSource(line.source_wording!)}>
                            “{line.source_wording}”
                          </button>
                        )}
                      </td>
                      <td className="qy-num">
                        {line.included
                          ? <Chip tone="neutral">{t('review.included')}</Chip>
                          : <Money value={line.amount ?? null} currency={line.currency} digits={line.basis === 'lot' ? 2 : 'unit'} />}
                      </td>
                      <td className="cmp-muted">{t(`review.basis.${line.basis ?? 'per_unit'}`)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </SectionCard>
          )}
        </div>
      </div>

      <footer className="qr-footer" aria-label={t('review.actionsLabel')}>
        <p className="qr-footer-status">
          {quote.status === 'confirmed'
            ? <><Icon name="check_circle" size={16} filled className="qr-ok" /> {t('banner.confirmed')}</>
            : quote.status === 'rejected'
              ? <><Icon name="do_not_disturb_on" size={16} /> {t('review.excludedStatus')}</>
              : priceMissing
                ? <><Icon name="warning" size={16} filled className="qr-warn" /> {t('review.needsPrice')}</>
                : t('banner.review')}
        </p>
        <div className="qr-footer-actions">
          {updateQuote.error && <span className="qr-error">{(updateQuote.error as ApiError).detail || t('edit.failed')}</span>}
          {confirmQuote.error && <span className="qr-error">{(confirmQuote.error as ApiError).detail === 'quote_price_required' ? t('review.needsPrice') : t('actions.acceptFailed')}</span>}
          {quote.status === 'rejected' ? (
            <Btn variant="secondary" icon="undo" loading={restoreQuote.isPending} onClick={() => restoreQuote.mutate(undefined, { onSuccess: () => toast(t('toast.updated')) })}>
              {t('actions.restore')}
            </Btn>
          ) : (
            <Btn variant="ghost" icon="do_not_disturb_on" loading={rejectQuote.isPending} onClick={() => rejectQuote.mutate(undefined, { onSuccess: () => toast(t('review.excluded')) })}>
              {t('actions.reject')}
            </Btn>
          )}
          <Btn variant="secondary" disabled={!isDirty} disabledReason={t('review.noEdits')} loading={updateQuote.isPending && !confirmQuote.isPending} onClick={() => save()}>
            {t('review.save')}
          </Btn>
          {quote.status === 'draft' && (
            <Btn
              variant="primary"
              icon="check_circle"
              disabled={priceMissing}
              disabledReason={t('review.includeNeedsPrice')}
              loading={confirmQuote.isPending}
              onClick={include}
            >
              {t('actions.accept')}
            </Btn>
          )}
          <Menu
            label={t('review.more')}
            items={[{ label: t('actions.delete'), icon: 'delete', danger: true, onSelect: () => setConfirmDelete(true) }]}
          />
        </div>
      </footer>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        icon="delete"
        tone="danger"
        title={t('actions.deleteConfirm')}
        consequence={t('actions.deleteWarning')}
        confirmLabel={t('actions.delete')}
        loading={deleteQuote.isPending}
        onConfirm={() => deleteQuote.mutate(undefined, { onSuccess: () => navigate(`/rfqs/${quote.rfq_id}`) })}
      />
    </div>
  )
}

function FieldState({ empty, required, edited, read }: { empty: boolean, required: boolean, edited: boolean, read: boolean }) {
  const { t } = useTranslation('quote')
  if (empty && required) return <Chip tone="warn" icon="warning">{t('review.state.missing')}</Chip>
  if (empty) return <span className="qr-state-muted">{t('review.state.notStated')}</span>
  if (edited) return <Chip tone="neutral" icon="edit">{t('review.state.edited')}</Chip>
  if (read) return <AiMark kind="read" />
  return null
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
  if (!text.trim()) return <p className="qr-source-empty">{emptyLabel}</p>
  let body: ReactNode = text
  if (range) {
    body = (
      <>
        {text.slice(0, range[0])}
        <mark ref={markRef} className="qr-mark">{text.slice(range[0], range[1])}</mark>
        {text.slice(range[1])}
      </>
    )
  }
  return <pre className="qr-source-text" tabIndex={0}>{body}</pre>
}

function NormalizationCard({ quote, steps }: { quote: QuoteRead, steps: ReturnType<typeof normalizationSteps> }) {
  const { t } = useTranslation('quote')
  const fmt = useFormat()
  const units = useUnitLabel()
  const rawUnit = units.per(steps?.raw.unit) || steps?.raw.unit || ''
  const resultUnit = units.per(steps?.result.unit) || steps?.result.unit || ''
  const blocked = quote.missing_fields.filter(field => field === 'currency_conversion' || field === 'unit_conversion')
  return (
    <SectionCard icon="calculate" title={t('review.normTitle')}>
      {steps ? (
        <>
          <p className="qr-math" aria-label={t('review.normAria')}>
            <span className="qr-math-term">{fmt.unitNumber(steps.raw.price)} {steps.raw.currency}<span className="qr-math-unit"> / {rawUnit}</span></span>
            {steps.rate != null && (
              <Tip content={t('review.rateHelp')}>
                <span className="qr-math-term" tabIndex={0}>× {fmt.number(steps.rate, { maximumFractionDigits: 4 })}<span className="qr-math-unit"> {steps.result.currency}/{steps.raw.currency}</span></span>
              </Tip>
            )}
            {steps.divisor != null && (
              <span className="qr-math-term">÷ {fmt.number(steps.divisor)}<span className="qr-math-unit"> {t('review.perUnit', { unit: rawUnit })}</span></span>
            )}
            <span className="qr-math-eq">=</span>
            <span className="qr-math-result">{fmt.unitNumber(steps.result.price)} {steps.result.currency}<span className="qr-math-unit"> / {resultUnit}</span></span>
          </p>
          <p className="qr-note">
            {steps.rate == null && steps.divisor == null ? t('review.normSame') : t('review.normNote')}
          </p>
        </>
      ) : (
        <p className="qr-note">
          {blocked.length > 0
            ? blocked.map(field => t(`review.blocked.${field}`)).join(' ')
            : t('review.normNeedsPrice')}
        </p>
      )}
    </SectionCard>
  )
}
