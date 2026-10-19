import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { useTheme } from '../context/theme.context'

const CommandPalette = ({
  isOpen,
  onClose,
  files,
  activeFile,
  onSelectFile,
  onOpenInviteModal,
  onOpenDetailsModal,
  onOpenSettingsModal,
  onRunCode,
  onToggleSplitPreview,
  onTriggerAiPrompt
}) => {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const listboxId = useId()
  const { resolvedTheme, toggleTheme } = useTheme()

  // Build comprehensive actions list
  const actions = [
    // Execution Actions
    {
      id: 'run-code',
      group: 'Execution',
      icon: 'ri-play-fill text-emerald-500',
      label: 'Run Code & Build Live Preview',
      hint: '⌘ + Enter',
      action: () => onRunCode?.()
    },
    // Layout Actions
    {
      id: 'toggle-split',
      group: 'Layout',
      icon: 'ri-layout-column-line text-blue-500',
      label: 'Toggle Split-Screen Live Preview',
      hint: 'Side-by-side',
      action: () => onToggleSplitPreview?.()
    },
    // Theme Switcher Action
    {
      id: 'toggle-theme',
      group: 'Preferences',
      icon: resolvedTheme === 'dark' ? 'ri-sun-line text-amber-500' : 'ri-moon-line text-accent',
      label: `Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`,
      hint: 'Theme',
      action: () => toggleTheme()
    },
    // Settings Action
    {
      id: 'open-settings',
      group: 'Preferences',
      icon: 'ri-settings-4-line text-secondary',
      label: 'Open Studio Preferences & Editor Settings',
      hint: 'Settings',
      action: () => onOpenSettingsModal?.()
    },
    // Collaboration
    {
      id: 'invite-member',
      group: 'Collaboration',
      icon: 'ri-user-add-line text-accent',
      label: 'Add Collaborator / View Workspace Users',
      hint: 'Invite',
      action: () => onOpenInviteModal?.()
    },
    {
      id: 'project-details',
      group: 'Workspace',
      icon: 'ri-information-line text-cyan-500',
      label: 'View Project Details & Identifier',
      hint: 'Info',
      action: () => onOpenDetailsModal?.()
    },
    // AI Commands
    {
      id: 'ai-explain',
      group: 'Nexus AI',
      icon: 'ri-sparkles-line text-amber-500',
      label: `Explain Architecture of ${activeFile || 'current file'}`,
      hint: 'Audit',
      action: () => onTriggerAiPrompt?.(`Explain the structure and logic of ${activeFile}`)
    },
    {
      id: 'ai-refactor',
      group: 'Nexus AI',
      icon: 'ri-flashlight-line text-accent',
      label: `Refactor & Clean ${activeFile || 'current file'}`,
      hint: 'Refactor',
      action: () => onTriggerAiPrompt?.(`Refactor ${activeFile} for cleaner performance and readability`)
    },
    {
      id: 'ai-test',
      group: 'Nexus AI',
      icon: 'ri-shield-check-line text-emerald-500',
      label: `Generate Vitest Unit Tests for ${activeFile || 'current file'}`,
      hint: 'Testing',
      action: () => onTriggerAiPrompt?.(`Write unit tests for ${activeFile}`)
    },
    // Files Navigation
    ...Object.keys(files || {}).map((fileName) => ({
      id: `file-${fileName}`,
      group: 'Files',
      icon: fileName.endsWith('.js')
        ? 'ri-javascript-line text-amber-500'
        : fileName.endsWith('.html')
        ? 'ri-html5-line text-orange-500'
        : fileName.endsWith('.css')
        ? 'ri-css3-line text-blue-500'
        : fileName.endsWith('.json')
        ? 'ri-braces-line text-emerald-500'
        : 'ri-file-code-line text-secondary',
      label: `Open ${fileName}`,
      hint: fileName === activeFile ? 'Active' : 'File',
      action: () => onSelectFile?.(fileName)
    }))
  ]

  // Filter actions
  const filteredActions = actions.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.group.toLowerCase().includes(query.toLowerCase())
  )

  // Auto focus input on open
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    setQuery('')
    setSelectedIndex(0)
    onClose()
  }, [onClose])

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
          handleClose()
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredActions, handleClose])

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeItem = listRef.current.children[selectedIndex]
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="w-full max-w-xl rounded-lg border border-default bg-surface shadow-2xl overflow-hidden flex flex-col animate-slideDown">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-default flex items-center gap-2.5 bg-surface">
          <i className="ri-search-line text-accent text-base shrink-0" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Type a command, jump to a file, or prompt AI..."
            className="w-full bg-transparent text-xs text-primary placeholder-muted outline-none font-sans"
          />
          <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-default bg-app text-muted shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div
          id={listboxId}
          ref={listRef}
          role="listbox"
          className="max-h-80 overflow-y-auto p-1.5 space-y-0.5"
        >
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted font-mono">
              No matching commands or files found for "{query}"
            </div>
          ) : (
            filteredActions.map((item, index) => {
              const isSelected = index === selectedIndex
              return (
                <div
                  key={item.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    item.action()
                    handleClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2 rounded-md text-xs flex items-center justify-between transition cursor-pointer select-none ${
                    isSelected
                      ? 'bg-surface-elevated text-primary border border-default border-l-2 border-l-accent shadow-xs'
                      : 'text-secondary hover:bg-surface-hover border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate min-w-0">
                    <i className={`${item.icon} text-sm shrink-0`} />
                    <span className="font-medium truncate text-primary">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] text-muted font-mono">{item.group}</span>
                    {item.hint && (
                      <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-default bg-app text-muted font-mono">
                        {item.hint}
                      </kbd>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="p-2.5 border-t border-default bg-app px-3.5 flex items-center justify-between text-[11px] text-muted font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
          <span className="text-[10px] text-secondary font-mono">Command Center</span>
        </div>
      </div>
    </div>
  )
}

export default CommandPalette
