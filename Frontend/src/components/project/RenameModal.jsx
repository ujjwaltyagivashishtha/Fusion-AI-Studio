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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-sm rounded-3xl border border-white/10 glass-panel shadow-2xl p-6 relative overflow-hidden animate-slideDown">
        <h2 id="rename-modal-title" className="text-base font-bold text-primary mb-1">
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
            className="w-full px-3 py-2 rounded-xl border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 font-sans shadow-inner"
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-default text-xs font-semibold text-secondary hover:bg-surface-hover transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!projectNameInput.trim()}
              className="px-5 py-2 rounded-xl btn-primary disabled:opacity-50 text-xs font-semibold text-white transition shadow-md cursor-pointer"
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
