const SidebarSearch = ({
  searchInFilesQuery,
  setSearchInFilesQuery,
  searchInFilesResults,
  onSelectFile
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      <div className="p-3 border-b border-default shrink-0 space-y-2">
        <div className="text-xs font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
          <i className="ri-search-2-line text-indigo-400" />
          <span>Search in Workspace</span>
        </div>

        <div className="relative">
          <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
          <input
            type="text"
            value={searchInFilesQuery}
            onChange={(e) => setSearchInFilesQuery(e.target.value)}
            placeholder="Search keywords across files..."
            className="w-full pl-7 pr-7 py-1 rounded-lg border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 font-mono"
          />
          {searchInFilesQuery && (
            <button
              onClick={() => setSearchInFilesQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-xs"
            >
              <i className="ri-close-line" />
            </button>
          )}
        </div>

        {searchInFilesQuery && (
          <p className="text-[10px] text-muted">
            {searchInFilesResults.length} result(s) found
          </p>
        )}
      </div>

      <div className="flex-grow overflow-y-auto p-1.5 space-y-1">
        {searchInFilesResults.map((res, idx) => (
          <div
            key={idx}
            onClick={() => onSelectFile(res.file)}
            className="p-2 rounded-xl border border-default bg-surface/50 hover:bg-surface-hover hover:border-strong transition cursor-pointer text-xs font-mono"
          >
            <div className="flex items-center justify-between text-indigo-400 font-semibold mb-1">
              <span className="truncate">{res.file}</span>
              <span className="text-[10px] text-muted">Ln {res.lineNum}</span>
            </div>
            <p className="text-[11px] text-secondary truncate font-normal">
              {res.content}
            </p>
          </div>
        ))}

        {searchInFilesQuery && searchInFilesResults.length === 0 && (
          <div className="p-4 text-center text-xs text-muted">
            <p>No matches found</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SidebarSearch
