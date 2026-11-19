/**
 * Turns LLM text that may contain light Markdown into plain text.
 *
 * The backend is asked for plain text, but older cached summaries and drafts
 * can still carry `**bold**`, `__bold__`, `# headings` or `- bullets`. The UI
 * shows (and sends) text, never markup, so the markers are removed here.
 * Bullets become "• " so list structure stays readable.
 */
export function stripMarkdown(text: string | null | undefined): string {
  if (!text) return ''
  return text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line
      .replace(/^\s{0,3}#{1,6}\s+/, '')
      .replace(/^(\s*)[-*+]\s+/, '$1• ')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/\*\*|__/g, '')
      .replace(/`([^`]+)`/g, '$1'))
    .join('\n')
    .trim()
}

/** Plain-text paragraphs (blank-line separated) from `stripMarkdown` output. */
export function plainParagraphs(text: string | null | undefined): string[] {
  return stripMarkdown(text)
    .split(/\n\s*\n/)
    .map(part => part.trim())
    .filter(Boolean)
}
