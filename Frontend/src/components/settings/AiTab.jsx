const AiTab = () => {
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl border border-indigo-500/25 bg-indigo-500/10 glass-card">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
          <i className="ri-cpu-line text-base" />
          <span>Active Model Engine</span>
        </div>
        <p className="text-xs text-primary font-bold">Gemini Flash Multimodal Suite</p>
        <p className="text-[11px] text-muted mt-1 leading-relaxed">
          Powered by high-throughput multimodal intelligence with AST-aware code patch extraction.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-muted uppercase tracking-wider">
          Assistance Capabilities
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-3 rounded-xl border border-default glass-card flex items-center gap-2 text-secondary">
            <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
            <span>Code Generation</span>
          </div>
          <div className="p-3 rounded-xl border border-default glass-card flex items-center gap-2 text-secondary">
            <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
            <span>AST Refactoring</span>
          </div>
          <div className="p-3 rounded-xl border border-default glass-card flex items-center gap-2 text-secondary">
            <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
            <span>Automated Testing</span>
          </div>
          <div className="p-3 rounded-xl border border-default glass-card flex items-center gap-2 text-secondary">
            <i className="ri-checkbox-circle-fill text-emerald-400 text-sm" />
            <span>Multi-file Context</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AiTab
