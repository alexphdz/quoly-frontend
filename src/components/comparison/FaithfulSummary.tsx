import { Fragment, type ReactNode } from 'react'

/**
 * Minimal, dependency-free markdown renderer for the LLM-generated comparison
 * summary. Supports the subset the backend emits: `#`/`##`/`###` headings,
 * `**bold**`, `- `/`* ` bullet lists, and blank-line-separated paragraphs.
 * Never injects raw HTML.
 */

type Block =
  | { kind: 'h1' | 'h2' | 'h3' | 'p'; text: string }
  | { kind: 'ul'; items: string[] }

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ kind: 'p', text: paragraph.join(' ').trim() })
      paragraph = []
    }
  }
  const flushList = () => {
    if (list.length) {
      blocks.push({ kind: 'ul', items: list.slice() })
      list = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushParagraph()
      flushList()
      continue
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line)
    if (heading) {
      flushParagraph()
      flushList()
      const level = heading[1].length
      blocks.push({ kind: level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3', text: heading[2].trim() })
      continue
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      flushParagraph()
      list.push(bullet[1].trim())
      continue
    }
    flushList()
    paragraph.push(line)
  }
  flushParagraph()
  flushList()
  return blocks
}

function renderInline(text: string): ReactNode {
  // Split on **bold** segments, keeping the delimiters' content.
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    const bold = /^\*\*([^*]+)\*\*$/.exec(part)
    if (bold) return <strong key={i}>{bold[1]}</strong>
    return <Fragment key={i}>{part}</Fragment>
  })
}

export default function FaithfulSummary({ text }: { text: string }) {
  const blocks = parseBlocks(text)
  if (blocks.length === 0) return null

  return (
    <div className="ds-ai-summary">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'h1':
            return <h3 key={i}>{renderInline(block.text)}</h3>
          case 'h2':
            return <h4 key={i}>{renderInline(block.text)}</h4>
          case 'h3':
            return <h5 key={i}>{renderInline(block.text)}</h5>
          case 'ul':
            return (
              <ul key={i}>
                {block.items.map((item, j) => (
                  <li key={j}>{renderInline(item)}</li>
                ))}
              </ul>
            )
          default:
            return <p key={i}>{renderInline(block.text)}</p>
        }
      })}
    </div>
  )
}
