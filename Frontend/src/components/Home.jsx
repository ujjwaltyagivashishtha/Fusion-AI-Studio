import { useEffect, useState, useContext } from 'react'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'

const TEMPLATE_OPTIONS = [
    {
        id: 'node-express',
        name: 'Node.js Express API',
        icon: 'ri-nodejs-line',
        badgeColor: 'from-emerald-600 to-teal-600',
        textColor: 'text-emerald-400',
        desc: 'Express server with live web container preview'
    },
    {
        id: 'react-vite',
        name: 'React + Vite App',
        icon: 'ri-reactjs-line',
        badgeColor: 'from-cyan-600 to-blue-600',
        textColor: 'text-cyan-400',
        desc: 'Modern React components with fast preview'
    },
    {
        id: 'python-flask',
        name: 'Python Flask API',
        icon: 'ri-code-s-slash-line',
        badgeColor: 'from-amber-600 to-orange-600',
        textColor: 'text-amber-400',
        desc: 'Lightweight Python microservice & endpoints'
    },
    {
        id: 'vanilla-web',
        name: 'Creative Canvas Web',
        icon: 'ri-html5-line',
        badgeColor: 'from-purple-600 to-indigo-600',
        textColor: 'text-purple-400',
        desc: 'Interactive HTML5/CSS3 particle physics'
    }
]

const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Recently'
    const now = new Date()
    const past = new Date(dateString)
    const diffMs = now - past
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHours = Math.floor(diffMin / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return past.toLocaleDateString()
}

