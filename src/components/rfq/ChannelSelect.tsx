import { useState } from 'react'
import { MicrosoftOutlookLogo } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { TextButton } from '../../design-system'
import { connectedMailboxes, type SendChannel } from '../../lib/mailbox'
import GmailIcon from '../icons/GmailIcon'

export type { SendChannel }

interface Props {
  googleConnected: boolean
  outlookConnected: boolean
  googleEmail?: string | null
  outlookEmail?: string | null
  value: SendChannel
  onChange: (channel: SendChannel) => void
  disabled?: boolean
  className?: string
}

// Tells the buyer which connected mailbox an RFQ (and its later replies) goes
// out from. One mailbox → informative line only. Two → the line plus a "change"
// action to pick the other one for this request. None → renders nothing (the
// caller keeps its "connect a mailbox" state).
export default function ChannelSelect({
  googleConnected,
  outlookConnected,
  googleEmail,
  outlookEmail,
  value,
  onChange,
  disabled,
  className = 'mb-3',
}: Props) {
  const { t } = useTranslation('rfq')
  const [choosing, setChoosing] = useState(false)

  const mailboxes = connectedMailboxes({
    google_connected: googleConnected,
    outlook_connected: outlookConnected,
    google_email: googleEmail,
    outlook_email: outlookEmail,
  })
  if (mailboxes.length === 0) return null

  const current = mailboxes.find(m => m.channel === value) ?? mailboxes[0]
  const providerName = (channel: SendChannel) =>
    channel === 'outlook' ? t('send.channel.outlook') : t('send.channel.gmail')
  const providerIcon = (channel: SendChannel) =>
    channel === 'outlook'
      ? <MicrosoftOutlookLogo size={16} weight="fill" color="#0F6CBD" aria-hidden />
      : <GmailIcon size={16} />

  return (
    <div className={className}>
      <div className="text-sm text-[var(--color-text-secondary)]" style={{ margin: 0 }}>
        {current.email
          ? (
            <>
              {t('send.from.label')}{' '}
              <strong className="text-[var(--color-text-primary)]" style={{ overflowWrap: 'anywhere' }}>{current.email}</strong>
              {' '}({providerName(current.channel)})
            </>
          )
          : t('send.from.unknownAddress', { provider: providerName(current.channel) })}
        {mailboxes.length > 1 && !choosing && (
          <>
            {' '}
            <TextButton size="sm" disabled={disabled} onClick={() => setChoosing(true)}>
              {t('send.from.change')}
            </TextButton>
          </>
        )}
      </div>

      {!current.email && (
        <div className="text-sm text-[var(--color-status-warning-text)]" style={{ margin: '0.25rem 0 0' }}>
          {t('send.from.reconnectHint')}
        </div>
      )}

      {mailboxes.length > 1 && choosing && (
        <div
          role="radiogroup"
          aria-label={t('send.from.chooseLabel')}
          className="mt-2 flex flex-wrap gap-2"
        >
          {mailboxes.map(mailbox => {
            const active = current.channel === mailbox.channel
            return (
              <button
                key={mailbox.channel}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={disabled}
                onClick={() => onChange(mailbox.channel)}
                className={`ds-btn ${active ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', maxWidth: '100%' }}
              >
                {providerIcon(mailbox.channel)}
                <span style={{ overflowWrap: 'anywhere', textAlign: 'left' }}>
                  {mailbox.email
                    ? `${providerName(mailbox.channel)} · ${mailbox.email}`
                    : providerName(mailbox.channel)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
