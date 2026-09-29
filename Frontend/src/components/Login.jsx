import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'

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
                email,
                password
            })

            localStorage.setItem('token', res.data.token)
            setUser(res.data.user)
            navigate('/')
        } catch (err) {
            console.error(err.response?.data)
            setError(
                err.response?.data?.message ||
                'Invalid email or password. Please check your credentials and try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-[#080C14] bg-ambient-grid text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-2xl overflow-hidden">
                
                {/* Left Side: Brand & AI Studio Feature Showcase */}
                <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-950/60 via-indigo-950/40 to-slate-950 border-r border-white/10 relative overflow-hidden">
                    <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div>
                        {/* Brand Logo */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <i className="ri-cpu-line text-2xl text-white"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent">
                                    Fusion AI Studio
                                </h2>
                                <p className="text-xs text-blue-400/80 font-medium tracking-wide">
                                    NEXT-GEN DEVELOPMENT
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-extrabold text-white leading-tight">
                                Build & Collaborate with <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">AI Intelligence</span>
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Experience full-stack project orchestration, real-time workspace collaboration, and intelligent code generation.
                            </p>
                        </div>
                    </div>

                    {/* Highlights Badges */}
                    <div className="space-y-3.5 my-8">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                            <i className="ri-code-s-slash-line text-blue-400 text-base"></i>
                            <span>Real-time Code Sync & Execution</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                            <i className="ri-sparkles-line text-indigo-400 text-base"></i>
                            <span>Context-Aware AI Code Assistant</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                            <i className="ri-team-line text-cyan-400 text-base"></i>
                            <span>Multi-user Workspace Collaboration</span>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 border-t border-white/10 pt-4 flex items-center justify-between">
                        <span>v2.4 Production Engine</span>
                        <span className="flex items-center gap-1.5 text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            Systems Operational
                        </span>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
                    {/* Mobile Logo Header */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <i className="ri-cpu-line text-xl text-white"></i>
                        </div>
                        <h2 className="text-lg font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                            Fusion AI Studio
                        </h2>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Sign in to access your AI projects and workspace
                        </p>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-5">
                        {/* Error Alert */}
                        {error && (
                            <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm animate-shake">
                                <i className="ri-error-warning-line text-lg shrink-0 mt-0.5"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <i className="ri-mail-line text-lg"></i>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="developer@fusionai.com"
                                    autoComplete="email"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                                    Password
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <i className="ri-lock-line text-lg"></i>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••••••"
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                                >
                                    <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition duration-200 shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <i className="ri-loader-4-line text-lg animate-spin"></i>
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In to Studio</span>
                                    <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Switch to Register */}
                    <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
                        <p className="text-sm text-slate-400">
                            Don't have an account yet?{' '}
                            <Link
                                to="/register"
                                className="text-blue-400 hover:text-blue-300 font-semibold transition inline-flex items-center gap-1"
                            >
                                Create an account <i className="ri-arrow-right-s-line"></i>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login