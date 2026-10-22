import { useNavigate } from 'react-router-dom'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-app text-primary flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6 animate-fadeIn">
        {/* Decorative terminal header */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-default bg-surface text-xs font-mono text-muted">
          <span className="w-2 h-2 rounded-full bg-rose-500/80" />
          <span className="w-2 h-2 rounded-full bg-amber-500/80" />
          <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
          <span className="ml-1">fusion-ai-studio ~ error</span>
        </div>

        {/* 404 display */}
        <div className="relative">
          <div className="text-[120px] sm:text-[160px] font-black leading-none tracking-tighter brand-gradient-text select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 rounded-full bg-accent/5 blur-3xl" />
          </div>
        </div>

        {/* Error code block */}
        <div className="p-4 rounded-lg border border-default bg-surface text-left font-mono text-xs space-y-1">
          <p className="text-muted">$ <span className="text-cyan">curl</span> <span className="text-emerald-400">{window.location.pathname}</span></p>
          <p className="text-rose-400">{'{'} "error": "NOT_FOUND", "status": 404 {'}'}</p>
          <p className="text-muted">$ <span className="w-2 inline-block bg-accent/70 animate-pulse">&nbsp;</span></p>
        </div>

        <div className="space-y-2">
          <h1 className="text-lg font-semibold text-primary">Page not found</h1>
          <p className="text-sm text-secondary leading-relaxed">
            The route you requested doesn't exist in this workspace. It may have been moved, deleted, or you may have mistyped the URL.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="btn-primary px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <i className="ri-home-line" />
            <span>Back to Workspaces</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="btn-secondary px-5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer"
          >
            <i className="ri-arrow-left-line" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
