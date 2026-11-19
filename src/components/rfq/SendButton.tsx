import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ApiError } from '../../api/client'
import type { EmailPayload, SendRequestsResponse } from '../../types/rfq'
import { FormFeedback } from '../ui'
import ChannelSelect, { type SendChannel } from './ChannelSelect'
import EmailPayloadDisplay from './EmailPayloadDisplay'

interface Props {
  pendingCount: number
  googleConnected: boolean
  outlookConnected?: boolean
  googleEmail?: string | null
  outlookEmail?: string | null
  defaultChannel?: SendChannel | null
  isPending: boolean
  error: Error | null
  result?: SendRequestsResponse
  onSend: (channel?: SendChannel) => void
}

function isEmailPayload(item: SendRequestsResponse[number]): item is EmailPayload {
  return 'body' in item
}

// Successful sends are confirmed with a toast (see RFQDetailPage) rather than an
// inline banner, which used to crowd the send button.
export default function SendButton({
  pendingCount,
  googleConnected,
  outlookConnected = false,
  googleEmail,
  outlookEmail,
  defaultChannel,
  isPending,
  error,
  result,
  onSend,
}: Props) {
  const { t } = useTranslation('rfq')
  const payloads = result?.filter(isEmailPayload) ?? []

  // Starts at the default mailbox; `picked` is the override for this request.
  // Derived (not seeded into state) so it stays right when the profile loads late.
  const [picked, setChannel] = useState<SendChannel | null>(null)
  const channel: SendChannel =
    picked ?? defaultChannel ?? (outlookConnected && !googleConnected ? 'outlook' : 'google')

  // When a single mailbox is connected the channel is implicit; when both are,
  // honor the choice (starts at the default mailbox). When none, send undefined so the backend uses its JSON
  // fallback.
  const effectiveChannel: SendChannel | undefined =
    googleConnected && outlookConnected
      ? channel
      : googleConnected
        ? 'google'
        : outlookConnected
          ? 'outlook'
          : undefined

  return (
    <div>
      <ChannelSelect
        googleConnected={googleConnected}
        outlookConnected={outlookConnected}
        googleEmail={googleEmail}
        outlookEmail={outlookEmail}
        value={channel}
        onChange={setChannel}
        disabled={isPending}
      />

      <button type="button" className="ds-btn ds-btn-primary" onClick={() => onSend(effectiveChannel)} disabled={pendingCount === 0 || isPending}>
        {isPending ? t('send.sending') : pendingCount > 0 ? t('send.sendRequestsCount', { count: pendingCount }) : t('send.sendRequests')}
      </button>

      {payloads.length > 0 && <EmailPayloadDisplay payloads={payloads} />}

      {error && (
        <FormFeedback className="mt-3">{(error as ApiError).detail || t('send.failed')}</FormFeedback>
      )}
    </div>
  )
}
