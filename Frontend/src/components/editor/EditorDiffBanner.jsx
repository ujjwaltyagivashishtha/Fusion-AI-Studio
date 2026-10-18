const EditorDiffBanner = ({ onRejectDiff, onAcceptDiff }) => {
  return (
    <div className="border-b border-blue-500/30 bg-blue-500/10 px-4 py-2 flex items-center justify-between text-xs text-primary">
      <div className="flex items-center gap-2">
        <i className="ri-git-merge-line text-blue-500 text-sm" />
        <span className="font-semibold">Reviewing pending AI recommendation</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRejectDiff}
          className="px-2.5 py-1 rounded-lg border border-default bg-surface hover:bg-surface-hover text-secondary text-[11px] font-medium cursor-pointer transition"
        >
          Discard
        </button>
        <button
          onClick={onAcceptDiff}
          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm cursor-pointer transition"
        >
          <i className="ri-check-line" />
          Accept & Apply
        </button>
      </div>
    </div>
  )
}

export default EditorDiffBanner
