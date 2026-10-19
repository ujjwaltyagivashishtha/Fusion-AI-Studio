import { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../context/theme.context'
import { highlightCode } from '../utils/editorSyntax'
import { getLanguageInfo, formatCodeContent } from '../utils/editorUtils'
import { useCodeEditorState } from '../hooks/useCodeEditorState'
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
  isDiffMode = false,
  onAcceptDiff = () => {},
  onRejectDiff = () => {},
  fontSize = 13,
  wordWrap = true,
  tabSize = 2,
  showMinimap = true
}) => {
  const { resolvedTheme } = useTheme()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [overrideWordWrap, setOverrideWordWrap] = useState(null)
  const [overrideFontSize, setOverrideFontSize] = useState(null)
  const [overrideMinimap, setOverrideMinimap] = useState(null)

  const activeWordWrap = overrideWordWrap !== null ? overrideWordWrap : wordWrap
  const activeFontSize = overrideFontSize !== null ? overrideFontSize : fontSize
  const activeShowMinimap = overrideMinimap !== null ? overrideMinimap : showMinimap

  const lines = useMemo(() => (value || '').split('\n'), [value])
  const totalLines = lines.length

  const languageInfo = useMemo(() => getLanguageInfo(fileName), [fileName])
  const highlightedCode = useMemo(() => highlightCode(value), [value])

  const {
    textareaRef,
    lineNumbersRef,
    preHighlightRef,
    minimapRef,
    cursorPos,
    copied,
    setCopied,
    searchQuery,
    setSearchQuery,
    currentSearchIndex,
    searchResults,
    handleScroll,
    updateCursorPosition,
    handleNextSearch,
    handlePrevSearch,
    handleKeyDown
  } = useCodeEditorState({
    value,
    onChange,
    tabSize,
    setIsSearchOpen
  })

  const handleFormatCode = () => {
    if (!value) return
    const formatted = formatCodeContent(value, fileName, tabSize)
    onChange(formatted)
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
        showMinimap={activeShowMinimap}
        onToggleMinimap={() => setOverrideMinimap(!activeShowMinimap)}
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
                  isCurrentLine ? 'text-accent-primary font-medium' : 'hover:text-primary'
                }`}
              >
                <span>{lineNum}</span>
              </div>
            )
          })}
        </div>

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
            className={`absolute inset-0 p-3 pt-3 bg-transparent text-transparent caret-accent-primary outline-none resize-none leading-6 font-mono selection:bg-accent-primary/20 overflow-auto ${
              activeWordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
            style={{
              fontSize: `${activeFontSize}px`,
              tabSize: tabSize,
              MozTabSize: tabSize
            }}
          />
        </div>

        {activeShowMinimap && (
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
