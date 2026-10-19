const EditorMinimap = ({
  minimapRef,
  lines,
  cursorLine,
  resolvedTheme
}) => {
  return (
    <div
      ref={minimapRef}
      className="w-12 bg-sidebar border-l border-default py-2 px-1 hidden md:flex flex-col select-none overflow-hidden shrink-0 opacity-40 hover:opacity-100 transition-opacity"
      title="Code Minimap"
    >
      <div className="space-y-0.5">
        {lines.slice(0, 70).map((l, idx) => {
          const len = Math.min(l.trim().length, 14)
          return (
            <div
              key={idx}
              className={`h-[2px] rounded-full transition-all ${
                idx + 1 === cursorLine
                  ? 'bg-accent-primary h-[3px]'
                  : len > 0
                  ? resolvedTheme === 'dark' ? 'bg-slate-700' : 'bg-slate-300'
                  : 'bg-transparent'
              }`}
              style={{ width: `${Math.max(len * 7, 4)}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}

export default EditorMinimap
