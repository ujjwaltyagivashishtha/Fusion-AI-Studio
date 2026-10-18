const HomeControls = ({
  searchQuery,
  setSearchQuery,
  selectedFilterTemplate,
  setSelectedFilterTemplate,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
      {/* Search Input */}
      <div className="relative flex-grow max-w-md">
        <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search workspaces by name or keywords..."
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-default bg-input/70 backdrop-blur-md text-primary placeholder-muted text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-sans shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer text-xs"
          >
            <i className="ri-close-circle-fill" />
          </button>
        )}
      </div>

      {/* Template Filters & Grid/List View Toggle */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center p-1 rounded-xl border border-default bg-surface/70 backdrop-blur-md text-xs">
          <button
            onClick={() => setSelectedFilterTemplate('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedFilterTemplate === 'all'
                ? 'btn-primary text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedFilterTemplate('node-express')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedFilterTemplate === 'node-express'
                ? 'btn-primary text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            Node
          </button>
          <button
            onClick={() => setSelectedFilterTemplate('react-vite')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedFilterTemplate === 'react-vite'
                ? 'btn-primary text-white shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            React
          </button>
        </div>

        <div className="flex items-center p-1 rounded-xl border border-default bg-surface/70 backdrop-blur-md text-muted">
          <button
            onClick={() => setViewMode('grid')}
            aria-label="Grid View"
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              viewMode === 'grid' ? 'bg-surface-hover text-primary shadow-sm' : 'hover:text-primary'
            }`}
          >
            <i className="ri-grid-fill" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label="List View"
            className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
              viewMode === 'list' ? 'bg-surface-hover text-primary shadow-sm' : 'hover:text-primary'
            }`}
          >
            <i className="ri-list-check-2" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeControls
