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
    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-44 rounded-2xl border border-default bg-surface p-5 animate-pulse flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-surface-elevated" />
                  <div className="w-14 h-5 rounded-full bg-surface-elevated" />
                </div>
                <div className="h-5 w-2/3 bg-surface-elevated rounded mt-4" />
                <div className="h-3.5 w-4/5 bg-surface-elevated rounded mt-2" />
              </div>
              <div className="pt-3.5 border-t border-default/60 flex justify-between items-center">
                <div className="h-3 w-20 bg-surface-elevated rounded" />
                <div className="h-3 w-12 bg-surface-elevated rounded" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-16 rounded-lg border border-default bg-surface p-4 animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-5 bg-surface-elevated rounded" />
              <div className="w-40 h-4 bg-surface-elevated rounded" />
            </div>
            <div className="w-20 h-4 bg-surface-elevated rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (filteredProjects.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-surface-elevated border border-default flex items-center justify-center text-muted text-base">
          <i className="ri-folder-line" />
        </div>
        <h3 className="text-sm font-medium text-primary">
          {searchQuery || selectedFilterTemplate !== 'all'
            ? 'No matching workspaces'
            : 'No workspaces yet'}
        </h3>
        <p className="text-xs text-secondary mt-1 max-w-sm mx-auto">
          {searchQuery || selectedFilterTemplate !== 'all'
            ? 'Try adjusting your search keywords or reset the filter.'
            : 'Create your first workspace to start building your next application.'}
        </p>
        {!searchQuery && selectedFilterTemplate === 'all' && (
          <button
            type="button"
            onClick={() => onOpenCreateModal('node-express')}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-accent-contrast text-xs font-medium hover:opacity-90 transition cursor-pointer shadow-xs"
          >
            <i className="ri-add-line text-sm" />
            <span>New workspace</span>
          </button>
        )}
      </div>
    )
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
    <div className="space-y-2">
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
