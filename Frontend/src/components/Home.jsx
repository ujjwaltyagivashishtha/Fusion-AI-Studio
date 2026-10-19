import { useEffect, useState, useContext } from 'react'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import SettingsModal from './SettingsModal'
import HomeHeader from './home/HomeHeader'
import HomeBanner from './home/HomeBanner'
import HomeControls from './home/HomeControls'
import HomeProjectList from './home/HomeProjectList'
import HomeTemplateDiscovery from './home/HomeTemplateDiscovery'
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

  const handleOpenCreateModal = (templateId = 'node-express') => {
    setSelectedTemplate(templateId)
    setIsModalOpen(true)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n' && !isModalOpen) {
        e.preventDefault()
        handleOpenCreateModal('node-express')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  return (
    <div className="min-h-screen bg-app text-primary flex flex-col transition-colors duration-150">
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-grow w-full">
        <HomeBanner
          onOpenCreateModal={handleOpenCreateModal}
        />

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-rose-300 text-xs animate-slideDown shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <i className="ri-error-warning-line text-sm shrink-0 text-rose-400" />
              <span className="font-medium">{error}</span>
            </div>
            <button
              onClick={() => setError('')}
              aria-label="Dismiss error"
              className="hover:text-rose-200 transition cursor-pointer p-0.5"
            >
              <i className="ri-close-line text-sm" />
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
            onOpenCreateModal={handleOpenCreateModal}
            onNavigate={(p) => navigate(`/project/${p._id}`, { state: { project: p } })}
            onDelete={setDeleteModalProject}
          />
        </section>

        <HomeTemplateDiscovery
          onOpenCreateModal={handleOpenCreateModal}
        />
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