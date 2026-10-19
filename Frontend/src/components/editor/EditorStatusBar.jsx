const EditorStatusBar = ({
  tabSize,
  cursorPos,
  totalLines,
  charCount,
  languageName
}) => {
  return (
    <div className="h-6 border-t border-default bg-sidebar px-3 flex items-center justify-between text-[11px] text-muted font-mono shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-cyan">
          <i className="ri-git-branch-line text-xs" />
          <span>main</span>
        </span>
        <span>UTF-8</span>
        <span>Spaces: {tabSize}</span>
        <span className="text-secondary">
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>
        <span className="hidden sm:inline">{totalLines} lines • {charCount} chars</span>
      </div>

      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-secondary">
          <span className="status-dot status-dot-success" />
          <span className="text-cyan">{languageName}</span>
        </span>
      </div>
    </div>
  )
}

export default EditorStatusBar
