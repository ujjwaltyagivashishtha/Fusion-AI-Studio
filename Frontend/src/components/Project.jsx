import { useState, useContext, useMemo, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import ToastContainer from './Toast.jsx'
import { generatePreviewDoc } from '../utils/workspaceConstants'
import { useWorkspaceSocket } from '../hooks/useWorkspaceSocket'
import { useTerminal } from '../hooks/useTerminal'
import { useWorkspaceFiles } from '../hooks/useWorkspaceFiles'
import { usePanelResizers } from '../hooks/usePanelResizers'
import { useWorkspaceActions } from '../hooks/useWorkspaceActions'
import { useProjectLoader } from '../hooks/useProjectLoader'
import { useWorkspaceModalsState } from '../hooks/useWorkspaceModalsState'
import { useCopilotState } from '../hooks/useCopilotState'
import WorkspaceTopbar from './project/WorkspaceTopbar'
import ActivityBar from './project/ActivityBar'
import WorkspaceSidebar from './project/WorkspaceSidebar'
import WorkspaceCenterArea from './project/WorkspaceCenterArea'
import WorkspaceRightPanel from './project/WorkspaceRightPanel'
import WorkspaceModals from './project/WorkspaceModals'

const Project = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { id: routeProjectId } = useParams()
  const { user } = useContext(UserContext)

  const initialProject = location.state?.project || { name: 'Cloud Workspace', users: [user?.email || 'User'] }
  const [project, setProject] = useState(initialProject)
  const targetProjectId = routeProjectId || location.state?.project?._id || project._id

  const [activeActivityTab, setActiveActivityTab] = useState('explorer')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [rightPanelTab, setRightPanelTab] = useState('copilot')
  const [bottomTab, setBottomTab] = useState('terminal')
  const [isSplitPreview, setIsSplitPreview] = useState(false)
  const [previewKey, setPreviewKey] = useState(0)
  const [searchInFilesQuery, setSearchInFilesQuery] = useState('')

  const {
    sidebarWidth,
    rightPanelWidth,
    bottomDrawerHeight,
    startDraggingSidebar,
    startDraggingRightPanel,
    startDraggingBottomDrawer
  } = usePanelResizers()

  const [editorSettings, setEditorSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('fusion_editor_settings')
      if (saved) return JSON.parse(saved)
    } catch {
      // Fallback
    }
    return { fontSize: 13, tabSize: 2, wordWrap: true, showMinimap: true }
  })

  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])
  const dismissToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const filesManager = useWorkspaceFiles({ targetProjectId, socketConnected: false, addToast })
  const modalsState = useWorkspaceModalsState()
  const [collaborators, setCollaborators] = useState([])
  const [consoleLogs, setConsoleLogs] = useState([])

  const terminalManager = useTerminal({
    files: filesManager.files,
    setFiles: filesManager.setFiles,
    openFiles: filesManager.openFiles,
    setOpenFiles: filesManager.setOpenFiles,
    activeFile: filesManager.activeFile,
    setActiveFile: filesManager.setActiveFile,
    saveFilesToBackend: filesManager.saveFilesToBackend,
    saveStatus: filesManager.saveStatus,
    handleExportProject: () => {},
    setBottomTab
  })

  const socketManager = useWorkspaceSocket({
    targetProjectId,
    user,
    rightPanelTab,
    addToast,
    setFiles: filesManager.setFiles,
    setOpenFiles: filesManager.setOpenFiles,
    setTerminalHistory: terminalManager.setTerminalHistory
  })

  const copilotManager = useCopilotState({
    teamMessages: socketManager.teamMessages,
    rightPanelTab
  })

  const actions = useWorkspaceActions({
    project,
    setProject,
    targetProjectId,
    files: filesManager.files,
    saveFilesToBackend: filesManager.saveFilesToBackend,
    addToast,
    setPreviewKey,
    isSplitPreview,
    setBottomTab,
    terminalManager,
    modalsState,
    setCollaborators,
    rightPanelTab,
    copilotManager,
    socketManager,
    user,
    activeFile: filesManager.activeFile
  })

  useProjectLoader({
    targetProjectId,
    user,
    setProject,
    setCollaborators,
    setNewProjectNameInput: modalsState.setNewProjectNameInput,
    setTeamMessages: socketManager.setTeamMessages,
    setFiles: filesManager.setFiles,
    setActiveFile: filesManager.setActiveFile,
    setOpenFiles: filesManager.setOpenFiles,
    setSaveStatus: filesManager.setSaveStatus,
    setUsers: modalsState.setUsers,
    setTerminalHistory: terminalManager.setTerminalHistory,
    setConsoleLogs
  })

  const filteredFiles = Object.keys(filesManager.files).filter((f) =>
    f.toLowerCase().includes(filesManager.fileFilter.toLowerCase())
  )

  const searchInFilesResults = useMemo(() => {
    if (!searchInFilesQuery.trim()) return []
    const q = searchInFilesQuery.toLowerCase()
    const results = []
    for (const [name, content] of Object.entries(filesManager.files)) {
      content.split('\n').forEach((line, idx) => {
        if (line.toLowerCase().includes(q)) {
          results.push({ file: name, lineNum: idx + 1, content: line.trim() })
        }
      })
    }
    return results
  }, [searchInFilesQuery, filesManager.files])

  const combinedPreviewDoc = useMemo(() => generatePreviewDoc(filesManager.files), [filesManager.files])

  return (
    <div className="h-screen w-screen overflow-hidden bg-app text-primary flex flex-col select-none transition-colors duration-150">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <WorkspaceTopbar
        projectName={project.name}
        onOpenRenameModal={() => modalsState.setIsRenameModalOpen(true)}
        saveStatus={filesManager.saveStatus}
        onSave={() => {
          filesManager.saveFilesToBackend(filesManager.files)
          addToast('All workspace files saved to cloud!', 'success')
        }}
        onRunCode={actions.handleRunCode}
        onToggleSplitPreview={() => {
          if (!isSplitPreview && bottomTab === 'preview') setBottomTab('hidden')
          setIsSplitPreview(!isSplitPreview)
        }}
        onOpenInviteModal={actions.handleOpenInviteModal}
        onOpenDetailsModal={() => modalsState.setIsDetailsModalOpen(true)}
        onExportProject={actions.handleExportProject}
        onlineUsers={socketManager.onlineUsers}
        collaborators={collaborators}
        socketConnected={socketManager.socketConnected}
        onOpenSettings={() => modalsState.setIsSettingsModalOpen(true)}
        onNavigateHome={() => navigate('/')}
        user={user}
      />

      <div className="flex-grow flex overflow-hidden relative">
        <ActivityBar
          activeActivityTab={activeActivityTab}
          setActiveActivityTab={setActiveActivityTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          bottomTab={bottomTab}
          setBottomTab={setBottomTab}
          onOpenSettings={() => modalsState.setIsSettingsModalOpen(true)}
        />

        <WorkspaceSidebar
          isOpen={isSidebarOpen}
          width={sidebarWidth}
          activeTab={activeActivityTab}
          files={filesManager.files}
          filteredFiles={filteredFiles}
          activeFile={filesManager.activeFile}
          onSelectFile={filesManager.handleSelectFile}
          fileFilter={filesManager.fileFilter}
          setFileFilter={filesManager.setFileFilter}
          isCreatingFile={filesManager.isCreatingFile}
          setIsCreatingFile={filesManager.setIsCreatingFile}
          newFileName={filesManager.newFileName}
          setNewFileName={filesManager.setNewFileName}
          onCreateFile={filesManager.handleCreateFile}
          onDeleteFile={filesManager.handleDeleteFile}
          searchInFilesQuery={searchInFilesQuery}
          setSearchInFilesQuery={setSearchInFilesQuery}
          searchInFilesResults={searchInFilesResults}
          saveStatus={filesManager.saveStatus}
          onCommitPush={(msg) => addToast(`Committed to main: "${msg}"`, 'success')}
        />

        {isSidebarOpen && <div className="resizer-h" onMouseDown={startDraggingSidebar} />}

        <WorkspaceCenterArea
          openFiles={filesManager.openFiles}
          activeFile={filesManager.activeFile}
          onSelectFile={filesManager.handleSelectFile}
          onCloseTab={filesManager.handleCloseTab}
          onAddNewFile={() => filesManager.setIsCreatingFile(true)}
          files={filesManager.files}
          onContentChange={filesManager.handleContentChange}
          editorSettings={editorSettings}
          isSplitPreview={isSplitPreview}
          combinedPreviewDoc={combinedPreviewDoc}
          previewKey={previewKey}
          onRefreshPreview={() => setPreviewKey((k) => k + 1)}
          bottomTab={bottomTab}
          setBottomTab={setBottomTab}
          bottomDrawerHeight={bottomDrawerHeight}
          onStartDraggingBottomDrawer={startDraggingBottomDrawer}
          terminalHistory={terminalManager.terminalHistory}
          terminalInput={terminalManager.terminalInput}
          setTerminalInput={terminalManager.setTerminalInput}
          onTerminalSubmit={terminalManager.handleTerminalCommand}
          terminalEndRef={terminalManager.terminalEndRef}
          consoleLogs={consoleLogs}
          onClearConsole={() => setConsoleLogs([])}
          addToast={addToast}
        />

        {isRightPanelOpen && <div className="resizer-h" onMouseDown={startDraggingRightPanel} />}

        <WorkspaceRightPanel
          isOpen={isRightPanelOpen}
          width={rightPanelWidth}
          onClose={() => setIsRightPanelOpen(false)}
          rightPanelTab={rightPanelTab}
          setRightPanelTab={setRightPanelTab}
          unreadTeamCount={socketManager.unreadTeamCount}
          setUnreadTeamCount={socketManager.setUnreadTeamCount}
          aiMode={copilotManager.aiMode}
          setAiMode={copilotManager.setAiMode}
          aiMessages={copilotManager.aiMessages}
          aiLoading={copilotManager.aiLoading}
          prompt={copilotManager.prompt}
          setPrompt={copilotManager.setPrompt}
          onSendPrompt={actions.handleSendPrompt}
          onApplyAiCode={filesManager.handleApplyAiCode}
          onCreateAiFile={filesManager.handleCreateAiFile}
          activeFile={filesManager.activeFile}
          teamMessages={socketManager.teamMessages}
          messagesEndRef={copilotManager.messagesEndRef}
          addToast={addToast}
        />
      </div>

      <WorkspaceModals
        modalsState={modalsState}
        editorSettings={editorSettings}
        setEditorSettings={setEditorSettings}
        user={user}
        onLogout={() => {
          localStorage.removeItem('token')
          navigate('/login')
        }}
        files={filesManager.files}
        onSelectFile={filesManager.handleSelectFile}
        onRunCode={actions.handleRunCode}
        collaborators={collaborators}
        project={project}
        onAddCollaborators={actions.handleAddCollaborators}
        onRenameWorkspace={actions.handleRenameWorkspace}
      />
    </div>
  )
}

export default Project
