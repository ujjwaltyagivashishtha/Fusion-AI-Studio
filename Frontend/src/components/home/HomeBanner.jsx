const HomeBanner = ({
  user,
  projectsCount,
  totalCollaborators,
  onOpenCreateModal
}) => {
  return (
    <section className="mb-8">
      <div className="rounded-3xl glass-panel p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Ambient radiant highlight orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/15 to-violet-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold text-indigo-400 mb-3.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              WORKSPACE OVERVIEW
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-gradient-cosmic">
              Welcome back,{' '}
              <span className="text-gradient-brand">
                {user?.email ? user.email.split('@')[0] : 'Developer'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-secondary mt-2 max-w-xl leading-relaxed">
              Scaffold, edit, and orchestrate cloud developer projects. Prompt the integrated AI Copilot for architecture advice, test suites, and real-time code generation.
            </p>
          </div>

          {/* Create Project Button */}
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl btn-primary font-semibold text-xs tracking-wide transition shadow-lg shrink-0 cursor-pointer"
          >
            <i className="ri-add-line text-base" />
            <span>Create Workspace</span>
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-default relative z-10">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl glass-card">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
              <i className="ri-folder-code-line text-lg" />
            </div>
            <div>
              <p className="text-[11px] text-muted font-medium">Workspaces</p>
              <p className="text-base font-bold text-primary">{projectsCount}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl glass-card">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 shrink-0">
              <i className="ri-team-line text-lg" />
            </div>
            <div>
              <p className="text-[11px] text-muted font-medium">Collaborators</p>
              <p className="text-base font-bold text-primary">{totalCollaborators}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-3 rounded-2xl glass-card col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
              <i className="ri-sparkling-fill text-lg" />
            </div>
            <div>
              <p className="text-[11px] text-muted font-medium">AI Copilot Engine</p>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online & Ready
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HomeBanner