const Home = () => {
    const { user, setUser } = useContext(UserContext)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState('')
    const [projectDesc, setProjectDesc] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState('node-express')
    const [projects, setProjects] = useState([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')

    // Deletion Modal state
    const [deleteModalProject, setDeleteModalProject] = useState(null)
    const [deleting, setDeleting] = useState(false)

    // Search and View Mode state
    const [searchQuery, setSearchQuery] = useState('')
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
    const [userMenuOpen, setUserMenuOpen] = useState(false)

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
                'Unable to load projects. Please refresh or log in again.'
            )
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        let isMounted = true
        axios.get('/projects/all')
            .then((res) => {
                if (isMounted) {
                    setProjects(res.data.projects || [])
                }
            })
            .catch((err) => {
                if (isMounted) {
                    console.error(err)
                    setError(
                        err.response?.data?.message ||
                        'Unable to load projects. Please try again.'
                    )
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [])

    // Create project
    const createProject = async (e) => {
        e.preventDefault()

        if (!projectName.trim()) return

        try {
            setCreating(true)
            setError('')

            const res = await axios.post('/projects/create', {
                name: projectName.trim(),
                description: projectDesc.trim() || undefined,
                template: selectedTemplate
            })

            setProjectName('')
            setProjectDesc('')
            setSelectedTemplate('node-express')
            setIsModalOpen(false)
            fetchProjects()

            if (res.data?.project?._id) {
                navigate(`/project/${res.data.project._id}`, { state: { project: res.data.project } })
            }
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

    // Delete project
    const confirmDeleteProject = async () => {
        if (!deleteModalProject) return
        try {
            setDeleting(true)
            await axios.delete(`/projects/${deleteModalProject._id}`)
            setProjects((prev) => prev.filter((p) => p._id !== deleteModalProject._id))
            setDeleteModalProject(null)
        } catch (err) {
            console.error('Delete project failed:', err)
            setError(err.response?.data?.message || 'Failed to delete workspace')
        } finally {
            setDeleting(false)
        }
    }

    // Logout Handler
    const handleLogout = async () => {
        try {
            await axios.post('/users/logout').catch(() => axios.get('/users/logout'))
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            localStorage.removeItem('token')
            setUser(null)
            navigate('/login')
        }
    }

    // Close modal
    const closeModal = () => {
        if (creating) return
        setIsModalOpen(false)
        setProjectName('')
        setProjectDesc('')
        setSelectedTemplate('node-express')
    }

    // Filter projects
    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Total collaborators across all projects
    const totalCollaborators = projects.reduce((acc, curr) => acc + (curr.users?.length || 0), 0)

    return (
        <div className="min-h-screen bg-[#080C14] bg-ambient-grid text-white relative flex flex-col selection:bg-blue-500 selection:text-white">
            {/* Ambient Background Lights */}
            <div className="fixed top-0 left-1/3 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

            {/* ================= HEADER ================= */}
            <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-16 flex items-center justify-between gap-4">
                        {/* Brand Logo & Title */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                <i className="ri-cpu-line text-xl text-white"></i>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="font-bold text-white text-base tracking-tight">
                                        Fusion AI Studio
                                    </h1>
                                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-semibold text-blue-400">
                                        v2.5 PRO
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium">
                                    Next-Gen Cloud IDE & AI Workspace
                                </p>
                            </div>
                        </div>

                        {/* User Profile & Actions */}
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-3 p-1.5 pl-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition group cursor-pointer"
                                >
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-semibold text-white">
                                            {user?.email ? user.email.split('@')[0] : 'Developer'}
                                        </p>
                                        <p className="text-[10px] text-slate-400">
                                            {user?.email || 'Logged In'}
                                        </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                                        {user?.email ? user.email[0].toUpperCase() : 'U'}
                                    </div>
                                    <i className="ri-arrow-down-s-line text-slate-400 group-hover:text-white transition"></i>
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-2 z-50 animate-fadeIn">
                                        <div className="px-3 py-2 border-b border-slate-800 mb-1">
                                            <p className="text-xs text-slate-400">Signed in as</p>
                                            <p className="text-xs font-medium text-white truncate">{user?.email}</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition cursor-pointer"
                                        >
                                            <i className="ri-logout-box-r-line text-sm"></i>
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ================= MAIN CONTENT ================= */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
                {/* Banner / Stats Section */}
                <section className="mb-8">
                    <div className="relative rounded-3xl border border-white/10 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-blue-950/40 p-6 sm:p-8 backdrop-blur-2xl overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-medium mb-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                                    AI-POWERED FULL-STACK STUDIO
                                </div>
                                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                                    Welcome back, <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">{user?.email?.split('@')[0] || 'Developer'}</span>
                                </h2>
                                <p className="text-slate-400 text-sm mt-2 max-w-xl">
                                    Build, edit, and collaborate in real-time. Prompt intelligent full-stack features with contextual AI assistance and live container execution.
                                </p>
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-sm transition duration-200 shadow-xl shadow-blue-600/30 group shrink-0 cursor-pointer"
                            >
                                <i className="ri-add-line text-lg group-hover:rotate-90 transition-transform duration-300"></i>
                                <span>Create New Project</span>
                            </button>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                    <i className="ri-folder-code-line text-lg"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Active Workspaces</p>
                                    <p className="text-lg font-bold text-white">{projects.length}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                    <i className="ri-team-line text-lg"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Collaborator Access</p>
                                    <p className="text-lg font-bold text-white">{totalCollaborators}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                    <i className="ri-sparkling-fill text-lg"></i>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">AI Copilot Engine</p>
                                    <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                        Connected & Ready
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
                        <div className="flex items-center gap-3">
                            <i className="ri-error-warning-line text-lg"></i>
                            <span>{error}</span>
                        </div>
                        <button onClick={() => setError('')} className="hover:text-white transition cursor-pointer">
                            <i className="ri-close-line text-lg"></i>
                        </button>
                    </div>
                )}

                {/* ================= PROJECTS SECTION ================= */}
                <section>
                    {/* Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
                        {/* Search Input */}
                        <div className="relative flex-grow max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                <i className="ri-search-line text-base"></i>
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search workspaces by name or keywords..."
                                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white cursor-pointer"
                                >
                                    <i className="ri-close-circle-fill"></i>
                                </button>
                            )}
                        </div>

                        {/* View Toggles */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-md' : 'hover:text-white'}`}
                                >
                                    <i className="ri-grid-fill"></i>
                                    <span className="hidden sm:inline">Grid</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-md' : 'hover:text-white'}`}
                                >
                                    <i className="ri-list-check-2"></i>
                                    <span className="hidden sm:inline">List</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Skeleton Loading State */}
                    {loading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-48 rounded-3xl border border-white/5 bg-slate-900/50 p-6 animate-pulse flex flex-col justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-800" />
                                        <div className="space-y-2 flex-grow">
                                            <div className="h-4 bg-slate-800 rounded w-3/4" />
                                            <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                                        </div>
                                    </div>
                                    <div className="h-4 bg-slate-800 rounded w-full" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredProjects.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/40 py-16 px-6 text-center backdrop-blur-sm">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-xl">
                                <i className="ri-folder-add-line text-3xl"></i>
                            </div>
                            <h3 className="text-lg font-bold text-white">
                                {searchQuery ? 'No matching workspaces found' : 'No workspaces created yet'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                                {searchQuery
                                    ? `No workspace matched "${searchQuery}". Try a different keyword.`
                                    : 'Start building by creating your first AI-assisted cloud project workspace.'}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition shadow-lg shadow-blue-600/25 cursor-pointer"
                                >
                                    <i className="ri-add-line text-sm"></i>
                                    <span>Create Your First Project</span>
                                </button>
                            )}
                        </div>
                    )}

                    {/* Project Grid View */}
                    {!loading && filteredProjects.length > 0 && viewMode === 'grid' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filteredProjects.map((project) => {
                                const template = TEMPLATE_OPTIONS.find((t) => t.id === project.template) || TEMPLATE_OPTIONS[0]
                                return (
                                    <div
                                        key={project._id}
                                        onClick={() => navigate(`/project/${project._id}`, { state: { project } })}
                                        className="group relative cursor-pointer rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/0 group-hover:bg-blue-500/10 rounded-full blur-2xl transition duration-500 pointer-events-none" />

                                        <div>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${template.badgeColor} flex items-center justify-center text-white group-hover:scale-110 transition duration-300 shadow-md`}>
                                                    <i className={`${template.icon} text-2xl`}></i>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {/* Delete button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setDeleteModalProject(project)
                                                        }}
                                                        title="Delete Workspace"
                                                        className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                                    >
                                                        <i className="ri-delete-bin-line text-sm"></i>
                                                    </button>
                                                    <span className="p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition">
                                                        <i className="ri-arrow-right-up-line text-sm"></i>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50">
                                                    {project.template || 'Node API'}
                                                </span>
                                                <span className="text-[11px] text-slate-500">
                                                    {formatRelativeTime(project.updatedAt || project.createdAt)}
                                                </span>
                                            </div>

                                            <h4 className="font-bold text-base text-white truncate group-hover:text-blue-300 transition">
                                                {project.name}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                                                {project.description || 'Full-stack AI workspace environment'}
                                            </p>
                                        </div>

                                        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex -space-x-2 overflow-hidden">
                                                    {(project.users || []).slice(0, 3).map((u, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="inline-block h-6 w-6 rounded-full bg-indigo-600 border border-slate-900 text-[10px] font-bold text-white flex items-center justify-center uppercase"
                                                            title={typeof u === 'string' ? u : u.email}
                                                        >
                                                            {(typeof u === 'string' ? u : u.email || 'U')[0]}
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[11px] font-medium text-slate-400">
                                                    {project.users?.length || 1} {project.users?.length === 1 ? 'member' : 'members'}
                                                </span>
                                            </div>

                                            <span className="text-xs font-semibold text-blue-400 opacity-0 group-hover:opacity-100 transition duration-200">
                                                Launch Studio →
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Project List View */}
                    {!loading && filteredProjects.length > 0 && viewMode === 'list' && (
                        <div className="space-y-3">
                            {filteredProjects.map((project) => {
                                const template = TEMPLATE_OPTIONS.find((t) => t.id === project.template) || TEMPLATE_OPTIONS[0]
                                return (
                                    <div
                                        key={project._id}
                                        onClick={() => navigate(`/project/${project._id}`, { state: { project } })}
                                        className="group cursor-pointer rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur-xl transition duration-200 hover:border-blue-500/40 hover:bg-slate-900/90 flex items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${template.badgeColor} flex items-center justify-center text-white transition`}>
                                                <i className={`${template.icon} text-xl`}></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-sm text-white group-hover:text-blue-300 transition">
                                                        {project.name}
                                                    </h4>
                                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                                        {project.template || 'NODE'}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {project.description || 'Full-stack AI workspace'} • Updated {formatRelativeTime(project.updatedAt || project.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-400 hidden sm:inline">
                                                {project.users?.length || 1} Collaborators
                                            </span>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setDeleteModalProject(project)
                                                }}
                                                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                                                title="Delete Workspace"
                                            >
                                                <i className="ri-delete-bin-line text-sm"></i>
                                            </button>
                                            <button className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-white font-medium group-hover:bg-blue-600 transition flex items-center gap-1.5 cursor-pointer">
                                                <span>Launch</span>
                                                <i className="ri-arrow-right-line"></i>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>
            </main>

            {/* ================= CREATE PROJECT MODAL ================= */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeModal()
                    }}
                >
                    <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                    <i className="ri-folder-add-line text-xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Create Workspace</h3>
                                    <p className="text-xs text-slate-400">Choose a framework template and start building</p>
                                </div>
                            </div>
                            <button
                                onClick={closeModal}
                                disabled={creating}
                                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                            >
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={createProject} className="space-y-5">
                            <div>
                                <label htmlFor="projectName" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Workspace Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                        <i className="ri-terminal-box-line text-lg"></i>
                                    </div>
                                    <input
                                        id="projectName"
                                        type="text"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="e.g. NextGen AI Microservice"
                                        autoFocus
                                        disabled={creating}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="projectDesc" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Description <span className="text-slate-500 lowercase">(optional)</span>
                                </label>
                                <input
                                    id="projectDesc"
                                    type="text"
                                    value={projectDesc}
                                    onChange={(e) => setProjectDesc(e.target.value)}
                                    placeholder="Brief summary of this project..."
                                    disabled={creating}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                                />
                            </div>

                            {/* Template Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                    Starter Template
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {TEMPLATE_OPTIONS.map((t) => {
                                        const isSelected = selectedTemplate === t.id
                                        return (
                                            <div
                                                key={t.id}
                                                onClick={() => setSelectedTemplate(t.id)}
                                                className={`p-3 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                                                    isSelected
                                                        ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500'
                                                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                                                }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${t.badgeColor} flex items-center justify-center text-white shrink-0`}>
                                                    <i className={`${t.icon} text-lg`}></i>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-white truncate">{t.name}</p>
                                                    <p className="text-[11px] text-slate-400 line-clamp-1">{t.desc}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={creating}
                                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !projectName.trim()}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white transition shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <i className="ri-loader-4-line animate-spin text-sm"></i>
                                            <span>Creating Workspace...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-rocket-line text-sm"></i>
                                            <span>Launch Workspace</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================= DELETE CONFIRMATION MODAL ================= */}
            {deleteModalProject && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget && !deleting) setDeleteModalProject(null)
                    }}
                >
                    <div className="w-full max-w-md rounded-3xl border border-red-500/20 bg-slate-950 p-6 shadow-2xl relative overflow-hidden">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                            <i className="ri-delete-bin-line text-2xl"></i>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Delete Workspace?</h3>
                        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                            Are you sure you want to delete <span className="font-semibold text-white">"{deleteModalProject.name}"</span>? All files, configurations, and conversation logs will be permanently deleted.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <button
                                onClick={() => setDeleteModalProject(null)}
                                disabled={deleting}
                                className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteProject}
                                disabled={deleting}
                                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition shadow-lg shadow-red-600/30 flex items-center gap-2 cursor-pointer"
                            >
                                {deleting ? (
                                    <>
                                        <i className="ri-loader-4-line animate-spin text-sm"></i>
                                        <span>Deleting...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-delete-bin-line text-sm"></i>
                                        <span>Delete Workspace</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Home