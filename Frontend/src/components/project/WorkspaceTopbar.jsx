import ThemeToggle from '../ThemeToggle.jsx'

const WorkspaceTopbar = ({
  projectName,
  onOpenRenameModal,
  saveStatus,
  onSave,
  onRunCode,
  isSplitPreview,
  onToggleSplitPreview,
  onOpenInviteModal,
  onOpenDetailsModal,
  onExportProject,
  onlineUsers,
  collaborators,
  socketConnected,
  onOpenSettings,
  onNavigateHome,
  user
}) => {
  return (
    <header className="h-12 border-b border-default bg-surface/90 backdrop-blur-xl px-3 flex items-center justify-between text-xs shrink-0 select-none z-30">
      {/* Left: Branding & Project Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 hover:opacity-85 transition cursor-pointer"
          title="Back to Workspaces"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/20">
            <i className="ri-arrow-left-line text-sm" />
          </div>
        </button>

        <div className="h-4 w-[1px] bg-border-default" />

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRenameModal}
            className="flex items-center gap-1.5 font-bold text-primary hover:text-indigo-400 transition cursor-pointer max-w-[200px] truncate"
            title="Click to rename workspace"
          >
            <span>{projectName}</span>
            <i className="ri-edit-line text-xs text-muted" />
          </button>

          <span className="text-[10px] px-2 py-0.5 rounded-full border border-default bg-surface/60 text-secondary font-mono flex items-center gap-1">
            <i className="ri-git-branch-line text-indigo-400" />
            main
          </span>

          {/* Cloud Save Status Indicator */}
          <button
            onClick={onSave}
            title={saveStatus === 'unsaved' ? 'Click to save (⌘S)' : 'All changes saved to MongoDB'}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 transition cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                : saveStatus === 'saving'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                : 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <i className="ri-loader-4-line animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <i className="ri-cloud-line" />
                <span>Cloud Sync</span>
              </>
            ) : (
              <>
                <i className="ri-alert-line" />
                <span>Unsaved (⌘S)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Center: Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onRunCode}
          className="btn-primary px-3.5 py-1.5 rounded-xl text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
          title="Execute & Run Web Preview (⌘+Enter)"
        >
          <i className="ri-play-fill text-sm" />
          <span>Run</span>
        </button>

        <button
          onClick={onToggleSplitPreview}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
            isSplitPreview
              ? 'btn-primary text-white shadow-sm'
              : 'border-default bg-surface text-secondary hover:text-primary hover:border-strong'
          }`}
          title="Toggle Split Code & Container Preview"
        >
          <i className="ri-layout-column-line text-sm" />
          <span className="hidden sm:inline">Split Preview</span>
        </button>

        <button
          onClick={onOpenInviteModal}
          className="px-3 py-1.5 rounded-xl border border-default bg-surface hover:bg-surface-hover text-secondary hover:text-primary text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          title="Invite collaborators"
        >
          <i className="ri-user-add-line text-sm text-indigo-400" />
          <span className="hidden md:inline">Invite</span>
        </button>

        <button
          onClick={onOpenDetailsModal}
          className="p-1.5 rounded-xl border border-default bg-surface hover:bg-surface-hover text-secondary hover:text-primary transition cursor-pointer"
          title="Workspace Details"
        >
          <i className="ri-information-line text-sm" />
        </button>

        <button
          onClick={onExportProject}
          className="p-1.5 rounded-xl border border-default bg-surface hover:bg-surface-hover text-secondary hover:text-primary transition cursor-pointer"
          title="Export Workspace Bundle"
        >
          <i className="ri-download-2-line text-sm" />
        </button>
      </div>

      {/* Right: Online Presences & Utilities */}
      <div className="flex items-center gap-2.5">
        {/* Collaborators Avatars */}
        <div className="hidden lg:flex items-center -space-x-1.5">
          {collaborators.slice(0, 4).map((c, idx) => {
            const email = typeof c === 'object' ? c.email : c
            const isOnline = onlineUsers.some((ou) => (typeof ou === 'object' ? ou.email === email : ou === email))
            return (
              <div
                key={idx}
                className={`relative w-6 h-6 rounded-full border border-surface flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm ${
                  isOnline
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500'
                    : 'bg-gradient-to-tr from-indigo-600 to-violet-600'
                }`}
                title={`${email} (${isOnline ? 'Online' : 'Offline'})`}
              >
                {(email || 'U')[0]}
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-surface" />
                )}
              </div>
            )
          })}
        </div>

        {/* Real-time Socket Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono ${
            socketConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}
          title={socketConnected ? 'Live WebSocket channel active' : 'Disconnected from channel'}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="hidden sm:inline">{socketConnected ? 'Live Sync' : 'Offline'}</span>
        </div>

        <ThemeToggle />

        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-xl border border-default bg-surface hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          title="Studio Preferences"
        >
          <i className="ri-settings-4-line text-sm" />
        </button>

        <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          {user?.email ? user.email[0].toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  )
}

export default WorkspaceTopbar
