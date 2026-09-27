import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from '../config/axios'

const Register = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    const submitHandler = async (e) => {
        e.preventDefault()

        setError('')

        if (!email || !password) {
            setError('Please enter your email and password.')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.')
            return
        }

        try {
            setLoading(true)

            const res = await axios.post('/users/register', {
                email,
                password
            })

            console.log(res.data)

            navigate('/')
        } catch (err) {
            console.log(err.response?.data)

            setError(
                err.response?.data?.message ||
                'Unable to create your account. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950 flex items-center justify-center px-4 py-8">

            <div className="w-full max-w-md">

                {/* Logo / Brand */}
                <div className="text-center mb-8">

                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30 mb-4">
                        <span className="text-2xl font-bold text-white">
                            B
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold text-white">
                        Create your account
                    </h1>

                    <p className="text-gray-400 mt-2">
                        Get started by creating a new account
                    </p>

                </div>

                {/* Register Card */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-2xl">

                    <form onSubmit={submitHandler}>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                                <p className="text-sm text-red-400">
                                    {error}
                                </p>
                            </div>
                        )}

                        {/* Email */}
                        <div className="mb-5">

                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Email address
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />

                        </div>

                        {/* Password */}
                        <div className="mb-6">

                            <div className="flex items-center justify-between mb-2">

                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-300"
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition"
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>

                            </div>

                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a password"
                                autoComplete="new-password"
                                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />

                            <p className="text-xs text-gray-500 mt-2">
                                Use at least 6 characters.
                            </p>

                        </div>

                        {/* Register Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-semibold transition duration-200 shadow-lg shadow-blue-600/20"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>

                    </form>

                    {/* Login Link */}
                    <div className="mt-6 pt-6 border-t border-gray-800 text-center">

                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}

                            <Link
                                to="/login"
                                className="text-blue-400 hover:text-blue-300 font-medium transition "
                            >
                                Login
                            </Link>
                        </p>

                    </div>

                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-600 mt-6">
                    Secure authentication powered by your application
                </p>

            </div>

        </div>
    )
}

export default Register