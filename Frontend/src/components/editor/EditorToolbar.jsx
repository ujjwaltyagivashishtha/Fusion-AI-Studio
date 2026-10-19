const EditorToolbar = ({
  fileName,
  languageInfo,
  isSearchOpen,
  onToggleSearch,
  onFormatCode,
  activeWordWrap,
  onToggleWordWrap,
  showMinimap,
  onToggleMinimap,
  activeFontSize,
  onChangeFontSize,
  onCopy,
  copied
}) => {
  return (
    <div className="h-8 border-b border-default bg-sidebar px-3 flex items-center justify-between text-xs text-secondary shrink-0 select-none">
      {/* Breadcrumb Path */}
      <div className="flex items-center gap-1.5 min-w-0 font-mono">
        <span className="text-[11px] text-muted flex items-center gap-1">
          <i className="ri-folder-2-line text-xs" />
          <span>workspace</span>
          <i className="ri-arrow-right-s-line text-muted text-xs" />
        </span>
        <span className="flex items-center gap-1.5 font-medium text-primary text-xs truncate">
          <i className={`${languageInfo.icon} ${languageInfo.color} text-xs`} />
          <span>{fileName}</span>
        </span>
        <span className="text-[10px] text-muted font-mono ml-1.5 hidden sm:inline px-1.5 py-0.2 rounded border border-default bg-surface-elevated">
          {languageInfo.name}
        </span>
      </div>

      {/* Editor Actions Toolbar */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Search Toggle */}
        <button
          onClick={onToggleSearch}
          className={`p-1 rounded border text-xs transition cursor-pointer ${
            isSearchOpen
              ? 'border-accent bg-surface-elevated text-accent shadow-xs'
              : 'border-default bg-surface text-secondary hover:text-primary hover:border-strong'
          }`}
          title="Find in file (⌘F / Ctrl+F)"
          aria-label="Find in file"
        >
          <i className="ri-search-line text-xs" />
        </button>

        {/* Format Code */}
        <button
          onClick={onFormatCode}
          className="p-1 rounded border border-default bg-surface text-secondary hover:text-primary hover:border-strong text-xs transition cursor-pointer"
          title="Format Code"
          aria-label="Format Code"
        >
          <i className="ri-magic-line text-xs" />
        </button>

        {/* Word Wrap Toggle */}
        <button
          onClick={onToggleWordWrap}
          className={`px-1.5 py-0.5 rounded border text-xs transition cursor-pointer flex items-center gap-1 ${
            activeWordWrap
              ? 'border-accent bg-surface-elevated text-accent shadow-xs font-medium'
              : 'border-default bg-surface text-secondary hover:text-primary hover:border-strong'
          }`}
          title={activeWordWrap ? 'Disable Word Wrap' : 'Enable Word Wrap'}
          aria-label="Toggle Word Wrap"
        >
          <i className="ri-text-wrap text-xs" />
          <span className="text-[11px] hidden sm:inline">Wrap</span>
        </button>

        {/* Code Minimap Toggle */}
        <button
          onClick={onToggleMinimap}
          className={`px-1.5 py-0.5 rounded border text-xs transition cursor-pointer flex items-center gap-1 ${
            showMinimap
              ? 'border-accent bg-surface-elevated text-accent shadow-xs font-medium'
              : 'border-default bg-surface text-secondary hover:text-primary hover:border-strong'
          }`}
          title={showMinimap ? 'Hide Code Minimap' : 'Show Code Minimap'}
          aria-label="Toggle Code Minimap"
        >
          <i className="ri-layout-right-line text-xs" />
          <span className="text-[11px] hidden sm:inline">Map</span>
        </button>

        {/* Font Size Adjusters */}
        <div className="hidden md:flex items-center gap-0.5 border border-default bg-surface rounded p-0.5 text-[10px] font-mono">
          <button
            onClick={() => onChangeFontSize(Math.max(11, activeFontSize - 1))}
            className="px-1 text-muted hover:text-primary cursor-pointer font-bold"
            title="Decrease Font Size"
          >
            -
          </button>
          <span className="text-secondary px-0.5">{activeFontSize}px</span>
          <button
            onClick={() => onChangeFontSize(Math.min(18, activeFontSize + 1))}
            className="px-1 text-muted hover:text-primary cursor-pointer font-bold"
            title="Increase Font Size"
          >
            +
          </button>
        </div>

        {/* Copy Code */}
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-[11px] font-medium text-secondary hover:text-primary transition px-2 py-0.5 rounded border border-default bg-surface hover:border-strong cursor-pointer ml-0.5"
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
