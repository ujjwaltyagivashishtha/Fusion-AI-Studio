import { useState, useRef, useEffect } from 'react'

const CodeEditor = ({ value, onChange, fileName, onCopy }) => {
    const textareaRef = useRef(null)
    const lineNumbersRef = useRef(null)
    const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })
    const [copied, setCopied] = useState(false)

    const lines = (value || '').split('\n')
    const totalLines = lines.length

    // Detect language from file name
    const getLanguage = () => {
        if (!fileName) return 'Plain Text'
        if (fileName.endsWith('.js')) return 'JavaScript (ES6+)'
        if (fileName.endsWith('.html')) return 'HTML5'
        if (fileName.endsWith('.css')) return 'CSS3'
        if (fileName.endsWith('.json')) return 'JSON'
        return 'Text'
    }

    // Sync scroll between textarea and line numbers
    const handleScroll = () => {
        if (textareaRef.current && lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
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

    // Keydown handler for Tab indentation and auto-closing pairs
    const handleKeyDown = (e) => {
        const textarea = textareaRef.current
        if (!textarea) return

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

    useEffect(() => {
        updateCursorPosition()
    }, [value])

    return (
        <div className="flex-grow flex flex-col min-w-0 bg-[#070B12] overflow-hidden select-text relative">
            {/* Top Toolbar */}
            <div className="h-8 border-b border-white/5 bg-slate-950/60 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 font-medium text-slate-300">
                        <i className="ri-code-line text-blue-400"></i>
                        {fileName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                        {getLanguage()}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition px-2 py-0.5 rounded-lg hover:bg-slate-900 cursor-pointer"
                        title="Copy code to clipboard"
                    >
                        <i className={copied ? 'ri-check-line text-emerald-400' : 'ri-file-copy-line'}></i>
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-grow flex relative overflow-hidden font-mono text-xs sm:text-sm">
                {/* Line Numbers Bar */}
                <div
                    ref={lineNumbersRef}
                    className="w-12 bg-slate-950/40 py-4 text-slate-600 text-right pr-3 select-none text-xs font-mono border-r border-white/5 leading-6 overflow-hidden shrink-0"
                >
                    {Array.from({ length: totalLines }).map((_, i) => {
                        const lineNum = i + 1
                        const isCurrentLine = cursorPos.line === lineNum
                        return (
                            <div
                                key={i}
                                className={isCurrentLine ? 'text-blue-400 font-semibold' : ''}
                            >
                                {lineNum}
                            </div>
                        )
                    })}
                </div>

                {/* Textarea */}
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
                    className="flex-grow p-4 bg-transparent text-slate-100 outline-none resize-none leading-6 font-mono text-xs sm:text-sm selection:bg-blue-600/40 overflow-y-auto whitespace-pre tab-4"
                />
            </div>

            {/* Editor Status Bar */}
            <div className="h-7 border-t border-white/5 bg-slate-950 px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0 select-none">
                <div className="flex items-center gap-4">
                    <span>UTF-8</span>
                    <span>Spaces: 2</span>
                    <span>
                        Ln {cursorPos.line}, Col {cursorPos.col}
                    </span>
                    <span className="hidden sm:inline">{totalLines} lines</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Ready</span>
                </div>
            </div>
        </div>
    )
}

export default CodeEditor
