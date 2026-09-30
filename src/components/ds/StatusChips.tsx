import { useTranslation } from 'react-i18next'
import { Chip, type ChipTone } from '.'
import { Icon } from './Icon'

type Spec = { tone: ChipTone, icon: string }
type RequestBucket = 'draft' | 'open' | 'closed'

function requestBucket(status: string): RequestBucket {
  if (status === 'draft') return 'draft'
  if (status === 'decided' || status === 'closed') return 'closed'
  return 'open'
}

const QUOTE: Record<string, Spec> = {
  draft: { tone: 'warn', icon: 'visibility' },
  confirmed: { tone: 'success', icon: 'check_circle' },
  rejected: { tone: 'neutral', icon: 'do_not_disturb_on' },
}

const SUPPLIER: Record<string, Spec> = {
  not_contacted: { tone: 'outline', icon: 'circle' },
  pending: { tone: 'outline', icon: 'circle' },
  awaiting_response: { tone: 'brand', icon: 'schedule' },
  requested: { tone: 'brand', icon: 'schedule' },
  partial_response: { tone: 'brand', icon: 'schedule' },
  buyer_action_required: { tone: 'warn', icon: 'chat' },
  quote_received: { tone: 'success', icon: 'check_circle' },
  quoted: { tone: 'success', icon: 'check_circle' },
  declined: { tone: 'neutral', icon: 'cancel' },
  closed: { tone: 'neutral', icon: 'do_not_disturb_on' },
}

const INBOX_STATUS: Record<string, Spec> = {
  processed: { tone: 'success', icon: 'check_circle' },
  unmatched: { tone: 'warn', icon: 'link_off' },
  error: { tone: 'danger', icon: 'error' },
}

const INBOX_TYPE: Record<string, Spec> = {
  quote: { tone: 'brand', icon: 'receipt_long' },
  conversation: { tone: 'neutral', icon: 'mail' },
}

function StatusChip({ map, ns, status }: { map: Record<string, Spec>, ns: string, status: string }) {
  const { t } = useTranslation('enums')
  const spec = map[status] ?? { tone: 'neutral' as ChipTone, icon: 'circle' }
  return <Chip tone={spec.tone} icon={spec.icon}>{t(`${ns}.${status}`, { defaultValue: status })}</Chip>
}

/** Request overall status: small mark + label, not a filled chip. */
export function RequestStatus({ status }: { status: string }) {
  const { t } = useTranslation('enums')
  const bucket = requestBucket(status)
  const label = t(`rfqStatus.${bucket === 'closed' ? 'decided' : bucket}`)
  return (
    <span className={`qy-status qy-status-${bucket}`}>
      <span className="qy-status-mark" aria-hidden>
        {bucket === 'draft' && <Icon name="edit" size={12} />}
        {bucket === 'open' && <span className="qy-status-dot" />}
        {bucket === 'closed' && <Icon name="check" size={12} />}
      </span>
      {label}
    </span>
  )
}

export const RequestStatusChip = ({ status }: { status: string }) => <RequestStatus status={status} />
export const QuoteStatusChip = ({ status, priceMissing }: { status: string, priceMissing?: boolean }) => {
  const shown = priceMissing ? 'draft' : status
  return <StatusChip map={QUOTE} ns="quoteStatus" status={shown} />
}
export const SupplierStatusChip = ({ status }: { status: string }) => <StatusChip map={SUPPLIER} ns="supplierStatus" status={status} />
export const InboxStatusChip = ({ status }: { status: string }) => <StatusChip map={INBOX_STATUS} ns="messageStatus" status={status} />
export const InboxTypeChip = ({ type }: { type: string }) => <StatusChip map={INBOX_TYPE} ns="messageType" status={type} />
