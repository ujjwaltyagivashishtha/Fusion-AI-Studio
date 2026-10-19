import { TEMPLATE_OPTIONS } from '../../utils/projectUtils'

const HomeTemplateDiscovery = ({ onOpenCreateModal }) => {
  return (
    <section className="mt-12 pt-8 border-t border-default/70">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2">
            <i className="ri-flashlight-line text-indigo-400" />
            <span>Start with a template</span>
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Spin up a live development container with pre-configured runtime environments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {TEMPLATE_OPTIONS.map((tpl) => (
          <div
            key={tpl.id}
            className="group relative flex flex-col justify-between p-4 rounded-xl border border-default bg-surface/80 hover:bg-surface hover:border-indigo-500/40 transition-all duration-200 shadow-xs hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-default/60 flex items-center justify-center text-primary group-hover:text-indigo-400 transition-colors">
                  <i className={`${tpl.icon} text-lg`} />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-elevated text-secondary border border-default/50">
                  {tpl.tag}
                </span>
              </div>
              <h3 className="text-xs font-semibold text-primary group-hover:text-indigo-300 transition-colors">
                {tpl.name}
              </h3>
              <p className="text-[11px] text-secondary mt-1 leading-relaxed line-clamp-2">
                {tpl.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-default/40 flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted flex items-center gap-1">
                <i className={`${tpl.fileIcon} text-xs`} />
                <span>{tpl.file}</span>
              </span>
              <button
                type="button"
                onClick={() => onOpenCreateModal(tpl.id)}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <span>Use template</span>
                <i className="ri-arrow-right-line text-xs group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HomeTemplateDiscovery
