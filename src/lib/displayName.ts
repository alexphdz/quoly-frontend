/** Best-effort display name from email (proto sidebar uses a person name). */
export function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? email
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

/**
 * First name for Home greetings. UserProfile has no name field today;
 * reuse the sidebar derivation, but never interpolate the raw email.
 */
export function greetingFirstName(email: string | undefined | null): string | undefined {
  if (!email || !email.includes('@')) return undefined
  const first = displayNameFromEmail(email).split(/\s+/)[0]
  if (!first || first.includes('@') || first.includes('+')) return undefined
  return first
}
