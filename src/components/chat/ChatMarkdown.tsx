import { Fragment, type ReactNode } from 'react'

/**
 * Dependency-free markdown renderer for agent chat messages. The agentic model
 * writes conversational markdown (**bold**, bullet and numbered lists, blank-line
 * paragraphs, emojis). Rendering it as plain text showed raw `**` and `1.`.
 * Supports only this safe subset — never injects raw HTML.
 */

type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }

function renderInline(text: string): ReactNode {
  // **bold** → <strong>, keeping everything else (incl. emojis) as-is.
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part)
    if (bold) return <strong key={i}>{bold[1]}</strong>
    return <Fragment key={i}>{part}</Fragment>
  })
}

function parse(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let para: string[] = []
  let ul: string[] = []
  let ol: string[] = []

  const flushP = () => { if (para.length) { blocks.push({ kind: 'p', text: para.join(' ').trim() }); para = [] } }
  const flushUl = () => { if (ul.length) { blocks.push({ kind: 'ul', items: ul.slice() }); ul = [] } }
  const flushOl = () => { if (ol.length) { blocks.push({ kind: 'ol', items: ol.slice() }); ol = [] } }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) { flushP(); flushUl(); flushOl(); continue }
    const ordered = /^\d+[.)]\s+(.*)$/.exec(line)
    if (ordered) { flushP(); flushUl(); ol.push(ordered[1].trim()); continue }
    const bullet = /^[-*•]\s+(.*)$/.exec(line)
    if (bullet) { flushP(); flushOl(); ul.push(bullet[1].trim()); continue }
    flushUl(); flushOl(); para.push(line)
  }
  flushP(); flushUl(); flushOl()
  return blocks
}

export default function ChatMarkdown({ text }: { text: string }) {
  const blocks = parse(text)
  if (!blocks.length) return null
  return (
    <div className="chat-md">
      {blocks.map((b, i) => {
        if (b.kind === 'ul') return <ul key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>
        if (b.kind === 'ol') return <ol key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ol>
        return <p key={i}>{renderInline(b.text)}</p>
      })}
    </div>
  )
}
