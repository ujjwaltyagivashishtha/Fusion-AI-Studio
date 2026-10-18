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
    <aside className="w-12 bg-activity-bar border-r border-default flex flex-col items-center justify-between py-3 shrink-0 select-none z-20">
      {/* Top Primary Navigation Icons */}
      <div className="flex flex-col items-center gap-3 w-full">
        <button
          onClick={() => handleTabClick('explorer')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
            isSidebarOpen && activeActivityTab === 'explorer'
              ? 'bg-indigo-500/20 text-indigo-400 shadow-sm border border-indigo-500/30'
              : 'text-muted hover:text-primary hover:bg-surface-hover'
          }`}
          title="Explorer (Files)"
        >
          <i className="ri-folder-3-line text-lg" />
          {isSidebarOpen && activeActivityTab === 'explorer' && (
            <span className="absolute -left-1.5 w-1 h-5 rounded-r bg-indigo-500" />
          )}
        </button>

        <button
          onClick={() => handleTabClick('search')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
            isSidebarOpen && activeActivityTab === 'search'
              ? 'bg-indigo-500/20 text-indigo-400 shadow-sm border border-indigo-500/30'
              : 'text-muted hover:text-primary hover:bg-surface-hover'
          }`}
          title="Search in Files"
        >
          <i className="ri-search-2-line text-lg" />
          {isSidebarOpen && activeActivityTab === 'search' && (
            <span className="absolute -left-1.5 w-1 h-5 rounded-r bg-indigo-500" />
          )}
        </button>

        <button
          onClick={() => handleTabClick('git')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
            isSidebarOpen && activeActivityTab === 'git'
              ? 'bg-indigo-500/20 text-indigo-400 shadow-sm border border-indigo-500/30'
              : 'text-muted hover:text-primary hover:bg-surface-hover'
          }`}
          title="Source Control (Git)"
        >
          <i className="ri-git-branch-line text-lg" />
          {isSidebarOpen && activeActivityTab === 'git' && (
            <span className="absolute -left-1.5 w-1 h-5 rounded-r bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Bottom Utility Icons */}
      <div className="flex flex-col items-center gap-2.5 w-full">
        <button
          onClick={() => setBottomTab(bottomTab === 'hidden' ? 'terminal' : 'hidden')}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
            bottomTab !== 'hidden'
              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
              : 'text-muted hover:text-primary hover:bg-surface-hover'
          }`}
          title="Toggle Bottom Terminal Drawer"
        >
          <i className="ri-terminal-box-line text-lg" />
        </button>

        <button
          onClick={onOpenSettings}
          className="w-9 h-9 rounded-xl text-muted hover:text-primary hover:bg-surface-hover flex items-center justify-center transition cursor-pointer"
          title="Settings"
        >
          <i className="ri-settings-4-line text-lg" />
        </button>
      </div>
    </aside>
  )
}

export default ActivityBar
