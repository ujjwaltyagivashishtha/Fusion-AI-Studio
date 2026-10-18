import { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import CodeEditor from './CodeEditor.jsx'
import CommandPalette from './CommandPalette.jsx'
import ToastContainer from './Toast.jsx'
import SettingsModal from './SettingsModal.jsx'
import { sendMessage } from '../config/socket.js'
import { generatePreviewDoc } from '../utils/workspaceConstants'
import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket'
import { useTerminal } from '../hooks/useTerminal'
import { useWorkspaceFiles } from '../hooks/useWorkspaceFiles'
import WorkspaceTopbar from './project/WorkspaceTopbar'
import ActivityBar from './project/ActivityBar'
import SidebarExplorer from './project/SidebarExplorer'
import SidebarSearch from './project/SidebarSearch'
import SidebarGit from './project/SidebarGit'
import EditorTabsBar from './project/EditorTabsBar'
import LivePreviewFrame from './project/LivePreviewFrame'
import BottomDrawer from './project/BottomDrawer'
import CopilotPanel from './project/CopilotPanel'
import TeamChatPanel from './project/TeamChatPanel'
import InviteModal from './project/InviteModal'
import DetailsModal from './project/DetailsModal'
import RenameModal from './project/RenameModal'

const Project = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { id: routeProjectId } = useParams()
  const { user } = useContext(UserContext)

  const initialProject = location.state?.project || { name: 'Cloud Workspace', users: [user?.email || 'User'] }
  const [project, setProject] = useState(initialProject)
  const targetProjectId = routeProjectId || location.state?.project?._id || project._id

  // Activity & Layout
  const [activeActivityTab, setActiveActivityTab] = useState('explorer')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [rightPanelWidth, setRightPanelWidth] = useState(360)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [rightPanelTab, setRightPanelTab] = useState('copilot')
  const [bottomTab, setBottomTab] = useState('terminal')
  const [bottomDrawerHeight, setBottomDrawerHeight] = useState(220)
  const [isSplitPreview, setIsSplitPreview] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)

  // Search in files
  const [searchInFilesQuery, setSearchInFilesQuery] = useState('')

  // Editor Settings
  const [editorSettings, setEditorSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('fusion_editor_settings')
      if (saved) return JSON.parse(saved)
    } catch {
      // Fallback
    }
    return { fontSize: 13, tabSize: 2, wordWrap: true, showMinimap: true }
  })

  // Toasts
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // Workspace Files Hook
  const {
    files,
    setFiles,
    openFiles,
    setOpenFiles,
    activeFile,
    setActiveFile,
    fileFilter,
    setFileFilter,
    isCreatingFile,
    setIsCreatingFile,
    newFileName,
    setNewFileName,
    saveStatus,
    setSaveStatus,
    saveFilesToBackend,
    handleSelectFile,
    handleCloseTab,
    handleCreateFile,
    handleDeleteFile,
    handleContentChange,
    handleApplyAiCode,
    handleCreateAiFile
  } = useWorkspaceFiles({ targetProjectId, socketConnected: false, addToast })

  // Modals & Users
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [newProjectNameInput, setNewProjectNameInput] = useState('')
  const [selectedUserId, setSelectedUserId] = useState([])
  const [users, setUsers] = useState([])
  const [collaborators, setCollaborators] = useState([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [fetchingUsers, setFetchingUsers] = useState(false)
  const [submittingUsers, setSubmittingUsers] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Terminal & Console Logs
  const [consoleLogs, setConsoleLogs] = useState([])

  // Export Project Bundle
  const handleExportProject = useCallback(() => {
    const bundle = {
      name: project.name,
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      files
    }
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name.replace(/\s+/g, '_')}_workspace.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Exported workspace bundle (.json)!', 'success')
  }, [project.name, files, addToast])

  // Interactive Terminal Hook
  const {
    terminalHistory,
    setTerminalHistory,
    terminalInput,
    setTerminalInput,
    terminalEndRef,
    handleTerminalCommand
  } = useTerminal({
    files,
    setFiles,
    openFiles,
    setOpenFiles,
    activeFile,
    setActiveFile,
    saveFilesToBackend,
    saveStatus,
    handleExportProject,
    setBottomTab
  })

  // Real-time Socket Hook
  const {
    socketConnected,
    onlineUsers,
    teamMessages,
    setTeamMessages,
    unreadTeamCount,
    setUnreadTeamCount
  } = useWorkspaceSocket({
    targetProjectId,
    user,
    rightPanelTab,
    addToast,
    setFiles,
    setOpenFiles,
    setTerminalHistory
  })

  // AI Copilot state
  const [prompt, setPrompt] = useState('')
  const [aiMode, setAiMode] = useState('copilot')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: `👋 **Fusion AI Copilot** is ready!\n\nI have indexed your workspace files. Choose an assistance mode (**Auto**, **Refactor**, **Debug**, or **Tests**) or prompt me directly below.`
    }
  ])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, teamMessages, rightPanelTab])

  // Run Code & Rebuild Preview
  const handleRunCode = useCallback(() => {
    setPreviewKey((prev) => prev + 1)
    if (!isSplitPreview) {
      setBottomTab('preview')
    }
    setTerminalHistory((prev) => [
      ...prev,
      `$ npm run build`,
      `> vite build --mode development`,
      `✓ Compiled in 14ms. Web container updated and running.`
    ])
    addToast('Container preview refreshed!', 'success')
  }, [isSplitPreview, addToast, setTerminalHistory])

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsCommandPaletteOpen((prev) => !prev)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveFilesToBackend(files)
        addToast('All workspace files saved to cloud!', 'success')
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRunCode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [files, saveFilesToBackend, addToast, handleRunCode])

  // Project details & backend files loader
  useEffect(() => {
    if (!targetProjectId) return

    axios.get(`/projects/get-project/${targetProjectId}`)
      .then((res) => {
        if (res.data.project) {
          setProject(res.data.project)
          setCollaborators(res.data.project.users || [])
          setNewProjectNameInput(res.data.project.name || '')
          if (res.data.project.messages && Array.isArray(res.data.project.messages)) {
            setTeamMessages(
              res.data.project.messages.map((m, idx) => {
                const senderId = m.sender?._id || m.sender
                const isSelf = senderId === user?._id || m.sender?.email === user?.email
                return {
                  id: m._id || `history-${idx}`,
                  sender: isSelf ? 'user' : 'collaborator',
                  senderName: isSelf
                    ? 'You'
                    : m.senderName || (typeof m.sender === 'object' ? m.sender?.email?.split('@')[0] : 'Collaborator'),
                  text: m.text,
                  timestamp: m.timestamp || new Date().toISOString()
                }
              })
            )
          }
        }
      })
      .catch((err) => console.error('Error fetching project details:', err))

    axios.get(`/projects/${targetProjectId}/files`)
      .then((res) => {
        if (res.data?.files && Object.keys(res.data.files).length > 0) {
          setFiles(res.data.files)
          const keys = Object.keys(res.data.files)
          setActiveFile((prevActive) => (!keys.includes(prevActive) ? (keys[0] || 'app.js') : prevActive))
          setOpenFiles((prev) => {
            const valid = prev.filter((f) => keys.includes(f))
            return valid.length > 0 ? valid : [keys[0] || 'app.js']
          })
          setSaveStatus('saved')
        }
      })
      .catch((err) => console.warn('Could not load backend files:', err.message))

    axios.get('/users/all')
      .then((res) => setUsers(res.data.users || []))
      .catch((err) => console.error('Error fetching registered users:', err))
  }, [targetProjectId, user?._id, user?.email, setFiles, setActiveFile, setOpenFiles, setSaveStatus, setTeamMessages])

  // Capture preview iframe console logs
  useEffect(() => {
    const handleFrameMessage = (e) => {
      if (e.data?.type === 'PREVIEW_CONSOLE') {
        const timestamp = new Date().toLocaleTimeString()
        setConsoleLogs((prev) => [
          ...prev.slice(-99),
          { level: e.data.level || 'log', message: e.data.message || '', time: timestamp }
        ])
        if (e.data.level === 'error') {
          setTerminalHistory((prev) => [...prev, `[PREVIEW-ERROR] ${e.data.message}`])
        }
      }
    }
    window.addEventListener('message', handleFrameMessage)
    return () => window.removeEventListener('message', handleFrameMessage)
  }, [setTerminalHistory])

  // Mouse Dragging Resizers
  const isDraggingSidebar = useRef(false)
  const isDraggingRightPanel = useRef(false)
  const isDraggingBottomDrawer = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSidebar.current) {
        setSidebarWidth(Math.max(180, Math.min(e.clientX - 48, 480)))
      }
      if (isDraggingRightPanel.current) {
        setRightPanelWidth(Math.max(280, Math.min(window.innerWidth - e.clientX, 650)))
      }
      if (isDraggingBottomDrawer.current) {
        setBottomDrawerHeight(Math.max(120, Math.min(window.innerHeight - e.clientY, 500)))
      }
    }

    const handleMouseUp = () => {
      isDraggingSidebar.current = false
      isDraggingRightPanel.current = false
      isDraggingBottomDrawer.current = false
      document.body.style.cursor = 'default'
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Collaborator Modal Handlers
  const handleOpenInviteModal = () => {
    setSelectedUserId([])
    setIsModalOpen(true)
    setFetchingUsers(true)
    axios.get('/users/all')
      .then((res) => setUsers(res.data.users || []))
      .catch((err) => console.error(err))
      .finally(() => setFetchingUsers(false))
  }

  const handleAddCollaborators = async () => {
    if (!selectedUserId.length) {
      addToast('Please select at least one user to add', 'error')
      return
    }
    const currentId = project._id || targetProjectId
    try {
      setSubmittingUsers(true)
      const res = await axios.put('/projects/add-user', { projectId: currentId, users: selectedUserId })
      if (res.data?.project) {
        setProject(res.data.project)
        setCollaborators(res.data.project.users || [])
      }
      addToast(`Added ${selectedUserId.length} collaborator(s) successfully!`, 'success')
      setIsModalOpen(false)
      setSelectedUserId([])
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add collaborators', 'error')
    } finally {
      setSubmittingUsers(false)
    }
  }

  // Rename Workspace
  const handleRenameWorkspace = async (e) => {
    e?.preventDefault()
    if (!newProjectNameInput.trim() || !targetProjectId) return
    try {
      const res = await axios.put(`/projects/${targetProjectId}`, { name: newProjectNameInput.trim() })
      if (res.data?.project) {
        setProject((prev) => ({ ...prev, name: res.data.project.name }))
        addToast('Workspace renamed successfully!', 'success')
        setIsRenameModalOpen(false)
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to rename workspace', 'error')
    }
  }

  // Send Prompt / Chat Message
  const handleSendPrompt = async (e) => {
    e?.preventDefault()
    if (!prompt.trim() || (rightPanelTab === 'copilot' && aiLoading)) return

    const userMsg = prompt.trim()
    const currentId = project._id || targetProjectId
    setPrompt('')

    if (rightPanelTab === 'chat') {
      setTeamMessages((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), sender: 'user', senderName: 'You', text: userMsg, timestamp: new Date().toISOString() }
      ])
      if (currentId) {
        sendMessage('project-message', { message: userMsg, sender: user, projectId: currentId })
      }
      return
    }

    setAiMessages((prev) => [...prev, { sender: 'user', text: userMsg }])
    setAiLoading(true)

    try {
      const res = await axios.post('/ai/prompt', {
        prompt: userMsg,
        activeFile,
        fileContent: files[activeFile] || '',
        mode: aiMode,
        files,
        history: aiMessages.slice(-6)
      })
      const data = res.data
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'AI recommendation completed.',
          suggestedCode: data.suggestedCode || null,
          targetFile: data.targetFile || null,
          action: data.action || 'explain'
        }
      ])
      setTerminalHistory((prev) => [
        ...prev,
        data.suggestedCode
          ? `[AI-LOG] Generated patch for ${data.targetFile || activeFile} (${data.source || 'gemini'})`
          : `[AI-LOG] Completed query response (${data.source || 'gemini'})`
      ])
    } catch (err) {
      const errMsg = err.response?.data?.message || 'AI assistant encountered an error.'
      setAiMessages((prev) => [...prev, { sender: 'ai', text: `⚠️ **AI Service Error**: ${errMsg}` }])
      addToast('AI prompt failed', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  // Filtered files & search results
  const filteredFiles = Object.keys(files).filter((f) => f.toLowerCase().includes(fileFilter.toLowerCase()))

  const searchInFilesResults = useMemo(() => {
    if (!searchInFilesQuery.trim()) return []
    const q = searchInFilesQuery.toLowerCase()
    const results = []
    for (const [name, content] of Object.entries(files)) {
      content.split('\n').forEach((line, idx) => {
        if (line.toLowerCase().includes(q)) {
          results.push({ file: name, lineNum: idx + 1, content: line.trim() })
        }
      })
    }
    return results
  }, [searchInFilesQuery, files])

  const combinedPreviewDoc = useMemo(() => generatePreviewDoc(files), [files])

  return (
    <div className="h-screen w-screen overflow-hidden bg-app text-primary flex flex-col select-none transition-colors duration-150">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        editorSettings={editorSettings}
        onUpdateEditorSettings={setEditorSettings}
        user={user}
        onLogout={() => {
          localStorage.removeItem('token')
          navigate('/login')
        }}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        onSelectFile={handleSelectFile}
        onRunCode={handleRunCode}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      <WorkspaceTopbar
        projectName={project.name}
        onOpenRenameModal={() => setIsRenameModalOpen(true)}
        saveStatus={saveStatus}
        onSave={() => {
          saveFilesToBackend(files)
          addToast('All workspace files saved to cloud!', 'success')
        }}
        onRunCode={handleRunCode}
        isSplitPreview={isSplitPreview}
        onToggleSplitPreview={() => setIsSplitPreview(!isSplitPreview)}
        onOpenInviteModal={handleOpenInviteModal}
        onOpenDetailsModal={() => setIsDetailsModalOpen(true)}
        onExportProject={handleExportProject}
        onlineUsers={onlineUsers}
        collaborators={collaborators}
        socketConnected={socketConnected}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onNavigateHome={() => navigate('/')}
        user={user}
      />

      {/* Main Studio Body */}
      <div className="flex-grow flex overflow-hidden relative">
        <ActivityBar
          activeActivityTab={activeActivityTab}
          setActiveActivityTab={setActiveActivityTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          bottomTab={bottomTab}
          setBottomTab={setBottomTab}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* Sidebar Panel */}
        {isSidebarOpen && (
          <div
            className="border-r border-default bg-sidebar flex flex-col shrink-0 overflow-hidden"
            style={{ width: `${sidebarWidth}px` }}
          >
            {activeActivityTab === 'explorer' && (
              <SidebarExplorer
                files={files}
                filteredFiles={filteredFiles}
                activeFile={activeFile}
                onSelectFile={handleSelectFile}
                fileFilter={fileFilter}
                setFileFilter={setFileFilter}
                isCreatingFile={isCreatingFile}
                setIsCreatingFile={setIsCreatingFile}
                newFileName={newFileName}
                setNewFileName={setNewFileName}
                onCreateFile={handleCreateFile}
                onDeleteFile={handleDeleteFile}
              />
            )}
            {activeActivityTab === 'search' && (
              <SidebarSearch
                searchInFilesQuery={searchInFilesQuery}
                setSearchInFilesQuery={setSearchInFilesQuery}
                searchInFilesResults={searchInFilesResults}
                onSelectFile={handleSelectFile}
              />
            )}
            {activeActivityTab === 'git' && (
              <SidebarGit
                files={files}
                saveStatus={saveStatus}
                onCommitPush={(msg) => addToast(`Committed to main: "${msg}"`, 'success')}
              />
            )}
          </div>
        )}

        {/* Sidebar Resizer */}
        {isSidebarOpen && (
          <div
            className="resizer-h"
            onMouseDown={() => {
              isDraggingSidebar.current = true
              document.body.style.cursor = 'col-resize'
            }}
          />
        )}

        {/* Center Canvas */}
        <div className="flex-grow flex flex-col min-w-0 overflow-hidden relative">
          <EditorTabsBar
            openFiles={openFiles}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            onCloseTab={handleCloseTab}
            onAddNewFile={() => setIsCreatingFile(true)}
          />

          <div className="flex-grow flex min-h-0 overflow-hidden relative">
            <CodeEditor
              value={files[activeFile] || ''}
              onChange={handleContentChange}
              fileName={activeFile}
              onCopy={() => addToast('Code copied to clipboard!', 'info')}
              collaborators={collaborators}
              fontSize={editorSettings.fontSize}
              wordWrap={editorSettings.wordWrap}
              tabSize={editorSettings.tabSize}
              showMinimap={editorSettings.showMinimap}
            />

            {isSplitPreview && (
              <LivePreviewFrame
                previewDoc={combinedPreviewDoc}
                previewKey={previewKey}
                onRefresh={() => setPreviewKey((k) => k + 1)}
              />
            )}
          </div>

          {/* Bottom Drawer Resizer */}
          {bottomTab !== 'hidden' && (
            <div
              className="resizer-v"
              onMouseDown={() => {
                isDraggingBottomDrawer.current = true
                document.body.style.cursor = 'row-resize'
              }}
            />
          )}

          <BottomDrawer
            bottomTab={bottomTab}
            setBottomTab={setBottomTab}
            bottomDrawerHeight={bottomDrawerHeight}
            terminalHistory={terminalHistory}
            terminalInput={terminalInput}
            setTerminalInput={setTerminalInput}
            onTerminalSubmit={handleTerminalCommand}
            terminalEndRef={terminalEndRef}
            consoleLogs={consoleLogs}
            onClearConsole={() => setConsoleLogs([])}
            previewDoc={combinedPreviewDoc}
            previewKey={previewKey}
            onRefreshPreview={() => setPreviewKey((k) => k + 1)}
          />
        </div>

        {/* Right Panel Resizer */}
        {isRightPanelOpen && (
          <div
            className="resizer-h"
            onMouseDown={() => {
              isDraggingRightPanel.current = true
              document.body.style.cursor = 'col-resize'
            }}
          />
        )}

        {/* Right Panel: Copilot & Team Chat */}
        {isRightPanelOpen && (
          <aside
            className="border-l border-default bg-sidebar flex flex-col shrink-0 overflow-hidden"
            style={{ width: `${rightPanelWidth}px` }}
          >
            {/* Panel Tabs Header */}
            <div className="h-9 border-b border-default bg-surface/75 px-3 flex items-center justify-between text-xs text-secondary shrink-0 select-none">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setRightPanelTab('copilot')}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                    rightPanelTab === 'copilot'
                      ? 'btn-primary text-white shadow-sm'
                      : 'text-muted hover:text-primary hover:bg-surface-hover'
                  }`}
                >
                  <i className="ri-sparkling-fill text-xs" />
                  <span>AI Copilot</span>
                </button>
                <button
                  onClick={() => {
                    setRightPanelTab('chat')
                    setUnreadTeamCount(0)
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer relative ${
                    rightPanelTab === 'chat'
                      ? 'btn-primary text-white shadow-sm'
                      : 'text-muted hover:text-primary hover:bg-surface-hover'
                  }`}
                >
                  <i className="ri-chat-1-line text-xs" />
                  <span>Team Chat</span>
                  {unreadTeamCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                </button>
              </div>

              <button
                onClick={() => setIsRightPanelOpen(false)}
                className="p-1 rounded text-muted hover:text-primary transition cursor-pointer"
                title="Collapse Panel"
              >
                <i className="ri-layout-right-line text-xs" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-grow overflow-hidden">
              {rightPanelTab === 'copilot' ? (
                <CopilotPanel
                  aiMode={aiMode}
                  setAiMode={setAiMode}
                  aiMessages={aiMessages}
                  aiLoading={aiLoading}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSendPrompt={handleSendPrompt}
                  onApplyAiCode={handleApplyAiCode}
                  onCreateAiFile={handleCreateAiFile}
                  activeFile={activeFile}
                  messagesEndRef={messagesEndRef}
                  addToast={addToast}
                />
              ) : (
                <TeamChatPanel
                  teamMessages={teamMessages}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  onSendMessage={handleSendPrompt}
                  messagesEndRef={messagesEndRef}
                />
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Modals */}
      <InviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        collaborators={collaborators}
        selectedUserId={selectedUserId}
        onUserClick={(id) => setSelectedUserId((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))}
        userSearchQuery={userSearchQuery}
        setUserSearchQuery={setUserSearchQuery}
        fetchingUsers={fetchingUsers}
        submittingUsers={submittingUsers}
        onAddCollaborators={handleAddCollaborators}
      />

      <DetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        project={project}
        filesCount={Object.keys(files).length}
        collaboratorsCount={collaborators.length}
      />

      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        projectNameInput={newProjectNameInput}
        setProjectNameInput={setNewProjectNameInput}
        onRename={handleRenameWorkspace}
      />
    </div>
  )
}

export default Project
