/** Hairline marks for the commercial request steps. One drawing each — not tiles. */

function ProductMark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M12 22.5 32 12l20 10.5V46L32 56.5 12 46V22.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M12 22.5 32 33l20-10.5M32 33v23.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M22 18.5 42 29" stroke="currentColor" strokeWidth="1.4" opacity="0.45" />
    </svg>
  )
}

function TermsMark() {
  // Clipboard with a check: agreed commercial terms (incoterm / dates / currency).
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      <rect x="15" y="15" width="34" height="40" rx="4" stroke="currentColor" strokeWidth="1.4" />
      <rect x="25" y="10" width="14" height="9" rx="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M23 35l6 6 11-13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 48h16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

function SpecMark() {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden>
      <path d="M18 10h20l10 10v34H18V10Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M38 10v10h10" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M26 32h16M26 40h16M26 48h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

const MARKS = [ProductMark, TermsMark, SpecMark] as const

export default function RequestStepArt({ step }: { step: 0 | 1 | 2 }) {
  const Mark = MARKS[step]
  return (
    <span className="cr-art" aria-hidden>
      <Mark />
    </span>
  )
}
