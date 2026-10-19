const HomeHeader = ({
  user,
  userMenuOpen,
  setUserMenuOpen,
  onOpenSettings,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-default bg-surface/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-14 flex items-center justify-between gap-4">
          {/* Logo & Product Identity */}
          <div className="flex items-center">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs"
                style={{ background: 'var(--accent-gradient)' }}
              >
                <i className="ri-terminal-box-line text-sm" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-primary">
                Fusion AI Studio
              </span>
            </div>

            {/* Active Navigation Indicator */}
            <nav className="hidden sm:flex items-center gap-1 ml-5 pl-5 border-l border-default">
              <span className="px-2.5 py-1 rounded-md text-xs font-medium text-primary bg-surface-elevated border border-default shadow-xs flex items-center gap-1.5">
                <i className="ri-folder-2-line text-xs text-accent" />
                <span>Workspaces</span>
              </span>
            </nav>
          </div>

          {/* Actions: Settings, User Profile */}
          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={onOpenSettings}
              aria-label="Studio Preferences"
              title="Studio Preferences"
              className="w-8 h-8 rounded-lg border border-default hover:bg-surface-hover hover:border-strong text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer text-xs"
            >
              <i className="ri-settings-3-line text-sm" />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-label="User profile menu"
                className="flex items-center gap-2 py-1 px-2.5 rounded-lg border border-default hover:bg-surface-hover hover:border-strong transition cursor-pointer text-xs"
              >
                <div className="w-5 h-5 rounded-full border border-default bg-surface-elevated text-primary flex items-center justify-center text-[10px] font-bold font-mono">
                  {user?.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <span className="text-secondary hover:text-primary hidden md:inline truncate max-w-[140px] text-xs">
                  {user?.email || 'Developer'}
                </span>
                <i className="ri-arrow-down-s-line text-muted text-xs" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-56 rounded-xl border border-default bg-surface-elevated shadow-lg p-1 z-50 animate-slideDown">
                  <div className="px-3 py-2 border-b border-default mb-1">
                    <p className="text-[10px] text-muted font-medium">Signed in as</p>
                    <p className="text-xs font-medium text-primary truncate mt-0.5">{user?.email}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onOpenSettings()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-secondary hover:bg-surface-hover hover:text-primary flex items-center gap-2 transition cursor-pointer"
                  >
                    <i className="ri-settings-3-line text-sm" />
                    <span>Studio Preferences</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition cursor-pointer mt-0.5"
                  >
                    <i className="ri-logout-box-r-line text-sm" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default HomeHeader
