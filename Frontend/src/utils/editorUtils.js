/**
 * Detect language name and icon styling from filename extension
 */
export const getLanguageInfo = (fileName) => {
  if (!fileName) return { name: 'Plain Text', icon: 'ri-file-text-line', color: 'text-muted' }
  if (fileName.endsWith('.js') || fileName.endsWith('.mjs')) return { name: 'JavaScript (ES6+)', icon: 'ri-javascript-line', color: 'text-amber-500' }
  if (fileName.endsWith('.jsx')) return { name: 'React (JSX)', icon: 'ri-reactjs-line', color: 'text-cyan-500' }
  if (fileName.endsWith('.html')) return { name: 'HTML5', icon: 'ri-html5-line', color: 'text-orange-500' }
  if (fileName.endsWith('.css')) return { name: 'CSS3', icon: 'ri-css3-line', color: 'text-blue-500' }
  if (fileName.endsWith('.json')) return { name: 'JSON', icon: 'ri-braces-line', color: 'text-emerald-500' }
  if (fileName.endsWith('.py')) return { name: 'Python', icon: 'ri-code-s-slash-line', color: 'text-yellow-500' }
  if (fileName.endsWith('.md')) return { name: 'Markdown', icon: 'ri-markdown-line', color: 'text-purple-500' }
  return { name: 'Plain Text', icon: 'ri-file-code-line', color: 'text-secondary' }
}

/**
 * Format code content (JSON pretty-print or trailing whitespace cleanup)
 */
export const formatCodeContent = (value, fileName, tabSize = 2) => {
  if (!value) return ''
  try {
    if (fileName?.endsWith('.json')) {
      const parsed = JSON.parse(value)
      return JSON.stringify(parsed, null, tabSize)
    }
    return value
      .split('\n')
      .map((l) => l.replace(/\s+$/, ''))
      .join('\n')
  } catch {
    return value
  }
}
