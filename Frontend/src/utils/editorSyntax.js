/**
 * Real-time syntax highlighter tokens for the code editor
 */
export const highlightCode = (value) => {
  if (!value) return ''

  return value
    .split('\n')
    .map((line) => {
      if (!line) return '&nbsp;'

      let escaped = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

      // Comments
      if (escaped.trim().startsWith('//') || escaped.trim().startsWith('/*') || escaped.trim().startsWith('*')) {
        return `<span class="syn-comment">${escaped}</span>`
      }

      // Strings
      escaped = escaped.replace(/(["'`])(.*?)\1/g, '<span class="syn-string">$1$2$1</span>')

      // Keywords
      escaped = escaped.replace(
        /\b(import|export|from|default|const|let|var|function|return|async|await|if|else|switch|case|try|catch|finally|throw|class|new|typeof|instanceof|while|for|of|in)\b/g,
        '<span class="syn-keyword">$1</span>'
      )

      // Booleans & null/undefined
      escaped = escaped.replace(/\b(true|false|null|undefined|NaN)\b/g, '<span class="syn-boolean">$1</span>')

      // Numbers
      escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syn-number">$1</span>')

      // Function invocations
      escaped = escaped.replace(/\b([a-zA-Z0-9_$]+)(?=\()/g, '<span class="syn-function">$1</span>')

      return escaped
    })
    .join('\n')
}
