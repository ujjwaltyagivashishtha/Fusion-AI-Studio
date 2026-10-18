import ThemeToggle from '../ThemeToggle'

const HomeHeader = ({
  user,
  userMenuOpen,
  setUserMenuOpen,
  onOpenSettings,
  onLogout
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-default bg-surface/75 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
              <i className="ri-cpu-line text-xl" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight font-display text-primary">
                  Fusion <span className="text-gradient-brand">AI Studio</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-semibold text-indigo-400 backdrop-blur-sm">
                  Cloud IDE
                </span>
              </div>
              <p className="text-[11px] text-muted font-medium tracking-wide">Workspaces Dashboard</p>
            </div>
          </div>

          {/* Actions: Theme Toggle, Settings, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <button
              onClick={onOpenSettings}
              aria-label="Open Studio Preferences"
              title="Studio Preferences"
              className="w-9 h-9 rounded-xl border border-default bg-surface/70 hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer shadow-sm"
            >
              <i className="ri-settings-4-line text-sm" />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-label="User profile menu"
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-default bg-surface/70 hover:bg-surface-hover transition cursor-pointer shadow-sm"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-primary">
                    {user?.email ? user.email.split('@')[0] : 'Developer'}
                  </p>
                  <p className="text-[10px] text-muted font-mono truncate max-w-[120px]">
                    {user?.email || 'Logged In'}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user?.email ? user.email[0].toUpperCase() : 'U'}
                </div>
                <i className="ri-arrow-down-s-line text-muted text-xs" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-default glass-panel shadow-2xl p-1.5 z-50 animate-slideDown">
                  <div className="px-3 py-2 border-b border-default mb-1">
                    <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Signed In As</p>
                    <p className="text-xs font-semibold text-primary truncate mt-0.5">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      onOpenSettings()
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-secondary hover:bg-surface-hover hover:text-primary flex items-center gap-2 transition cursor-pointer"
                  >
                    <i className="ri-settings-4-line text-sm text-indigo-400" />
                    <span>Studio Preferences</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false)
                      onLogout()
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition cursor-pointer mt-0.5"
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
