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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 glass-panel shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative">
        {/* Subtle ambient back glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="px-6 py-4 border-b border-default flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
              <i className="ri-settings-4-line text-lg" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-base font-bold text-primary tracking-tight">
                Studio Preferences
              </h2>
              <p className="text-xs text-muted">Customize workspace appearance, editor behavior, and AI copilot</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Content Body: Sidebar Tabs + Settings Panel */}
        <div className="flex flex-col sm:flex-row flex-grow overflow-hidden relative z-10">
          {/* Tabs Rail */}
          <div className="w-full sm:w-48 border-b sm:border-b-0 sm:border-r border-default p-2 sm:p-3 flex sm:flex-col gap-1.5 shrink-0 bg-sidebar/80">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'general'
                  ? 'btn-primary text-white shadow-md shadow-indigo-500/20'
                  : 'text-secondary hover:bg-surface-hover hover:text-primary'
              }`}
            >
              <i className="ri-palette-line text-sm" />
              <span>Appearance</span>
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'editor'
                  ? 'btn-primary text-white shadow-md shadow-indigo-500/20'
                  : 'text-secondary hover:bg-surface-hover hover:text-primary'
              }`}
            >
              <i className="ri-code-line text-sm" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'ai'
                  ? 'btn-primary text-white shadow-md shadow-indigo-500/20'
                  : 'text-secondary hover:bg-surface-hover hover:text-primary'
              }`}
            >
              <i className="ri-sparkling-fill text-sm" />
              <span>AI Copilot</span>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition cursor-pointer ${
                activeTab === 'account'
                  ? 'btn-primary text-white shadow-md shadow-indigo-500/20'
                  : 'text-secondary hover:bg-surface-hover hover:text-primary'
              }`}
            >
              <i className="ri-user-line text-sm" />
              <span>Account</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-grow p-6 overflow-y-auto space-y-6">
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
        <div className="px-6 py-3.5 border-t border-default bg-app/80 flex items-center justify-end relative z-10">
          <button
            onClick={onClose}
            className="btn-primary px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
