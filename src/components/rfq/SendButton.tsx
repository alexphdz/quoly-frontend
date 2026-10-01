import { useTranslation } from 'react-i18next'
import type { ApiError } from '../../api/client'
import type { EmailPayload, SendRequestsResponse } from '../../types/rfq'
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

// Successful sends are confirmed with a toast (see RFQDetailPage) rather than an
// inline banner, which used to crowd the send button.
export default function SendButton({
  pendingCount,
  isPending,
  error,
  result,
  onSend,
}: Props) {
  const { t } = useTranslation('rfq')
  const payloads = result?.filter(isEmailPayload) ?? []

  return (
    <div>
      <button type="button" className="ds-btn ds-btn-primary" onClick={onSend} disabled={pendingCount === 0 || isPending}>
        {isPending ? t('send.sending') : pendingCount > 0 ? t('send.sendRequestsCount', { count: pendingCount }) : t('send.sendRequests')}
      </button>

      {payloads.length > 0 && <EmailPayloadDisplay payloads={payloads} />}

      {error && (
        <Alert tone="error" className="mt-3">{(error as ApiError).detail || t('send.failed')}</Alert>
      )}
    </div>
  )
}
