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
      className={`inline-flex items-center gap-2 w-8 h-8 rounded-lg border border-default hover:bg-surface-hover hover:border-strong text-secondary hover:text-primary justify-center transition duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${className}`}
    >
      <i className={`text-sm transition-transform duration-200 ${isDark ? 'ri-sun-line rotate-0' : 'ri-moon-line rotate-12'}`} />
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  )
}

export default ThemeToggle
