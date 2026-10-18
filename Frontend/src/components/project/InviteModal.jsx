const InviteModal = ({
  isOpen,
  onClose,
  users,
  collaborators,
  selectedUserId,
  onUserClick,
  userSearchQuery,
  setUserSearchQuery,
  fetchingUsers,
  submittingUsers,
  onAddCollaborators
}) => {
  if (!isOpen) return null

  const filteredUsers = users.filter((u) => {
    const isAlreadyMember = collaborators.some((c) =>
      typeof c === 'object' ? c._id === u._id : c === u.email
    )
    const matches = u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
    return !isAlreadyMember && matches
  })

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submittingUsers) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-3xl border border-white/10 glass-panel shadow-2xl p-6 relative overflow-hidden animate-slideDown">
        <div className="flex items-center justify-between pb-4 border-b border-default mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
              <i className="ri-user-add-line text-lg" />
            </div>
            <div>
              <h2 id="invite-modal-title" className="text-base font-bold text-primary">
                Add Collaborators
              </h2>
              <p className="text-xs text-muted">Grant write access to project workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submittingUsers}
            className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs" />
          <input
            type="text"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            placeholder="Search users by email..."
            className="w-full pl-8 pr-4 py-2 rounded-xl border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-indigo-500"
          />
        </div>

        {/* User list */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 mb-5 pr-1">
          {fetchingUsers && (
            <div className="py-8 text-center text-xs text-indigo-400 flex items-center justify-center gap-2">
              <i className="ri-loader-4-line animate-spin" />
              <span>Loading users...</span>
            </div>
          )}

          {!fetchingUsers && filteredUsers.map((u) => {
            const isSelected = selectedUserId.includes(u._id)
            return (
              <div
                key={u._id}
                onClick={() => onUserClick(u._id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? 'border-indigo-500/80 bg-indigo-500/15 ring-1 ring-indigo-500/40 text-primary'
                    : 'border-default bg-surface/50 hover:bg-surface-hover text-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {u.email[0].toUpperCase()}
                  </div>
                  <span className="text-xs truncate">{u.email}</span>
                </div>
                <i className={isSelected ? 'ri-checkbox-circle-fill text-indigo-400 text-base' : 'ri-checkbox-blank-circle-line text-muted text-base'} />
              </div>
            )
          })}

          {!fetchingUsers && filteredUsers.length === 0 && (
            <p className="py-6 text-center text-xs text-muted">
              {userSearchQuery ? 'No matching users found.' : 'All available users already joined this project.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-default">
          <button
            onClick={onClose}
            disabled={submittingUsers}
            className="px-4 py-2 rounded-xl border border-default text-xs font-semibold text-secondary hover:bg-surface-hover transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onAddCollaborators}
            disabled={submittingUsers || selectedUserId.length === 0}
            className="px-4 py-2 rounded-xl btn-primary disabled:opacity-50 text-xs font-semibold text-white transition flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            {submittingUsers ? (
              <>
                <i className="ri-loader-4-line animate-spin" />
                <span>Adding...</span>
              </>
            ) : (
              <>
                <i className="ri-check-line" />
                <span>Add Selected ({selectedUserId.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InviteModal
