const DeleteProjectModal = ({
  project,
  onClose,
  onConfirm,
  deleting
}) => {
  if (!project) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-xl border border-default bg-surface-elevated p-5 shadow-xl relative overflow-hidden animate-slideDown">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-8 h-8 rounded-md bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 text-sm">
            <i className="ri-delete-bin-line" />
          </div>
          <div>
            <h2 id="delete-modal-title" className="text-sm font-semibold text-primary">
              Delete Workspace
            </h2>
            <p className="text-xs text-secondary mt-1 leading-relaxed">
              Are you sure you want to delete <span className="font-mono text-primary font-semibold">{project.name}</span>? This action cannot be undone and will delete all files and history.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-default">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-3 py-1.5 rounded-md btn-secondary text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-3.5 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-xs font-medium text-white transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {deleting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-xs" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <i className="ri-delete-bin-line text-xs" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteProjectModal
