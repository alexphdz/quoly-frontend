import { forwardRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AlertDialog, DropdownMenu, Select as RSelect, Tooltip } from 'radix-ui'
import { motion } from 'motion/react'
import { cn } from '../ui'
import { unitPriceFractionDigits } from '../../lib/format'
import { Icon } from './Icon'

export { Icon } from './Icon'
export { MetricCard, type MetricCardProps, type MetricTone } from './MetricCard'

/** Progressive-disclosure panel: a header with an optional marker + collapsed
 *  summary, and a body revealed on toggle. Used to keep optional/secondary
 *  content out of the way until the user asks for it. */
export function Collapsible({
  label,
  optional,
  summary,
  defaultOpen = false,
  className,
  children,
}: {
  label: ReactNode
  optional?: boolean
  summary?: ReactNode
  defaultOpen?: boolean
  className?: string
  children: ReactNode
}) {
  const { t } = useTranslation('common')
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className={cn('ds-collapsible', open && 'is-open', className)}>
      <button
        type="button"
        className="ds-collapsible-head"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ds-collapsible-title">
          <span className="ds-collapsible-label">
            {label}
            {optional ? <span className="optional">({t('field.optional')})</span> : null}
          </span>
          {!open && summary ? <span className="ds-collapsible-summary">{summary}</span> : null}
        </span>
        <span className="ds-collapsible-action">
          <span className="ds-collapsible-toggle">{open ? t('actions.showLess') : t('actions.showMore')}</span>
          <Icon name="expand_more" size={16} className={cn('ds-collapsible-caret', open && 'is-open')} />
        </span>
      </button>
      {open ? <div className="ds-collapsible-body">{children}</div> : null}
    </div>
  )
}

export type ChipTone = 'neutral' | 'brand' | 'success' | 'warn' | 'danger' | 'outline'

export function Chip({
  tone = 'neutral',
  icon,
  children,
  title,
  className,
}: {
  tone?: ChipTone
  icon?: string
  children: ReactNode
  title?: string
  className?: string
}) {
  return (
    <span className={cn('qy-chip', `qy-chip-${tone}`, className)} title={title}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  )
}

