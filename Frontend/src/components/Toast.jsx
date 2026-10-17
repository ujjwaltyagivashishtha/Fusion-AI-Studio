export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success'
        const isError = toast.type === 'error'
        const isWarning = toast.type === 'warning'

        let borderClass = 'border-indigo-500/40 bg-indigo-500/5'
        let icon = 'ri-information-line text-indigo-400'

        if (isSuccess) {
          borderClass = 'border-emerald-500/40 bg-emerald-500/5'
          icon = 'ri-checkbox-circle-fill text-emerald-400'
        } else if (isError) {
          borderClass = 'border-red-500/40 bg-red-500/5'
          icon = 'ri-error-warning-fill text-red-400'
        } else if (isWarning) {
          borderClass = 'border-amber-500/40 bg-amber-500/5'
          icon = 'ri-alert-fill text-amber-400'
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3.5 p-3.5 rounded-2xl border ${borderClass} glass-panel shadow-2xl text-xs text-primary transition-all duration-200 animate-slideUp backdrop-blur-xl`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <i className={`${icon} text-base shrink-0`} />
              <span className="font-medium text-primary truncate">{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-muted hover:text-primary transition p-1 shrink-0 cursor-pointer rounded-lg hover:bg-surface-hover"
            >
              <i className="ri-close-line text-sm" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ToastContainer
