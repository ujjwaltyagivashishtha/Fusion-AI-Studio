import { TEMPLATE_OPTIONS, formatRelativeTime } from '../../utils/projectUtils'

const ProjectListCard = ({ project, onNavigate, onDelete }) => {
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
      className="group px-4 py-3.5 rounded-xl border border-default bg-surface hover:bg-surface-elevated hover:border-strong transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-surface-elevated border border-default flex items-center justify-center text-sm text-secondary shrink-0 group-hover:scale-105 transition-transform">
          <i className={template.icon} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-primary group-hover:text-accent transition-colors truncate">
              {project.name}
            </h2>
            <span className="text-[10px] font-mono uppercase px-2 py-0.2 rounded border border-default bg-surface-elevated text-secondary shrink-0">
              {template.tag}
            </span>
          </div>
          <p className="text-xs text-secondary truncate mt-0.5">
            {project.description || template.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-default/50 text-xs">
        <span className="text-muted text-[11px]">
          {formatRelativeTime(project.updatedAt || project.createdAt)}
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
          <span className="inline-flex items-center gap-1 font-medium text-accent hover:underline pl-1 text-xs">
            <span>Open</span>
            <i className="ri-arrow-right-line text-xs group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProjectListCard
