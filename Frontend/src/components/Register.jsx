import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import ThemeToggle from './ThemeToggle'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { setUser } = useContext(UserContext)
  const navigate = useNavigate()

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '', percent: 0 }
    if (password.length < 4) return { label: 'Too short (min 3 chars)', color: 'bg-red-500', percent: 25 }
    if (password.length < 8) return { label: 'Acceptable', color: 'bg-amber-500', percent: 60 }
    return { label: 'Strong', color: 'bg-emerald-500', percent: 100 }
  }

  const strength = getPasswordStrength()

  const submitHandler = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both your email address and password.')
      return
    }

    if (password.length < 3) {
      setError('Password must be at least 3 characters long.')
      return
    }

    try {
      setLoading(true)

      const res = await axios.post('/users/register', {
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
        'Unable to create your account. Please try again with another email address.'
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
        {/* Left Col: Developer Features */}
        <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-10 bg-sidebar/70 backdrop-blur-md border-r border-default">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold text-indigo-400 mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              DEVELOPER REGISTRATION
            </div>

            <h3 className="text-2xl font-extrabold text-primary tracking-tight leading-snug font-display">
              Unlock your isolated cloud engineering workspace in seconds.
            </h3>
            <p className="text-xs text-secondary mt-3 leading-relaxed">
              Create an account to build microservices, full-stack React applications, and test AI code generation in real-time.
            </p>
          </div>

          <div className="space-y-3.5 my-8">
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl glass-card text-xs text-secondary hover:text-primary transition">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                <i className="ri-checkbox-circle-fill text-base" />
              </div>
              <span className="font-medium">Full-stack Starter Templates (Express, Vite, Flask)</span>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl glass-card text-xs text-secondary hover:text-primary transition">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shrink-0">
                <i className="ri-checkbox-circle-fill text-base" />
              </div>
              <span className="font-medium">Collaborative Socket Presence & File Sharing</span>
            </div>
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl glass-card text-xs text-secondary hover:text-primary transition">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                <i className="ri-checkbox-circle-fill text-base" />
              </div>
              <span className="font-medium">Contextual AI Code Assistance & Diff Review</span>
            </div>
          </div>

          <div className="pt-4 border-t border-default flex items-center justify-between text-[11px] text-muted font-mono">
            <span>Free Tier Developer Setup</span>
            <span className="text-indigo-400 font-semibold">100% Free Access</span>
          </div>
        </div>

        {/* Right Col: Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-surface/60 backdrop-blur-md">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-gradient-cosmic">
              Create Developer Account
            </h1>
            <p className="text-xs text-secondary mt-1.5">
              Set up your profile to start launching workspaces and inviting team members.
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
              <label htmlFor="register-email" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <i className="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base" />
                <input
                  id="register-email"
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
                <label htmlFor="register-password" className="block text-xs font-semibold text-secondary uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <i className="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-base" />
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password (min 3 characters)"
                  autoComplete="new-password"
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

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-muted">Password Strength:</span>
                    <span className="font-semibold text-secondary">{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Create Account Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl btn-primary font-semibold text-xs tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line text-base animate-spin" />
                    <span>Creating Developer Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <i className="ri-arrow-right-line text-sm" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="mt-8 pt-6 border-t border-default text-center">
            <p className="text-xs text-secondary">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition inline-flex items-center gap-1"
              >
                Sign in <i className="ri-arrow-right-s-line" />
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

export default Register