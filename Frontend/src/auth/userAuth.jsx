import React, { useContext, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate } from 'react-router-dom'

const UserAuth = ({ children }) => {
    const { user, loading } = useContext(UserContext)
    const token = localStorage.getItem('token')
    const navigate = useNavigate()

    useEffect(() => {
        if (!loading && (!token || !user)) {
            navigate('/login')
        }
    }, [user, loading, token, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center text-white gap-4">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-xs text-slate-400 font-mono tracking-wider">Authenticating Fusion session...</p>
            </div>
        )
    }

    if (!token || !user) {
        return null
    }

    return children
}

export default UserAuth   