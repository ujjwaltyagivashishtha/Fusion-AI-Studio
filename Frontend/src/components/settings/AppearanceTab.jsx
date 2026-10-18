const AppearanceTab = ({ theme, setTheme, resolvedTheme }) => {
  return (
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
  )
}

export default AppearanceTab
