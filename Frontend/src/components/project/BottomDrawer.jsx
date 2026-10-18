import LivePreviewFrame from './LivePreviewFrame'

const BottomDrawer = ({
  bottomTab,
  setBottomTab,
  bottomDrawerHeight,
  terminalHistory,
  terminalInput,
  setTerminalInput,
  onTerminalSubmit,
  terminalEndRef,
  consoleLogs,
  onClearConsole,
  previewDoc,
  previewKey,
  onRefreshPreview
}) => {
  if (bottomTab === 'hidden') return null

  return (
    <div
      className="border-t border-default bg-sidebar flex flex-col shrink-0 relative z-10"
      style={{ height: `${bottomDrawerHeight}px` }}
    >
      {/* Drawer Tab Header */}
      <div className="h-8 border-b border-default bg-surface/75 px-3 flex items-center justify-between text-xs text-secondary shrink-0 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBottomTab('terminal')}
            className={`px-2.5 py-1 rounded-lg font-mono text-xs transition cursor-pointer flex items-center gap-1.5 ${
              bottomTab === 'terminal'
                ? 'bg-indigo-500/20 text-indigo-400 font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            <i className="ri-terminal-line text-xs" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setBottomTab('preview')}
            className={`px-2.5 py-1 rounded-lg font-mono text-xs transition cursor-pointer flex items-center gap-1.5 ${
              bottomTab === 'preview'
                ? 'bg-indigo-500/20 text-indigo-400 font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            <i className="ri-window-line text-xs" />
            <span>Live Container</span>
          </button>

          <button
            onClick={() => setBottomTab('console')}
            className={`px-2.5 py-1 rounded-lg font-mono text-xs transition cursor-pointer flex items-center gap-1.5 ${
              bottomTab === 'console'
                ? 'bg-indigo-500/20 text-indigo-400 font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            <i className="ri-bug-line text-xs" />
            <span>Console</span>
            {consoleLogs.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {bottomTab === 'console' && (
            <button
              onClick={onClearConsole}
              className="p-1 rounded text-muted hover:text-primary text-xs"
              title="Clear Console"
            >
              <i className="ri-forbid-line" />
            </button>
          )}

          <button
            onClick={() => setBottomTab('hidden')}
            className="p-1 rounded text-muted hover:text-primary transition cursor-pointer"
            title="Close Drawer"
          >
            <i className="ri-close-line text-sm" />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-grow overflow-hidden relative">
        {/* Terminal Tab */}
        {bottomTab === 'terminal' && (
          <div className="h-full p-3 font-mono text-xs overflow-y-auto bg-black/60 text-secondary space-y-1">
            {terminalHistory.map((item, idx) => (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                {item.startsWith('$') ? (
                  <span className="text-emerald-400 font-bold">{item}</span>
                ) : item.startsWith('[AI') ? (
                  <span className="text-indigo-400">{item}</span>
                ) : item.startsWith('[SOCKET') || item.startsWith('[COLLAB') ? (
                  <span className="text-cyan-400">{item}</span>
                ) : (
                  <span>{item}</span>
                )}
              </div>
            ))}
            <form onSubmit={onTerminalSubmit} className="flex items-center gap-1 pt-1">
              <span className="text-emerald-400 font-bold">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="type command (help, npm start, clear)..."
                className="flex-grow bg-transparent text-primary outline-none font-mono text-xs"
              />
            </form>
            <div ref={terminalEndRef} />
          </div>
        )}

        {/* Live Container Tab */}
        {bottomTab === 'preview' && (
          <LivePreviewFrame
            previewDoc={previewDoc}
            previewKey={previewKey}
            onRefresh={onRefreshPreview}
          />
        )}

        {/* Console Tab */}
        {bottomTab === 'console' && (
          <div className="h-full p-3 font-mono text-xs overflow-y-auto bg-black/50 text-secondary space-y-1">
            {consoleLogs.map((log, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 py-0.5 border-b border-white/5 ${
                  log.level === 'error'
                    ? 'text-red-400'
                    : log.level === 'warn'
                    ? 'text-amber-400'
                    : 'text-primary'
                }`}
              >
                <span className="text-[10px] text-muted">{log.time}</span>
                <span className="text-[10px] uppercase font-bold px-1 rounded bg-surface/80">
                  {log.level}
                </span>
                <span className="flex-grow whitespace-pre-wrap">{log.message}</span>
              </div>
            ))}
            {consoleLogs.length === 0 && (
              <p className="text-muted text-xs">No console messages intercepted from container preview.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BottomDrawer
