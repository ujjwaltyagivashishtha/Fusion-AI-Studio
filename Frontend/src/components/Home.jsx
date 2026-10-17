import { useEffect, useState, useContext } from 'react'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import ThemeToggle from './ThemeToggle'
import SettingsModal from './SettingsModal'

const TEMPLATE_OPTIONS = [
  {
    id: 'node-express',
    name: 'Node.js Express API',
    icon: 'ri-nodejs-line',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    desc: 'Express microservice with live container preview'
  },
  {
    id: 'react-vite',
    name: 'React + Vite Application',
    icon: 'ri-reactjs-line',
    badgeColor: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    desc: 'Modern React web application with lightning HMR'
  },
  {
    id: 'python-flask',
    name: 'Python Flask API',
    icon: 'ri-code-s-slash-line',
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    desc: 'Lightweight Python microservice with REST endpoints'
  },
  {
    id: 'vanilla-web',
    name: 'Vanilla Canvas & Web',
    icon: 'ri-html5-line',
    badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
    desc: 'HTML5, modern CSS3, and JavaScript live canvas'
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
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const Home = () => {
  const { user, setUser } = useContext(UserContext)
  const navigate = useNavigate()

  // Creation Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDesc, setProjectDesc] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('node-express')
  const [creating, setCreating] = useState(false)

  // Project List state
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Deletion Modal state
  const [deleteModalProject, setDeleteModalProject] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Filter, View, & Settings state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilterTemplate, setSelectedFilterTemplate] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Fetch all projects
  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await axios.get('/projects/all')
      setProjects(res.data.projects || [])
    } catch (err) {
      console.error('Fetch projects error:', err)
      setError(
        err.response?.data?.message ||
        'Unable to load workspaces. Please refresh the page or verify your session.'
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
          console.error('Fetch projects error:', err)
          setError(
            err.response?.data?.message ||
            'Unable to load workspaces. Please refresh the page or verify your session.'
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

      if (res.data?.project) {
        setIsModalOpen(false)
        setProjectName('')
        setProjectDesc('')
        setSelectedTemplate('node-express')
        navigate(`/project/${res.data.project._id}`, {
          state: { project: res.data.project }
        })
      }
    } catch (err) {
      console.error('Create project error:', err)
      setError(
        err.response?.data?.message ||
        'Could not initialize workspace. Please ensure project name is valid.'
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
      setDeleteModalProject(null)
      fetchProjects()
    } catch (err) {
      console.error('Delete project error:', err)
      setError(err.response?.data?.message || 'Could not delete workspace.')
    } finally {
      setDeleting(false)
    }
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      await axios.get('/users/logout')
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token')
      setUser(null)
      navigate('/login')
    }
  }

  const closeModal = () => {
    if (creating) return
    setIsModalOpen(false)
    setProjectName('')
    setProjectDesc('')
    setSelectedTemplate('node-express')
  }

  // Filter projects by search query and template
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTemplate =
      selectedFilterTemplate === 'all' || p.template === selectedFilterTemplate
    return matchesSearch && matchesTemplate
  })

  // Total collaborators
  const totalCollaborators = projects.reduce((acc, curr) => acc + (curr.users?.length || 0), 0)

  return (
    <div className="min-h-screen bg-app cosmic-grid-bg ambient-glow-bg text-primary flex flex-col transition-colors duration-200 relative">
      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* ================= 1. APPLICATION HEADER ================= */}
      <header className="sticky top-0 z-40 border-b border-default bg-surface/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            {/* Logo & Product Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
                <i className="ri-cpu-line text-xl" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-tight font-display text-primary">
                    Fusion <span className="text-gradient-brand">AI Studio</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-[10px] font-semibold text-indigo-400 backdrop-blur-sm">
                    Cloud IDE
                  </span>
                </div>
                <p className="text-[11px] text-muted font-medium tracking-wide">Workspaces Dashboard</p>
              </div>
            </div>

            {/* Actions: Theme Toggle, Settings, User Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />

              <button
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Open Studio Preferences"
                title="Studio Preferences"
                className="w-9 h-9 rounded-xl border border-default bg-surface/70 hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer shadow-sm"
              >
                <i className="ri-settings-4-line text-sm" />
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-expanded={userMenuOpen}
                  aria-label="User profile menu"
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-default bg-surface/70 hover:bg-surface-hover transition cursor-pointer shadow-sm"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-semibold text-primary">
                      {user?.email ? user.email.split('@')[0] : 'Developer'}
                    </p>
                    <p className="text-[10px] text-muted font-mono truncate max-w-[120px]">
                      {user?.email || 'Logged In'}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {user?.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                  <i className="ri-arrow-down-s-line text-muted text-xs" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-default glass-panel shadow-2xl p-1.5 z-50 animate-slideDown">
                    <div className="px-3 py-2 border-b border-default mb-1">
                      <p className="text-[10px] text-muted uppercase font-bold tracking-wider">Signed In As</p>
                      <p className="text-xs font-semibold text-primary truncate mt-0.5">{user?.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        setIsSettingsOpen(true)
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-secondary hover:bg-surface-hover hover:text-primary flex items-center gap-2 transition cursor-pointer"
                    >
                      <i className="ri-settings-4-line text-sm text-indigo-400" />
                      <span>Studio Preferences</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition cursor-pointer mt-0.5"
                    >
                      <i className="ri-logout-box-r-line text-sm" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= 2. MAIN DASHBOARD CONTENT ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full relative z-10">
        {/* Banner Section */}
        <section className="mb-8">
          <div className="rounded-3xl glass-panel p-6 sm:p-8 shadow-xl relative overflow-hidden">
            {/* Ambient radiant highlight orb */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/15 to-violet-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-xs font-semibold text-indigo-400 mb-3.5 backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  WORKSPACE OVERVIEW
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display text-gradient-cosmic">
                  Welcome back,{' '}
                  <span className="text-gradient-brand">
                    {user?.email ? user.email.split('@')[0] : 'Developer'}
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-secondary mt-2 max-w-xl leading-relaxed">
                  Scaffold, edit, and orchestrate cloud developer projects. Prompt the integrated AI Copilot for architecture advice, test suites, and real-time code generation.
                </p>
              </div>

              {/* Create Project Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl btn-primary font-semibold text-xs tracking-wide transition shadow-lg shrink-0 cursor-pointer"
              >
                <i className="ri-add-line text-base" />
                <span>Create Workspace</span>
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-default relative z-10">
              <div className="flex items-center gap-3.5 p-3 rounded-2xl glass-card">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
                  <i className="ri-folder-code-line text-lg" />
                </div>
                <div>
                  <p className="text-[11px] text-muted font-medium">Workspaces</p>
                  <p className="text-base font-bold text-primary">{projects.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl glass-card">
                <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400 shrink-0">
                  <i className="ri-team-line text-lg" />
                </div>
                <div>
                  <p className="text-[11px] text-muted font-medium">Collaborators</p>
                  <p className="text-base font-bold text-primary">{totalCollaborators}</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-2xl glass-card col-span-2 sm:col-span-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shrink-0">
                  <i className="ri-sparkling-fill text-lg" />
                </div>
                <div>
                  <p className="text-[11px] text-muted font-medium">AI Copilot Engine</p>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online & Ready
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error Notification Banner */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-xs animate-slideDown backdrop-blur-md"
          >
            <div className="flex items-center gap-2.5">
              <i className="ri-error-warning-line text-base shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              aria-label="Dismiss error"
              className="hover:text-red-300 transition cursor-pointer p-1"
            >
              <i className="ri-close-line text-base" />
            </button>
          </div>
        )}

        {/* ================= 3. WORKSPACES BROWSER & CONTROLS ================= */}
        <section>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces by name or keywords..."
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-default bg-input/70 backdrop-blur-md text-primary placeholder-muted text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition font-sans shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer text-xs"
                >
                  <i className="ri-close-circle-fill" />
                </button>
              )}
            </div>

            {/* Template Filters & Grid/List View Toggle */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex items-center p-1 rounded-xl border border-default bg-surface/70 backdrop-blur-md text-xs">
                <button
                  onClick={() => setSelectedFilterTemplate('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFilterTemplate === 'all'
                      ? 'btn-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilterTemplate('node-express')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFilterTemplate === 'node-express'
                      ? 'btn-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  Node
                </button>
                <button
                  onClick={() => setSelectedFilterTemplate('react-vite')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFilterTemplate === 'react-vite'
                      ? 'btn-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  React
                </button>
              </div>

              <div className="flex items-center p-1 rounded-xl border border-default bg-surface/70 backdrop-blur-md text-muted">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid View"
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                    viewMode === 'grid' ? 'bg-surface-hover text-primary shadow-sm' : 'hover:text-primary'
                  }`}
                >
                  <i className="ri-grid-fill" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List View"
                  className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                    viewMode === 'list' ? 'bg-surface-hover text-primary shadow-sm' : 'hover:text-primary'
                  }`}
                >
                  <i className="ri-list-check-2" />
                </button>
              </div>
            </div>
          </div>

          {/* Skeleton Loading State */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-48 rounded-2xl glass-card p-5 animate-pulse flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-hover" />
                    <div className="space-y-2 flex-grow">
                      <div className="h-4 bg-surface-hover rounded w-3/4" />
                      <div className="h-3 bg-surface-hover rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-3 bg-surface-hover rounded w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProjects.length === 0 && (
            <div className="rounded-3xl border border-dashed border-default glass-panel py-16 px-6 text-center shadow-lg">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                <i className="ri-folder-add-line text-2xl" />
              </div>
              <h2 className="text-base font-bold text-primary font-display">
                {searchQuery || selectedFilterTemplate !== 'all'
                  ? 'No matching workspaces found'
                  : 'No workspaces created yet'}
              </h2>
              <p className="text-xs text-muted mt-1.5 max-w-sm mx-auto leading-relaxed">
                {searchQuery || selectedFilterTemplate !== 'all'
                  ? 'Try adjusting your search keywords or resetting the template filter.'
                  : 'Launch your first AI-assisted project workspace to begin writing, editing, and running code.'}
              </p>
              {!searchQuery && selectedFilterTemplate === 'all' && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl btn-primary text-xs font-semibold text-white shadow-md transition cursor-pointer"
                >
                  <i className="ri-add-line text-sm" />
                  <span>Create First Workspace</span>
                </button>
              )}
            </div>
          )}

          {/* Project Grid View */}
          {!loading && filteredProjects.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => {
                const template =
                  TEMPLATE_OPTIONS.find((t) => t.id === project.template) || TEMPLATE_OPTIONS[0]

                return (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/project/${project._id}`, { state: { project } })}
                    className="group relative cursor-pointer rounded-2xl glass-card p-5.5 hover:border-indigo-500/50 hover:shadow-glow transition duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-3.5">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shadow-sm ${template.badgeColor}`}>
                          <i className={template.icon} />
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setDeleteModalProject(project)
                            }}
                            title="Delete Workspace"
                            aria-label={`Delete ${project.name}`}
                            className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                          >
                            <i className="ri-delete-bin-line text-sm" />
                          </button>
                          <span className="p-1.5 rounded-lg text-muted group-hover:text-indigo-400 transition">
                            <i className="ri-arrow-right-up-line text-sm" />
                          </span>
                        </div>
                      </div>

                      {/* Template Badge & Date */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md border border-default bg-surface/50 text-secondary">
                          {project.template || 'NODE'}
                        </span>
                        <span className="text-[11px] text-muted font-mono">
                          {formatRelativeTime(project.updatedAt || project.createdAt)}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-bold text-sm text-primary truncate group-hover:text-indigo-400 transition font-display">
                        {project.name}
                      </h3>
                      <p className="text-xs text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                        {project.description || 'Full-stack AI workspace environment'}
                      </p>
                    </div>

                    {/* Card Footer: Users & Launch CTA */}
                    <div className="mt-5 pt-3.5 border-t border-default flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {(project.users || []).slice(0, 3).map((u, idx) => (
                            <div
                              key={idx}
                              className="inline-block h-5 w-5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 border border-surface text-[9px] font-bold text-white flex items-center justify-center uppercase shadow-sm"
                              title={typeof u === 'string' ? u : u.email}
                            >
                              {(typeof u === 'string' ? u : u.email || 'U')[0]}
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] font-medium text-muted">
                          {project.users?.length || 1} {project.users?.length === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      <span className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 group-hover:translate-x-1 transition-all flex items-center gap-1">
                        Open Studio <i className="ri-arrow-right-line text-xs" />
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
                const template =
                  TEMPLATE_OPTIONS.find((t) => t.id === project.template) || TEMPLATE_OPTIONS[0]

                return (
                  <div
                    key={project._id}
                    onClick={() => navigate(`/project/${project._id}`, { state: { project } })}
                    className="group cursor-pointer rounded-2xl glass-card p-4 hover:border-indigo-500/50 hover:shadow-glow transition duration-150 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${template.badgeColor}`}>
                        <i className={template.icon} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xs sm:text-sm text-primary truncate group-hover:text-indigo-400 transition font-display">
                            {project.name}
                          </h3>
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-default bg-surface/50 text-secondary">
                            {project.template || 'NODE'}
                          </span>
                        </div>
                        <p className="text-xs text-muted truncate mt-0.5">
                          {project.description || 'Full-stack workspace'} • Updated {formatRelativeTime(project.updatedAt || project.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted hidden md:inline">
                        {project.users?.length || 1} Collaborators
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteModalProject(project)
                        }}
                        className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                        title="Delete Workspace"
                        aria-label="Delete Workspace"
                      >
                        <i className="ri-delete-bin-line text-sm" />
                      </button>
                      <button className="px-3.5 py-1.5 rounded-xl btn-primary text-xs font-semibold text-white transition flex items-center gap-1 cursor-pointer shadow-sm">
                        <span>Launch</span>
                        <i className="ri-arrow-right-line text-xs" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* ================= 4. CREATE PROJECT MODAL ================= */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-workspace-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-slideDown border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-default mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
                  <i className="ri-folder-add-line text-lg" />
                </div>
                <div>
                  <h2 id="create-workspace-title" className="text-base font-bold text-primary font-display">
                    Create New Workspace
                  </h2>
                  <p className="text-xs text-muted">Select an architecture template to initialize your cloud IDE</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={creating}
                aria-label="Close modal"
                className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label htmlFor="projectName" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Workspace Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Real-Time Chat API"
                  autoFocus
                  required
                  disabled={creating}
                  className="w-full px-4 py-2.5 rounded-xl border border-default bg-input/80 text-primary placeholder-muted text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-sans shadow-inner"
                />
              </div>

              <div>
                <label htmlFor="projectDesc" className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
                  Description <span className="text-muted lowercase font-normal">(optional)</span>
                </label>
                <input
                  id="projectDesc"
                  type="text"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  placeholder="e.g. Microservice handling customer verification"
                  disabled={creating}
                  className="w-full px-4 py-2.5 rounded-xl border border-default bg-input/80 text-primary placeholder-muted text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-sans shadow-inner"
                />
              </div>

              {/* Starter Template Selection */}
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  Architecture Starter
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TEMPLATE_OPTIONS.map((t) => {
                    const isSelected = selectedTemplate === t.id
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/30 shadow-sm'
                            : 'border-default bg-surface/50 hover:border-strong hover:bg-surface-hover'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 text-sm ${t.badgeColor}`}>
                          <i className={t.icon} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-primary truncate">{t.name}</p>
                          <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{t.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-default">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="px-4 py-2.5 rounded-xl border border-default text-xs font-semibold text-secondary hover:bg-surface-hover transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !projectName.trim()}
                  className="px-5 py-2.5 rounded-xl btn-primary disabled:opacity-50 text-xs font-semibold text-white transition shadow-md cursor-pointer flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-sm" />
                      <span>Creating Workspace...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-rocket-line text-sm" />
                      <span>Launch Workspace</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= 5. DELETE CONFIRMATION MODAL ================= */}
      {deleteModalProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !deleting) setDeleteModalProject(null)
          }}
        >
          <div className="w-full max-w-md rounded-3xl border border-red-500/20 glass-panel p-6 shadow-2xl relative overflow-hidden animate-slideDown">
            <div className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mb-3.5">
              <i className="ri-delete-bin-line text-xl" />
            </div>
            <h2 id="delete-modal-title" className="text-base font-bold text-primary mb-1.5 font-display">
              Delete Workspace?
            </h2>
            <p className="text-xs text-secondary mb-5 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-primary font-semibold">"{deleteModalProject.name}"</strong>? All workspace code, configurations, and chat records will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setDeleteModalProject(null)}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl border border-default text-xs font-semibold text-secondary hover:bg-surface-hover transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProject}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                {deleting ? (
                  <>
                    <i className="ri-loader-4-line animate-spin text-sm" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <i className="ri-delete-bin-line text-sm" />
                    <span>Confirm Delete</span>
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