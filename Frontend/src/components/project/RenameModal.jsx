const RenameModal = ({
  isOpen,
  onClose,
  projectNameInput,
  setProjectNameInput,
  onRename
}) => {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rename-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-sm rounded-lg border border-default bg-surface shadow-xl p-5 relative overflow-hidden animate-slideDown">
        <h2 id="rename-modal-title" className="text-sm font-semibold text-primary mb-1">
          Rename Workspace
        </h2>
        <p className="text-xs text-muted mb-4">Update the workspace display name</p>

        <form onSubmit={onRename} className="space-y-4">
          <input
            type="text"
            autoFocus
            required
            value={projectNameInput}
            onChange={(e) => setProjectNameInput(e.target.value)}
            placeholder="Workspace name..."
            className="input w-full px-3 py-2 text-xs font-sans"
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-default">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!projectNameInput.trim()}
              className="btn btn-sm btn-primary text-xs"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RenameModal
