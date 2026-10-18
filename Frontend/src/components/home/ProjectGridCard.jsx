import { TEMPLATE_OPTIONS, formatRelativeTime } from '../../utils/projectUtils'

const ProjectGridCard = ({ project, onNavigate, onDelete }) => {
  const template =
    TEMPLATE_OPTIONS.find((t) => t.id === project.template) || TEMPLATE_OPTIONS[0]

  return (
    <div
      onClick={() => onNavigate(project)}
      className="group relative cursor-pointer rounded-2xl glass-card p-5.5 hover:border-indigo-500/50 hover:shadow-glow transition duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3.5">
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shadow-sm ${template.badgeColor}`}>
            <i className={template.icon} />
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(project)
              }}
              title="Delete Workspace"
              aria-label={`Delete ${project.name}`}
              className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
            >
              <i className="ri-delete-bin-line text-sm" />
            </button>
            <span className="p-1.5 rounded-lg text-muted group-hover:text-indigo-400 transition">
              <i className="ri-arrow-right-up-line text-sm" />
            </span>
          </div>
        </div>

        {/* Template Badge & Date */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border border-default bg-surface/50 text-secondary">
            {project.template || 'NODE'}
          </span>
          <span className="text-[11px] text-muted font-mono">
            {formatRelativeTime(project.updatedAt || project.createdAt)}
          </span>
        </div>

        {/* Title & Description */}
        <h3 className="font-bold text-sm text-primary truncate group-hover:text-indigo-400 transition font-display">
          {project.name}
        </h3>
        <p className="text-xs text-secondary mt-1.5 line-clamp-2 leading-relaxed">
          {project.description || 'Full-stack AI workspace environment'}
        </p>
      </div>

      {/* Card Footer: Users & Launch CTA */}
      <div className="mt-5 pt-3.5 border-t border-default flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5 overflow-hidden">
            {(project.users || []).slice(0, 3).map((u, idx) => (
              <div
                key={idx}
                className="inline-block h-5 w-5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 border border-surface text-[9px] font-bold text-white flex items-center justify-center uppercase shadow-sm"
                title={typeof u === 'string' ? u : u.email}
              >
                {(typeof u === 'string' ? u : u.email || 'U')[0]}
              </div>
            ))}
          </div>
          <span className="text-[11px] font-medium text-muted">
            {project.users?.length || 1} {project.users?.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all flex items-center gap-1">
          Open Studio <i className="ri-arrow-right-line text-xs" />
        </span>
      </div>
    </div>
  )
}

export default ProjectGridCard
