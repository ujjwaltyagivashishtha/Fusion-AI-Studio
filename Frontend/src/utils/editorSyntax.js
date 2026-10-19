/**
 * High-performance real-time syntax highlighter tokens for the code editor
 * Supports JS, TS, Python, SQL, Go, Rust, Java, C/C++, HTML, Shell
 */

const escapeHtml = (str) =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const KEYWORDS =
  'import|export|from|default|const|let|var|function|return|async|await|if|else|switch|case|try|catch|finally|throw|class|new|typeof|instanceof|while|for|of|in|interface|type|enum|implements|extends|public|private|protected|readonly|def|as|self|None|True|False|func|package|struct|fn|mut|pub|impl|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|CREATE|TABLE'

const TOKEN_PATTERN = new RegExp(
  '(' +
    // 1. Comments
    '(?:\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/|#[^\\n]*|--[^\\n]*)' +
  ')|(' +
    // 2. Strings (single, double, template backtick)
    '(?:"(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)' +
  ')|(' +
    // 3. Keywords
    '\\b(?:' + KEYWORDS + ')\\b' +
  ')|(' +
    // 4. Booleans & null/undefined/nil
    '\\b(?:true|false|null|undefined|nil|NaN)\\b' +
  ')|(' +
    // 5. Numbers
    '\\b(?:\\d+(?:\\.\\d+)?)\\b' +
  ')|(' +
    // 6. Function calls
    '\\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\\s*\\()' +
  ')',
  'g'
)

export const highlightCode = (value) => {
  if (!value) return ''

  return value
    .split('\n')
    .map((line) => {
      if (!line) return '&nbsp;'

      let result = ''
      let lastIndex = 0
      TOKEN_PATTERN.lastIndex = 0
      let match

      while ((match = TOKEN_PATTERN.exec(line)) !== null) {
        if (match.index > lastIndex) {
          result += escapeHtml(line.slice(lastIndex, match.index))
        }

        const [full, comment, str, kw, bool, num, fn] = match

        if (comment) {
          result += `<span class="syn-comment">${escapeHtml(comment)}</span>`
        } else if (str) {
          result += `<span class="syn-string">${escapeHtml(str)}</span>`
        } else if (kw) {
          result += `<span class="syn-keyword">${escapeHtml(kw)}</span>`
        } else if (bool) {
          result += `<span class="syn-boolean">${escapeHtml(bool)}</span>`
        } else if (num) {
          result += `<span class="syn-number">${escapeHtml(num)}</span>`
        } else if (fn) {
          result += `<span class="syn-function">${escapeHtml(fn)}</span>`
        } else {
          result += escapeHtml(full)
        }

        lastIndex = match.index + full.length
      }

      if (lastIndex < line.length) {
        result += escapeHtml(line.slice(lastIndex))
      }

      return result
    })
    .join('\n')
}
