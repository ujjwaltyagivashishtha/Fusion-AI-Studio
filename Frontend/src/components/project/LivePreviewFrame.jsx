import { useState } from 'react'

const LivePreviewFrame = ({
  previewDoc,
  previewKey,
  onRefresh
}) => {
  const [viewport, setViewport] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'
  const [urlInput, setUrlInput] = useState('http://localhost:3000')

  const getViewportWidth = () => {
    if (viewport === 'mobile') return 'max-w-[375px]'
    if (viewport === 'tablet') return 'max-w-[768px]'
    return 'w-full'
  }

  return (
    <div className="w-full h-full flex-grow flex flex-col min-w-0 min-h-0 bg-app overflow-hidden relative">
      {/* Container Browser Bar */}
      <div className="h-9 border-b border-default bg-surface px-3 flex items-center justify-between text-xs text-secondary shrink-0 select-none">
        <div className="flex items-center gap-2 flex-grow max-w-md">
          <div className="flex items-center gap-1.5 text-muted pr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onRefresh()
            }}
            className="flex-grow flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-default bg-app text-[11px] font-mono text-muted"
          >
            <i className="ri-lock-line text-cyan text-xs shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full bg-transparent text-secondary outline-none font-mono text-[11px]"
              aria-label="Preview URL"
            />
          </form>

          <button
            onClick={onRefresh}
            className="p-1 rounded-md hover:bg-surface-hover text-secondary hover:text-primary transition cursor-pointer"
            title="Refresh Preview"
            aria-label="Refresh Preview"
          >
            <i className="ri-refresh-line text-xs" />
          </button>
        </div>

        {/* Viewport switcher */}
        <div className="flex items-center gap-0.5 border border-default bg-app rounded-md p-0.5 text-xs">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-primary'
            }`}
            title="Desktop Viewport (100%)"
          >
            <i className="ri-computer-line text-xs" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'tablet' ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-primary'
            }`}
            title="Tablet Viewport (768px)"
          >
            <i className="ri-tablet-line text-xs" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1 rounded transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-primary'
            }`}
            title="Mobile Viewport (375px)"
          >
            <i className="ri-smartphone-line text-xs" />
          </button>
        </div>
      </div>

      {/* Sandboxed iframe container */}
      <div className="flex-grow flex flex-col items-center justify-start min-h-0 w-full overflow-hidden p-2 sm:p-3 bg-app/80">
        {previewDoc ? (
          <iframe
            key={previewKey}
            title="Live Web Container Preview"
            srcDoc={previewDoc}
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className={`w-full h-full min-h-0 ${getViewportWidth()} bg-white rounded-md shadow-sm border border-default transition-all duration-150 flex-grow`}
          />
        ) : (
          <div className="w-full h-full min-h-[240px] flex flex-col items-center justify-center text-center p-6 bg-surface rounded-md border border-default">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xl mb-3">
              <i className="ri-window-line" />
            </div>
            <h3 className="text-sm font-semibold text-primary mb-1">Live Container Idle</h3>
            <p className="text-xs text-muted max-w-sm mb-4">
              Click &quot;Run&quot; or create an index.html file to start rendering your web application in the cloud container.
            </p>
            <button
              onClick={onRefresh}
              className="btn-primary px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <i className="ri-refresh-line text-xs" />
              <span>Start Preview</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default LivePreviewFrame
