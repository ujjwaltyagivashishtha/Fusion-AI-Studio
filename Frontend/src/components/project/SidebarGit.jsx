import { useState } from 'react'

const SidebarGit = ({ files, saveStatus, onCommitPush }) => {
  const [commitMessage, setCommitMessage] = useState('')

  const handleCommit = (e) => {
    e.preventDefault()
    if (!commitMessage.trim()) return
    onCommitPush(commitMessage.trim())
    setCommitMessage('')
  }

  const modifiedCount = saveStatus === 'unsaved' ? Object.keys(files).length : 0

  return (
    <div className="flex flex-col h-full overflow-hidden select-none p-2.5 space-y-3 bg-sidebar text-xs">
      <div className="flex items-center justify-between text-[11px] font-mono text-muted uppercase tracking-wider">
        <span className="font-semibold text-secondary">Source Control</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded border border-default bg-surface-elevated text-cyan font-mono">
          main
        </span>
      </div>

      {/* Commit Input Form */}
      <form onSubmit={handleCommit} className="space-y-2">
        <textarea
          rows={3}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Commit message (⌘Enter)..."
          className="input w-full p-2 rounded text-xs text-primary placeholder-muted font-sans resize-none"
        />
        <button
          type="submit"
          disabled={!commitMessage.trim()}
          className="w-full py-1.5 rounded btn-primary disabled:opacity-40 text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <i className="ri-git-commit-line text-xs" />
          <span>Commit & Push</span>
        </button>
      </form>

      {/* Changes Section */}
      <div className="space-y-1.5 flex-grow overflow-y-auto">
        <div className="flex items-center justify-between text-xs font-medium text-secondary">
          <span>Staged / Tracked</span>
          <span className="text-[10px] px-1.5 rounded border border-default bg-surface-elevated font-mono text-muted">
            {modifiedCount} modified
          </span>
        </div>

        <div className="space-y-0.5">
          {Object.keys(files).map((f) => (
            <div
              key={f}
              className="flex items-center justify-between px-2 py-1 rounded text-xs font-mono text-secondary hover:bg-surface-hover hover:text-primary transition"
            >
              <span className="truncate">{f}</span>
              <span className={`text-[10px] font-mono font-medium ${saveStatus === 'saved' ? 'text-muted' : 'text-amber-400'}`}>
                {saveStatus === 'saved' ? 'synced' : 'M'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SidebarGit
