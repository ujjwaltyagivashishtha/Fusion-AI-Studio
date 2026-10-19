const DetailsModal = ({
  isOpen,
  onClose,
  project,
  filesCount,
  collaboratorsCount
}) => {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-default bg-surface shadow-xl p-5 relative overflow-hidden animate-slideDown">
        <div className="flex items-center justify-between pb-3.5 border-b border-default mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md border border-default bg-app flex items-center justify-center text-accent">
              <i className="ri-information-line text-sm" />
            </div>
            <div>
              <h2 id="details-modal-title" className="text-sm font-semibold text-primary">
                Workspace Metadata
              </h2>
              <p className="text-xs text-muted">Cloud container environment info</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          >
            <i className="ri-close-line text-base" />
          </button>
        </div>

        <div className="space-y-2 py-1 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-md border border-default bg-app font-mono">
            <span className="text-muted">Workspace Name</span>
            <span className="font-semibold text-primary">{project?.name || 'Workspace'}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-md border border-default bg-app font-mono">
            <span className="text-muted">Project ID</span>
            <span className="text-secondary truncate max-w-[200px]">{project?._id || 'local'}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-md border border-default bg-app font-mono">
            <span className="text-muted">Runtime Template</span>
            <span className="text-accent font-semibold">{project?.template || 'NODE'}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-md border border-default bg-app font-mono">
            <span className="text-muted">Indexed Files</span>
            <span className="text-primary font-semibold">{filesCount} files</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-md border border-default bg-app font-mono">
            <span className="text-muted">Collaborator Seats</span>
            <span className="text-primary font-semibold">{collaboratorsCount} members</span>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-default mt-4">
          <button
            onClick={onClose}
            className="btn btn-sm btn-primary px-4 text-xs font-medium cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetailsModal
