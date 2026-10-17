import { useTheme } from '../context/theme.context'

const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`inline-flex items-center gap-2 p-1.5 rounded-xl border border-default glass-card hover:border-indigo-500/40 text-secondary hover:text-primary transition duration-150 cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${className}`}
    >
      <i className={`text-sm transition-transform duration-200 ${isDark ? 'ri-sun-line text-amber-400 rotate-0' : 'ri-moon-line text-indigo-400 rotate-12'}`} />
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  )
}

export default ThemeToggle
