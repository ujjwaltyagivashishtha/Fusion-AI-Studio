/**
 * Detect language name and icon styling from filename extension
 */
export const getLanguageInfo = (fileName) => {
  if (!fileName) return { name: 'Plain Text', icon: 'ri-file-text-line', color: 'text-muted' }
  const lower = fileName.toLowerCase()

  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) {
    return { name: 'JavaScript (ES6+)', icon: 'ri-javascript-line', color: 'text-amber-400' }
  }
  if (lower.endsWith('.jsx')) {
    return { name: 'React (JSX)', icon: 'ri-reactjs-line', color: 'text-cyan-400' }
  }
  if (lower.endsWith('.ts') || lower.endsWith('.mts') || lower.endsWith('.cts')) {
    return { name: 'TypeScript', icon: 'ri-code-s-slash-line', color: 'text-blue-400' }
  }
  if (lower.endsWith('.tsx')) {
    return { name: 'React (TSX)', icon: 'ri-reactjs-line', color: 'text-sky-400' }
  }
  if (lower.endsWith('.py') || lower.endsWith('.pyw')) {
    return { name: 'Python 3', icon: 'ri-terminal-window-line', color: 'text-yellow-400' }
  }
  if (lower.endsWith('.java')) {
    return { name: 'Java', icon: 'ri-cup-line', color: 'text-orange-400' }
  }
  if (lower.endsWith('.c') || lower.endsWith('.h')) {
    return { name: 'C', icon: 'ri-cpu-line', color: 'text-blue-400' }
  }
  if (lower.endsWith('.cpp') || lower.endsWith('.hpp') || lower.endsWith('.cc')) {
    return { name: 'C++', icon: 'ri-cpu-line', color: 'text-indigo-400' }
  }
  if (lower.endsWith('.go')) {
    return { name: 'Go', icon: 'ri-code-box-line', color: 'text-cyan-300' }
  }
  if (lower.endsWith('.rs')) {
    return { name: 'Rust', icon: 'ri-tools-line', color: 'text-amber-500' }
  }
  if (lower.endsWith('.php')) {
    return { name: 'PHP', icon: 'ri-server-line', color: 'text-indigo-300' }
  }
  if (lower.endsWith('.html') || lower.endsWith('.htm')) {
    return { name: 'HTML5', icon: 'ri-html5-line', color: 'text-orange-500' }
  }
  if (lower.endsWith('.css') || lower.endsWith('.scss') || lower.endsWith('.less')) {
    return { name: 'CSS3', icon: 'ri-css3-line', color: 'text-blue-500' }
  }
  if (lower.endsWith('.sql')) {
    return { name: 'SQL', icon: 'ri-database-2-line', color: 'text-emerald-400' }
  }
  if (lower.endsWith('.json')) {
    return { name: 'JSON', icon: 'ri-braces-line', color: 'text-emerald-400' }
  }
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) {
    return { name: 'YAML', icon: 'ri-settings-line', color: 'text-pink-400' }
  }
  if (lower.endsWith('.md')) {
    return { name: 'Markdown', icon: 'ri-markdown-line', color: 'text-purple-400' }
  }
  if (lower.endsWith('.sh') || lower.endsWith('.bash')) {
    return { name: 'Shell Script', icon: 'ri-terminal-line', color: 'text-emerald-500' }
  }
  if (lower.startsWith('.env')) {
    return { name: 'Environment Config', icon: 'ri-key-2-line', color: 'text-amber-400' }
  }

  return { name: 'Plain Text', icon: 'ri-file-code-line', color: 'text-secondary' }
}

/**
 * Format code content (JSON pretty-print or trailing whitespace cleanup)
 */
export const formatCodeContent = (value, fileName, tabSize = 2) => {
  if (!value) return ''
  try {
    if (fileName?.toLowerCase().endsWith('.json')) {
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
