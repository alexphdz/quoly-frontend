import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { Select as RadixSelect } from 'radix-ui'
import { Icon } from '../ds/Icon'
import { Toaster, toast as sonnerToast } from 'sonner'
import { useTheme } from './theme'
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function Button({
  variant = 'primary',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return <button className={cn('btn', `btn-${variant}`, className)} {...props} />
}

export function IconButton({
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button aria-label={label} title={label} className={cn('btn btn-secondary icon-btn', className)} {...props} />
  )
}

export function Card({ children, className, id }: { children: ReactNode, className?: string, id?: string }) {
  return <div id={id} className={cn('card', className)}>{children}</div>
}

export function Badge({
  tone = 'neutral',
  dot = false,
  children,
  className,
}: {
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'error'
  dot?: boolean
  children: ReactNode
  className?: string
}) {
  return <span className={cn('badge', `badge-${tone}`, dot && 'badge-dot', className)}>{children}</span>
}

export function Alert({
  tone = 'info',
  title,
  icon,
  children,
  className,
}: {
  tone?: 'info' | 'warning' | 'error' | 'success'
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('alert', tone !== 'info' && `alert-${tone}`, className)}>
      {icon && <span className="flex shrink-0 items-center">{icon}</span>}
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export function FormField({
  label,
  required,
  optional,
  error,
  helper,
  children,
}: {
  label: string
  required?: boolean
  optional?: boolean
  error?: string
  helper?: string
  children: ReactNode
}) {
  const { t } = useTranslation('common')
  return (
    <div className="field">
      <label className="field-label">
        {label}
        {required && <span className="req"> *</span>}
        {optional && <span className="font-normal"> {t('field.optional')}</span>}
      </label>
      {children}
      {helper && <div className="field-help">{helper}</div>}
      {error && <div className="field-error">{error}</div>}
    </div>
  )
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn('input', className)} {...props} />
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn('input', className)} {...props} />
}

const EMPTY_OPTION = '__empty__'

type OptionProps = { value?: string | number, children?: ReactNode, disabled?: boolean }

/**
 * Radix Select with the native <select> API: <option> children, value/onChange,
 * and react-hook-form `register` (the ref lands on a hidden input).
 */
