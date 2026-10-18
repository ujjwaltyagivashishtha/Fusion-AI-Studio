import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useTheme } from '../context/theme.context'
import { highlightCode } from '../utils/editorSyntax'
import { getLanguageInfo, formatCodeContent } from '../utils/editorUtils'
import EditorToolbar from './editor/EditorToolbar'
import EditorSearchBar from './editor/EditorSearchBar'
import EditorDiffBanner from './editor/EditorDiffBanner'
import EditorStatusBar from './editor/EditorStatusBar'
import EditorMinimap from './editor/EditorMinimap'

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

  const languageInfo = useMemo(() => getLanguageInfo(fileName), [fileName])
  const highlightedCode = useMemo(() => highlightCode(value), [value])

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

  const handleFormatCode = () => {
    if (!value) return
    const formatted = formatCodeContent(value, fileName, tabSize)
    onChange(formatted)
  }

  // Keyboard actions: Tab, Cmd+F, auto-closing brackets & quotes
  const handleKeyDown = (e) => {
    const textarea = textareaRef.current
    if (!textarea) return

    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault()
      setIsSearchOpen(true)
      return
    }

    const { selectionStart, selectionEnd } = textarea

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

    const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '`': '`' }
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

  useEffect(() => {
    updateCursorPosition()
  }, [value, updateCursorPosition])

  return (
    <div className="flex-grow flex flex-col min-w-0 bg-editor overflow-hidden select-text relative border-r border-default transition-colors duration-150">
      <EditorToolbar
        fileName={fileName}
        languageInfo={languageInfo}
        isSearchOpen={isSearchOpen}
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        onFormatCode={handleFormatCode}
        activeWordWrap={activeWordWrap}
        onToggleWordWrap={() => setOverrideWordWrap(!activeWordWrap)}
        activeFontSize={activeFontSize}
        onChangeFontSize={setOverrideFontSize}
        onCopy={handleCopy}
        copied={copied}
      />

      {isSearchOpen && (
        <EditorSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultsCount={searchResults.length}
          currentIndex={currentSearchIndex}
          onPrevSearch={handlePrevSearch}
          onNextSearch={handleNextSearch}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {isDiffMode && (
        <EditorDiffBanner onRejectDiff={onRejectDiff} onAcceptDiff={onAcceptDiff} />
      )}

      {/* Main Code Canvas */}
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
          <div
            className="absolute left-0 right-0 pointer-events-none editor-line-active transition-all duration-75"
            style={{
              top: `${(cursorPos.line - 1) * 24 + 12}px`,
              height: '24px'
            }}
          />

          <pre
            ref={preHighlightRef}
            aria-hidden="true"
            className={`absolute inset-0 p-3 pt-3 text-primary font-mono leading-6 pointer-events-none overflow-hidden select-none whitespace-pre ${
              activeWordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
            style={{ fontSize: `${activeFontSize}px` }}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />

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

        {showMinimap && (
          <EditorMinimap
            minimapRef={minimapRef}
            lines={lines}
            cursorLine={cursorPos.line}
            resolvedTheme={resolvedTheme}
          />
        )}
      </div>

      <EditorStatusBar
        tabSize={tabSize}
        cursorPos={cursorPos}
        totalLines={totalLines}
        charCount={value?.length || 0}
        languageName={languageInfo.name}
      />
    </div>
  )
}

export default CodeEditor
