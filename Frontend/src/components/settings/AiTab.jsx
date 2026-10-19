const AiTab = () => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-md border border-default bg-app">
        <div className="flex items-center gap-2 text-accent text-xs font-mono font-medium mb-1">
          <i className="ri-cpu-line text-sm" />
          <span>Active Model Engine</span>
        </div>
        <p className="text-xs text-primary font-medium">Gemini Flash Multimodal Suite</p>
        <p className="text-[11px] text-muted font-mono mt-1 leading-relaxed">
          Powered by high-throughput multimodal intelligence with AST-aware code patch extraction.
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-mono font-medium text-muted uppercase tracking-wider">
          Assistance Capabilities
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-md border border-default bg-surface flex items-center gap-2 text-secondary font-mono">
            <i className="ri-check-line text-emerald-500 text-sm" />
            <span>Code Generation</span>
          </div>
          <div className="p-2.5 rounded-md border border-default bg-surface flex items-center gap-2 text-secondary font-mono">
            <i className="ri-check-line text-emerald-500 text-sm" />
            <span>AST Refactoring</span>
          </div>
          <div className="p-2.5 rounded-md border border-default bg-surface flex items-center gap-2 text-secondary font-mono">
            <i className="ri-check-line text-emerald-500 text-sm" />
            <span>Automated Tests</span>
          </div>
          <div className="p-2.5 rounded-md border border-default bg-surface flex items-center gap-2 text-secondary font-mono">
            <i className="ri-check-line text-emerald-500 text-sm" />
            <span>Multi-file Context</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiTab
