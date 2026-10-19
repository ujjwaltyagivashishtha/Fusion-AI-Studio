import LivePreviewFrame from './LivePreviewFrame'

const BottomDrawer = ({
  bottomTab,
  setBottomTab,
  bottomDrawerHeight,
  isExpanded = false,
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

  const isFullPreview = bottomTab === 'preview' || isExpanded

  return (
    <div
      className={`border-t border-default bg-sidebar flex flex-col relative z-10 select-none ${
        isFullPreview ? 'flex-grow flex-1 h-full min-h-0' : 'shrink-0'
      }`}
      style={isFullPreview ? undefined : { height: `${bottomDrawerHeight}px` }}
    >
      {/* Drawer Tab Header */}
      <div className="h-8 border-b border-default bg-surface px-3 flex items-center justify-between text-xs text-secondary shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setBottomTab('terminal')}
            className={`px-2.5 py-0.5 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              bottomTab === 'terminal'
                ? 'bg-app text-primary font-medium border border-default shadow-xs'
                : 'text-muted hover:text-primary hover:bg-surface-hover'
            }`}
          >
            <i className="ri-terminal-line text-xs" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setBottomTab('preview')}
            className={`px-2.5 py-0.5 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              bottomTab === 'preview'
                ? 'bg-app text-primary font-medium border border-default shadow-xs'
                : 'text-muted hover:text-primary hover:bg-surface-hover'
            }`}
          >
            <i className="ri-window-line text-xs" />
            <span>Live Container</span>
          </button>

          <button
            onClick={() => setBottomTab('console')}
            className={`px-2.5 py-0.5 rounded text-xs font-mono transition cursor-pointer flex items-center gap-1.5 ${
              bottomTab === 'console'
                ? 'bg-app text-primary font-medium border border-default shadow-xs'
                : 'text-muted hover:text-primary hover:bg-surface-hover'
            }`}
          >
            <i className="ri-bug-line text-xs" />
            <span>Console</span>
            {consoleLogs.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {bottomTab === 'console' && (
            <button
              onClick={onClearConsole}
              className="p-1 rounded text-muted hover:text-primary hover:bg-surface-hover text-xs transition cursor-pointer"
              title="Clear Console"
            >
              <i className="ri-forbid-line" />
            </button>
          )}

          <button
            onClick={() => setBottomTab('hidden')}
            className="p-1 rounded text-muted hover:text-primary hover:bg-surface-hover transition cursor-pointer"
            title="Close Drawer"
          >
            <i className="ri-close-line text-xs" />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-grow flex flex-col min-h-0 overflow-hidden relative select-text">
        {/* Terminal Tab */}
        {bottomTab === 'terminal' && (
          <div className="h-full p-3 font-mono text-xs overflow-y-auto bg-terminal text-secondary space-y-1">
            {terminalHistory.map((item, idx) => (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                {item.startsWith('$') ? (
                  <span className="text-cyan font-semibold">{item}</span>
                ) : item.startsWith('[AI') ? (
                  <span className="text-accent">{item}</span>
                ) : item.startsWith('[SOCKET') || item.startsWith('[COLLAB') ? (
                  <span className="text-cyan">{item}</span>
                ) : (
                  <span>{item}</span>
                )}
              </div>
            ))}
            <form onSubmit={onTerminalSubmit} className="flex items-center gap-1.5 pt-1">
              <span className="text-cyan font-bold">$</span>
              <input
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Type command (help, npm start, clear)..."
                className="flex-grow bg-transparent text-primary outline-none font-mono text-xs placeholder-muted"
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
          <div className="h-full p-3 font-mono text-xs overflow-y-auto bg-terminal text-secondary space-y-1">
            {consoleLogs.map((log, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 py-1 border-b border-default/50 font-mono ${
                  log.level === 'error'
                    ? 'text-red-500'
                    : log.level === 'warn'
                    ? 'text-amber-500'
                    : 'text-primary'
                }`}
              >
                <span className="text-[10px] text-muted">{log.time}</span>
                <span className="text-[10px] uppercase font-bold px-1 py-0.2 rounded border border-default bg-surface">
                  {log.level}
                </span>
                <span className="flex-grow whitespace-pre-wrap">{log.message}</span>
              </div>
            ))}
            {consoleLogs.length === 0 && (
              <p className="text-muted text-xs font-mono">No console messages intercepted from container preview.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BottomDrawer
