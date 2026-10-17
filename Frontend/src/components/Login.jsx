import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import ThemeToggle from './ThemeToggle'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { setUser } = useContext(UserContext)
  const navigate = useNavigate()

  const submitHandler = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both your email address and password.')
      return
    }

    try {
      setLoading(true)

      const res = await axios.post('/users/login', {
        email: email.trim(),
        password
      })

      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
      navigate('/')
    } catch (err) {
      console.error(err.response?.data)
      setError(
        err.response?.data?.message ||
        'Invalid email or password. Please verify your credentials and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app cosmic-grid-bg ambient-glow-bg text-primary flex flex-col justify-between p-4 sm:p-6 lg:p-8 transition-colors duration-200 relative">
      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <i className="ri-cpu-line text-xl" />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight font-display text-primary">
              Fusion <span className="text-gradient-brand">AI Studio</span>
            </h2>
            <p className="text-[11px] text-muted font-medium tracking-wide">Cloud Developer Environment</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Main Glassmorphic Card */}
      <main className="max-w-5xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 rounded-3xl glass-panel overflow-hidden relative z-10 shadow-2xl">
        {/* Left Col: Developer Value Proposition */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-10 bg-sidebar/70 backdrop-blur-md border-r border-default">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold text-indigo-400 mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              INTELLIGENT CLOUD IDE
            </div>

            <h3 className="text-2xl font-extrabold text-primary tracking-tight leading-snug font-display">
              Engineered for velocity, collaboration, and code intelligence.
            </h3>
            <p className="text-xs text-secondary mt-3 leading-relaxed">
              Instantly scaffold full-stack architectures, run isolated web containers, and collaborate live with your team using AI-driven assistance.
            </p>
          </div>

          <div className="space-y-3.5 my-8">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl glass-card text-xs text-secondary hover:text-primary transition">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                <i className="ri-code-s-slash-line text-base" />
              </div>
              <span className="font-medium">Real-time Multi-file Workspace Synchronization</span>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl glass-card text-xs text-secondary hover:text-primary transition">
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 shrink-0">
                <i className="ri-sparkles-line text-base" />
              </div>
              <span className="font-medium">Multi-mode AI Code Generation & Refactoring</span>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl glass-card text-xs text-secondary hover:text-primary transition">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <i className="ri-terminal-box-line text-base" />
              </div>
              <span className="font-medium">In-browser Cloud Terminal & Web Execution</span>
            </div>
          </div>

          <div className="pt-4 border-t border-default flex items-center justify-between text-[11px] text-muted font-mono">
            <span>Version 2.5.0 Engine</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Operational
            </span>
          </div>
        </div>

        {/* Right Col: Sign In Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-surface/60 backdrop-blur-md">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-gradient-cosmic">
              Sign In to Fusion Studio
            </h1>
            <p className="text-xs text-secondary mt-1.5">
              Enter your credentials to access your cloud workspaces and AI agent.
            </p>
          </div>

          <form onSubmit={submitHandler} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 p-3.5 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs animate-slideDown"
              >
                <i className="ri-error-warning-line text-base shrink-0 mt-0.5" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <i className="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@fusion.ai"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-default bg-input/80 text-primary placeholder-muted outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition font-sans shadow-inner"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="login-password" className="block text-xs font-semibold text-secondary uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <i className="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-default bg-input/80 text-primary placeholder-muted outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-xs transition font-sans shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition p-1 cursor-pointer"
                >
                  <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl btn-primary font-semibold text-xs tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line text-base animate-spin" />
                    <span>Authenticating Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Studio</span>
                    <i className="ri-arrow-right-line text-sm" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 pt-6 border-t border-default text-center">
            <p className="text-xs text-secondary">
              Don't have an account yet?{' '}
              <Link
                to="/register"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition inline-flex items-center gap-1"
              >
                Create an account <i className="ri-arrow-right-s-line" />
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-6 text-center text-xs text-muted relative z-10">
        <p>© 2026 Fusion AI Studio • Enterprise Cloud Engineering Workspace</p>
      </footer>
    </div>
  )
}

export default Login