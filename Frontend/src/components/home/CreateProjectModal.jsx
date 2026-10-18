import { TEMPLATE_OPTIONS } from '../../utils/projectUtils'

const CreateProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  projectName,
  setProjectName,
  projectDesc,
  setProjectDesc,
  selectedTemplate,
  setSelectedTemplate,
  creating
}) => {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-workspace-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !creating) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-slideDown border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-default mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
              <i className="ri-folder-add-line text-lg" />
            </div>
            <div>
              <h2 id="create-workspace-title" className="text-base font-bold text-primary font-display">
                Create New Workspace
              </h2>
              <p className="text-xs text-muted">Select an architecture template to initialize your cloud IDE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={creating}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Workspace Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Real-Time Chat API"
              autoFocus
              required
              disabled={creating}
              className="w-full px-4 py-2.5 rounded-xl border border-default bg-input/80 text-primary placeholder-muted text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-sans shadow-inner"
            />
          </div>

          <div>
            <label htmlFor="projectDesc" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Description <span className="text-muted lowercase font-normal">(optional)</span>
            </label>
            <input
              id="projectDesc"
              type="text"
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder="e.g. Microservice handling customer verification"
              disabled={creating}
              className="w-full px-4 py-2.5 rounded-xl border border-default bg-input/80 text-primary placeholder-muted text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-sans shadow-inner"
            />
          </div>

          {/* Starter Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
              Architecture Starter
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TEMPLATE_OPTIONS.map((t) => {
                const isSelected = selectedTemplate === t.id
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/30 shadow-sm'
                        : 'border-default bg-surface/50 hover:border-strong hover:bg-surface-hover'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 text-sm ${t.badgeColor}`}>
                      <i className={t.icon} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-primary truncate">{t.name}</p>
                      <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-default">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2.5 rounded-xl border border-default text-xs font-semibold text-secondary hover:bg-surface-hover transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !projectName.trim()}
              className="px-5 py-2.5 rounded-xl btn-primary disabled:opacity-50 text-xs font-semibold text-white transition shadow-md cursor-pointer flex items-center gap-2"
            >
              {creating ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-sm" />
                  <span>Creating Workspace...</span>
                </>
              ) : (
                <>
                  <i className="ri-rocket-line text-sm" />
                  <span>Launch Workspace</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProjectModal
