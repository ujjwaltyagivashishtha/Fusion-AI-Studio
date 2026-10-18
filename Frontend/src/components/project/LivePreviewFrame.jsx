import { useState } from 'react'

const LivePreviewFrame = ({
  previewDoc,
  previewKey,
  onRefresh
}) => {
  const [viewport, setViewport] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'

  const getViewportWidth = () => {
    if (viewport === 'mobile') return 'max-w-[375px]'
    if (viewport === 'tablet') return 'max-w-[768px]'
    return 'w-full'
  }

  return (
    <div className="flex-grow flex flex-col min-w-0 bg-app overflow-hidden relative">
      {/* Container Browser Bar */}
      <div className="h-9 border-b border-default bg-sidebar/90 backdrop-blur-md px-3 flex items-center justify-between text-xs text-secondary shrink-0 select-none">
        <div className="flex items-center gap-2 flex-grow max-w-md">
          <div className="flex items-center gap-1 text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex-grow flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-default bg-surface/70 text-[11px] font-mono text-muted">
            <i className="ri-lock-line text-emerald-400 text-xs" />
            <span className="truncate">http://cloud-sandbox:3000</span>
          </div>

          <button
            onClick={onRefresh}
            className="p-1 rounded-lg hover:bg-surface-hover text-secondary hover:text-primary transition cursor-pointer"
            title="Refresh Preview"
          >
            <i className="ri-refresh-line text-xs" />
          </button>
        </div>

        {/* Viewport switcher */}
        <div className="flex items-center gap-1 border border-default bg-surface/70 rounded-xl p-0.5 text-xs">
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1 rounded-lg transition cursor-pointer ${
              viewport === 'desktop' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-muted hover:text-primary'
            }`}
            title="Desktop Viewport"
          >
            <i className="ri-computer-line text-xs" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1 rounded-lg transition cursor-pointer ${
              viewport === 'tablet' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-muted hover:text-primary'
            }`}
            title="Tablet Viewport (768px)"
          >
            <i className="ri-tablet-line text-xs" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1 rounded-lg transition cursor-pointer ${
              viewport === 'mobile' ? 'bg-indigo-500/20 text-indigo-400 shadow-sm' : 'text-muted hover:text-primary'
            }`}
            title="Mobile Viewport (375px)"
          >
            <i className="ri-smartphone-line text-xs" />
          </button>
        </div>
      </div>

      {/* Sandboxed iframe */}
      <div className="flex-grow flex items-center justify-center p-2 bg-[#0a0f1d] overflow-auto">
        <iframe
          key={previewKey}
          title="Live Web Container Preview"
          srcDoc={previewDoc}
          sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
          className={`h-full ${getViewportWidth()} bg-white rounded-xl shadow-2xl border border-white/10 transition-all duration-200`}
        />
      </div>
    </div>
  )
}

export default LivePreviewFrame
