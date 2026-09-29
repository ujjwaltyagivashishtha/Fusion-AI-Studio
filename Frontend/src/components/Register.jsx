import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'

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
        if (password.length < 6) return { label: 'Weak (min 6 chars)', color: 'bg-red-500', percent: 30 }
        if (password.length < 10) return { label: 'Medium', color: 'bg-amber-500', percent: 65 }
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
                'Unable to create your account. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen bg-[#080C14] bg-ambient-grid text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />

            <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl border border-white/10 bg-slate-950/70 backdrop-blur-2xl shadow-2xl overflow-hidden">
                
                {/* Left Side: Feature Showcase */}
                <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-indigo-950/60 via-blue-950/40 to-slate-950 border-r border-white/10 relative overflow-hidden">
                    <div className="absolute -left-16 -top-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div>
                        {/* Brand Logo */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <i className="ri-cpu-line text-2xl text-white"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                                    Fusion AI Studio
                                </h2>
                                <p className="text-xs text-indigo-400/80 font-medium tracking-wide">
                                    START CREATING TODAY
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h3 className="text-2xl font-extrabold text-white leading-tight">
                                Unlock Instant <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">AI Project Workspaces</span>
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Join thousands of engineers building next-generation web applications with real-time AI assistance and instant cloud execution.
                            </p>
                        </div>
                    </div>

                    {/* Features checklist */}
                    <div className="space-y-3.5 my-8">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                            <i className="ri-checkbox-circle-fill text-indigo-400 text-base"></i>
                            <span>Instant project creation & environment setups</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                            <i className="ri-checkbox-circle-fill text-cyan-400 text-base"></i>
                            <span>Seamless collaborator invites via email</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300">
                            <i className="ri-checkbox-circle-fill text-blue-400 text-base"></i>
                            <span>Secure token authentication & Redis blacklisting</span>
                        </div>
                    </div>

                    <div className="text-xs text-slate-500 border-t border-white/10 pt-4 flex items-center justify-between">
                        <span>Free tier account available</span>
                        <span className="text-indigo-400 font-medium">100% Free Setup</span>
                    </div>
                </div>

                {/* Right Side: Register Form */}
                <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
                    {/* Mobile Logo Header */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <i className="ri-cpu-line text-xl text-white"></i>
                        </div>
                        <h2 className="text-lg font-bold bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">
                            Fusion AI Studio
                        </h2>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Create Account
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Set up your developer profile to start building
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
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 outline-none transition duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
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
                                    placeholder="Choose a strong password"
                                    autoComplete="new-password"
                                    className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 outline-none transition duration-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition"
                                >
                                    <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                                </button>
                            </div>

                            {/* Strength indicator */}
                            {password && (
                                <div className="mt-2.5">
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="text-slate-400">Password Strength:</span>
                                        <span className="font-medium text-slate-300">{strength.label}</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-300 ${strength.color}`} 
                                            style={{ width: `${strength.percent}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 active:from-indigo-700 active:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm transition duration-200 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <i className="ri-loader-4-line text-lg animate-spin"></i>
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform"></i>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Switch to Login */}
                    <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
                        <p className="text-sm text-slate-400">
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                className="text-indigo-400 hover:text-indigo-300 font-semibold transition inline-flex items-center gap-1"
                            >
                                Sign in <i className="ri-arrow-right-s-line"></i>
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register