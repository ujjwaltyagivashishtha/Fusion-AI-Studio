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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 glass-panel shadow-2xl p-6 relative overflow-hidden animate-slideDown">
        <div className="flex items-center justify-between pb-4 border-b border-default mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <i className="ri-information-line text-lg" />
            </div>
            <div>
              <h2 id="details-modal-title" className="text-base font-bold text-primary">
                Workspace Metadata
              </h2>
              <p className="text-xs text-muted">Cloud container environment info</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="space-y-3 py-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-default bg-surface/50 font-mono">
            <span className="text-muted">Workspace Name</span>
            <span className="font-bold text-primary">{project?.name || 'Workspace'}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-default bg-surface/50 font-mono">
            <span className="text-muted">Project ID</span>
            <span className="text-secondary truncate max-w-[200px]">{project?._id || 'local'}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-default bg-surface/50 font-mono">
            <span className="text-muted">Starter Template</span>
            <span className="uppercase text-indigo-400 font-bold">{project?.template || 'NODE'}</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-default bg-surface/50 font-mono">
            <span className="text-muted">Indexed Files</span>
            <span className="text-primary font-bold">{filesCount} files</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-default bg-surface/50 font-mono">
            <span className="text-muted">Collaborator Seats</span>
            <span className="text-primary font-bold">{collaboratorsCount} members</span>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-default mt-4">
          <button
            onClick={onClose}
            className="btn-primary px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-md cursor-pointer transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetailsModal
