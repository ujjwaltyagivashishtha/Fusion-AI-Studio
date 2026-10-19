import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'

const FEATURES = [
  { icon: 'ri-code-s-slash-line', title: 'Multi-file Workspace Sync', desc: 'Instant file tree indexing, live edits, and cloud persistence.' },
  { icon: 'ri-sparkling-line', title: 'Nexus Intelligent Agent', desc: 'Context-aware AST generation, refactoring, and test suites.' },
  { icon: 'ri-terminal-box-line', title: 'In-Browser Cloud Runtimes', desc: 'Fast container execution with live browser preview frames.' }
]

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
      const res = await axios.post('/users/login', { email: email.trim(), password })
      localStorage.setItem('token', res.data.token)
      setUser(res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-app text-primary flex flex-col transition-colors duration-150">
      <header className="sticky top-0 z-40 border-b border-default bg-surface/90 backdrop-blur-md">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs shadow-xs" style={{ background: 'var(--accent-gradient)' }}>
              <i className="ri-terminal-box-line text-sm" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-primary">Fusion <span className="brand-gradient-text">AI Studio</span></span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-default bg-surface overflow-hidden shadow-xl">
          <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-7 bg-sidebar/80 border-r border-default relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-56 h-56 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wide border border-default bg-surface-elevated text-secondary mb-4">
                <span className="status-dot status-dot-success" />
                <span>INTELLIGENT CLOUD IDE</span>
              </div>

              <h2 className="text-xl font-bold text-primary tracking-tight leading-snug">
                Engineered for velocity, collaboration, and code intelligence.
              </h2>
              <p className="text-xs text-secondary mt-2.5 leading-relaxed">
                Scaffold full-stack architectures, run isolated web containers, and pair-program with Nexus AI.
              </p>

              <div className="my-5 p-3.5 rounded-xl border border-default bg-surface/70 shadow-xs relative">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-2">
                  <span className="flex items-center gap-1 text-primary font-medium">
                    <i className="ri-node-tree text-accent text-xs" />
                    <span>Connected Systems</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">Live Mesh</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-surface-elevated border border-default/70 flex flex-col items-center gap-1">
                    <i className="ri-terminal-box-line text-cyan text-xs" />
                    <span className="text-primary font-medium">Runtimes</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-elevated border border-accent/40 shadow-xs flex flex-col items-center gap-1">
                    <i className="ri-sparkling-line text-accent text-xs" />
                    <span className="text-primary font-medium">Nexus</span>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-elevated border border-default/70 flex flex-col items-center gap-1">
                    <i className="ri-team-line text-secondary text-xs" />
                    <span className="text-primary font-medium">Collab</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                {FEATURES.map((f, i) => (
                  <div key={i} className="group flex items-start gap-3 p-2.5 rounded-xl border border-default bg-surface/50 hover:bg-surface hover:border-strong transition-all">
                    <div className="w-7 h-7 rounded-lg bg-surface-elevated border border-default/80 flex items-center justify-center text-primary group-hover:text-accent transition-colors shrink-0 text-xs mt-0.5">
                      <i className={f.icon} />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-primary">{f.title}</h3>
                      <p className="text-[11px] text-secondary mt-0.5 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-default/70 flex items-center justify-between text-[11px] text-muted font-mono">
              <span>Engine v2.5.0</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="status-dot status-dot-success" />
                Operational
              </span>
            </div>
          </div>

          <div className="lg:col-span-7 p-7 sm:p-9 lg:p-10 flex flex-col justify-center">
            <div className="w-full max-w-sm mx-auto">
              <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-primary">Sign In to Studio</h1>
                <p className="text-xs text-secondary mt-1.5 leading-relaxed">Enter your credentials to access your cloud workspaces and Nexus agent.</p>
              </div>

              <form onSubmit={submitHandler} className="space-y-4">
                {error && (
                  <div role="alert" className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs animate-slideDown shadow-xs">
                    <i className="ri-error-warning-line text-sm text-rose-400 shrink-0 mt-0.5" />
                    <span className="font-medium leading-relaxed">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="login-email" className="block text-xs font-medium text-secondary mb-1.5">Email Address</label>
                  <div className="relative rounded-xl border border-default bg-input focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all shadow-xs">
                    <i className="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs pointer-events-none" />
                    <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="developer@fusion.ai" autoComplete="email" required className="w-full pl-9 pr-4 py-2.5 bg-transparent text-primary placeholder-muted outline-none text-xs font-sans" />
                  </div>
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-xs font-medium text-secondary mb-1.5">Password</label>
                  <div className="relative rounded-xl border border-default bg-input focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all shadow-xs">
                    <i className="ri-lock-2-line absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-xs pointer-events-none" />
                    <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" autoComplete="current-password" required className="w-full pl-9 pr-10 py-2.5 bg-transparent text-primary placeholder-muted outline-none text-xs font-sans" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition p-0.5 cursor-pointer text-xs">
                      <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                    </button>
                  </div>
                </div>

                <div className="pt-1.5">
                  <button type="submit" disabled={loading} className="w-full py-2.5 px-4 rounded-xl btn-primary font-semibold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? (
                      <><i className="ri-loader-4-line text-sm animate-spin" /><span>Authenticating Credentials...</span></>
                    ) : (
                      <><span>Sign In to Studio</span><i className="ri-arrow-right-line text-xs" /></>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-default/70 text-center space-y-2">
                <p className="text-xs text-secondary">
                  Don't have an account yet?{' '}
                  <Link to="/register" className="text-accent hover:underline font-medium transition inline-flex items-center gap-0.5">
                    <span>Create an account</span><i className="ri-arrow-right-s-line text-xs" />
                  </Link>
                </p>
                <p className="text-[10px] text-muted font-mono flex items-center justify-center gap-1.5">
                  <i className="ri-shield-check-line text-xs text-emerald-400" />
                  <span>Protected by encrypted session authentication</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-default py-4 text-center text-xs text-muted">
        <p>© 2026 Fusion AI Studio · Enterprise Cloud Engineering Workspace</p>
      </footer>
    </div>
  )
}

export default Login