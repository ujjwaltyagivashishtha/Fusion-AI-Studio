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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !submittingUsers) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-default bg-surface shadow-xl p-5 relative overflow-hidden animate-slideDown">
        <div className="flex items-center justify-between pb-3.5 border-b border-default mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md border border-default bg-app flex items-center justify-center text-accent">
              <i className="ri-user-add-line text-sm" />
            </div>
            <div>
              <h2 id="invite-modal-title" className="text-sm font-semibold text-primary">
                Add Collaborators
              </h2>
              <p className="text-xs text-muted">Grant workspace access to teammates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submittingUsers}
            className="w-7 h-7 rounded-md border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
          >
            <i className="ri-close-line text-base" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3.5">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs" />
          <input
            type="text"
            value={userSearchQuery}
            onChange={(e) => setUserSearchQuery(e.target.value)}
            placeholder="Filter by email address..."
            className="input w-full pl-8 pr-3 py-1.5 text-xs font-sans"
          />
        </div>

        {/* User list */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 mb-4 pr-1">
          {fetchingUsers && (
            <div className="py-8 text-center text-xs text-muted flex items-center justify-center gap-2 font-mono">
              <i className="ri-loader-4-line animate-spin text-accent" />
              <span>Loading registered developers...</span>
            </div>
          )}

          {!fetchingUsers && filteredUsers.map((u) => {
            const isSelected = selectedUserId.includes(u._id)
            return (
              <div
                key={u._id}
                onClick={() => onUserClick(u._id)}
                className={`flex items-center justify-between p-2.5 rounded-md border transition cursor-pointer ${
                  isSelected
                    ? 'border-accent bg-accent/5 text-primary'
                    : 'border-default bg-app/50 hover:bg-surface-hover text-secondary'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded border border-default bg-surface font-mono text-[11px] font-semibold text-primary flex items-center justify-center shrink-0">
                    {u.email[0].toUpperCase()}
                  </div>
                  <span className="text-xs font-mono truncate">{u.email}</span>
                </div>
                <i className={isSelected ? 'ri-checkbox-circle-fill text-accent text-sm' : 'ri-checkbox-blank-circle-line text-muted text-sm'} />
              </div>
            )
          })}

          {!fetchingUsers && filteredUsers.length === 0 && (
            <p className="py-6 text-center text-xs text-muted">
              {userSearchQuery ? 'No matching users found.' : 'All available users already joined this workspace.'}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-default">
          <button
            onClick={onClose}
            disabled={submittingUsers}
            className="btn btn-sm btn-secondary text-xs"
          >
            Cancel
          </button>
          <button
            onClick={onAddCollaborators}
            disabled={submittingUsers || selectedUserId.length === 0}
            className="btn btn-sm btn-primary text-xs flex items-center gap-1.5"
          >
            {submittingUsers ? (
              <>
                <i className="ri-loader-4-line animate-spin" />
                <span>Inviting...</span>
              </>
            ) : (
              <>
                <i className="ri-check-line" />
                <span>Add {selectedUserId.length > 0 ? `(${selectedUserId.length})` : ''}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default InviteModal
