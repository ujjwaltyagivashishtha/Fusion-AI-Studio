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
    <div className="border-b border-default bg-surface px-4 py-2 flex items-center justify-between gap-3 text-xs z-20 animate-slideDown shadow-sm">
      <div className="flex items-center gap-2 flex-grow max-w-md">
        <div className="relative flex-grow">
          <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Find in current file..."
            className="w-full pl-8 pr-20 py-1.5 rounded-lg border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-blue-500 font-mono"
          />
          {searchQuery && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted font-mono">
              {resultsCount > 0
                ? `${currentIndex + 1} of ${resultsCount}`
                : '0 results'}
            </span>
          )}
        </div>
        <button
          onClick={onPrevSearch}
          disabled={resultsCount === 0}
          className="p-1.5 rounded-lg border border-default bg-surface text-secondary hover:text-primary disabled:opacity-30 cursor-pointer"
          title="Previous match (Shift+Enter)"
        >
          <i className="ri-arrow-up-s-line text-xs" />
        </button>
        <button
          onClick={onNextSearch}
          disabled={resultsCount === 0}
          className="p-1.5 rounded-lg border border-default bg-surface text-secondary hover:text-primary disabled:opacity-30 cursor-pointer"
          title="Next match (Enter)"
        >
          <i className="ri-arrow-down-s-line text-xs" />
        </button>
      </div>
      <button
        onClick={onClose}
        className="text-muted hover:text-primary cursor-pointer p-1"
        title="Close search"
      >
        <i className="ri-close-line text-sm" />
      </button>
    </div>
  )
}

export default EditorSearchBar
