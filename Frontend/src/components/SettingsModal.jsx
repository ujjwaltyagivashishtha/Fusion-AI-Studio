import { useState, useEffect } from 'react'
import { useTheme } from '../context/theme.context'

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
            {/* 1. General Appearance */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">
                    Interface Theme
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        theme === 'dark'
                          ? 'border-indigo-500/80 bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-sm'
                          : 'border-default bg-surface hover:border-strong'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-[#030712] border border-white/10 flex items-center justify-center text-indigo-400 mb-2.5 shadow-sm">
                        <i className="ri-moon-line text-base" />
                      </div>
                      <p className="text-xs font-bold text-primary">Dark</p>
                      <p className="text-[11px] text-muted mt-0.5">Cosmic obsidian</p>
                    </button>

                    <button
                      onClick={() => setTheme('light')}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        theme === 'light'
                          ? 'border-indigo-500/80 bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-sm'
                          : 'border-default bg-surface hover:border-strong'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-amber-500 mb-2.5 shadow-sm">
                        <i className="ri-sun-line text-base" />
                      </div>
                      <p className="text-xs font-bold text-primary">Light</p>
                      <p className="text-[11px] text-muted mt-0.5">Pearlescent slate</p>
                    </button>

                    <button
                      onClick={() => setTheme('system')}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        theme === 'system'
                          ? 'border-indigo-500/80 bg-indigo-500/10 ring-1 ring-indigo-500/40 shadow-sm'
                          : 'border-default bg-surface hover:border-strong'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-surface border border-default flex items-center justify-center text-cyan-400 mb-2.5 shadow-sm">
                        <i className="ri-computer-line text-base" />
                      </div>
                      <p className="text-xs font-bold text-primary">System</p>
                      <p className="text-[11px] text-muted mt-0.5">Sync with OS ({resolvedTheme})</p>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-default">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">
                    Visual Density & Motion
                  </h3>
                  <div className="flex items-center justify-between p-3.5 rounded-2xl border border-default bg-app/60">
                    <div>
                      <p className="text-xs font-semibold text-primary">Cosmic Glassmorphism</p>
                      <p className="text-[11px] text-muted">Ambient radial glow, frosted panels, and micro-dot grid</p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Editor Settings */}
            {activeTab === 'editor' && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <label htmlFor="font-size-slider" className="text-xs font-semibold text-primary block">
                      Editor Font Size
                    </label>
                    <span className="text-[11px] text-muted">Currently {editorSettings.fontSize || 13}px monospace</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateEditorSettings({ ...editorSettings, fontSize: Math.max(11, (editorSettings.fontSize || 13) - 1) })}
                      className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center font-bold text-xs transition cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-mono font-bold text-primary w-6 text-center">
                      {editorSettings.fontSize || 13}
                    </span>
                    <button
                      onClick={() => onUpdateEditorSettings({ ...editorSettings, fontSize: Math.min(18, (editorSettings.fontSize || 13) + 1) })}
                      className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center font-bold text-xs transition cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-default">
                  <div>
                    <p className="text-xs font-semibold text-primary">Word Wrap</p>
                    <p className="text-[11px] text-muted">Wrap long lines to fit the editor viewport width</p>
                  </div>
                  <button
                    onClick={() => onUpdateEditorSettings({ ...editorSettings, wordWrap: !editorSettings.wordWrap })}
                    className={`w-11 h-6 rounded-full transition p-1 cursor-pointer ${
                      editorSettings.wordWrap ? 'btn-primary' : 'bg-surface-hover border border-default'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${editorSettings.wordWrap ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-default">
                  <div>
                    <p className="text-xs font-semibold text-primary">Code Minimap</p>
                    <p className="text-[11px] text-muted">Display structural overview on the right edge of editor</p>
                  </div>
                  <button
                    onClick={() => onUpdateEditorSettings({ ...editorSettings, showMinimap: !editorSettings.showMinimap })}
                    className={`w-11 h-6 rounded-full transition p-1 cursor-pointer ${
                      editorSettings.showMinimap ? 'btn-primary' : 'bg-surface-hover border border-default'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${editorSettings.showMinimap ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-default">
                  <div>
                    <p className="text-xs font-semibold text-primary">Tab Size</p>
                    <p className="text-[11px] text-muted">Indentation width for tab key presses</p>
                  </div>
                  <div className="flex items-center p-1 rounded-xl border border-default bg-app text-xs font-mono">
                    <button
                      onClick={() => onUpdateEditorSettings({ ...editorSettings, tabSize: 2 })}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        (editorSettings.tabSize || 2) === 2 ? 'btn-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      2 spaces
                    </button>
                    <button
                      onClick={() => onUpdateEditorSettings({ ...editorSettings, tabSize: 4 })}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                        editorSettings.tabSize === 4 ? 'btn-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      4 spaces
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. AI Copilot */}
            {activeTab === 'ai' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 glass-card">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                    <i className="ri-cpu-line text-base" />
                    <span>Active Model Engine</span>
                  </div>
                  <p className="text-xs text-primary font-bold">Gemini Flash Multimodal Suite</p>
                  <p className="text-[11px] text-muted mt-1 leading-relaxed">
                    Powered by high-throughput multimodal intelligence with AST-aware code patch extraction.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
                    Assistance Capabilities
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl border border-default glass-card flex items-center gap-2 text-secondary">
                      <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
                      <span>Code Generation</span>
                    </div>
                    <div className="p-3 rounded-xl border border-default glass-card flex items-center gap-2 text-secondary">
                      <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
                      <span>AST Refactoring</span>
                    </div>
                    <div className="p-3 rounded-xl border border-default glass-card flex items-center gap-2 text-secondary">
                      <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
                      <span>Automated Testing</span>
                    </div>
                    <div className="p-3 rounded-xl border border-default glass-card flex items-center gap-2 text-secondary">
                      <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
                      <span>Multi-file Context</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Account */}
            {activeTab === 'account' && (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl border border-default glass-card flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-indigo-500/25">
                    {user?.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-primary truncate">{user?.email || 'Active Developer'}</p>
                    <p className="text-[11px] text-muted font-mono truncate">{user?._id || 'Verified Session'}</p>
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Authentication Active
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-default flex justify-end">
                  <button
                    onClick={() => {
                      onClose()
                      onLogout()
                    }}
                    className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <i className="ri-logout-box-r-line" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
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
