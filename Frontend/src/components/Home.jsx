import { useEffect, useState, useContext } from 'react'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import SettingsModal from './SettingsModal'
import HomeHeader from './home/HomeHeader'
import HomeBanner from './home/HomeBanner'
import HomeControls from './home/HomeControls'
import ProjectGridCard from './home/ProjectGridCard'
import ProjectListCard from './home/ProjectListCard'
import CreateProjectModal from './home/CreateProjectModal'
import DeleteProjectModal from './home/DeleteProjectModal'

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
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      <HomeHeader
        user={user}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full relative z-10">
        <HomeBanner
          user={user}
          projectsCount={projects.length}
          totalCollaborators={totalCollaborators}
          onOpenCreateModal={() => setIsModalOpen(true)}
        />

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

        <section>
          <HomeControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedFilterTemplate={selectedFilterTemplate}
            setSelectedFilterTemplate={setSelectedFilterTemplate}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

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

          {!loading && filteredProjects.length > 0 && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProjects.map((project) => (
                <ProjectGridCard
                  key={project._id}
                  project={project}
                  onNavigate={(p) => navigate(`/project/${p._id}`, { state: { project: p } })}
                  onDelete={setDeleteModalProject}
                />
              ))}
            </div>
          )}

          {!loading && filteredProjects.length > 0 && viewMode === 'list' && (
            <div className="space-y-3">
              {filteredProjects.map((project) => (
                <ProjectListCard
                  key={project._id}
                  project={project}
                  onNavigate={(p) => navigate(`/project/${p._id}`, { state: { project: p } })}
                  onDelete={setDeleteModalProject}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={createProject}
        projectName={projectName}
        setProjectName={setProjectName}
        projectDesc={projectDesc}
        setProjectDesc={setProjectDesc}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
        creating={creating}
      />

      <DeleteProjectModal
        project={deleteModalProject}
        onClose={() => setDeleteModalProject(null)}
        onConfirm={confirmDeleteProject}
        deleting={deleting}
      />
    </div>
  )
}

export default Home