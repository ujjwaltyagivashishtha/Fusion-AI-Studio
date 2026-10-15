
export const ToastContainer = ({ toasts, onDismiss }) => {
    if (!toasts || toasts.length === 0) return null

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full">
            {toasts.map((toast) => {
                const isSuccess = toast.type === 'success'
                const isError = toast.type === 'error'
                const isInfo = toast.type === 'info'

                let borderClass = 'border-blue-500/30'
                let bgClass = 'bg-slate-900/90'
                let textClass = 'text-blue-400'
                let icon = 'ri-information-line'

                if (isSuccess) {
                    borderClass = 'border-emerald-500/40 shadow-emerald-500/10'
                    textClass = 'text-emerald-400'
                    icon = 'ri-checkbox-circle-fill'
                } else if (isError) {
                    borderClass = 'border-red-500/40 shadow-red-500/10'
                    textClass = 'text-red-400'
                    icon = 'ri-error-warning-fill'
                } else if (isInfo) {
                    borderClass = 'border-cyan-500/40 shadow-cyan-500/10'
                    textClass = 'text-cyan-400'
                    icon = 'ri-sparkles-fill'
                }

                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border ${borderClass} ${bgClass} backdrop-blur-xl shadow-2xl text-xs text-white transition-all duration-300 animate-fadeIn`}
                    >
                        <div className="flex items-center gap-2.5 truncate">
                            <i className={`${icon} ${textClass} text-base shrink-0`}></i>
                            <span className="font-medium truncate">{toast.message}</span>
                        </div>
                        <button
                            onClick={() => onDismiss(toast.id)}
                            className="text-slate-500 hover:text-white transition p-1 shrink-0 cursor-pointer"
                        >
                            <i className="ri-close-line text-sm"></i>
                        </button>
                    </div>
                )
            })}
        </div>
    )
}

export default ToastContainer
