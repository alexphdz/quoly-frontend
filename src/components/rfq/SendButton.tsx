import { useTranslation } from 'react-i18next'
import type { ApiError } from '../../api/client'
import type { EmailPayload, GmailSendResult, OutlookSendResult, SendRequestsResponse } from '../../types/rfq'
import { Alert } from '../ui'
import EmailPayloadDisplay from './EmailPayloadDisplay'

interface Props {
  pendingCount: number
  googleConnected: boolean
  outlookConnected?: boolean
  isPending: boolean
  error: Error | null
  result?: SendRequestsResponse
  onSend: () => void
}

function isEmailPayload(item: SendRequestsResponse[number]): item is EmailPayload {
  return 'body' in item
}

function isGmailSendResult(item: SendRequestsResponse[number]): item is GmailSendResult {
  return 'gmail_message_id' in item
}

function isOutlookSendResult(item: SendRequestsResponse[number]): item is OutlookSendResult {
  return 'outlook_message_id' in item
}

export default function SendButton({
  pendingCount,
  googleConnected,
  outlookConnected = false,
  isPending,
  error,
  result,
  onSend,
}: Props) {
  const { t } = useTranslation('rfq')
  const payloads = result?.filter(isEmailPayload) ?? []
  const gmailResults = result?.filter(isGmailSendResult) ?? []
  const outlookResults = result?.filter(isOutlookSendResult) ?? []
  const mailboxConnected = googleConnected || outlookConnected

  return (
    <div>
      <button type="button" className="ds-btn ds-btn-primary" onClick={onSend} disabled={pendingCount === 0 || isPending}>
        {isPending ? t('send.sending') : pendingCount > 0 ? t('send.sendRequestsCount', { count: pendingCount }) : t('send.sendRequests')}
      </button>

      {mailboxConnected && (gmailResults.length > 0 || outlookResults.length > 0) && (
        <Alert tone="success" className="mt-3">
          <div className="grid gap-1">
            {gmailResults.map(r => (
              <div key={r.gmail_message_id}>{t('send.sentTo', { name: r.supplier_name, email: r.to })}</div>
            ))}
            {outlookResults.map(r => (
              <div key={r.outlook_message_id}>{t('send.sentTo', { name: r.supplier_name, email: r.to })}</div>
            ))}
          </div>
        </Alert>
      )}

      {payloads.length > 0 && <EmailPayloadDisplay payloads={payloads} />}

      {error && (
        <Alert tone="error" className="mt-3">{(error as ApiError).detail || t('send.failed')}</Alert>
      )}
    </div>
  )
}
