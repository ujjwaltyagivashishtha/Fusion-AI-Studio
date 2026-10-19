import { useRef, useEffect } from 'react'

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'node-express', label: 'Node.js' },
  { id: 'react-vite', label: 'React' },
  { id: 'python-flask', label: 'Python' }
]

const HomeControls = ({
  searchQuery,
  setSearchQuery,
  selectedFilterTemplate,
  setSelectedFilterTemplate,
  viewMode,
  setViewMode
}) => {
  const searchInputRef = useRef(null)

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Focus search input when user presses / (outside inputs) or Cmd+K
      if ((e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
          ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-grow max-w-md">
        <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs pointer-events-none" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search workspaces by name or description..."
          className="w-full pl-9 pr-14 py-2 rounded-xl border border-default bg-surface hover:border-strong focus:border-accent text-primary placeholder-muted text-xs font-sans transition outline-none shadow-xs"
        />
        {searchQuery ? (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer text-xs"
          >
            <i className="ri-close-line" />
          </button>
        ) : (
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface-elevated border border-default text-muted pointer-events-none">
            /
          </kbd>
        )}
      </div>

      {/* Filter Tabs & View Toggle */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <div className="flex items-center p-0.5 rounded-lg border border-default bg-surface shadow-xs">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = selectedFilterTemplate === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedFilterTemplate(opt.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                  isActive
                    ? 'bg-surface-elevated text-primary font-semibold shadow-xs border border-default'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center p-0.5 rounded-lg border border-default bg-surface shadow-xs text-muted">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            aria-label="Grid View"
            title="Grid View"
            className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-surface-elevated text-primary shadow-xs border border-default'
                : 'hover:text-primary'
            }`}
          >
            <i className="ri-grid-line" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            aria-label="List View"
            title="List View"
            className={`p-1.5 rounded-md text-xs transition cursor-pointer ${
              viewMode === 'list'
                ? 'bg-surface-elevated text-primary shadow-xs border border-default'
                : 'hover:text-primary'
            }`}
          >
            <i className="ri-list-check" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeControls
