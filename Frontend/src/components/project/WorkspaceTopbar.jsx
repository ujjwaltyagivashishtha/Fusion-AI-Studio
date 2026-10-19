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
    <header className="h-11 border-b border-default bg-surface px-3 flex items-center justify-between text-xs shrink-0 select-none z-30">
      {/* Left: Nav Back, Title & Git Branch */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onNavigateHome}
          className="w-7 h-7 rounded-md border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          title="Back to Workspaces"
        >
          <i className="ri-arrow-left-line text-xs" />
        </button>

        <div className="h-3.5 w-[1px] bg-border-default" />

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenRenameModal}
            className="flex items-center gap-1.5 font-semibold text-primary hover:text-accent-primary transition cursor-pointer max-w-[200px] truncate"
            title="Click to rename workspace"
          >
            <span>{projectName}</span>
            <i className="ri-pencil-line text-[11px] text-muted" />
          </button>

          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-default bg-surface-elevated text-cyan flex items-center gap-1">
            <i className="ri-git-branch-line text-xs" />
            main
          </span>

          {/* Cloud Save Status Indicator */}
          <button
            onClick={onSave}
            title={saveStatus === 'unsaved' ? 'Click to save (⌘S)' : 'All files synced to cloud'}
            className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1.5 transition cursor-pointer ${
              saveStatus === 'saved'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : saveStatus === 'saving'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {saveStatus === 'saving' ? (
              <>
                <i className="ri-loader-4-line animate-spin text-[10px]" />
                <span>Saving...</span>
              </>
            ) : saveStatus === 'saved' ? (
              <>
                <span className="status-dot status-dot-success" />
                <span>Synced</span>
              </>
            ) : (
              <>
                <span className="status-dot status-dot-error" />
                <span>Unsaved</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Center: Primary Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onRunCode}
          className="btn-primary px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
          title="Run Code Preview (⌘+Enter)"
        >
          <i className="ri-play-fill text-xs" />
          <span>Run</span>
        </button>

        <button
          onClick={onToggleSplitPreview}
          className={`px-2.5 py-1 rounded-md border text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${
            isSplitPreview
              ? 'border-accent bg-surface-elevated text-accent shadow-xs'
              : 'border-default bg-surface text-secondary hover:text-primary hover:border-strong'
          }`}
          title="Toggle Split Preview"
        >
          <i className="ri-layout-column-line text-xs" />
          <span className="hidden sm:inline">Split Preview</span>
        </button>

        <button
          onClick={onOpenInviteModal}
          className="px-2.5 py-1 rounded-md border border-default bg-surface hover:bg-surface-hover text-secondary hover:text-primary text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
          title="Invite collaborators"
        >
          <i className="ri-user-add-line text-xs" />
          <span className="hidden md:inline">Invite</span>
        </button>

        <button
          onClick={onOpenDetailsModal}
          className="p-1.5 rounded-md border border-default hover:bg-surface-hover text-secondary hover:text-primary transition cursor-pointer"
          title="Workspace Info"
        >
          <i className="ri-information-line text-xs" />
        </button>

        <button
          onClick={onExportProject}
          className="p-1.5 rounded-md border border-default hover:bg-surface-hover text-secondary hover:text-primary transition cursor-pointer"
          title="Export Workspace"
        >
          <i className="ri-download-2-line text-xs" />
        </button>
      </div>

      {/* Right: Presence & Settings */}
      <div className="flex items-center gap-2">
        {/* Collaborators */}
        <div className="hidden lg:flex items-center -space-x-1">
          {collaborators.slice(0, 4).map((c, idx) => {
            const email = typeof c === 'object' ? c.email : c
            const isOnline = onlineUsers.some((ou) => (typeof ou === 'object' ? ou.email === email : ou === email))
            return (
              <div
                key={idx}
                className="relative w-5 h-5 rounded-full bg-surface-elevated border border-default text-[9px] font-mono font-bold text-secondary flex items-center justify-center uppercase"
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
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono ${
            socketConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}
          title={socketConnected ? 'Live WebSocket connected' : 'Disconnected from channel'}
        >
          <span className={`status-dot ${socketConnected ? 'status-dot-success' : 'status-dot-error'}`} />
          <span className="hidden sm:inline">{socketConnected ? 'Live' : 'Offline'}</span>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-7 h-7 rounded-md border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer text-xs"
          title="Studio Preferences"
        >
          <i className="ri-settings-3-line" />
        </button>

        <div className="w-6 h-6 rounded-md border border-default bg-surface-elevated text-primary text-[10px] font-bold flex items-center justify-center font-mono shadow-xs">
          {user?.email ? user.email[0].toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  )
}

export default WorkspaceTopbar