export function Tip({ content, children, side = 'top' }: { content?: ReactNode, children: ReactNode, side?: 'top' | 'bottom' | 'left' | 'right' }) {
  if (!content) return <>{children}</>
  return (
    <Tooltip.Root delayDuration={250}>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side={side} sideOffset={6} className="qy-tooltip">
          {content}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'text'

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: string
  /** Shown as a tooltip while the button is disabled. */
  disabledReason?: string
}

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn(
  { variant = 'secondary', size = 'md', loading, icon, disabledReason, disabled, className, children, type = 'button', ...props },
  ref,
) {
  const button = (
    <button
      ref={ref}
      type={type}
      className={cn('ds-btn', `ds-btn-${variant}`, variant !== 'text' && `ds-btn-${size}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading
        ? <Icon name="progress_activity" size={16} className="qy-spin" />
        : icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  )
  if (disabled && disabledReason) {
    return (
      <Tip content={disabledReason}>
        <span tabIndex={0} style={{ display: 'inline-flex' }}>{button}</span>
      </Tip>
    )
  }
  return button
})

export const IconBtn = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { label: string, icon: string }>(
  function IconBtn({ label, icon, className, type = 'button', ...props }, ref) {
    return (
      <Tip content={label}>
        <button ref={ref} type={type} aria-label={label} className={cn('ds-btn ds-btn-icon', className)} {...props}>
          <Icon name={icon} size={18} />
        </button>
      </Tip>
    )
  },
)

export function SectionCard({
  icon,
  title,
  actions,
  children,
  className,
  bodyClassName,
  flush,
  plain,
  id,
  headingLevel = 2,
}: {
  icon?: string
  title?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
  /** Body has no padding (tables). */
  flush?: boolean
  /** Heading + content with no card chrome. */
  plain?: boolean
  id?: string
  headingLevel?: 2 | 3
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <section id={id} className={cn(plain ? 'qy-block' : 'qy-card', className)}>
      {title && (
        <header className="qy-section-head">
          {icon && <Icon name={icon} size={16} className="qy-section-icon" />}
          <Heading>{title}</Heading>
          {actions && <div className="qy-section-actions">{actions}</div>}
        </header>
      )}
      <div className={cn(!plain && !flush && 'qy-card-body', bodyClassName)}>{children}</div>
    </section>
  )
}

export interface Fact { icon: string, label: ReactNode, value: ReactNode, title?: string }

export function KeyFacts({ facts, label }: { facts: Fact[], label?: string }) {
  return (
    <dl className="qy-facts" aria-label={label}>
      {facts.map((fact, index) => (
        <div key={index} className="qy-fact">
          <span className="qy-fact-tile"><Icon name={fact.icon} size={18} /></span>
          <div style={{ minWidth: 0 }}>
            <dt className="qy-fact-label">{fact.label}</dt>
            <dd className="qy-fact-value" style={{ margin: 0 }} title={fact.title}>{fact.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  )
}

export function Breadcrumbs({ backTo, items }: { backTo?: string, items: Array<{ label: ReactNode, to?: string }> }) {
  const { t } = useTranslation('common')
  return (
    <nav aria-label={t('ds.breadcrumbs')} className="qy-crumbs">
      {backTo && (
        <Link to={backTo} className="qy-crumbs-back" aria-label={t('actions.back')}>
          <Icon name="arrow_back" size={16} />
        </Link>
      )}
      {items.map((item, index) => {
        const last = index === items.length - 1
        return (
          <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {item.to && !last ? <Link to={item.to}>{item.label}</Link> : <span aria-current={last ? 'page' : undefined}>{item.label}</span>}
            {!last && <Icon name="chevron_right" size={12} />}
          </span>
        )
      })}
    </nav>
  )
}

export interface TabDef<T extends string> { id: T, label: ReactNode, icon?: string, count?: number }

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  layoutId,
  label,
}: {
  tabs: Array<TabDef<T>>
  value: T
  onChange: (id: T) => void
  layoutId: string
  label: string
}) {
  return (
    <div role="tablist" aria-label={label} className="qy-tabs">
      {tabs.map(tab => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className="qy-tab"
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <Icon name={tab.icon} size={16} filled={selected} />}
            {tab.label}
            {tab.count !== undefined && <span className="qy-tab-count">{tab.count}</span>}
            {selected && (
              <motion.span
                layoutId={layoutId}
                className="qy-tab-underline"
                transition={{ type: 'spring', stiffness: 520, damping: 42 }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export interface SelectOption { value: string, label: ReactNode, textValue?: string }

export function Select({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  compact,
  invalid,
  disabled,
  id,
}: {
  value?: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  ariaLabel?: string
  compact?: boolean
  invalid?: boolean
  disabled?: boolean
  id?: string
}) {
  return (
    <RSelect.Root value={value || undefined} onValueChange={onValueChange} disabled={disabled}>
      <RSelect.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={cn('qy-select-trigger', compact && 'is-compact')}
      >
        <RSelect.Value placeholder={placeholder} />
        <RSelect.Icon><Icon name="expand_more" size={14} /></RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content position="popper" sideOffset={4} className="qy-popover">
          <RSelect.Viewport>
            {options.map(option => (
              <RSelect.Item key={option.value} value={option.value} textValue={option.textValue} className="qy-item">
                <RSelect.ItemText>{option.label}</RSelect.ItemText>
                <RSelect.ItemIndicator className="qy-item-check"><Icon name="check" size={14} /></RSelect.ItemIndicator>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  )
}

export interface MenuItemDef { label: ReactNode, icon?: string, onSelect: () => void, danger?: boolean, disabled?: boolean }

/** Row/overflow menu. Destructive items are always rendered last, after a separator. */
export function Menu({ items, label, trigger }: { items: MenuItemDef[], label: string, trigger?: ReactNode }) {
  const safe = items.filter(item => !item.danger)
  const danger = items.filter(item => item.danger)
  const renderItem = (item: MenuItemDef, index: number) => (
    <DropdownMenu.Item
      key={index}
      className={cn('qy-item', item.danger && 'qy-item-danger')}
      disabled={item.disabled}
      onSelect={item.onSelect}
    >
      {item.icon && <Icon name={item.icon} size={16} />}
      {item.label}
    </DropdownMenu.Item>
  )
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger ?? (
          <button type="button" className="ds-btn ds-btn-icon" aria-label={label}>
            <Icon name="more_horiz" size={20} />
          </button>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={4} className="qy-popover" style={{ minWidth: 200 }}>
          {safe.map(renderItem)}
          {safe.length > 0 && danger.length > 0 && <DropdownMenu.Separator className="qy-menu-sep" />}
          {danger.map(renderItem)}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export function ConfirmDialog({
  open,
  onOpenChange,
  icon,
  title,
  consequence,
  confirmLabel,
  tone = 'brand',
  loading,
  onConfirm,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  icon: string
  title: ReactNode
  consequence: ReactNode
  confirmLabel: ReactNode
  tone?: 'brand' | 'danger'
  loading?: boolean
  onConfirm: () => void
  children?: ReactNode
}) {
  const { t } = useTranslation('common')
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="qy-overlay" />
        <AlertDialog.Content className="qy-dialog">
          <span className={cn('qy-dialog-tile', tone === 'danger' && 'is-danger')}>
            <Icon name={icon} size={22} />
          </span>
          <AlertDialog.Title asChild><h2>{title}</h2></AlertDialog.Title>
          <AlertDialog.Description asChild><p>{consequence}</p></AlertDialog.Description>
          {children}
          <div className="qy-dialog-actions">
            <AlertDialog.Cancel asChild>
              <Btn variant="secondary">{t('actions.cancel')}</Btn>
            </AlertDialog.Cancel>
            <Btn
              variant={tone === 'danger' ? 'destructive' : 'primary'}
              loading={loading}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Btn>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export function Empty({ icon, title, description, action }: { icon: string, title: ReactNode, description?: ReactNode, action?: ReactNode }) {
  return (
    <div className="qy-empty">
      <span className="qy-empty-art"><Icon name={icon} size={28} /></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="qy-empty-action">{action}</div>}
    </div>
  )
}

export function Skel({ w = '100%', h = 14, r, className }: { w?: number | string, h?: number | string, r?: number, className?: string }) {
  return <span aria-hidden className={cn('qy-skel', className)} style={{ display: 'block', width: w, height: h, borderRadius: r }} />
}

export function AiMark({ kind = 'read' }: { kind?: 'read' | 'suggests' }) {
  const { t } = useTranslation('common')
  return (
    <span className="qy-ai" title={kind === 'read' ? t('ds.aiRead') : t('ds.aiSuggests')}>
      <QuolyGlyph />
      <span className="qy-ai-label">{kind === 'read' ? t('ds.aiRead') : t('ds.aiSuggests')}</span>
    </span>
  )
}

function QuolyGlyph() {
  return <span className="brand-mark qy-ai-glyph" aria-hidden />
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T, label: ReactNode }>
  ariaLabel: string
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel} className="qy-segmented">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Amount with a muted currency code. `digits="unit"` uses adaptive per-unit precision. */
export function Money({ value, currency, digits = 2, className, signed }: { value: number | null | undefined, currency?: string | null, digits?: number | 'unit', className?: string, signed?: boolean }) {
  const { i18n } = useTranslation()
  if (value === null || value === undefined) return <span className={cn('qy-num', className)} style={{ color: 'var(--tx-3)' }}>—</span>
  const places = digits === 'unit' ? unitPriceFractionDigits(value) : digits
  const formatted = new Intl.NumberFormat(i18n.resolvedLanguage === 'es' ? 'es-MX' : 'en-US', {
    minimumFractionDigits: digits === 'unit' ? 2 : places,
    maximumFractionDigits: places,
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(value)
  return (
    <span className={cn('qy-num', className)}>
      {formatted}
      {currency && <span className="qy-cur">{currency}</span>}
    </span>
  )
}
