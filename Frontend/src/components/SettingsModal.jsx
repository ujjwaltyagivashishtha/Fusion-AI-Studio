import { useState, useEffect } from 'react'
import { useTheme } from '../context/theme.context'
import AppearanceTab from './settings/AppearanceTab'
import EditorTab from './settings/EditorTab'
import AiTab from './settings/AiTab'
import AccountTab from './settings/AccountTab'

const SettingsModal = ({
  isOpen,
  onClose,
  editorSettings = { fontSize: 13, tabSize: 2, wordWrap: true, showMinimap: true },
  onUpdateEditorSettings = () => {},
  user = null,
  onLogout = () => {}
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('general') // 'general' | 'editor' | 'ai' | 'account'

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const tabs = [
    { id: 'general', label: 'Appearance', icon: 'ri-palette-line' },
    { id: 'editor', label: 'Editor', icon: 'ri-code-line' },
    { id: 'ai', label: 'Nexus AI', icon: 'ri-sparkling-fill' },
    { id: 'account', label: 'Account', icon: 'ri-user-line' }
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-2xl rounded-xl border border-default bg-surface shadow-lg overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-default flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-default flex items-center justify-center text-secondary text-sm">
              <i className="ri-settings-4-line" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-sm font-semibold text-primary tracking-tight">
                Studio Preferences
              </h2>
              <p className="text-[11px] text-muted">Customize workspace appearance, editor behavior, and Nexus agent</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="w-7 h-7 rounded-lg border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>

        {/* Content Body: Sidebar Tabs + Settings Panel */}
        <div className="flex flex-col sm:flex-row flex-grow overflow-hidden">
          {/* Tabs Rail */}
          <div className="w-full sm:w-44 border-b sm:border-b-0 sm:border-r border-default p-2 flex sm:flex-col gap-1 shrink-0 bg-sidebar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-surface-elevated text-primary border border-default shadow-sm'
                    : 'text-secondary hover:bg-surface-hover hover:text-primary'
                }`}
              >
                <i className={`${tab.icon} text-sm`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-grow p-5 overflow-y-auto space-y-5">
            {activeTab === 'general' && (
              <AppearanceTab theme={theme} setTheme={setTheme} resolvedTheme={resolvedTheme} />
            )}
            {activeTab === 'editor' && (
              <EditorTab editorSettings={editorSettings} onUpdateEditorSettings={onUpdateEditorSettings} />
            )}
            {activeTab === 'ai' && <AiTab />}
            {activeTab === 'account' && (
              <AccountTab user={user} onClose={onClose} onLogout={onLogout} />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-default flex items-center justify-end">
          <button
            onClick={onClose}
            className="btn-primary px-4 py-1.5 rounded-lg text-white text-xs font-medium transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
