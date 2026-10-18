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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !deleting) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-red-500/20 glass-panel p-6 shadow-2xl relative overflow-hidden animate-slideDown">
        <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-3.5">
          <i className="ri-delete-bin-line text-xl" />
        </div>
        <h2 id="delete-modal-title" className="text-base font-bold text-primary mb-1.5 font-display">
          Delete Workspace?
        </h2>
        <p className="text-xs text-secondary mb-5 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <strong className="text-primary font-semibold">"{project.name}"</strong>? All workspace code, configurations, and chat records will be permanently removed.
        </p>
        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl border border-default text-xs font-semibold text-secondary hover:bg-surface-hover transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition shadow-md flex items-center gap-2 cursor-pointer"
          >
            {deleting ? (
              <>
                <i className="ri-loader-4-line animate-spin text-sm" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <i className="ri-delete-bin-line text-sm" />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteProjectModal
