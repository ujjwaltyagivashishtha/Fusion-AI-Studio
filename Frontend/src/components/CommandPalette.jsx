import { useState, useEffect, useRef } from 'react'

const CommandPalette = ({
    isOpen,
    onClose,
    files,
    activeFile,
    onSelectFile,
    onOpenInviteModal,
    onOpenDetailsModal,
    onRunCode,
    onToggleSplitPreview,
    onTriggerAiPrompt
}) => {
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef(null)

    // Build actions list based on context
    const actions = [
        // Workspace Actions
        {
            id: 'run-code',
            group: 'Execution',
            icon: 'ri-play-fill text-emerald-400',
            label: 'Run Code & Build Preview',
            hint: 'Cmd + Enter',
            action: () => onRunCode()
        },
        {
            id: 'toggle-split',
            group: 'Layout',
            icon: 'ri-layout-column-line text-blue-400',
            label: 'Toggle Split-View Web Preview',
            hint: 'Side-by-side',
            action: () => onToggleSplitPreview()
        },
        {
            id: 'invite-member',
            group: 'Collaboration',
            icon: 'ri-user-add-line text-indigo-400',
            label: 'Add Collaborator / View Users',
            hint: 'Modal',
            action: () => onOpenInviteModal()
        },
        {
            id: 'project-details',
            group: 'Workspace',
            icon: 'ri-information-line text-cyan-400',
            label: 'View Project Details & ID',
            hint: 'Info',
            action: () => onOpenDetailsModal()
        },
        // AI Commands
        {
            id: 'ai-explain',
            group: 'AI Assistant',
            icon: 'ri-sparkles-line text-amber-400',
            label: `Explain ${activeFile}`,
            hint: 'AI Audit',
            action: () => onTriggerAiPrompt(`Explain the structure and logic of ${activeFile}`)
        },
        {
            id: 'ai-refactor',
            group: 'AI Assistant',
            icon: 'ri-flashlight-line text-violet-400',
            label: `Refactor & Optimize ${activeFile}`,
            hint: 'Clean Code',
            action: () => onTriggerAiPrompt(`Refactor ${activeFile} for cleaner performance and readability`)
        },
        {
            id: 'ai-test',
            group: 'AI Assistant',
            icon: 'ri-shield-check-line text-emerald-400',
            label: `Generate Tests for ${activeFile}`,
            hint: 'Testing',
            action: () => onTriggerAiPrompt(`Write unit tests for ${activeFile}`)
        },
        // File Jump Actions
        ...Object.keys(files || {}).map((fileName) => ({
            id: `file-${fileName}`,
            group: 'Files',
            icon: fileName.endsWith('.js')
                ? 'ri-javascript-line text-amber-400'
                : fileName.endsWith('.html')
                ? 'ri-html5-line text-orange-400'
                : fileName.endsWith('.css')
                ? 'ri-css3-line text-blue-400'
                : 'ri-file-code-line text-slate-400',
            label: `Open ${fileName}`,
            hint: fileName === activeFile ? 'Active' : 'File',
            action: () => onSelectFile(fileName)
        }))
    ]

    // Filter actions
    const filteredActions = actions.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.group.toLowerCase().includes(query.toLowerCase())
    )

    // Reset selected index when query changes
    useEffect(() => {
        setSelectedIndex(0)
    }, [query])

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev + 1) % (filteredActions.length || 1))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % (filteredActions.length || 1))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                const target = filteredActions[selectedIndex]
                if (target) {
                    target.action()
                    onClose()
                }
            } else if (e.key === 'Escape') {
                e.preventDefault()
                onClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, selectedIndex, filteredActions, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-fadeIn"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col">
                {/* Search Bar */}
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <i className="ri-search-line text-blue-400 text-lg"></i>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search commands, files, or ask AI..."
                        className="w-full bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                    />
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                        ESC
                    </span>
                </div>

                {/* Results List */}
                <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                    {filteredActions.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-500">
                            No commands or files matching "{query}"
                        </div>
                    ) : (
                        filteredActions.map((item, index) => {
                            const isSelected = index === selectedIndex
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        item.action()
                                        onClose()
                                    }}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`px-3.5 py-2.5 rounded-2xl text-xs flex items-center justify-between transition cursor-pointer ${
                                        isSelected
                                            ? 'bg-blue-600/20 text-white border border-blue-500/40'
                                            : 'text-slate-300 hover:bg-slate-900 border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <i className={`${item.icon} text-base`}></i>
                                        <span className="font-medium truncate">{item.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {item.group}
                                        </span>
                                        {item.hint && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                                                {item.hint}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* Footer Tips */}
                <div className="p-3 border-t border-slate-900 bg-slate-900/40 px-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <div className="flex items-center gap-3">
                        <span>↑↓ to navigate</span>
                        <span>↵ to select</span>
                    </div>
                    <span>Fusion Command Center</span>
                </div>
            </div>
        </div>
    )
}

export default CommandPalette
