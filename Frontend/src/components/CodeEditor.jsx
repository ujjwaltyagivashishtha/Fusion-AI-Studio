import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useTheme } from '../context/theme.context'

const CodeEditor = ({
  value,
  onChange,
  fileName,
  onCopy,
  collaborators = [],
  isDiffMode = false,
  onAcceptDiff = () => {},
  onRejectDiff = () => {},
  fontSize = 13,
  wordWrap = true,
  tabSize = 2,
  showMinimap = true
}) => {
  const { resolvedTheme } = useTheme()
  const textareaRef = useRef(null)
  const lineNumbersRef = useRef(null)
  const preHighlightRef = useRef(null)
  const minimapRef = useRef(null)

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })
  const [copied, setCopied] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  const [overrideWordWrap, setOverrideWordWrap] = useState(null)
  const [overrideFontSize, setOverrideFontSize] = useState(null)

  const activeWordWrap = overrideWordWrap !== null ? overrideWordWrap : wordWrap
  const activeFontSize = overrideFontSize !== null ? overrideFontSize : fontSize

  const lines = useMemo(() => (value || '').split('\n'), [value])
  const totalLines = lines.length

  // Detect language & icons from file extension
  const languageInfo = useMemo(() => {
    if (!fileName) return { name: 'Plain Text', icon: 'ri-file-text-line', color: 'text-muted' }
    if (fileName.endsWith('.js') || fileName.endsWith('.mjs')) return { name: 'JavaScript (ES6+)', icon: 'ri-javascript-line', color: 'text-amber-500' }
    if (fileName.endsWith('.jsx')) return { name: 'React (JSX)', icon: 'ri-reactjs-line', color: 'text-cyan-500' }
    if (fileName.endsWith('.html')) return { name: 'HTML5', icon: 'ri-html5-line', color: 'text-orange-500' }
    if (fileName.endsWith('.css')) return { name: 'CSS3', icon: 'ri-css3-line', color: 'text-blue-500' }
    if (fileName.endsWith('.json')) return { name: 'JSON', icon: 'ri-braces-line', color: 'text-emerald-500' }
    if (fileName.endsWith('.py')) return { name: 'Python', icon: 'ri-code-s-slash-line', color: 'text-yellow-500' }
    if (fileName.endsWith('.md')) return { name: 'Markdown', icon: 'ri-markdown-line', color: 'text-purple-500' }
    return { name: 'Plain Text', icon: 'ri-file-code-line', color: 'text-secondary' }
  }, [fileName])

  // Sync scrolling between textarea, line numbers gutter, and highlight layer
  const handleScroll = () => {
    if (!textareaRef.current) return
    const { scrollTop, scrollLeft } = textareaRef.current
    if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = scrollTop
    if (preHighlightRef.current) {
      preHighlightRef.current.scrollTop = scrollTop
      preHighlightRef.current.scrollLeft = scrollLeft
    }
  }

  // Update cursor position line and column
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return
    const selStart = textareaRef.current.selectionStart
    const textBefore = (value || '').substring(0, selStart)
    const currentLines = textBefore.split('\n')
    const line = currentLines.length
    const col = currentLines[currentLines.length - 1].length + 1
    setCursorPos({ line, col })
  }, [value])

  // In-editor Search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !value) return []
    const query = searchQuery.toLowerCase()
    const text = value.toLowerCase()
    const indices = []
    let startIndex = 0
    while ((startIndex = text.indexOf(query, startIndex)) !== -1) {
      indices.push(startIndex)
      startIndex += query.length
    }
    return indices
  }, [searchQuery, value])

  const highlightSearchMatch = (charIndex) => {
    if (!textareaRef.current || charIndex === undefined) return
    textareaRef.current.focus()
    textareaRef.current.setSelectionRange(charIndex, charIndex + searchQuery.length)
    updateCursorPosition()
  }

  const handleNextSearch = () => {
    if (searchResults.length === 0) return
    const nextIndex = (currentSearchIndex + 1) % searchResults.length
    setCurrentSearchIndex(nextIndex)
    highlightSearchMatch(searchResults[nextIndex])
  }

  const handlePrevSearch = () => {
    if (searchResults.length === 0) return
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length
    setCurrentSearchIndex(prevIndex)
    highlightSearchMatch(searchResults[prevIndex])
  }

  // Prettier / Formatter
  const handleFormatCode = () => {
    if (!value) return
    try {
      if (fileName?.endsWith('.json')) {
        const parsed = JSON.parse(value)
        onChange(JSON.stringify(parsed, null, tabSize))
        return
      }
      const formatted = value
        .split('\n')
        .map((l) => l.replace(/\s+$/, ''))
        .join('\n')
      onChange(formatted)
    } catch {
      // Retain as is
    }
  }

  // Keyboard actions: Tab, Cmd+F, auto-closing brackets & quotes
  const handleKeyDown = (e) => {
    const textarea = textareaRef.current
    if (!textarea) return

    // Hotkey: Cmd+F or Ctrl+F
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault()
      setIsSearchOpen(true)
      return
    }

    const { selectionStart, selectionEnd } = textarea

    // Tab key
    if (e.key === 'Tab') {
      e.preventDefault()
      const spaces = ' '.repeat(tabSize)
      const newValue = value.substring(0, selectionStart) + spaces + value.substring(selectionEnd)
      onChange(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + spaces.length
        updateCursorPosition()
      }, 0)
      return
    }

    // Auto-closing pairs: (), {}, [], "", '', ``
    const pairs = {
      '(': ')',
      '{': '}',
      '[': ']',
      '"': '"',
      "'": "'",
      '`': '`'
    }

    if (pairs[e.key] && selectionStart === selectionEnd) {
      e.preventDefault()
      const openChar = e.key
      const closeChar = pairs[e.key]
      const newValue = value.substring(0, selectionStart) + openChar + closeChar + value.substring(selectionEnd)
      onChange(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
        updateCursorPosition()
      }, 0)
      return
    }

    // Skip closing char if matching
    const closingChars = [')', '}', ']', '"', "'", '`']
    if (closingChars.includes(e.key) && value[selectionStart] === e.key) {
      e.preventDefault()
      textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
      updateCursorPosition()
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(value || '')
    setCopied(true)
    if (onCopy) onCopy()
    setTimeout(() => setCopied(false), 2000)
  }

  // Real-time syntax highlighter tokens
  const highlightedCode = useMemo(() => {
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
  }, [value])

  useEffect(() => {
    updateCursorPosition()
  }, [value, updateCursorPosition])

  return (
    <div className="flex-grow flex flex-col min-w-0 bg-editor overflow-hidden select-text relative border-r border-default transition-colors duration-150">
      {/* 1. Breadcrumbs & Top Editor Toolbar */}
      <div className="h-9 border-b border-default bg-sidebar/85 backdrop-blur-md px-3 flex items-center justify-between text-xs text-secondary shrink-0 select-none">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1.5 min-w-0 font-mono">
          <span className="text-[11px] text-muted flex items-center gap-1">
            <i className="ri-folder-3-line text-indigo-400 text-xs" />
            <span>src</span>
            <i className="ri-arrow-right-s-line text-muted text-xs" />
          </span>
          <span className="flex items-center gap-1.5 font-semibold text-primary text-xs truncate">
            <i className={`${languageInfo.icon} ${languageInfo.color} text-sm`} />
            <span>{fileName}</span>
          </span>
          <span className="text-[10px] text-muted font-mono ml-2 hidden sm:inline px-2 py-0.5 rounded-md border border-default bg-surface/60">
            {languageInfo.name}
          </span>
        </div>

        {/* Editor Actions Toolbar */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Search Toggle Button */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`p-1.5 rounded-xl border text-xs transition cursor-pointer ${
              isSearchOpen
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-sm'
                : 'border-default bg-surface/70 text-secondary hover:text-primary hover:border-strong'
            }`}
            title="Find in file (⌘F / Ctrl+F)"
            aria-label="Find in file"
          >
            <i className="ri-search-line text-xs" />
          </button>

          {/* Format Code */}
          <button
            onClick={handleFormatCode}
            className="p-1.5 rounded-xl border border-default bg-surface/70 text-secondary hover:text-primary hover:border-strong text-xs transition cursor-pointer"
            title="Format Code with Prettier"
            aria-label="Format Code"
          >
            <i className="ri-magic-line text-xs" />
          </button>

          {/* Word Wrap Toggle */}
          <button
            onClick={() => setOverrideWordWrap(!activeWordWrap)}
            className={`p-1.5 rounded-xl border text-xs transition cursor-pointer ${
              activeWordWrap
                ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-400 shadow-sm'
                : 'border-default bg-surface/70 text-secondary hover:text-primary'
            }`}
            title="Toggle Word Wrap"
            aria-label="Toggle Word Wrap"
          >
            <i className="ri-text-wrap text-xs" />
          </button>

          {/* Font Size Adjusters */}
          <div className="hidden md:flex items-center gap-0.5 border border-default bg-surface/70 rounded-xl p-0.5 text-[10px]">
            <button
              onClick={() => setOverrideFontSize(Math.max(11, activeFontSize - 1))}
              className="px-1.5 py-0.5 text-muted hover:text-primary cursor-pointer font-bold"
              title="Decrease Font Size"
            >
              A-
            </button>
            <span className="text-secondary font-mono px-1">{activeFontSize}</span>
            <button
              onClick={() => setOverrideFontSize(Math.min(18, activeFontSize + 1))}
              className="px-1.5 py-0.5 text-muted hover:text-primary cursor-pointer font-bold"
              title="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-semibold text-secondary hover:text-primary transition px-2.5 py-1 rounded-xl border border-default bg-surface/70 hover:border-strong cursor-pointer shadow-sm ml-1"
            title="Copy code to clipboard"
          >
            <i className={copied ? 'ri-check-line text-emerald-400' : 'ri-file-copy-line text-xs'} />
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* 2. Floating Search Bar */}
      {isSearchOpen && (
        <div className="border-b border-default bg-surface px-4 py-2 flex items-center justify-between gap-3 text-xs z-20 animate-slideDown shadow-sm">
          <div className="flex items-center gap-2 flex-grow max-w-md">
            <div className="relative flex-grow">
              <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find in current file..."
                className="w-full pl-8 pr-20 py-1.5 rounded-lg border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-blue-500 font-mono"
              />
              {searchQuery && (
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono">
                  {searchResults.length > 0
                    ? `${currentSearchIndex + 1} of ${searchResults.length}`
                    : '0 results'}
                </span>
              )}
            </div>
            <button
              onClick={handlePrevSearch}
              disabled={searchResults.length === 0}
              className="p-1.5 rounded-lg border border-default bg-surface text-secondary hover:text-primary disabled:opacity-30 cursor-pointer"
              title="Previous match (Shift+Enter)"
            >
              <i className="ri-arrow-up-s-line text-xs" />
            </button>
            <button
              onClick={handleNextSearch}
              disabled={searchResults.length === 0}
              className="p-1.5 rounded-lg border border-default bg-surface text-secondary hover:text-primary disabled:opacity-30 cursor-pointer"
              title="Next match (Enter)"
            >
              <i className="ri-arrow-down-s-line text-xs" />
            </button>
          </div>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-muted hover:text-primary cursor-pointer p-1"
            title="Close search"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>
      )}

      {/* 3. AI Diff View Mode Banner */}
      {isDiffMode && (
        <div className="border-b border-blue-500/30 bg-blue-500/10 px-4 py-2 flex items-center justify-between text-xs text-primary">
          <div className="flex items-center gap-2">
            <i className="ri-git-merge-line text-blue-500 text-sm" />
            <span className="font-semibold">Reviewing pending AI recommendation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRejectDiff}
              className="px-2.5 py-1 rounded-lg border border-default bg-surface hover:bg-surface-hover text-secondary text-[11px] font-medium cursor-pointer transition"
            >
              Discard
            </button>
            <button
              onClick={onAcceptDiff}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm cursor-pointer transition"
            >
              <i className="ri-check-line" />
              Accept & Apply
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Code Canvas */}
      <div className="flex-grow flex relative overflow-hidden font-mono">
        {/* Gutter / Line Numbers */}
        <div
          ref={lineNumbersRef}
          aria-hidden="true"
          className="w-12 bg-sidebar py-3 text-muted text-right pr-2.5 select-none font-mono border-r border-default leading-6 overflow-hidden shrink-0"
          style={{ fontSize: `${activeFontSize}px` }}
        >
          {Array.from({ length: totalLines }).map((_, i) => {
            const lineNum = i + 1
            const isCurrentLine = cursorPos.line === lineNum
            return (
              <div
                key={i}
                className={`transition-colors ${
                  isCurrentLine ? 'text-indigo-400 font-bold' : 'hover:text-primary'
                }`}
              >
                <span>{lineNum}</span>
              </div>
            )
          })}
        </div>

        {/* Code Canvas Container */}
        <div className="flex-grow relative overflow-hidden bg-editor">
          {/* Active Line Highlight Background */}
          <div
            className="absolute left-0 right-0 pointer-events-none editor-line-active transition-all duration-75"
            style={{
              top: `${(cursorPos.line - 1) * 24 + 12}px`,
              height: '24px'
            }}
          />

          {/* Syntax Highlighted Background Layer */}
          <pre
            ref={preHighlightRef}
            aria-hidden="true"
            className={`absolute inset-0 p-3 pt-3 text-primary font-mono leading-6 pointer-events-none overflow-hidden select-none whitespace-pre ${
              activeWordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
            style={{ fontSize: `${activeFontSize}px` }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />

          {/* Interactive Textarea (Top Layer with Transparent Text for Caret/Selection) */}
          <textarea
            ref={textareaRef}
            value={value || ''}
            onChange={(e) => {
              onChange(e.target.value)
              updateCursorPosition()
            }}
            onKeyDown={handleKeyDown}
            onKeyUp={updateCursorPosition}
            onClick={updateCursorPosition}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label={`Code editor for ${fileName}`}
            className={`absolute inset-0 p-3 pt-3 bg-transparent text-transparent caret-indigo-400 outline-none resize-none leading-6 font-mono selection:bg-indigo-500/30 overflow-auto ${
              activeWordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
            style={{
              fontSize: `${activeFontSize}px`,
              tabSize: tabSize,
              MozTabSize: tabSize
            }}
          />

          {/* Simulated Collaborator Cursors */}
          {collaborators.length > 1 && (
            <div
              className="absolute pointer-events-none flex items-center gap-1 transition-all duration-300"
              style={{
                top: `${Math.min(cursorPos.line + 2, totalLines) * 24}px`,
                left: '160px'
              }}
            >
              <span className="w-0.5 h-5 bg-emerald-400 animate-pulse shadow-sm" />
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-[9px] font-bold text-white uppercase shadow-sm tracking-wider">
                {typeof collaborators[1] === 'object' ? collaborators[1].email?.split('@')[0] : 'Partner'}
              </span>
            </div>
          )}
        </div>

        {/* Minimap Preview Bar */}
        {showMinimap && (
          <div
            ref={minimapRef}
            className="w-14 bg-sidebar/85 border-l border-default py-2 px-1 hidden xl:flex flex-col select-none overflow-hidden shrink-0 opacity-40 hover:opacity-100 transition-opacity"
            title="Code Minimap"
          >
            <div className="space-y-0.5">
              {lines.slice(0, 65).map((l, idx) => {
                const len = Math.min(l.trim().length, 14)
                return (
                  <div
                    key={idx}
                    className={`h-[2px] rounded-full ${
                      idx + 1 === cursorPos.line
                        ? 'bg-indigo-500 h-[3px]'
                        : len > 0
                        ? resolvedTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
                        : 'bg-transparent'
                    }`}
                    style={{ width: `${Math.max(len * 7, 4)}%` }}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Status Bar */}
      <div className="h-6.5 border-t border-default bg-sidebar/90 backdrop-blur-md px-3 flex items-center justify-between text-[11px] text-muted font-mono shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-secondary font-medium">
            <i className="ri-git-branch-line text-indigo-400 text-xs" />
            <span>main</span>
          </span>
          <span>UTF-8</span>
          <span>Spaces: {tabSize}</span>
          <span className="text-secondary">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span className="hidden sm:inline">{totalLines} lines • {value?.length || 0} chars</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
            <i className="ri-shield-check-line text-xs" />
            <span>Prettier Ready</span>
          </span>
          <span className="h-3 w-[1px] bg-border-default" />
          <span className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>{languageInfo.name}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

export default CodeEditor
