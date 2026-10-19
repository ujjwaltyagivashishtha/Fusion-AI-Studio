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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !creating) onClose()
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-default bg-surface-elevated p-6 shadow-xl relative overflow-hidden animate-slideDown">
        <div className="flex items-center justify-between pb-3.5 border-b border-default mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-surface border border-default flex items-center justify-center text-secondary text-sm">
              <i className="ri-folder-add-line" />
            </div>
            <div>
              <h2 id="create-workspace-title" className="text-sm font-semibold text-primary">
                Create Workspace
              </h2>
              <p className="text-xs text-muted">Select an architecture starter to initialize your cloud IDE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={creating}
            aria-label="Close modal"
            className="w-7 h-7 rounded-md border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer text-xs"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="projectName" className="block text-xs font-mono text-secondary mb-1">
              Workspace Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. backend-api"
              autoFocus
              required
              disabled={creating}
              className="input w-full px-3 py-1.5 rounded-md text-primary placeholder-muted text-xs font-mono"
            />
          </div>

          <div>
            <label htmlFor="projectDesc" className="block text-xs font-mono text-secondary mb-1">
              Description <span className="text-muted">(optional)</span>
            </label>
            <input
              id="projectDesc"
              type="text"
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              placeholder="e.g. Microservice handling customer verification"
              disabled={creating}
              className="input w-full px-3 py-1.5 rounded-md text-primary placeholder-muted text-xs font-sans"
            />
          </div>

          {/* Starter Template Selection */}
          <div>
            <label className="block text-xs font-mono text-secondary mb-1.5">
              Architecture Starter
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATE_OPTIONS.map((t) => {
                const isSelected = selectedTemplate === t.id
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-start gap-2.5 ${
                      isSelected
                        ? 'border-accent bg-surface-elevated shadow-xs text-primary'
                        : 'border-default bg-surface hover:border-strong hover:bg-surface-hover'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-md bg-surface-elevated border border-default flex items-center justify-center shrink-0 text-secondary text-sm">
                      <i className={t.icon} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-primary truncate">{t.name}</p>
                      <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{t.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-default">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="px-3 py-1.5 rounded-md btn-secondary text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !projectName.trim()}
              className="px-4 py-1.5 rounded-md btn-primary disabled:opacity-50 text-xs font-medium cursor-pointer flex items-center gap-1.5"
            >
              {creating ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-xs" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <i className="ri-rocket-line text-xs" />
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
