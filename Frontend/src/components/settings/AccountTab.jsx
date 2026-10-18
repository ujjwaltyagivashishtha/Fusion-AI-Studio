const AccountTab = ({ user, onClose, onLogout }) => {
  return (
    <div className="space-y-5">
      <div className="p-4 rounded-2xl border border-default glass-card flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-600 flex items-center justify-center text-white text-base font-bold shadow-lg shadow-indigo-500/25">
          {user?.email ? user.email[0].toUpperCase() : 'U'}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-primary truncate">{user?.email || 'Active Developer'}</p>
          <p className="text-[11px] text-muted font-mono truncate">{user?._id || 'Verified Session'}</p>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Authentication Active
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-default flex justify-end">
        <button
          onClick={() => {
            onClose()
            onLogout()
          }}
          className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/30 transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <i className="ri-logout-box-r-line" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

export default AccountTab
