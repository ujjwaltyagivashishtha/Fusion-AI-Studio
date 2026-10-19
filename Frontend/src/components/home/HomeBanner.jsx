const HomeBanner = ({ onOpenCreateModal }) => {
  return (
    <section className="mb-8 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary">
            Build something <span className="brand-gradient-text">remarkable.</span>
          </h1>
          <p className="text-sm sm:text-base text-secondary mt-2.5 leading-relaxed">
            Your projects, runtimes, and AI tools — ready when you are.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onOpenCreateModal('node-express')}
          className="btn btn-primary px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <i className="ri-add-line text-base font-bold" />
          <span>New Workspace</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/20 text-white">
            ⌘N
          </kbd>
        </button>
      </div>
    </section>
  )
}

export default HomeBanner
