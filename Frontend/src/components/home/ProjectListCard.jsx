import { TEMPLATE_OPTIONS, formatRelativeTime } from '../../utils/projectUtils'

const ProjectListCard = ({ project, onNavigate, onDelete }) => {
  const template =
    TEMPLATE_OPTIONS.find((t) => t.id === project.template) || TEMPLATE_OPTIONS[0]

  return (
    <div
      onClick={() => onNavigate(project)}
      className="group cursor-pointer rounded-2xl glass-card p-4 hover:border-indigo-500/50 hover:shadow-glow transition duration-150 flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${template.badgeColor}`}>
          <i className={template.icon} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-xs sm:text-sm text-primary truncate group-hover:text-indigo-400 transition font-display">
              {project.name}
            </h3>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-default bg-surface/50 text-secondary">
              {project.template || 'NODE'}
            </span>
          </div>
          <p className="text-xs text-muted truncate mt-0.5">
            {project.description || 'Full-stack workspace'} • Updated {formatRelativeTime(project.updatedAt || project.createdAt)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted hidden md:inline">
          {project.users?.length || 1} Collaborators
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(project)
          }}
          className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
          title="Delete Workspace"
          aria-label="Delete Workspace"
        >
          <i className="ri-delete-bin-line text-sm" />
        </button>
        <button className="px-3.5 py-1.5 rounded-xl btn-primary text-xs font-semibold text-white transition flex items-center gap-1 cursor-pointer shadow-sm">
          <span>Launch</span>
          <i className="ri-arrow-right-line text-xs" />
        </button>
      </div>
    </div>
  )
}

export default ProjectListCard
