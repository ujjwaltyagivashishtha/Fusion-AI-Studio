const AppearanceTab = ({ theme, setTheme, resolvedTheme }) => {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-mono font-medium text-muted uppercase tracking-wider mb-3">
          Interface Theme
        </h3>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-md border text-left transition cursor-pointer ${
              theme === 'dark'
                ? 'border-accent bg-accent/5 shadow-xs'
                : 'border-default bg-surface hover:border-strong'
            }`}
          >
            <div className="w-7 h-7 rounded border border-default bg-app flex items-center justify-center text-primary mb-2 shadow-xs">
              <i className="ri-moon-line text-sm" />
            </div>
            <p className="text-xs font-medium text-primary">Dark</p>
            <p className="text-[11px] text-muted font-mono mt-0.5">Neutral obsidian</p>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-md border text-left transition cursor-pointer ${
              theme === 'light'
                ? 'border-accent bg-accent/5 shadow-xs'
                : 'border-default bg-surface hover:border-strong'
            }`}
          >
            <div className="w-7 h-7 rounded border border-default bg-app flex items-center justify-center text-amber-500 mb-2 shadow-xs">
              <i className="ri-sun-line text-sm" />
            </div>
            <p className="text-xs font-medium text-primary">Light</p>
            <p className="text-[11px] text-muted font-mono mt-0.5">High-contrast slate</p>
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`p-3 rounded-md border text-left transition cursor-pointer ${
              theme === 'system'
                ? 'border-accent bg-accent/5 shadow-xs'
                : 'border-default bg-surface hover:border-strong'
            }`}
          >
            <div className="w-7 h-7 rounded border border-default bg-app flex items-center justify-center text-secondary mb-2 shadow-xs">
              <i className="ri-computer-line text-sm" />
            </div>
            <p className="text-xs font-medium text-primary">System</p>
            <p className="text-[11px] text-muted font-mono mt-0.5">Sync with OS ({resolvedTheme})</p>
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-default">
        <h3 className="text-xs font-mono font-medium text-muted uppercase tracking-wider mb-2.5">
          Design System & Runtime
        </h3>
        <div className="flex items-center justify-between p-3 rounded-md border border-default bg-app">
          <div>
            <p className="text-xs font-medium text-primary">WebContainers Architecture Design</p>
            <p className="text-[11px] text-muted font-mono mt-0.5">
              High-contrast typography, restrained borders, and developer density
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/10 text-emerald-500 font-medium border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        </div>
      </div>
    </div>
  )
}

export default AppearanceTab
