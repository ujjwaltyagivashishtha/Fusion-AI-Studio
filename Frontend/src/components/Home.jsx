import React, { useEffect, useState } from 'react'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'

const Home = () => {
    const [user, setUser] = useState(null)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')

    const navigate = useNavigate()

    // Fetch all projects
    const fetchProjects = async () => {
        try {
            setLoading(true)
            setError('')

            const res = await axios.get('/projects/all')

            setProjects(res.data.projects || [])
        } catch (err) {
            console.error(err)

            setError(
                err.response?.data?.message ||
                'Unable to load projects. Please try again.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    // Create project
    const createProject = async (e) => {
        e.preventDefault()

        if (!projectName.trim()) return

        try {
            setCreating(true)
            setError('')

            const res = await axios.post('/projects/create', {
                name: projectName.trim()
            })

            console.log(res.data)

            setProjectName('')
            setIsModalOpen(false)

            // Refresh project list
            fetchProjects()

        } catch (err) {
            console.error(err)

            setError(
                err.response?.data?.message ||
                'Unable to create project. Please try again.'
            )
        } finally {
            setCreating(false)
        }
    }

    // Close modal
    const closeModal = () => {
        if (creating) return

        setIsModalOpen(false)
        setProjectName('')
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">

            {/* ================= HEADER ================= */}
            <header className="sticky top-0 z-30 border-b border-gray-800 bg-gray-950/90 backdrop-blur-xl">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="h-16 flex items-center justify-between">

                        {/* Logo */}
                        <div className="flex items-center gap-3">

                            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <span className="font-bold text-white">
                                    B
                                </span>
                            </div>

                            <div>
                                <h1 className="font-semibold text-white">
                                    Dashboard
                                </h1>

                                <p className="text-xs text-gray-500">
                                    Project workspace
                                </p>
                            </div>

                        </div>

                        {/* User */}
                        <div className="flex items-center gap-3">

                            <div className="hidden sm:block text-right">
                                <p className="text-sm font-medium text-gray-200">
                                    {user?.email || 'User'}
                                </p>

                                <p className="text-xs text-gray-500">
                                    Account
                                </p>
                            </div>

                            <div className="w-9 h-9 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                                <i className="ri-user-line text-gray-400"></i>
                            </div>

                        </div>

                    </div>

                </div>

            </header>


            {/* ================= MAIN ================= */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Welcome Section */}
                <section className="mb-8">

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">

                        <div>
                            <p className="text-sm text-blue-400 font-medium mb-2">
                                WORKSPACE
                            </p>

                            <h2 className="text-3xl sm:text-4xl font-bold text-white">
                                Your Projects
                            </h2>

                            <p className="text-gray-400 mt-2">
                                Create and manage your projects from one place.
                            </p>
                        </div>

                        {/* New Project */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold transition duration-200 shadow-lg shadow-blue-600/20"
                        >
                            <i className="ri-add-line text-lg"></i>
                            New Project
                        </button>

                    </div>

                </section>


                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">

                        <div className="flex items-center gap-3">
                            <i className="ri-error-warning-line text-red-400"></i>

                            <p className="text-sm text-red-400">
                                {error}
                            </p>
                        </div>

                        <button
                            onClick={() => setError('')}
                            className="text-gray-500 hover:text-gray-300"
                        >
                            <i className="ri-close-line"></i>
                        </button>

                    </div>
                )}


                {/* ================= PROJECTS ================= */}
                <section>

                    {/* Section Header */}
                    <div className="flex items-center justify-between mb-4">

                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-white">
                                All Projects
                            </h3>

                            {!loading && (
                                <span className="px-2 py-0.5 rounded-md bg-gray-800 border border-gray-700 text-xs text-gray-400">
                                    {projects.length}
                                </span>
                            )}
                        </div>

                    </div>


                    {/* Loading */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-40 rounded-2xl border border-gray-800 bg-gray-900 animate-pulse"
                                />
                            ))}

                        </div>
                    )}


                    {/* Empty State */}
                    {!loading && projects.length === 0 && (
                        <div className="border border-dashed border-gray-700 rounded-2xl bg-gray-900/50 py-16 px-6 text-center">

                            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-800 flex items-center justify-center">
                                <i className="ri-folder-add-line text-2xl text-gray-500"></i>
                            </div>

                            <h3 className="text-lg font-semibold text-white">
                                No projects yet
                            </h3>

                            <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto">
                                Create your first project and start collaborating with your team.
                            </p>

                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition"
                            >
                                <i className="ri-add-line"></i>
                                Create your first project
                            </button>

                        </div>
                    )}


                    {/* Project Grid */}
                    {!loading && projects.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                            {projects.map((project) => (

                                <div
                                    key={project._id}
                                    onClick={() => {
                                        navigate('/project', {
                                            state: { project }
                                        })
                                    }}
                                    className="group relative cursor-pointer rounded-2xl border border-gray-800 bg-gray-900 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-gray-700 hover:bg-gray-900/80 hover:shadow-xl hover:shadow-black/20"
                                >

                                    {/* Top */}
                                    <div className="flex items-start justify-between">

                                        <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center">
                                            <i className="ri-folder-3-line text-xl text-blue-400"></i>
                                        </div>

                                        <i className="ri-arrow-right-up-line text-gray-700 group-hover:text-blue-400 transition"></i>

                                    </div>


                                    {/* Project Name */}
                                    <div className="mt-5">

                                        <h4 className="font-semibold text-white truncate">
                                            {project.name}
                                        </h4>

                                        <p className="text-xs text-gray-500 mt-1">
                                            Project workspace
                                        </p>

                                    </div>


                                    {/* Footer */}
                                    <div className="mt-6 pt-4 border-t border-gray-800 flex items-center justify-between">

                                        <div className="flex items-center gap-2 text-gray-500">

                                            <i className="ri-group-line"></i>

                                            <span className="text-xs">
                                                {project.users?.length || 0}{' '}
                                                {project.users?.length === 1
                                                    ? 'Collaborator'
                                                    : 'Collaborators'}
                                            </span>

                                        </div>

                                        <span className="text-xs text-gray-600 group-hover:text-blue-400 transition">
                                            Open
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>
                    )}

                </section>

            </main>


            {/* ================= CREATE PROJECT MODAL ================= */}
            {isModalOpen && (

                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            closeModal()
                        }
                    }}
                >

                    <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl">

                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">

                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Create new project
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Give your project a name to get started.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={creating}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition disabled:opacity-50"
                            >
                                <i className="ri-close-line text-lg"></i>
                            </button>

                        </div>


                        {/* Modal Body */}
                        <form
                            onSubmit={createProject}
                            className="p-6"
                        >

                            <label
                                htmlFor="projectName"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Project name
                            </label>

                            <input
                                id="projectName"
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="e.g. Bank Transaction System"
                                autoFocus
                                disabled={creating}
                                className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                            />


                            {/* Modal Actions */}
                            <div className="flex items-center justify-end gap-3 mt-6">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={creating}
                                    className="px-4 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={creating || !projectName.trim()}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition disabled:bg-blue-600/40 disabled:cursor-not-allowed"
                                >
                                    {creating ? (
                                        <span className="flex items-center gap-2">
                                            <i className="ri-loader-4-line animate-spin"></i>
                                            Creating...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <i className="ri-add-line"></i>
                                            Create project
                                        </span>
                                    )}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    )
}

export default Home