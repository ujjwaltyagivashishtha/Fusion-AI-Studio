const EditorDiffBanner = ({ onRejectDiff, onAcceptDiff }) => {
  return (
    <div className="border-b border-accent bg-accent-primary/10 px-3 py-1.5 flex items-center justify-between text-xs text-primary">
      <div className="flex items-center gap-2">
        <i className="ri-git-merge-line text-accent-primary text-xs" />
        <span className="font-medium">Reviewing AI proposed code changes</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onRejectDiff}
          className="px-2.5 py-1 rounded btn-secondary text-[11px] font-medium cursor-pointer transition"
        >
          Discard
        </button>
        <button
          onClick={onAcceptDiff}
          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition shadow-sm"
        >
          <i className="ri-check-line text-xs" />
          <span>Accept & Apply</span>
        </button>
      </div>
    </div>
  )
}

export default EditorDiffBanner
