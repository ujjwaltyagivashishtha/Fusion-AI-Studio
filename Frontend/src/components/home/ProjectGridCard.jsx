import { TEMPLATE_OPTIONS, formatRelativeTime } from '../../utils/projectUtils'

const ProjectGridCard = ({ project, onNavigate, onDelete }) => {
  const template =
    TEMPLATE_OPTIONS.find((t) => t.id === project.template) || TEMPLATE_OPTIONS[0]

  return (
    <div
      onClick={() => onNavigate(project)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onNavigate(project)
        }
      }}
      className="group rounded-2xl border border-default bg-surface hover:bg-surface-elevated hover:border-strong p-5 flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div>
        {/* Top Header: Language Icon and Runtime Badge */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-xl bg-surface-elevated border border-default flex items-center justify-center text-primary group-hover:text-accent group-hover:scale-105 transition-all shadow-xs">
            <i className={`${template.icon} text-xl`} />
          </div>

          <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-surface-elevated text-secondary border border-default/70 font-medium">
            {template.tag}
          </span>
        </div>

        {/* Workspace Name & Description */}
        <div className="mt-4">
          <h2 className="text-base font-semibold text-primary group-hover:text-accent transition-colors truncate">
            {project.name}
          </h2>
          <p className="text-xs text-secondary mt-1.5 line-clamp-2 leading-relaxed min-h-[36px]">
            {project.description || template.desc}
          </p>
        </div>
      </div>

      {/* Card Footer: Last-modified info, Delete, and Open */}
      <div className="mt-5 pt-3.5 border-t border-default/60 flex items-center justify-between text-xs">
        <span className="text-muted text-[11px] flex items-center gap-1.5">
          <i className="ri-time-line text-xs" />
          <span>{formatRelativeTime(project.updatedAt || project.createdAt)}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(project)
            }}
            title={`Delete ${project.name}`}
            aria-label={`Delete ${project.name}`}
            className="w-7 h-7 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all flex items-center justify-center cursor-pointer text-xs"
          >
            <i className="ri-delete-bin-line" />
          </button>
          <span className="inline-flex items-center gap-1 font-medium text-accent hover:underline text-xs pl-1">
            <span>Open</span>
            <i className="ri-arrow-right-line text-xs group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProjectGridCard
