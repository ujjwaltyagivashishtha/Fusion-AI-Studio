const EditorToolbar = ({
  fileName,
  languageInfo,
  isSearchOpen,
  onToggleSearch,
  onFormatCode,
  activeWordWrap,
  onToggleWordWrap,
  activeFontSize,
  onChangeFontSize,
  onCopy,
  copied
}) => {
  return (
    <div className="h-9 border-b border-default bg-sidebar/85 backdrop-blur-md px-3 flex items-center justify-between text-xs text-secondary shrink-0 select-none">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-1.5 min-w-0 font-mono">
        <span className="text-[11px] text-muted flex items-center gap-1">
          <i className="ri-folder-3-line text-indigo-400 text-xs" />
          <span>src</span>
          <i className="ri-arrow-right-s-line text-muted text-xs" />
        </span>
        <span className="flex items-center gap-1.5 font-semibold text-primary text-xs truncate">
          <i className={`${languageInfo.icon} ${languageInfo.color} text-sm`} />
          <span>{fileName}</span>
        </span>
        <span className="text-[10px] text-muted font-mono ml-2 hidden sm:inline px-2 py-0.5 rounded-md border border-default bg-surface/60">
          {languageInfo.name}
        </span>
      </div>

      {/* Editor Actions Toolbar */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Search Toggle Button */}
        <button
          onClick={onToggleSearch}
          className={`p-1.5 rounded-xl border text-xs transition cursor-pointer ${
            isSearchOpen
              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 shadow-sm'
              : 'border-default bg-surface/70 text-secondary hover:text-primary hover:border-strong'
          }`}
          title="Find in file (⌘F / Ctrl+F)"
          aria-label="Find in file"
        >
          <i className="ri-search-line text-xs" />
        </button>

        {/* Format Code */}
        <button
          onClick={onFormatCode}
          className="p-1.5 rounded-xl border border-default bg-surface/70 text-secondary hover:text-primary hover:border-strong text-xs transition cursor-pointer"
          title="Format Code with Prettier"
          aria-label="Format Code"
        >
          <i className="ri-magic-line text-xs" />
        </button>

        {/* Word Wrap Toggle */}
        <button
          onClick={onToggleWordWrap}
          className={`p-1.5 rounded-xl border text-xs transition cursor-pointer ${
            activeWordWrap
              ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-400 shadow-sm'
              : 'border-default bg-surface/70 text-secondary hover:text-primary'
          }`}
          title="Toggle Word Wrap"
          aria-label="Toggle Word Wrap"
        >
          <i className="ri-text-wrap text-xs" />
        </button>

        {/* Font Size Adjusters */}
        <div className="hidden md:flex items-center gap-0.5 border border-default bg-surface/70 rounded-xl p-0.5 text-[10px]">
          <button
            onClick={() => onChangeFontSize(Math.max(11, activeFontSize - 1))}
            className="px-1.5 py-0.5 text-muted hover:text-primary cursor-pointer font-bold"
            title="Decrease Font Size"
          >
            A-
          </button>
          <span className="text-secondary font-mono px-1">{activeFontSize}</span>
          <button
            onClick={() => onChangeFontSize(Math.min(18, activeFontSize + 1))}
            className="px-1.5 py-0.5 text-muted hover:text-primary cursor-pointer font-bold"
            title="Increase Font Size"
          >
            A+
          </button>
        </div>

        {/* Copy Code */}
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-[11px] font-semibold text-secondary hover:text-primary transition px-2.5 py-1 rounded-xl border border-default bg-surface/70 hover:border-strong cursor-pointer shadow-sm ml-1"
          title="Copy code to clipboard"
        >
          <i className={copied ? 'ri-check-line text-emerald-400' : 'ri-file-copy-line text-xs'} />
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  )
}

export default EditorToolbar
