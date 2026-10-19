const AccountTab = ({ user, onClose, onLogout }) => {
  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-md border border-default bg-app flex items-center gap-3">
        <div className="w-10 h-10 rounded border border-default bg-surface flex items-center justify-center text-primary text-sm font-mono font-semibold shadow-xs">
          {user?.email ? user.email[0].toUpperCase() : 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary truncate font-sans">{user?.email || 'Active Developer'}</p>
          <p className="text-[11px] text-muted font-mono truncate">{user?._id || 'Verified Session'}</p>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-500 font-mono font-medium mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Session Authenticated
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-default flex justify-end">
        <button
          onClick={() => {
            onClose()
            onLogout()
          }}
          className="btn btn-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 transition flex items-center gap-1.5 cursor-pointer text-xs"
        >
          <i className="ri-logout-box-r-line" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export default AccountTab
