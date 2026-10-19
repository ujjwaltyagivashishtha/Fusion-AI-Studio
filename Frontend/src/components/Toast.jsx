import { useEffect } from 'react'

const ToastItem = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration || 3500)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  const isSuccess = toast.type === 'success'
  const isError = toast.type === 'error'
  const isWarning = toast.type === 'warning'

  let borderAccent = 'border-l-accent'
  let icon = 'ri-information-line text-accent'

  if (isSuccess) {
    borderAccent = 'border-l-emerald-500'
    icon = 'ri-checkbox-circle-line text-emerald-500'
  } else if (isError) {
    borderAccent = 'border-l-red-500'
    icon = 'ri-error-warning-line text-red-500'
  } else if (isWarning) {
    borderAccent = 'border-l-amber-500'
    icon = 'ri-alert-line text-amber-500'
  }

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-md border border-default ${borderAccent} border-l-4 bg-surface shadow-lg text-xs text-primary transition-all duration-150 animate-slideUp`}
    >
      <div className="flex items-center gap-2.5 truncate">
        <i className={`${icon} text-sm shrink-0`} />
        <span className="font-medium text-primary truncate font-sans">{toast.message}</span>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-muted hover:text-primary transition p-0.5 shrink-0 cursor-pointer rounded hover:bg-surface-hover"
      >
        <i className="ri-close-line text-sm" />
      </button>
    </div>
  )
}

export const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

export default ToastContainer
