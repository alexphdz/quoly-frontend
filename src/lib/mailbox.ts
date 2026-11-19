import type { UserProfile } from '../types/auth'

export type SendChannel = 'google' | 'outlook'

export interface ConnectedMailbox {
  channel: SendChannel
  /** null = connected before Quoly stored the address → the UI asks to reconnect. */
  email: string | null
}

type MailboxFields = Pick<
  UserProfile,
  'google_connected' | 'outlook_connected' | 'google_email' | 'outlook_email' | 'default_send_channel'
>

function cleanEmail(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/** Connected mailboxes, Gmail first (same tie-break the backend uses). */
export function connectedMailboxes(user: Partial<MailboxFields> | null | undefined): ConnectedMailbox[] {
  const list: ConnectedMailbox[] = []
  if (user?.google_connected) list.push({ channel: 'google', email: cleanEmail(user.google_email) })
  if (user?.outlook_connected) list.push({ channel: 'outlook', email: cleanEmail(user.outlook_email) })
  return list
}

/** The mailbox a request goes out from when the buyer doesn't pick one. */
export function defaultMailbox(
  mailboxes: ConnectedMailbox[],
  preferred: SendChannel | null | undefined,
): ConnectedMailbox | undefined {
  return mailboxes.find(m => m.channel === preferred) ?? mailboxes[0]
}
