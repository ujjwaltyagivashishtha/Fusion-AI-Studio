import { getFileBadge } from '../../utils/workspaceConstants'

const EditorTabsBar = ({
  openFiles,
  activeFile,
  onSelectFile,
  onCloseTab,
  onAddNewFile
}) => {
  return (
    <div className="h-8 border-b border-default bg-sidebar flex items-center overflow-x-auto select-none shrink-0 scrollbar-none">
      <div className="flex items-center h-full">
        {openFiles.map((file) => {
          const badge = getFileBadge(file)
          const isActive = activeFile === file

          return (
            <div
              key={file}
              onClick={() => onSelectFile(file)}
              className={`group h-full px-3 border-r border-default flex items-center gap-2 text-xs font-mono transition cursor-pointer relative shrink-0 ${
                isActive
                  ? 'bg-editor text-primary font-medium border-t-2 border-t-accent'
                  : 'bg-sidebar text-muted hover:text-secondary hover:bg-surface-hover'
              }`}
            >
              <i className={`${badge.icon} ${badge.color} text-xs`} />
              <span className="truncate max-w-[130px]">{file}</span>

              <button
                onClick={(e) => onCloseTab(e, file)}
                className="w-3.5 h-3.5 rounded hover:bg-surface-hover text-muted hover:text-primary flex items-center justify-center transition cursor-pointer opacity-40 group-hover:opacity-100 text-[10px]"
                title="Close Tab"
              >
                <i className="ri-close-line" />
              </button>
            </div>
          )
        })}

        <button
          onClick={onAddNewFile}
          className="h-full px-2.5 text-muted hover:text-primary hover:bg-surface-hover transition cursor-pointer flex items-center justify-center border-r border-default"
          title="New File"
        >
          <i className="ri-add-line text-xs" />
        </button>
      </div>
    </div>
  )
}

export default EditorTabsBar
