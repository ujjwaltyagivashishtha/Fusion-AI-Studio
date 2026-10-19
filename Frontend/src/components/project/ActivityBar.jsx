const ActivityBar = ({
  activeActivityTab,
  setActiveActivityTab,
  isSidebarOpen,
  setIsSidebarOpen,
  bottomTab,
  setBottomTab,
  onOpenSettings
}) => {
  const handleTabClick = (tab) => {
    if (activeActivityTab === tab && isSidebarOpen) {
      setIsSidebarOpen(false)
    } else {
      setActiveActivityTab(tab)
      setIsSidebarOpen(true)
    }
  }

  return (
    <aside className="w-11 bg-activity-bar border-r border-default flex flex-col items-center justify-between py-2 shrink-0 select-none z-20">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <button
          onClick={() => handleTabClick('explorer')}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition cursor-pointer relative ${
            isSidebarOpen && activeActivityTab === 'explorer'
              ? 'bg-surface-elevated text-primary border border-default'
              : 'text-muted hover:text-primary hover:bg-surface-hover'
          }`}
          title="Explorer (Files)"
        >
          <i className="ri-folder-2-line text-sm" />
          {isSidebarOpen && activeActivityTab === 'explorer' && (
            <span className="absolute -left-1.5 w-0.5 h-4 bg-accent rounded-r" />
          )}
        </button>

        <button
          onClick={() => handleTabClick('search')}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition cursor-pointer relative ${
            isSidebarOpen && activeActivityTab === 'search'
              ? 'bg-surface-elevated text-primary border border-default'
              : 'text-muted hover:text-primary hover:bg-surface-hover'
          }`}
          title="Search in Files"
        >
          <i className="ri-search-line text-sm" />
          {isSidebarOpen && activeActivityTab === 'search' && (
            <span className="absolute -left-1.5 w-0.5 h-4 bg-accent rounded-r" />
          )}
        </button>

        <button
          onClick={() => handleTabClick('git')}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition cursor-pointer relative ${
            isSidebarOpen && activeActivityTab === 'git'
              ? 'bg-surface-elevated text-primary border border-default'
              : 'text-muted hover:text-primary hover:bg-surface-hover'
          }`}
          title="Source Control"
        >
          <i className="ri-git-branch-line text-sm" />
          {isSidebarOpen && activeActivityTab === 'git' && (
            <span className="absolute -left-1.5 w-0.5 h-4 bg-accent rounded-r" />
          )}
        </button>
      </div>

      {/* Bottom Icons */}
      <div className="flex flex-col items-center gap-1.5 w-full">
        <button
          onClick={() => setBottomTab(bottomTab === 'hidden' ? 'terminal' : 'hidden')}
          className={`w-8 h-8 rounded-md flex items-center justify-center transition cursor-pointer ${
            bottomTab !== 'hidden'
              ? 'bg-surface-elevated text-accent border border-default'
              : 'text-muted hover:text-primary hover:bg-surface-hover'
          }`}
          title="Toggle Terminal"
        >
          <i className="ri-terminal-box-line text-sm" />
        </button>

        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-md text-muted hover:text-primary hover:bg-surface-hover flex items-center justify-center transition cursor-pointer"
          title="Settings"
        >
          <i className="ri-settings-3-line text-sm" />
        </button>
      </div>
    </aside>
  )
}

export default ActivityBar
