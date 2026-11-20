import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { sendFailureProgress, type ApiError } from '../../api/client'
import { ConfirmDialog, InlineAlert, TextButton } from '../../design-system'
import { MAILBOX_SETTINGS_PATH, connectedMailboxes, defaultMailbox, usableMailboxes } from '../../lib/mailbox'
import { FormFeedback } from '../ui'
import ChannelSelect, { type SendChannel } from './ChannelSelect'

interface Props {
  pendingCount: number
  googleConnected: boolean
  outlookConnected?: boolean
  googleEmail?: string | null
  outlookEmail?: string | null
  defaultChannel?: SendChannel | null
  isPending: boolean
  error: Error | null
  onSend: (channel: SendChannel) => void
}

// Successful sends are confirmed with a toast (see RFQDetailPage) rather than an
// inline banner, which used to crowd the send button. Same rules as the commercial
// detail (SuppliersTab): no usable mailbox → no send; the send always asks first
// because an email can't be unsent.
export default function SendButton({
  pendingCount,
  googleConnected,
  outlookConnected = false,
  googleEmail,
  outlookEmail,
  defaultChannel,
  isPending,
  error,
  onSend,
}: Props) {
  const { t } = useTranslation('rfq')
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const mailboxFields = {
    google_connected: googleConnected,
    outlook_connected: outlookConnected,
    google_email: googleEmail,
    outlook_email: outlookEmail,
  }
  const usable = usableMailboxes(mailboxFields)
  const needsReconnect = usable.length === 0 && connectedMailboxes(mailboxFields).length > 0

  // Starts at the default mailbox; `picked` is the override for this request.
  // Derived (not seeded into state) so it stays right when the profile loads late.
  const [picked, setChannel] = useState<SendChannel | null>(null)
  const sender = usable.find(m => m.channel === picked) ?? defaultMailbox(usable, defaultChannel)
  const failure = sendFailureProgress(error)

  useEffect(() => {
    if (!isPending) setConfirmOpen(false)
  }, [isPending])

  return (
    <div>
      {sender && (
        <ChannelSelect
          googleConnected={usable.some(m => m.channel === 'google')}
          outlookConnected={usable.some(m => m.channel === 'outlook')}
          googleEmail={googleEmail}
          outlookEmail={outlookEmail}
          value={sender.channel}
          onChange={setChannel}
          disabled={isPending}
        />
      )}

      <button
        type="button"
        className="ds-btn ds-btn-primary"
        onClick={() => setConfirmOpen(true)}
        disabled={pendingCount === 0 || isPending || !sender}
      >
        {isPending ? t('send.sending') : pendingCount > 0 ? t('send.sendRequestsCount', { count: pendingCount }) : t('send.sendRequests')}
      </button>

      {!sender && pendingCount > 0 && (
        <InlineAlert tone="warning" className="mt-3" title={needsReconnect ? t('detalle.suppliers.reconnectMailboxTitle') : t('detalle.suppliers.noMailboxTitle')}>
          {needsReconnect ? t('detalle.suppliers.reconnectMailboxText') : t('detalle.suppliers.noMailboxText')}
          {' '}
          <TextButton size="sm" onClick={() => navigate(MAILBOX_SETTINGS_PATH)}>
            {needsReconnect ? t('detalle.suppliers.reconnectMailbox') : t('detalle.suppliers.connectMailbox')}
          </TextButton>
        </InlineAlert>
      )}

      {error && (
        <FormFeedback className="mt-3">
          {failure && failure.sent > 0
            ? failure.failedTo
              ? t('send.partial', { sent: failure.sent, total: failure.total, failedTo: failure.failedTo })
              : t('send.partialNoAddress', { sent: failure.sent, total: failure.total })
            : (error as ApiError).detail || t('send.failed')}
        </FormFeedback>
      )}

      <ConfirmDialog
        open={confirmOpen && !!sender}
        title={t('detalle.suppliers.confirmTitle', { count: pendingCount, email: sender?.email ?? '' })}
        description={t('detalle.suppliers.confirmNoUndo')}
        confirmLabel={t('detalle.suppliers.confirmAction', { count: pendingCount })}
        cancelLabel={t('crear.actions.cancel')}
        pending={isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => sender && onSend(sender.channel)}
      />
    </div>
  )
}