export const SelectInput = forwardRef<HTMLInputElement, SelectHTMLAttributes<HTMLSelectElement>>(function SelectInput(
  { className, children, value, defaultValue, onChange, onBlur, name, disabled, id, 'aria-label': ariaLabel, 'aria-invalid': ariaInvalid },
  ref,
) {
  const hiddenRef = useRef<HTMLInputElement | null>(null)
  const [inner, setInner] = useState(String(value ?? defaultValue ?? ''))
  const options = Children.toArray(children)
    .filter((child): child is ReactElement<OptionProps> => isValidElement(child) && child.type === 'option')
    .map(child => ({ value: String(child.props.value ?? ''), label: child.props.children, disabled: child.props.disabled }))

  useLayoutEffect(() => {
    if (value === undefined && hiddenRef.current && hiddenRef.current.value !== inner) setInner(hiddenRef.current.value)
  })

  const current = value !== undefined ? String(value) : inner
  const placeholder = options.find(option => option.value === '')?.label

  const emit = (next: string) => {
    const real = next === EMPTY_OPTION ? '' : next
    setInner(real)
    const input = hiddenRef.current
    if (!input) return
    input.value = real
    onChange?.({ target: input, currentTarget: input, type: 'change' } as unknown as ChangeEvent<HTMLSelectElement>)
  }

  return (
    <>
      <input
        type="hidden"
        name={name}
        ref={node => {
          hiddenRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) ref.current = node
        }}
        defaultValue={current}
      />
      <RadixSelect.Root
        value={current === '' ? (placeholder !== undefined ? EMPTY_OPTION : undefined) : current}
        onValueChange={emit}
        disabled={disabled}
        onOpenChange={open => {
          if (!open && hiddenRef.current) onBlur?.({ target: hiddenRef.current, type: 'blur' } as unknown as FocusEvent<HTMLSelectElement>)
        }}
      >
        <RadixSelect.Trigger id={id} data-name={name} aria-label={ariaLabel} aria-invalid={ariaInvalid} className={cn('qy-select-trigger', className)}>
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon><Icon name="expand_more" size={14} /></RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content position="popper" sideOffset={4} className="qy-popover">
            <RadixSelect.Viewport>
              {options.map(option => (
                <RadixSelect.Item
                  key={option.value || EMPTY_OPTION}
                  value={option.value || EMPTY_OPTION}
                  disabled={option.disabled}
                  data-option-value={option.value}
                  className="qy-item"
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="qy-item-check"><Icon name="check" size={14} /></RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </>
  )
})

export function Avatar({ name, size = 'md' }: { name?: string | null, size?: 'sm' | 'md' }) {
  const initials = (name || '?')
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
  return <span className={cn('avatar', size === 'sm' && 'avatar-sm')}>{initials || '?'}</span>
}

export function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value))
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${width}%` }} />
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string, description: string, action?: ReactNode }) {
  return (
    <div className="ds-empty">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="mb-7 flex items-start justify-between gap-4">
      <div>
        <h1 className="qy-heading text-2xl font-bold text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, helper, tone }: { label: string, value: ReactNode, helper?: string, tone?: 'warning' | 'success' }) {
  return (
    <Card className="card-pad">
      <div className="text-xs font-semibold text-[var(--text-muted)]">{label}</div>
      <div className={cn('tnum mt-2 text-2xl font-semibold', tone === 'warning' && 'text-amber-500', tone === 'success' && 'text-green-500')}>
        {value}
      </div>
      {helper && <div className="mt-1 text-sm text-[var(--text-muted)]">{helper}</div>}
    </Card>
  )
}

export function statusTone(status?: string): 'neutral' | 'brand' | 'success' | 'warning' | 'error' {
  const normalized = (status || '').toLowerCase()
  if (['confirmed', 'quoted', 'quote_received', 'decided', 'processed', 'complete', 'sent'].includes(normalized)) return 'success'
  if (['draft', 'pending', 'not_contacted', 'requested', 'awaiting_response', 'partial_response', 'buyer_action_required', 'collecting', 'awaiting quotes', 'no response', 'unmatched'].includes(normalized)) return 'warning'
  if (['declined'].includes(normalized)) return 'error'
  if (['failed', 'error'].includes(normalized)) return 'error'
  if (['rejected', 'closed', 'cancelled', 'canceled'].includes(normalized)) return 'neutral'
  return 'brand'
}

export function StatusBadge({ status, label }: { status?: string, label?: string }) {
  return <Badge tone={statusTone(status)} dot={statusTone(status) === 'brand'}>{label || status || 'Unknown'}</Badge>
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  wide,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  wide?: boolean
}) {
  const { t } = useTranslation('common')
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      ref={backdropRef}
      className="modal-backdrop"
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className={cn('card modal-card card-pad', wide && 'modal-wide')} role="dialog" aria-modal="true" aria-label={title}>
        <div className="ds-dialog-head">
          {title ? <h2>{title}</h2> : <span />}
          <button type="button" onClick={onClose} className="ds-btn ds-btn-secondary">{t('actions.close')}</button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export function Skeleton({ variant = 'text', className }: { variant?: 'text' | 'heading' | 'card', className?: string }) {
  return <div className={cn('skeleton', `skeleton-${variant}`, className)} />
}

export function SkeletonRows({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-3">
      <div className="skeleton skeleton-heading" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton skeleton-text" style={{ width: `${85 - i * 10}%` }} />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-card" />
      <div className="skeleton skeleton-card" />
    </div>
  )
}

export function ErrorState({ title, message, onRetry }: { title?: string, message?: string, onRetry?: () => void }) {
  const { t } = useTranslation('common')
  return (
    <div className="ds-empty">
      <h2>{title ?? t('states.error')}</h2>
      {message && <p>{message}</p>}
      {onRetry && (
        <button type="button" onClick={onRetry} className="ds-btn ds-btn-secondary" style={{ marginTop: 16 }}>
          {t('actions.retry')}
        </button>
      )}
    </div>
  )
}

type ToastTone = 'success' | 'error' | 'warning' | 'info'

export function toast(message: string, tone: ToastTone = 'success') {
  sonnerToast[tone](message)
}

export function ToastContainer() {
  const { theme } = useTheme()
  return <Toaster theme={theme} position="bottom-right" duration={3200} />
}

export { default as MissingFields } from './MissingFields'
