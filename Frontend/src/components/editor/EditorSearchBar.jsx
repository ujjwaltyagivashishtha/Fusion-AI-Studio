const EditorSearchBar = ({
  searchQuery,
  onSearchChange,
  resultsCount,
  currentIndex,
  onPrevSearch,
  onNextSearch,
  onClose
}) => {
  return (
    <div className="border-b border-default bg-surface px-3 py-1.5 flex items-center justify-between gap-2 text-xs z-20 animate-slideDown shadow-sm">
      <div className="flex items-center gap-1.5 flex-grow max-w-sm">
        <div className="relative flex-grow">
          <i className="ri-search-line absolute left-2 top-1/2 -translate-y-1/2 text-muted text-xs" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Find in file..."
            className="w-full pl-6 pr-16 py-1 rounded border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-accent font-mono"
          />
          {searchQuery && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono">
              {resultsCount > 0
                ? `${currentIndex + 1}/${resultsCount}`
                : '0'}
            </span>
          )}
        </div>
        <button
          onClick={onPrevSearch}
          disabled={resultsCount === 0}
          className="p-1 rounded border border-default bg-surface text-secondary hover:text-primary disabled:opacity-30 cursor-pointer"
          title="Previous match (Shift+Enter)"
        >
          <i className="ri-arrow-up-s-line text-xs" />
        </button>
        <button
          onClick={onNextSearch}
          disabled={resultsCount === 0}
          className="p-1 rounded border border-default bg-surface text-secondary hover:text-primary disabled:opacity-30 cursor-pointer"
          title="Next match (Enter)"
        >
          <i className="ri-arrow-down-s-line text-xs" />
        </button>
      </div>
      <button
        onClick={onClose}
        className="text-muted hover:text-primary cursor-pointer p-0.5"
        title="Close search"
      >
        <i className="ri-close-line text-xs" />
      </button>
    </div>
  )
}

export default EditorSearchBar
