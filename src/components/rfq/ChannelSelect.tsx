import { MicrosoftOutlookLogo } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import GmailIcon from '../icons/GmailIcon'

export type SendChannel = 'google' | 'outlook'

interface Props {
  googleConnected: boolean
  outlookConnected: boolean
  value: SendChannel
  onChange: (channel: SendChannel) => void
  disabled?: boolean
}

// Lets the buyer pick which mailbox an RFQ (and its later replies) goes out from.
// Only rendered when BOTH mailboxes are connected — with a single mailbox the
// channel is implicit and no choice is shown.
export default function ChannelSelect({
  googleConnected,
  outlookConnected,
  value,
  onChange,
  disabled,
}: Props) {
  const { t } = useTranslation('rfq')

  if (!googleConnected || !outlookConnected) return null

  const options: { key: SendChannel; label: string; icon: React.ReactNode }[] = [
    { key: 'google', label: t('send.channel.gmail'), icon: <GmailIcon size={16} /> },
    {
      key: 'outlook',
      label: t('send.channel.outlook'),
      icon: <MicrosoftOutlookLogo size={16} weight="fill" color="#0F6CBD" aria-hidden />,
    },
  ]

  return (
    <div className="mb-3">
      <span className="block text-sm text-[var(--color-text-secondary)] mb-1">
        {t('send.channel.label')}
      </span>
      <div role="radiogroup" className="inline-flex gap-2">
        {options.map(opt => {
          const active = value === opt.key
          return (
            <button
              key={opt.key}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              onClick={() => onChange(opt.key)}
              className={`ds-btn ${active ? 'ds-btn-primary' : 'ds-btn-secondary'}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {opt.icon}
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
