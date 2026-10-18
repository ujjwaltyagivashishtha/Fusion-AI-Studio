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
  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Sidebar Header & File Quick Search */}
      <div className="p-3 border-b border-default shrink-0 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <i className="ri-folders-line text-indigo-400" />
            <span>Workspace Files</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCreatingFile(!isCreatingFile)}
              className="p-1 rounded-lg hover:bg-surface-hover text-secondary hover:text-primary transition cursor-pointer"
              title="New File"
            >
              <i className="ri-file-add-line text-sm" />
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative">
          <i className="ri-filter-3-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
          <input
            type="text"
            value={fileFilter}
            onChange={(e) => setFileFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full pl-7 pr-7 py-1 rounded-lg border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 font-mono"
          />
          {fileFilter && (
            <button
              onClick={() => setFileFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-xs"
            >
              <i className="ri-close-line" />
            </button>
          )}
        </div>
      </div>

      {/* Inline File Creation Input */}
      {isCreatingFile && (
        <form onSubmit={onCreateFile} className="p-2 border-b border-default bg-surface/50">
          <div className="flex items-center gap-1.5">
            <i className="ri-file-line text-indigo-400 text-xs ml-1" />
            <input
              type="text"
              autoFocus
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onBlur={() => {
                if (!newFileName.trim()) setIsCreatingFile(false)
              }}
              placeholder="filename.ext"
              className="w-full px-2 py-1 rounded border border-indigo-500/60 bg-input text-xs text-primary outline-none font-mono"
            />
          </div>
        </form>
      )}

      {/* Files Tree List */}
      <div className="flex-grow overflow-y-auto p-1.5 space-y-0.5">
        {filteredFiles.map((file) => {
          const badge = getFileBadge(file)
          const isActive = activeFile === file
          const lineCount = (files[file] || '').split('\n').length

          return (
            <div
              key={file}
              onClick={() => onSelectFile(file)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-mono transition cursor-pointer ${
                isActive
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <i className={`${badge.icon} ${badge.color} text-sm shrink-0`} />
                <span className="truncate">{file}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-muted font-sans font-normal">
                  {lineCount}L
                </span>
                <button
                  onClick={(e) => onDeleteFile(e, file)}
                  className="p-1 rounded text-muted hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                  title={`Delete ${file}`}
                >
                  <i className="ri-delete-bin-line text-xs" />
                </button>
              </div>
            </div>
          )
        })}

        {filteredFiles.length === 0 && (
          <div className="p-4 text-center text-xs text-muted">
            <p>No matching files</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SidebarExplorer
