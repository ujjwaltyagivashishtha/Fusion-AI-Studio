const SidebarSearch = ({
  searchInFilesQuery,
  setSearchInFilesQuery,
  searchInFilesResults,
  onSelectFile
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden select-none bg-sidebar text-xs">
      <div className="p-2.5 border-b border-default shrink-0 space-y-2">
        <div className="text-[11px] font-mono text-muted uppercase tracking-wider flex items-center justify-between">
          <span className="font-semibold text-secondary">Search</span>
          {searchInFilesQuery && (
            <span className="text-[10px] text-muted">
              {searchInFilesResults.length} match(es)
            </span>
          )}
        </div>

        <div className="relative">
          <i className="ri-search-line absolute left-2 top-1/2 -translate-y-1/2 text-muted text-[11px]" />
          <input
            type="text"
            value={searchInFilesQuery}
            onChange={(e) => setSearchInFilesQuery(e.target.value)}
            placeholder="Search in files..."
            className="input w-full pl-6 pr-6 py-1 rounded text-xs text-primary placeholder-muted font-mono"
          />
          {searchInFilesQuery && (
            <button
              onClick={() => setSearchInFilesQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-xs"
            >
              <i className="ri-close-line" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-1.5 space-y-1">
        {searchInFilesResults.map((res, idx) => (
          <div
            key={idx}
            onClick={() => onSelectFile(res.file)}
            className="px-2.5 py-1.5 rounded-md hover:bg-surface-hover transition-colors duration-150 cursor-pointer text-xs font-mono"
          >
            <div className="flex items-center justify-between text-primary font-medium mb-0.5">
              <span className="truncate">{res.file}</span>
              <span className="text-[10px] text-cyan font-mono">:{res.lineNum}</span>
            </div>
            <p className="text-[11px] text-muted truncate font-normal">
              {res.content}
            </p>
          </div>
        ))}

        {searchInFilesQuery && searchInFilesResults.length === 0 && (
          <div className="p-4 text-center text-xs text-muted font-mono">
            <p>No matches found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SidebarSearch
