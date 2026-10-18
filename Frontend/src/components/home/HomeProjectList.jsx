import ProjectGridCard from './ProjectGridCard'
import ProjectListCard from './ProjectListCard'

const HomeProjectList = ({
  loading,
  filteredProjects,
  viewMode,
  searchQuery,
  selectedFilterTemplate,
  onOpenCreateModal,
  onNavigate,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-48 rounded-2xl glass-card p-5 animate-pulse flex flex-col justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-hover" />
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-surface-hover rounded w-3/4" />
                <div className="h-3 bg-surface-hover rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-surface-hover rounded w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-default glass-panel py-16 px-6 text-center shadow-lg">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
          <i className="ri-folder-add-line text-2xl" />
        </div>
        <h2 className="text-base font-bold text-primary font-display">
          {searchQuery || selectedFilterTemplate !== 'all'
            ? 'No matching workspaces found'
            : 'No workspaces created yet'}
        </h2>
        <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
          {searchQuery || selectedFilterTemplate !== 'all'
            ? 'Try adjusting your search keywords or resetting the template filter.'
            : 'Launch your first AI-assisted project workspace to begin writing, editing, and running code.'}
        </p>
        {!searchQuery && selectedFilterTemplate === 'all' && (
          <button
            onClick={onOpenCreateModal}
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl btn-primary text-xs font-semibold text-white shadow-md transition cursor-pointer"
          >
            <i className="ri-add-line text-sm" />
            <span>Create First Workspace</span>
          </button>
        )}
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProjects.map((project) => (
          <ProjectGridCard
            key={project._id}
            project={project}
            onNavigate={onNavigate}
            onDelete={onDelete}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {filteredProjects.map((project) => (
        <ProjectListCard
          key={project._id}
          project={project}
          onNavigate={onNavigate}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}

export default HomeProjectList
