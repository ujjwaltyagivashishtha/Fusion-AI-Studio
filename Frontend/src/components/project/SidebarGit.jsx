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
    <div className="flex flex-col h-full overflow-hidden select-none p-3 space-y-4">
      <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider">
        <span className="flex items-center gap-1.5">
          <i className="ri-git-branch-line text-indigo-400" />
          <span>Source Control</span>
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full border border-default bg-surface/50 text-secondary font-mono">
          main
        </span>
      </div>

      {/* Commit Input Form */}
      <form onSubmit={handleCommit} className="space-y-2">
        <textarea
          rows={3}
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Message (⌘Enter to commit)..."
          className="w-full p-2.5 rounded-xl border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 font-sans resize-none"
        />
        <button
          type="submit"
          disabled={!commitMessage.trim()}
          className="w-full py-2 rounded-xl btn-primary disabled:opacity-50 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
        >
          <i className="ri-git-commit-line text-sm" />
          <span>Commit & Push</span>
        </button>
      </form>

      {/* Changes Section */}
      <div className="space-y-2 flex-grow overflow-y-auto">
        <div className="flex items-center justify-between text-xs font-semibold text-secondary">
          <span>Changes</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-hover text-muted">
            {modifiedCount}
          </span>
        </div>

        <div className="space-y-1">
          {Object.keys(files).map((f) => (
            <div
              key={f}
              className="flex items-center justify-between px-2 py-1 rounded-lg text-xs font-mono text-secondary hover:bg-surface-hover"
            >
              <span className="truncate">{f}</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase">
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
