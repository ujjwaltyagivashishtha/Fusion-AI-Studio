// Safe URL protocol validator to prevent javascript: or data: injection
export function sanitizeUrl(rawUrl) {
  if (!rawUrl) return null
  const trimmed = rawUrl.trim()
  if (/^(?:javascript|data|vbscript):/i.test(trimmed)) {
    return null
  }
  return trimmed
}

// Tokenize code snippets into keywords, strings, numbers, comments, plain text
export function highlightCodeTokens(code) {
  if (!code) return []
  const lines = code.split('\n')
  const keywordRegex = /\b(const|let|var|function|return|import|from|export|default|class|extends|async|await|if|else|switch|case|try|catch|finally|throw|new|typeof|instanceof|while|for|in|of|def|self|print|public|static|void|int|String|boolean|router|app|req|res|next)\b/g
  const stringRegex = /(["'`])(?:(?=(\\?))\2[\s\S])*?\1/g
  const numberRegex = /\b(\d+(?:\.\d+)?)\b/g
  const commentRegex = /(\/\/[^\n]*|#[^\n]*)/g

  return lines.map((line, lineIdx) => {
    const tokens = []
    const matches = []

    for (const m of line.matchAll(commentRegex)) {
      matches.push({ type: 'comment', index: m.index, text: m[0] })
    }
    for (const m of line.matchAll(stringRegex)) {
      if (!matches.some((c) => m.index >= c.index && m.index < c.index + c.text.length)) {
        matches.push({ type: 'string', index: m.index, text: m[0] })
      }
    }
    for (const m of line.matchAll(keywordRegex)) {
      if (!matches.some((ex) => m.index >= ex.index && m.index < ex.index + ex.text.length)) {
        matches.push({ type: 'keyword', index: m.index, text: m[0] })
      }
    }
    for (const m of line.matchAll(numberRegex)) {
      if (!matches.some((ex) => m.index >= ex.index && m.index < ex.index + ex.text.length)) {
        matches.push({ type: 'number', index: m.index, text: m[0] })
      }
    }

    matches.sort((a, b) => a.index - b.index)

    let cursor = 0
    matches.forEach((m, mIdx) => {
      if (m.index > cursor) {
        tokens.push({ type: 'plain', text: line.slice(cursor, m.index), key: `p-${lineIdx}-${mIdx}` })
      }
      tokens.push({ type: m.type, text: m.text, key: `t-${lineIdx}-${mIdx}` })
      cursor = m.index + m.text.length
    })
    if (cursor < line.length) {
      tokens.push({ type: 'plain', text: line.slice(cursor), key: `p-${lineIdx}-end` })
    }

    return { lineIdx, tokens: tokens.length > 0 ? tokens : [{ type: 'plain', text: line, key: `p-${lineIdx}` }] }
  })
}

// Block-level Markdown parser
export function parseMarkdownBlocks(text) {
  if (!text) return []
  const blocks = []
  const lines = text.split(/\r?\n/)
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // 1. Fenced Code Block (handles streaming/unclosed fences gracefully)
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      const codeLines = []
      i++
      let closed = false
      while (i < lines.length) {
        if (lines[i].trim().startsWith('```')) {
          closed = true
          i++
          break
        }
        codeLines.push(lines[i])
        i++
      }
      blocks.push({
        type: 'code',
        lang: lang || 'code',
        code: codeLines.join('\n'),
        isStreaming: !closed
      })
      continue
    }

    // 2. Horizontal Rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: 'hr' })
      i++
      continue
    }

    // 3. Headings (#, ##, ###)
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] })
      i++
      continue
    }

    // 4. Blockquotes (> ...)
    if (line.trim().startsWith('>')) {
      const quoteLines = [line.trim().slice(1).trim()]
      i++
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().slice(1).trim())
        i++
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') })
      continue
    }

    // 5. Ordered List (1. ...)
    if (/^\d+\.\s+/.test(line.trim())) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''))
        i++
      }
      blocks.push({ type: 'ol', items })
      continue
    }

    // 6. Unordered List (- ... or * ...)
    if (/^[-*+]\s+/.test(line.trim())) {
      const items = []
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ''))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    // 7. Empty line
    if (!line.trim()) {
      i++
      continue
    }

    // 8. Paragraph (aggregate contiguous non-empty lines)
    const paraLines = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('>') &&
      !/^\d+\.\s+/.test(lines[i].trim()) &&
      !/^[-*+]\s+/.test(lines[i].trim()) &&
      !/^(\*{3,}|-{3,}|_{3,})$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i])
      i++
    }
    blocks.push({ type: 'p', text: paraLines.join('\n') })
  }

  return blocks
}
