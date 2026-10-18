const EditorStatusBar = ({
  tabSize,
  cursorPos,
  totalLines,
  charCount,
  languageName
}) => {
  return (
    <div className="h-6.5 border-t border-default bg-sidebar/90 backdrop-blur-md px-3 flex items-center justify-between text-[11px] text-muted font-mono shrink-0 select-none">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1 text-secondary font-medium">
          <i className="ri-git-branch-line text-indigo-400 text-xs" />
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
        <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
          <i className="ri-shield-check-line text-xs" />
          <span>Prettier Ready</span>
        </span>
        <span className="h-3 w-[1px] bg-border-default" />
        <span className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span>{languageName}</span>
        </span>
      </div>
    </div>
  )
}

export default EditorStatusBar
