import { Icon } from '../ds'
import { useTranslation } from 'react-i18next'
import type { EmailPayload } from '../../types/rfq'
import { Alert, Card, toast } from '../ui'

interface Props {
  payloads: EmailPayload[]
}

export default function EmailPayloadDisplay({ payloads }: Props) {
  const { t } = useTranslation('rfq')
  if (payloads.length === 0) return null

  const copyBody = (body: string) => {
    navigator.clipboard.writeText(body)
    toast(t('emailPayload.bodyCopied'))
  }

  return (
    <div className="mt-3 grid gap-3">
      <Alert tone="warning">
        {t('emailPayload.notConnected')}
      </Alert>
      {payloads.map(payload => (
        <Card key={`${payload.to}-${payload.subject}`} className="card-pad">
          <div className="grid gap-1 text-sm">
            <p><span className="text-[var(--text-muted)]">{t('emailPayload.to')}</span> <span className="font-semibold">{payload.to}</span></p>
            <p><span className="text-[var(--text-muted)]">{t('emailPayload.replyTo')}</span> {payload.reply_to}</p>
            <p><span className="text-[var(--text-muted)]">{t('emailPayload.subject')}</span> {payload.subject}</p>
          </div>
          <div className="mt-3 rounded-[var(--radius-card)] bg-[var(--bg-secondary)] p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">{t('emailPayload.body')}</span>
              <button type="button" onClick={() => copyBody(payload.body)} className="btn btn-secondary !py-1 !px-2 !text-xs">
                <Icon name="content_copy" size={12} /> {t('emailPayload.copy')}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-xs text-[var(--text-secondary)]">{payload.body}</pre>
          </div>
        </Card>
      ))}
    </div>
  )
}
