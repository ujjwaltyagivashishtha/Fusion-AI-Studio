import { useState, useMemo } from 'react'
import { sanitizeUrl, highlightCodeTokens, parseMarkdownBlocks } from '../../utils/markdownParser'

// Inline Markdown parser (bold, italic, inline code, safe links)
function parseInlineMarkdown(text) {
  if (!text) return null
  const inlineRegex = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*\*[^*]+\*\*\*)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g
  const nodes = []
  let lastIndex = 0
  let match

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    const key = `inline-${match.index}`

    if (token.startsWith('`') && token.endsWith('`')) {
      nodes.push(
        <code
          key={key}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-surface-elevated border border-default text-cyan font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const labelEnd = token.indexOf('](')
      const label = token.slice(1, labelEnd)
      const url = token.slice(labelEnd + 2, -1)
      const safeUrl = sanitizeUrl(url)

      if (safeUrl) {
        nodes.push(
          <a
            key={key}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline hover:text-cyan transition-colors"
          >
            {label}
          </a>
        )
      } else {
        nodes.push(<span key={key} className="text-muted">{label}</span>)
      }
    } else if (token.startsWith('***') && token.endsWith('***')) {
      nodes.push(<strong key={key} className="font-bold italic">{token.slice(3, -3)}</strong>)
    } else if (token.startsWith('**') && token.endsWith('**')) {
      nodes.push(<strong key={key} className="font-semibold text-primary">{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*') && token.endsWith('*')) {
      nodes.push(<em key={key} className="italic text-secondary">{token.slice(1, -1)}</em>)
    }

    lastIndex = inlineRegex.lastIndex
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes
}

// Render Fenced Code Block with Copy Action and Token Colors
function CodeBlockView({ lang, code, onCopy, isCopied }) {
  const tokenLines = useMemo(() => highlightCodeTokens(code), [code])

  return (
    <div className="my-2.5 rounded-md border border-default bg-app overflow-hidden font-mono text-[11px] shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-default bg-surface text-[10px]">
        <span className="font-semibold text-cyan flex items-center gap-1.5 font-mono">
          <i className="ri-code-s-slash-line text-xs" />
          {lang || 'code'}
        </span>
        <button
          type="button"
          onClick={() => onCopy(code)}
          className="hover:text-primary transition cursor-pointer text-[10px] font-mono flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-surface-hover"
        >
          {isCopied ? (
            <>
              <i className="ri-check-line text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied</span>
            </>
          ) : (
            <>
              <i className="ri-file-copy-line" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 leading-relaxed text-primary selection:bg-accent/20">
        <code>
          {tokenLines.map((row) => (
            <div key={row.lineIdx} className="table-row">
              <span className="table-cell">
                {row.tokens.map((tok) => {
                  if (tok.type === 'keyword') return <span key={tok.key} className="text-accent font-semibold">{tok.text}</span>
                  if (tok.type === 'string') return <span key={tok.key} className="text-emerald-400">{tok.text}</span>
                  if (tok.type === 'number') return <span key={tok.key} className="text-amber-400">{tok.text}</span>
                  if (tok.type === 'comment') return <span key={tok.key} className="text-muted italic">{tok.text}</span>
                  return <span key={tok.key}>{tok.text}</span>
                })}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  )
}

// Main Markdown Renderer Component
export default function CopilotMarkdown({ content, onCopyCode, addToast }) {
  const [copiedCode, setCopiedCode] = useState(null)

  const handleCopy = (code) => {
    navigator.clipboard?.writeText(code)
    setCopiedCode(code)
    onCopyCode?.(code)
    addToast?.('Copied code to clipboard!', 'info')
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const blocks = useMemo(() => parseMarkdownBlocks(content), [content])

  if (!content) return null

  return (
    <div className="space-y-2.5 text-xs leading-relaxed text-primary break-words">
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return (
            <CodeBlockView
              key={idx}
              lang={block.lang}
              code={block.code}
              onCopy={handleCopy}
              isCopied={copiedCode === block.code}
            />
          )
        }
        if (block.type === 'heading') {
          if (block.level === 1) {
            return (
              <h1 key={idx} className="text-sm font-bold text-primary mt-3 mb-1.5 pb-1 border-b border-default flex items-center gap-1.5">
                {parseInlineMarkdown(block.text)}
              </h1>
            )
          }
          if (block.level === 2) {
            return (
              <h2 key={idx} className="text-xs font-bold text-primary mt-2.5 mb-1 text-cyan flex items-center gap-1">
                {parseInlineMarkdown(block.text)}
              </h2>
            )
          }
          return (
            <h3 key={idx} className="text-xs font-semibold text-primary mt-2 mb-1 flex items-center gap-1">
              {parseInlineMarkdown(block.text)}
            </h3>
          )
        }
        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={idx}
              className="border-l-2 border-accent pl-3 py-1 my-2 bg-surface rounded-r text-secondary italic text-[11px]"
            >
              {parseInlineMarkdown(block.text)}
            </blockquote>
          )
        }
        if (block.type === 'ul') {
          return (
            <ul key={idx} className="list-disc list-inside space-y-1 my-1.5 pl-1 text-primary">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {parseInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === 'ol') {
          return (
            <ol key={idx} className="list-decimal list-inside space-y-1 my-1.5 pl-1 text-primary">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx} className="leading-relaxed">
                  {parseInlineMarkdown(item)}
                </li>
              ))}
            </ol>
          )
        }
        if (block.type === 'hr') {
          return <hr key={idx} className="border-default my-3" />
        }
        return (
          <p key={idx} className="leading-relaxed whitespace-pre-wrap">
            {parseInlineMarkdown(block.text)}
          </p>
        )
      })}
    </div>
  )
}
