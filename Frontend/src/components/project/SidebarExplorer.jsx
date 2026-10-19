import { getFileBadge } from '../../utils/workspaceConstants'

const SidebarExplorer = ({
  files,
  filteredFiles,
  activeFile,
  onSelectFile,
  fileFilter,
  setFileFilter,
  isCreatingFile,
  setIsCreatingFile,
  newFileName,
  setNewFileName,
  onCreateFile,
  onDeleteFile
}) => {
  const pendingBadge = newFileName ? getFileBadge(newFileName) : null

  return (
    <div className="flex flex-col h-full overflow-hidden select-none bg-sidebar text-xs">
      {/* Sidebar Header & File Quick Search */}
      <div className="p-2.5 border-b border-default shrink-0 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-mono text-muted uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-secondary">Explorer</span>
            <span className="text-[10px] text-muted font-normal">({Object.keys(files).length})</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCreatingFile(!isCreatingFile)}
              className="p-1 rounded hover:bg-surface-hover text-secondary hover:text-primary transition cursor-pointer"
              title="New File (.js, .ts, .py, .java, .c, .rs, .go, .sql, etc.)"
            >
              <i className="ri-file-add-line text-xs" />
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <i className="ri-search-line absolute left-2 top-1/2 -translate-y-1/2 text-muted text-[11px]" />
          <input
            type="text"
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full pl-6 pr-6 py-1 rounded border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-accent font-mono"
          />
          {fileFilter && (
            <button
              onClick={() => setFileFilter('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-xs"
            >
              <i className="ri-close-line" />
            </button>
          )}
        </div>
      </div>

      {/* Inline File Creation Input */}
      {isCreatingFile && (
        <form onSubmit={onCreateFile} className="p-2 border-b border-default bg-surface-elevated">
          <div className="flex items-center gap-1.5">
            <i className={`${pendingBadge ? pendingBadge.icon : 'ri-file-add-line'} ${pendingBadge ? pendingBadge.color : 'text-accent-primary'} text-xs ml-1`} />
            <input
              type="text"
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={() => {
                if (!newFileName.trim()) setIsCreatingFile(false)
              }}
              placeholder="name.ts / app.py / schema.sql..."
              className="w-full px-2 py-0.5 rounded border border-accent bg-input text-xs text-primary outline-none font-mono"
            />
          </div>
          <div className="mt-1 px-1 flex items-center justify-between text-[10px] text-muted font-mono">
            <span>Press Enter to create</span>
            <span>Esc to cancel</span>
          </div>
        </form>
      )}

      {/* Files Tree List */}
      <div className="flex-grow overflow-y-auto p-1 space-y-0.5">
        {filteredFiles.map((file) => {
          const badge = getFileBadge(file)
          const isActive = activeFile === file
          const lineCount = (files[file] || '').split('\n').length

          return (
            <div
              key={file}
              onClick={() => onSelectFile(file)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-mono transition-colors duration-150 cursor-pointer ${
                isActive
                  ? 'bg-surface-elevated text-primary font-medium border-l-2 border-l-accent'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <i className={`${badge.icon} ${badge.color} text-xs shrink-0`} />
                <span className="truncate">{file}</span>
              </div>

              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-muted font-mono">
                  {lineCount}L
                </span>
                <button
                  onClick={(e) => onDeleteFile(e, file)}
                  className="p-0.5 rounded text-muted hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  title={`Delete ${file}`}
                >
                  <i className="ri-delete-bin-line text-xs" />
                </button>
              </div>
            </div>
          )
        })}

        {filteredFiles.length === 0 && (
          <div className="p-4 text-center text-xs text-muted font-mono">
            <p>No matching files</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SidebarExplorer
