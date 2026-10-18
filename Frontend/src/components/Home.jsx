import { useEffect, useState, useContext } from 'react'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import SettingsModal from './SettingsModal'
import HomeHeader from './home/HomeHeader'
import HomeBanner from './home/HomeBanner'
import HomeControls from './home/HomeControls'
import HomeProjectList from './home/HomeProjectList'
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
  const [viewMode, setViewMode] = useState('grid')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await axios.get('/projects/all')
      setProjects(res.data.projects || [])
    } catch (err) {
      console.error('Fetch projects error:', err)
      setError(err.response?.data?.message || 'Unable to load workspaces.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    axios.get('/projects/all')
      .then((res) => {
        if (isMounted) setProjects(res.data.projects || [])
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || 'Unable to load workspaces.')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

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
      setError(err.response?.data?.message || 'Could not initialize workspace.')
    } finally {
      setCreating(false)
    }
  }

  const confirmDeleteProject = async () => {
    if (!deleteModalProject) return
    try {
      setDeleting(true)
      await axios.delete(`/projects/${deleteModalProject._id}`)
      setDeleteModalProject(null)
      fetchProjects()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete workspace.')
    } finally {
      setDeleting(false)
    }
  }

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

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesTemplate =
      selectedFilterTemplate === 'all' || p.template === selectedFilterTemplate
    return matchesSearch && matchesTemplate
  })

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

          <HomeProjectList
            loading={loading}
            filteredProjects={filteredProjects}
            viewMode={viewMode}
            searchQuery={searchQuery}
            selectedFilterTemplate={selectedFilterTemplate}
            onOpenCreateModal={() => setIsModalOpen(true)}
            onNavigate={(p) => navigate(`/project/${p._id}`, { state: { project: p } })}
            onDelete={setDeleteModalProject}
          />
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