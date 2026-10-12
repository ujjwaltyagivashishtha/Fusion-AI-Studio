import { useState, useRef, useEffect, useMemo } from 'react'

const CodeEditor = ({
    value,
    onChange,
    fileName,
    onCopy,
    collaborators = [],
    isDiffMode = false,
    diffContent = '',
    onAcceptDiff,
    onRejectDiff
}) => {
    const textareaRef = useRef(null)
    const lineNumbersRef = useRef(null)
    const preHighlightRef = useRef(null)
    const minimapRef = useRef(null)

    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })
    const [copied, setCopied] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
    const [wordWrap, setWordWrap] = useState(true)
    const [fontSize, setFontSize] = useState(13) // px

    const lines = useMemo(() => (value || '').split('\n'), [value])
    const totalLines = lines.length

    // Detect language from file name
    const languageInfo = useMemo(() => {
        if (!fileName) return { name: 'Plain Text', icon: 'ri-file-text-line', color: 'text-slate-400' }
        if (fileName.endsWith('.js') || fileName.endsWith('.mjs')) return { name: 'JavaScript (ES6+)', icon: 'ri-javascript-line', color: 'text-amber-400' }
        if (fileName.endsWith('.jsx')) return { name: 'React (JSX)', icon: 'ri-reactjs-line', color: 'text-cyan-400' }
        if (fileName.endsWith('.html')) return { name: 'HTML5', icon: 'ri-html5-line', color: 'text-orange-400' }
        if (fileName.endsWith('.css')) return { name: 'CSS3', icon: 'ri-css3-line', color: 'text-blue-400' }
        if (fileName.endsWith('.json')) return { name: 'JSON', icon: 'ri-braces-line', color: 'text-emerald-400' }
        if (fileName.endsWith('.md')) return { name: 'Markdown', icon: 'ri-markdown-line', color: 'text-purple-400' }
        return { name: 'Plain Text', icon: 'ri-file-code-line', color: 'text-slate-400' }
    }, [fileName])

    // Sync scroll between textarea, line numbers, and highlight layer
    const handleScroll = () => {
        if (!textareaRef.current) return
        const { scrollTop, scrollLeft } = textareaRef.current
        if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = scrollTop
        if (preHighlightRef.current) {
            preHighlightRef.current.scrollTop = scrollTop
            preHighlightRef.current.scrollLeft = scrollLeft
        }
    }

    // Calculate cursor position (line, col)
    const updateCursorPosition = () => {
        if (!textareaRef.current) return
        const selStart = textareaRef.current.selectionStart
        const textBefore = (value || '').substring(0, selStart)
        const currentLines = textBefore.split('\n')
        const line = currentLines.length
        const col = currentLines[currentLines.length - 1].length + 1
        setCursorPos({ line, col })
    }

    // In-editor Search functionality
    useEffect(() => {
        if (!searchQuery.trim() || !value) {
            setSearchResults([])
            setCurrentSearchIndex(0)
            return
        }
        const query = searchQuery.toLowerCase()
        const text = value.toLowerCase()
        const indices = []
        let startIndex = 0
        while ((startIndex = text.indexOf(query, startIndex)) !== -1) {
            indices.push(startIndex)
            startIndex += query.length
        }
        setSearchResults(indices)
        setCurrentSearchIndex(indices.length > 0 ? 0 : -1)
    }, [searchQuery, value])

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

    const highlightSearchMatch = (charIndex) => {
        if (!textareaRef.current || charIndex === undefined) return
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(charIndex, charIndex + searchQuery.length)
        updateCursorPosition()
    }

    // Code Formatting / Beautify Simulation
    const handleFormatCode = () => {
        if (!value) return
        try {
            if (fileName?.endsWith('.json')) {
                const parsed = JSON.parse(value)
                onChange(JSON.stringify(parsed, null, 2))
                return
            }
            // Basic indentation cleanup
            const formatted = value
                .split('\n')
                .map((l) => l.replace(/\s+$/, ''))
                .join('\n')
            onChange(formatted)
        } catch {
            // retain if invalid json
        }
    }

    // Keydown handler for Tab indentation and auto-closing pairs
    const handleKeyDown = (e) => {
        const textarea = textareaRef.current
        if (!textarea) return

        // Search hotkey: Ctrl+F or Cmd+F
        if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
            e.preventDefault()
            setIsSearchOpen(true)
            return
        }

        const { selectionStart, selectionEnd } = textarea

        // 1. Tab Key: Insert 2 spaces
        if (e.key === 'Tab') {
            e.preventDefault()
            const spaces = '  '
            const newValue = value.substring(0, selectionStart) + spaces + value.substring(selectionEnd)
            onChange(newValue)
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = selectionStart + spaces.length
                updateCursorPosition()
            }, 0)
            return
        }

        // 2. Auto-closing pairs: (), {}, [], "", '', ``
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

        // 3. Skip over closing character if already present
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

    // High-performance token syntax highlighter
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
                if (escaped.trim().startsWith('//') || escaped.trim().startsWith('/*')) {
                    return `<span class="syn-comment">${escaped}</span>`
                }

                // Strings: "...", '...', `...`
                escaped = escaped.replace(/(["'`])(.*?)\1/g, '<span class="syn-string">$1$2$1</span>')

                // Keywords
                escaped = escaped.replace(
                    /\b(import|export|from|default|const|let|var|function|return|async|await|if|else|switch|case|try|catch|finally|throw|class|new|typeof|instanceof|while|for|of|in)\b/g,
                    '<span class="syn-keyword">$1</span>'
                )

                // Booleans & null / undefined
                escaped = escaped.replace(/\b(true|false|null|undefined|NaN)\b/g, '<span class="syn-boolean">$1</span>')

                // Numbers
                escaped = escaped.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="syn-number">$1</span>')

                // Function invocations: foo(...)
                escaped = escaped.replace(/\b([a-zA-Z0-9_$]+)(?=\()/g, '<span class="syn-function">$1</span>')

                return escaped
            })
            .join('\n')
    }, [value])

    useEffect(() => {
        updateCursorPosition()
    }, [value])

    return (
        <div className="flex-grow flex flex-col min-w-0 bg-[#0B0F19] overflow-hidden select-text relative border-r border-white/5">
            {/* 1. Monaco-Grade Breadcrumbs & Header Bar */}
            <div className="h-9 border-b border-white/5 bg-[#080C14] px-3.5 flex items-center justify-between text-xs text-slate-400 shrink-0 select-none">
                {/* Left: Breadcrumbs Path */}
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <i className="ri-folder-3-line text-blue-400 text-xs"></i>
                        <span>workspace</span>
                        <i className="ri-arrow-right-s-line text-slate-600 text-xs"></i>
                        <span>src</span>
                        <i className="ri-arrow-right-s-line text-slate-600 text-xs"></i>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-200 text-xs truncate">
                        <i className={`${languageInfo.icon} ${languageInfo.color} text-sm`}></i>
                        <span>{fileName}</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono ml-2 hidden md:inline px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {languageInfo.name}
                    </span>
                </div>

                {/* Right: Actions (Search, Prettier, Wrap, Copy, Font Size) */}
                <div className="flex items-center gap-1.5 shrink-0">
                    {/* Search Toggle Button */}
                    <button
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                            isSearchOpen
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title="Find in file (Ctrl+F / ⌘F)"
                    >
                        <i className="ri-search-line text-xs"></i>
                    </button>

                    {/* Prettier / Format Code */}
                    <button
                        onClick={handleFormatCode}
                        className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs transition cursor-pointer"
                        title="Format Code (Prettier)"
                    >
                        <i className="ri-magic-line text-xs"></i>
                    </button>

                    {/* Word Wrap Toggle */}
                    <button
                        onClick={() => setWordWrap(!wordWrap)}
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                            wordWrap
                                ? 'bg-slate-800 border-slate-700 text-blue-400'
                                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                        title="Toggle Word Wrap"
                    >
                        <i className="ri-text-wrap text-xs"></i>
                    </button>

                    {/* Font Size Adjusters */}
                    <div className="hidden lg:flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 text-[10px]">
                        <button
                            onClick={() => setFontSize((f) => Math.max(11, f - 1))}
                            className="px-1.5 py-0.5 text-slate-400 hover:text-white cursor-pointer"
                            title="Decrease Font Size"
                        >
                            A-
                        </button>
                        <span className="text-slate-500 font-mono px-0.5">{fontSize}</span>
                        <button
                            onClick={() => setFontSize((f) => Math.min(18, f + 1))}
                            className="px-1.5 py-0.5 text-slate-400 hover:text-white cursor-pointer"
                            title="Increase Font Size"
                        >
                            A+
                        </button>
                    </div>

                    {/* Copy Code Button */}
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white transition px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer shadow-sm"
                        title="Copy code to clipboard"
                    >
                        <i className={copied ? 'ri-check-line text-emerald-400' : 'ri-file-copy-line text-xs'}></i>
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>
            </div>

            {/* 2. Floating Search & Replace Bar */}
            {isSearchOpen && (
                <div className="bg-slate-950/95 border-b border-white/10 px-4 py-2 flex items-center justify-between gap-3 text-xs z-20 backdrop-blur-md animate-fadeIn">
                    <div className="flex items-center gap-2 flex-grow max-w-md">
                        <div className="relative flex-grow">
                            <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                            <input
                                type="text"
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Find in current file..."
                                className="w-full pl-8 pr-20 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                            />
                            {searchQuery && (
                                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                                    {searchResults.length > 0
                                        ? `${currentSearchIndex + 1} of ${searchResults.length}`
                                        : '0 results'}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={handlePrevSearch}
                            disabled={searchResults.length === 0}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Previous match (Shift+Enter)"
                        >
                            <i className="ri-arrow-up-s-line text-xs"></i>
                        </button>
                        <button
                            onClick={handleNextSearch}
                            disabled={searchResults.length === 0}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                            title="Next match (Enter)"
                        >
                            <i className="ri-arrow-down-s-line text-xs"></i>
                        </button>
                    </div>
                    <button
                        onClick={() => setIsSearchOpen(false)}
                        className="text-slate-400 hover:text-white cursor-pointer p-1"
                        title="Close search"
                    >
                        <i className="ri-close-line text-sm"></i>
                    </button>
                </div>
            )}

            {/* 3. Diff View Mode Banner (when active) */}
            {isDiffMode && (
                <div className="bg-blue-950/70 border-b border-blue-500/30 px-4 py-2 flex items-center justify-between text-xs text-blue-200">
                    <div className="flex items-center gap-2">
                        <i className="ri-git-merge-line text-blue-400 text-sm"></i>
                        <span className="font-semibold">AI Diff Recommendation: Reviewing pending changes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onRejectDiff}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700 cursor-pointer transition"
                        >
                            Discard
                        </button>
                        <button
                            onClick={onAcceptDiff}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-md shadow-emerald-600/30 cursor-pointer transition"
                        >
                            <i className="ri-check-line"></i>
                            Accept & Apply
                        </button>
                    </div>
                </div>
            )}

            {/* 4. Main Code Canvas Area */}
            <div className="flex-grow flex relative overflow-hidden font-mono">
                {/* Gutter / Line Numbers */}
                <div
                    ref={lineNumbersRef}
                    className="w-13 bg-[#080C14] py-3 text-slate-600 text-right pr-3 select-none font-mono border-r border-white/5 leading-6 overflow-hidden shrink-0"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {Array.from({ length: totalLines }).map((_, i) => {
                        const lineNum = i + 1
                        const isCurrentLine = cursorPos.line === lineNum
                        return (
                            <div
                                key={i}
                                className={`flex items-center justify-between gap-1 transition-colors ${
                                    isCurrentLine ? 'text-blue-400 font-bold' : 'hover:text-slate-400'
                                }`}
                            >
                                <span className={`w-1 h-3 rounded-full ${isCurrentLine ? 'bg-blue-500' : 'opacity-0'}`} />
                                <span>{lineNum}</span>
                            </div>
                        )
                    })}
                </div>

                {/* Code Canvas Container */}
                <div className="flex-grow relative overflow-hidden">
                    {/* Active Line Highlight Background */}
                    <div
                        className="absolute left-0 right-0 pointer-events-none bg-blue-500/5 border-y border-blue-500/10 transition-all duration-75"
                        style={{
                            top: `${(cursorPos.line - 1) * 24 + 12}px`,
                            height: '24px'
                        }}
                    />

                    {/* Syntax Highlighted Background Layer */}
                    <pre
                        ref={preHighlightRef}
                        aria-hidden="true"
                        className={`absolute inset-0 p-3 pt-3 text-slate-100 font-mono leading-6 pointer-events-none overflow-hidden select-none whitespace-pre ${
                            wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
                        }`}
                        style={{ fontSize: `${fontSize}px` }}
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
                        className={`absolute inset-0 p-3 pt-3 bg-transparent text-transparent caret-blue-400 outline-none resize-none leading-6 font-mono selection:bg-blue-600/35 overflow-auto tab-2 ${
                            wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
                        }`}
                        style={{ fontSize: `${fontSize}px` }}
                    />

                    {/* Simulated Live Collaborator Cursors (when team members are editing) */}
                    {collaborators.length > 1 && (
                        <div
                            className="absolute pointer-events-none flex items-center gap-1 transition-all duration-300"
                            style={{
                                top: `${Math.min(cursorPos.line + 2, totalLines) * 24}px`,
                                left: '160px'
                            }}
                        >
                            <span className="w-0.5 h-5 bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-[9px] font-bold text-slate-950 uppercase shadow-md tracking-wider">
                                {typeof collaborators[1] === 'object' ? collaborators[1].email?.split('@')[0] : 'Partner'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Minimap Preview Bar (Right Edge) */}
                <div
                    ref={minimapRef}
                    className="w-16 bg-[#080C14]/90 border-l border-white/5 py-2 px-1 hidden xl:flex flex-col select-none overflow-hidden shrink-0 opacity-40 hover:opacity-100 transition-opacity"
                    title="Code Minimap"
                >
                    <div className="space-y-0.5">
                        {lines.slice(0, 70).map((l, idx) => {
                            const len = Math.min(l.trim().length, 14)
                            return (
                                <div
                                    key={idx}
                                    className={`h-[2px] rounded-full ${
                                        idx + 1 === cursorPos.line
                                            ? 'bg-blue-400 h-[3px]'
                                            : len > 0
                                            ? 'bg-slate-600'
                                            : 'bg-transparent'
                                    }`}
                                    style={{ width: `${Math.max(len * 7, 4)}%` }}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* 5. Monaco-Grade Status Bar */}
            <div className="h-6.5 border-t border-white/5 bg-[#080C14] px-3.5 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0 select-none">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-slate-300">
                        <i className="ri-git-branch-line text-blue-400 text-xs"></i>
                        <span>main</span>
                    </span>
                    <span>UTF-8</span>
                    <span>Spaces: 2</span>
                    <span>
                        Ln {cursorPos.line}, Col {cursorPos.col}
                    </span>
                    <span className="hidden sm:inline">{totalLines} lines • {value?.length || 0} chars</span>
                </div>

                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-semibold">
                        <i className="ri-shield-check-line text-xs"></i>
                        <span>Prettier Ready</span>
                    </span>
                    <span className="h-3 w-[1px] bg-slate-800" />
                    <span className="flex items-center gap-1.5 text-blue-400 font-semibold text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                        <span>{languageInfo.name}</span>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default CodeEditor
