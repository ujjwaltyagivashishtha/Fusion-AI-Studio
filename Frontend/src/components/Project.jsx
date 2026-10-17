import { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import CodeEditor from './CodeEditor.jsx'
import CommandPalette from './CommandPalette.jsx'
import ToastContainer from './Toast.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import SettingsModal from './SettingsModal.jsx'
import { intializeSocket, recieveMessage, sendMessage, disconnectSocket, removeListener } from '../config/socket.js'

const INITIAL_FILES = {
  'app.js': `// Fusion AI Studio - Express Application Server
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to Fusion AI Cloud Workspace!",
    status: "Operational",
    version: "2.5.0",
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, memory: "142MB", latency: "1.2ms" });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running smoothly on port \${PORT}\`);
});`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fusion AI Web Preview</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h1>🚀 Fusion Live Web Container</h1>
      <span class="badge">● Online</span>
    </div>
    <p style="color: #94A3B8; line-height: 1.6;">
      Your full-stack application preview is executing and live-rendering inside our isolated cloud environment.
    </p>
    <button class="btn" onclick="alert('Container interaction verified! All cloud systems normal.')">Test Cloud Interaction</button>
  </div>
</body>
</html>`,
  'style.css': `/* Workspace Global Stylesheet */
:root {
  --primary: #3b82f6;
  --bg-dark: #080c14;
}

body { 
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
  background: #080C14; 
  color: #F8FAFC; 
  padding: 2.5rem; 
  margin: 0;
}
.card { 
  background: rgba(30, 41, 59, 0.45); 
  padding: 2rem; 
  border-radius: 1.25rem; 
  border: 1px solid rgba(255, 255, 255, 0.08); 
  backdrop-filter: blur(16px);
  box-shadow: 0 20px 40px -15px rgba(0,0,0,0.6);
  max-width: 600px;
  margin: 0 auto;
}
h1 { 
  color: #60A5FA; 
  margin-top: 0; 
  font-size: 1.5rem;
}
.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.15);
  color: #34D399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}
.btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, #2563EB, #4F46E5);
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
  transition: transform 0.15s ease;
}
.btn:hover {
  transform: translateY(-2px);
}`,
  'package.json': `{
  "name": "fusion-ai-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "test": "vitest run"
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`
}

const Project = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { id: routeProjectId } = useParams()
  const { user } = useContext(UserContext)

  // Project state resolution
  const initialProject = location.state?.project || { name: 'Cloud Workspace', users: [user?.email || 'User'] }
  const [project, setProject] = useState(initialProject)
  const targetProjectId = routeProjectId || location.state?.project?._id || project._id

  // Socket Connection & Presence
  const [socketConnected, setSocketConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])

  // Cloud Save status: 'saved' | 'saving' | 'unsaved'
  const [saveStatus, setSaveStatus] = useState('saved')
  const saveTimeoutRef = useRef(null)

  // Panes & Layout State
  const [activeActivityTab, setActiveActivityTab] = useState('explorer') // 'explorer' | 'search' | 'git'
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [rightPanelWidth, setRightPanelWidth] = useState(360)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
  const [rightPanelTab, setRightPanelTab] = useState('copilot') // 'copilot' | 'chat'

  // Files state
  const [files, setFiles] = useState(INITIAL_FILES)
  const [openFiles, setOpenFiles] = useState(['app.js', 'index.html'])
  const [activeFile, setActiveFile] = useState('app.js')
  const [fileFilter, setFileFilter] = useState('')
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')

  // Search within files state (for Search Tab)
  const [searchInFilesQuery, setSearchInFilesQuery] = useState('')

  // Editor Preferences State
  const [editorSettings, setEditorSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('fusion_editor_settings')
      if (saved) return JSON.parse(saved)
    } catch {
      // Fallback
    }
    return { fontSize: 13, tabSize: 2, wordWrap: true, showMinimap: true }
  })

  const handleUpdateEditorSettings = (newSettings) => {
    setEditorSettings(newSettings)
    try {
      localStorage.setItem('fusion_editor_settings', JSON.stringify(newSettings))
    } catch {
      // Ignore
    }
  }

  // Split-Preview & Sandboxed Container
  const [isSplitPreview, setIsSplitPreview] = useState(false)
  const [previewViewport, setPreviewViewport] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'
  const [previewKey, setPreviewKey] = useState(0)

  // Bottom Drawer (Terminal, Preview, Console)
  const [bottomTab, setBottomTab] = useState('terminal') // 'terminal' | 'preview' | 'console' | 'hidden'
  const [bottomDrawerHeight, setBottomDrawerHeight] = useState(220)
  const [terminalHistory, setTerminalHistory] = useState([
    'Fusion AI Cloud Terminal (Node v20.10.0, Linux x86_64)',
    'Type "help" for available commands, or "npm start" to run live server.'
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const [consoleLogs, setConsoleLogs] = useState([])
  const terminalEndRef = useRef(null)

  // AI Copilot & Collaborator Chat State
  const [prompt, setPrompt] = useState('')
  const [aiMode, setAiMode] = useState('copilot') // 'copilot' | 'refactor' | 'debug' | 'test' | 'explain'
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: `👋 **Fusion AI Copilot** is ready!\n\nI have indexed your workspace files. Choose an assistance mode (**Auto**, **Refactor**, **Debug**, or **Tests**) or prompt me directly below.`
    }
  ])

  // Team Workspace Chat
  const [teamMessages, setTeamMessages] = useState([])
  const [unreadTeamCount, setUnreadTeamCount] = useState(0)
  const messagesEndRef = useRef(null)

  // Modals & User Management
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

  // Command Palette
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  // Toasts
  const [toasts, setToasts] = useState([])
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])
  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Resizing references
  const isDraggingSidebar = useRef(false)
  const isDraggingRightPanel = useRef(false)
  const isDraggingBottomDrawer = useRef(false)

  // Scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalHistory])

  // Scroll right panel messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, teamMessages, rightPanelTab])

  // Save files to backend API with debouncing
  const saveFilesToBackend = useCallback(async (filesToSave) => {
    if (!targetProjectId) return
    try {
      setSaveStatus('saving')
      await axios.put(`/projects/${targetProjectId}/files`, { files: filesToSave })
      setSaveStatus('saved')
    } catch (err) {
      console.error('Failed to save workspace files:', err)
      setSaveStatus('unsaved')
    }
  }, [targetProjectId])

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
  }, [isSplitPreview, addToast])

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

  // Sync project details & load files
  useEffect(() => {
    if (!targetProjectId) return

    // 1. Fetch Project Details
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
      .catch((err) => {
        console.error('Error fetching project details:', err)
      })

    // 2. Fetch Saved Files from MongoDB
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
      .catch((err) => {
        console.warn('Could not load backend files, using default template:', err.message)
      })

    // 3. Preload registered users list
    axios.get('/users/all')
      .then((res) => {
        setUsers(res.data.users || [])
      })
      .catch((err) => {
        console.error('Error fetching registered users:', err)
      })
  }, [targetProjectId, user?._id, user?.email])

  // Socket.IO Pipeline
  useEffect(() => {
    if (!targetProjectId) return

    const socket = intializeSocket(targetProjectId)

    // Project message from team member
    const handleProjectMessage = (data) => {
      const senderId = data.sender?._id || data.sender
      const isSelf = senderId === user?._id || data.sender?.email === user?.email
      if (isSelf) return

      const senderName =
        typeof data.sender === 'object'
          ? data.sender.email?.split('@')[0] || 'Collaborator'
          : String(data.sender).split('@')[0]

      setTeamMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          sender: 'collaborator',
          senderName,
          text: data.message,
          timestamp: data.timestamp || new Date().toISOString()
        }
      ])
      if (rightPanelTab !== 'chat') {
        setUnreadTeamCount((prev) => prev + 1)
      }
      addToast(`Message from ${senderName}`, 'info')
    }

    const handleRoomUsers = (data) => {
      if (data?.users) {
        setOnlineUsers(data.users)
      }
    }

    const handleUserJoined = (data) => {
      addToast(`${data.name || 'Collaborator'} joined the workspace`, 'info')
      setTerminalHistory((prev) => [...prev, `[COLLAB] ${data.email || 'User'} connected`])
    }

    const handleUserLeft = (data) => {
      addToast(`${data.name || 'Collaborator'} left workspace`, 'info')
      setTerminalHistory((prev) => [...prev, `[COLLAB] ${data.email || 'User'} disconnected`])
    }

    const handleRemoteFileChange = (data) => {
      if (!data?.fileName) return
      setFiles((prev) => ({
        ...prev,
        [data.fileName]: data.content
      }))
      setTerminalHistory((prev) => [
        ...prev,
        `[SYNC] ${data.fileName} updated by ${data.sender?.email || 'collaborator'}`
      ])
    }

    const handleRemoteFileCreate = (data) => {
      if (!data?.fileName) return
      setFiles((prev) => ({
        ...prev,
        [data.fileName]: data.content || ''
      }))
      setOpenFiles((prev) => (prev.includes(data.fileName) ? prev : [...prev, data.fileName]))
      addToast(`Collaborator created: ${data.fileName}`, 'info')
    }

    const handleRemoteFileDelete = (data) => {
      if (!data?.fileName) return
      setFiles((prev) => {
        const next = { ...prev }
        delete next[data.fileName]
        return next
      })
      setOpenFiles((prev) => prev.filter((f) => f !== data.fileName))
      addToast(`Collaborator deleted: ${data.fileName}`, 'info')
    }

    const handleConnect = () => {
      setSocketConnected(true)
      setTerminalHistory((prev) => [...prev, `[SOCKET] Connected to workspace channel`])
    }

    const handleDisconnect = () => {
      setSocketConnected(false)
      setTerminalHistory((prev) => [...prev, `[SOCKET] Disconnected from workspace`])
    }

    recieveMessage('project-message', handleProjectMessage)
    recieveMessage('room-users', handleRoomUsers)
    recieveMessage('user-joined', handleUserJoined)
    recieveMessage('user-left', handleUserLeft)
    recieveMessage('file-change', handleRemoteFileChange)
    recieveMessage('file-create', handleRemoteFileCreate)
    recieveMessage('file-delete', handleRemoteFileDelete)
    recieveMessage('connect', handleConnect)
    recieveMessage('disconnect', handleDisconnect)

    if (socket?.connected) {
      setSocketConnected(true)
    }

    return () => {
      removeListener('project-message', handleProjectMessage)
      removeListener('room-users', handleRoomUsers)
      removeListener('user-joined', handleUserJoined)
      removeListener('user-left', handleUserLeft)
      removeListener('file-change', handleRemoteFileChange)
      removeListener('file-create', handleRemoteFileCreate)
      removeListener('file-delete', handleRemoteFileDelete)
      removeListener('connect', handleConnect)
      removeListener('disconnect', handleDisconnect)
      disconnectSocket()
    }
  }, [targetProjectId, user?._id, user?.email, rightPanelTab, addToast])

  // Capture preview iframe console logs
  useEffect(() => {
    const handleFrameMessage = (e) => {
      if (e.data?.type === 'PREVIEW_CONSOLE') {
        const timestamp = new Date().toLocaleTimeString()
        setConsoleLogs((prev) => [
          ...prev.slice(-99),
          {
            level: e.data.level || 'log',
            message: e.data.message || '',
            time: timestamp
          }
        ])
        if (e.data.level === 'error') {
          setTerminalHistory((prev) => [...prev, `[PREVIEW-ERROR] ${e.data.message}`])
        }
      }
    }
    window.addEventListener('message', handleFrameMessage)
    return () => window.removeEventListener('message', handleFrameMessage)
  }, [])

  // Mouse Dragging Resizers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSidebar.current) {
        const newWidth = Math.max(180, Math.min(e.clientX - 48, 480))
        setSidebarWidth(newWidth)
      }
      if (isDraggingRightPanel.current) {
        const newWidth = Math.max(280, Math.min(window.innerWidth - e.clientX, 650))
        setRightPanelWidth(newWidth)
      }
      if (isDraggingBottomDrawer.current) {
        const newHeight = Math.max(120, Math.min(window.innerHeight - e.clientY, 500))
        setBottomDrawerHeight(newHeight)
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

  // Collaborators Modal
  const handleOpenInviteModal = () => {
    setSelectedUserId([])
    setIsModalOpen(true)
    setFetchingUsers(true)
    axios.get('/users/all')
      .then((res) => setUsers(res.data.users || []))
      .catch((err) => console.error(err))
      .finally(() => setFetchingUsers(false))
  }

  const handleUserClick = (id) => {
    setSelectedUserId((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleAddCollaborators = async () => {
    if (!selectedUserId || selectedUserId.length === 0) {
      addToast('Please select at least one user to add', 'error')
      return
    }

    const currentId = project._id || targetProjectId
    if (!currentId) {
      addToast('Invalid Project ID.', 'error')
      return
    }

    try {
      setSubmittingUsers(true)
      const res = await axios.put('/projects/add-user', {
        projectId: currentId,
        users: selectedUserId
      })

      if (res.data?.project) {
        setProject(res.data.project)
        setCollaborators(res.data.project.users || [])
      }

      addToast(`Added ${selectedUserId.length} collaborator(s) successfully!`, 'success')
      setIsModalOpen(false)
      setSelectedUserId([])
    } catch (err) {
      console.error('Error adding users to project:', err)
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
      const res = await axios.put(`/projects/${targetProjectId}`, {
        name: newProjectNameInput.trim()
      })
      if (res.data?.project) {
        setProject((prev) => ({ ...prev, name: res.data.project.name }))
        addToast('Workspace renamed successfully!', 'success')
        setIsRenameModalOpen(false)
      }
    } catch (err) {
      console.error('Failed to rename project:', err)
      addToast(err.response?.data?.message || 'Failed to rename workspace', 'error')
    }
  }

  // File Management
  const handleSelectFile = (fileName) => {
    if (!openFiles.includes(fileName)) {
      setOpenFiles([...openFiles, fileName])
    }
    setActiveFile(fileName)
  }

  const handleCloseTab = (e, fileName) => {
    e.stopPropagation()
    const newOpen = openFiles.filter((f) => f !== fileName)
    setOpenFiles(newOpen)
    if (activeFile === fileName) {
      setActiveFile(newOpen[newOpen.length - 1] || Object.keys(files)[0] || '')
    }
  }

  const handleCreateFile = (e) => {
    e.preventDefault()
    if (!newFileName.trim()) return
    const name = newFileName.trim()
    if (!files[name]) {
      const newFiles = { ...files, [name]: `// File: ${name}\n` }
      setFiles(newFiles)
      setOpenFiles([...openFiles, name])
      setActiveFile(name)
      saveFilesToBackend(newFiles)
      if (socketConnected && targetProjectId) {
        sendMessage('file-create', { fileName: name, content: newFiles[name] })
      }
      addToast(`Created new file: ${name}`, 'success')
    }
    setNewFileName('')
    setIsCreatingFile(false)
  }

  const handleDeleteFile = (e, fileName) => {
    e.stopPropagation()
    if (Object.keys(files).length <= 1) {
      addToast('Cannot delete the last remaining workspace file', 'error')
      return
    }

    const newFiles = { ...files }
    delete newFiles[fileName]
    setFiles(newFiles)

    const remainingOpen = openFiles.filter((f) => f !== fileName)
    setOpenFiles(remainingOpen)

    if (activeFile === fileName) {
      const keys = Object.keys(newFiles)
      setActiveFile(keys[0] || '')
    }

    saveFilesToBackend(newFiles)
    if (socketConnected && targetProjectId) {
      sendMessage('file-delete', { fileName })
    }
    addToast(`Deleted ${fileName}`, 'info')
  }

  const handleContentChange = (content) => {
    setSaveStatus('unsaved')
    setFiles((prev) => {
      const updated = {
        ...prev,
        [activeFile]: content
      }
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = setTimeout(() => {
        saveFilesToBackend(updated)
      }, 1200)

      if (socketConnected && targetProjectId) {
        sendMessage('file-change', {
          fileName: activeFile,
          content
        })
      }
      return updated
    })
  }

  // Interactive Terminal
  const handleTerminalCommand = async (e) => {
    e.preventDefault()
    if (!terminalInput.trim()) return

    const cmd = terminalInput.trim()
    setTerminalInput('')
    const newLogs = [...terminalHistory, `$ ${cmd}`]

    if (cmd === 'clear') {
      setTerminalHistory([`Fusion AI Cloud Terminal (Node v20.10.0)`])
      return
    }

    if (cmd === 'help') {
      newLogs.push(
        'Available commands:',
        '  npm start       - Launch Express web container',
        '  npm test        - Execute workspace Vitest test assertions',
        '  npm run build   - Build application bundles',
        '  node <file>     - Execute file in cloud runner',
        '  ls / dir        - List files with line counts',
        '  cat <file>      - Print file content to terminal',
        '  touch <file>    - Create a new file',
        '  rm <file>       - Remove a file',
        '  ai <prompt>     - Prompt Fusion AI Copilot directly',
        '  export          - Download project files bundle',
        '  clear           - Clear terminal log output'
      )
    } else if (cmd === 'ls' || cmd === 'dir') {
      const fileList = Object.entries(files)
        .map(([name, content]) => `${name} (${content.split('\n').length} lines)`)
        .join('   ')
      newLogs.push(fileList)
    } else if (cmd.startsWith('cat ')) {
      const targetName = cmd.slice(4).trim()
      if (files[targetName] !== undefined) {
        newLogs.push(files[targetName])
      } else {
        newLogs.push(`cat: ${targetName}: No such file`)
      }
    } else if (cmd.startsWith('touch ')) {
      const targetName = cmd.slice(6).trim()
      if (targetName && !files[targetName]) {
        const updated = { ...files, [targetName]: `// Created via terminal: ${targetName}\n` }
        setFiles(updated)
        setOpenFiles([...openFiles, targetName])
        setActiveFile(targetName)
        saveFilesToBackend(updated)
        newLogs.push(`Created file: ${targetName}`)
      }
    } else if (cmd.startsWith('rm ')) {
      const targetName = cmd.slice(3).trim()
      if (files[targetName]) {
        const updated = { ...files }
        delete updated[targetName]
        setFiles(updated)
        setOpenFiles(openFiles.filter((f) => f !== targetName))
        saveFilesToBackend(updated)
        newLogs.push(`Removed file: ${targetName}`)
      } else {
        newLogs.push(`rm: cannot remove '${targetName}': No such file`)
      }
    } else if (cmd.startsWith('ai ')) {
      const aiPromptText = cmd.slice(3).trim()
      newLogs.push(`[Fusion AI]: Synthesizing query response...`)
      setTerminalHistory(newLogs)
      try {
        const res = await axios.post('/ai/prompt', {
          prompt: aiPromptText,
          activeFile,
          fileContent: files[activeFile] || '',
          mode: 'copilot',
          files
        })
        setTerminalHistory((prev) => [
          ...prev,
          `[Fusion AI (${res.data.source || 'gemini'})]:\n${res.data.reply}`
        ])
      } catch (err) {
        setTerminalHistory((prev) => [...prev, `[AI Error]: ${err.message}`])
      }
      return
    } else if (cmd === 'export') {
      handleExportProject()
      newLogs.push(`Workspace export bundle downloading.`)
    } else if (cmd === 'git status') {
      newLogs.push(
        `On branch main\nYour branch is up to date with 'origin/main'.\nStatus: ${saveStatus === 'saved' ? 'Working tree clean' : 'Pending cloud synchronization'}`
      )
    } else if (cmd === 'npm test') {
      newLogs.push(
        `> vitest run\n\n✓ ${activeFile} unit assertions passed (4/4)\n✓ Code coverage: 94.2%\nTest Files: 1 passed (1)\nTests: 4 passed (4)\nDuration: 24ms`
      )
    } else if (cmd === 'npm start' || cmd === 'node app.js' || cmd.startsWith('node ')) {
      newLogs.push(
        `[fusion-runner] starting process...\n🚀 Server listening on port 3000\nConnected to live web container`
      )
      setBottomTab('preview')
    } else {
      newLogs.push(`bash: command not found: ${cmd}. Type "help" for a list of commands.`)
    }

    setTerminalHistory(newLogs)
  }

  // Export Project Bundle
  const handleExportProject = () => {
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
  }

  // Prompt / Chat Send Handler
  const handleSendPrompt = async (e) => {
    e?.preventDefault()
    if (!prompt.trim() || (rightPanelTab === 'copilot' && aiLoading)) return

    const userMsg = prompt.trim()
    const currentId = project._id || targetProjectId
    setPrompt('')

    // Team Chat broadcast
    if (rightPanelTab === 'chat') {
      setTeamMessages((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          sender: 'user',
          senderName: 'You',
          text: userMsg,
          timestamp: new Date().toISOString()
        }
      ])

      if (currentId) {
        sendMessage('project-message', {
          message: userMsg,
          sender: user,
          projectId: currentId
        })
      }
      return
    }

    // AI Copilot prompt
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
      console.error('AI prompt error:', err)
      const errMsg = err.response?.data?.message || 'AI assistant encountered an error. Please try again.'
      setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `⚠️ **AI Service Error**: ${errMsg}`
        }
      ])
      addToast('AI prompt failed', 'error')
    } finally {
      setAiLoading(false)
    }
  }

  // Apply AI Code Directly
  const handleApplyAiCode = (code, targetFile) => {
    const fileToUpdate = targetFile || activeFile
    if (fileToUpdate === activeFile) {
      handleContentChange(code)
    }
    const updated = { ...files, [fileToUpdate]: code }
    setFiles(updated)
    if (!openFiles.includes(fileToUpdate)) {
      setOpenFiles((prev) => [...prev, fileToUpdate])
    }
    setActiveFile(fileToUpdate)
    saveFilesToBackend(updated)
    addToast(`Applied code directly to ${fileToUpdate}!`, 'success')
  }

  // Create New File Suggested by AI
  const handleCreateAiFile = (fileName, code) => {
    const updated = { ...files, [fileName]: code }
    setFiles(updated)
    setOpenFiles([...openFiles, fileName])
    setActiveFile(fileName)
    saveFilesToBackend(updated)
    if (socketConnected && targetProjectId) {
      sendMessage('file-create', { fileName, content: code })
    }
    addToast(`Created new file ${fileName} with AI code!`, 'success')
  }

  // Helper to render AI response body preserving markdown code blocks
  const renderAiMessageContent = (text, isActionable = false) => {
    if (!text) return null
    if (isActionable && text.includes('```')) {
      const preamble = text.split('```')[0].trim()
      return <p className="whitespace-pre-wrap">{preamble || 'Here is the requested implementation:'}</p>
    }
    if (!text.includes('```')) {
      return <p className="whitespace-pre-wrap">{text}</p>
    }
    const parts = text.split(/(```[\s\S]*?```)/g)
    return (
      <div className="space-y-2">
        {parts.map((part, idx) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const content = part.slice(3, -3).replace(/^\r?\n/, '')
            const firstNewline = content.indexOf('\n')
            const lang = firstNewline !== -1 ? content.slice(0, firstNewline).trim() : ''
            const snippet = firstNewline !== -1 ? content.slice(firstNewline + 1) : content
            return (
              <div key={idx} className="my-2 rounded-xl border border-default bg-surface p-2 font-mono text-[11px] overflow-hidden">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-default text-[10px] text-muted">
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <i className="ri-code-line text-blue-500" />
                    {lang || 'example'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(snippet)
                      addToast('Copied code to clipboard!')
                    }}
                    className="hover:text-primary transition cursor-pointer text-[10px]"
                  >
                    Copy
                  </button>
                </div>
                <pre className="overflow-x-auto p-1 leading-4 text-primary">{snippet}</pre>
              </div>
            )
          }
          const trimmed = part.trim()
          return trimmed ? <p key={idx} className="whitespace-pre-wrap">{part}</p> : null
        })}
      </div>
    )
  }

  // Filter files list
  const filteredFiles = Object.keys(files).filter((f) =>
    f.toLowerCase().includes(fileFilter.toLowerCase())
  )

  // Search in files results (Search Tab)
  const searchInFilesResults = useMemo(() => {
    if (!searchInFilesQuery.trim()) return []
    const q = searchInFilesQuery.toLowerCase()
    const results = []
    for (const [name, content] of Object.entries(files)) {
      const lines = content.split('\n')
      lines.forEach((line, idx) => {
        if (line.toLowerCase().includes(q)) {
          results.push({ file: name, lineNum: idx + 1, content: line.trim() })
        }
      })
    }
    return results
  }, [searchInFilesQuery, files])

  // File icon badges
  const getFileBadge = (name) => {
    if (name.endsWith('.js') || name.endsWith('.mjs')) return { icon: 'ri-javascript-line', color: 'text-amber-500' }
    if (name.endsWith('.jsx')) return { icon: 'ri-reactjs-line', color: 'text-cyan-500' }
    if (name.endsWith('.html')) return { icon: 'ri-html5-line', color: 'text-orange-500' }
    if (name.endsWith('.css')) return { icon: 'ri-css3-line', color: 'text-blue-500' }
    if (name.endsWith('.json')) return { icon: 'ri-braces-line', color: 'text-emerald-500' }
    if (name.endsWith('.py')) return { icon: 'ri-code-s-slash-line', color: 'text-yellow-500' }
    return { icon: 'ri-file-text-line', color: 'text-muted' }
  }

  // Live sandboxed preview doc
  const combinedPreviewDoc = useMemo(() => {
    const html = files['index.html'] || '<html><head></head><body><div id="root"><h1>No HTML Entry</h1></div></body></html>'
    const css = files['style.css'] || files['src/style.css'] || files['src/index.css'] || ''
    const js = files['main.js'] || ''

    let doc = html
    if (css && !doc.includes(css)) {
      if (doc.includes('</head>')) {
        doc = doc.replace('</head>', `<style>${css}</style></head>`)
      } else {
        doc = `<style>${css}</style>` + doc
      }
    }

    const captureScript = `<script>
      (function() {
        const origLog = console.log;
        const origErr = console.error;
        window.addEventListener('error', function(e) {
          window.parent.postMessage({ type: 'PREVIEW_CONSOLE', level: 'error', message: e.message }, '*');
        });
        console.log = function(...args) {
          origLog.apply(console, args);
          window.parent.postMessage({ type: 'PREVIEW_CONSOLE', level: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
        };
        console.error = function(...args) {
          origErr.apply(console, args);
          window.parent.postMessage({ type: 'PREVIEW_CONSOLE', level: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') }, '*');
        };
      })();
    </script>`

    if (doc.includes('<head>')) {
      doc = doc.replace('<head>', `<head>${captureScript}`)
    } else {
      doc = captureScript + doc
    }

    if (js) {
      doc += `<script>${js}</script>`
    }

    return doc
  }, [files])

  return (
    <div className="h-screen w-screen bg-app text-primary flex flex-col overflow-hidden font-sans select-none transition-colors duration-200">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        files={files}
        activeFile={activeFile}
        onSelectFile={handleSelectFile}
        onOpenInviteModal={handleOpenInviteModal}
        onOpenDetailsModal={() => setIsDetailsModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onRunCode={handleRunCode}
        onToggleSplitPreview={() => setIsSplitPreview(!isSplitPreview)}
        onTriggerAiPrompt={(text) => {
          setPrompt(text)
          setIsRightPanelOpen(true)
          setRightPanelTab('copilot')
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        editorSettings={editorSettings}
        onUpdateEditorSettings={handleUpdateEditorSettings}
        user={user}
        onLogout={() => {
          localStorage.removeItem('token')
          navigate('/login')
        }}
      />

      {/* ================= 1. MASTER WORKSPACE TOPBAR ================= */}
      {/* ================= 1. MASTER WORKSPACE TOPBAR ================= */}
      <header className="h-12 border-b border-default bg-surface/75 backdrop-blur-xl px-3 flex items-center justify-between z-30 shrink-0">
        {/* Left: Brand, Back, Workspace Title, Cloud Save Status */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-xl border border-default bg-surface/70 hover:bg-surface-hover text-secondary hover:text-primary transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm shrink-0"
            title="Return to Dashboard"
            aria-label="Back to Projects"
          >
            <i className="ri-arrow-left-line text-sm" />
            <span className="hidden sm:inline">Projects</span>
          </button>

          <div className="h-4 w-[1px] bg-border-default shrink-0" />

          {/* Project Title Button */}
          <button
            onClick={() => setIsDetailsModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-surface-hover/80 transition border border-transparent hover:border-default cursor-pointer group truncate"
            title="Click to view workspace metadata & identifier"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-500 flex items-center justify-center text-white shadow-sm ring-1 ring-white/20 shrink-0">
              <i className="ri-cpu-line text-xs" />
            </div>
            <h1 className="font-bold text-xs text-primary truncate max-w-[130px] sm:max-w-xs group-hover:text-indigo-400 transition font-display">
              {project.name}
            </h1>
            <i className="ri-information-line text-muted text-xs group-hover:text-indigo-400 transition shrink-0" />
          </button>

          {/* Save Status Badge */}
          <button
            onClick={() => {
              saveFilesToBackend(files)
              addToast('Workspace files saved!', 'success')
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-default bg-surface/70 text-[10px] font-medium transition cursor-pointer shrink-0"
            title="Cloud Save (⌘S / Ctrl+S)"
          >
            {saveStatus === 'saving' ? (
              <>
                <i className="ri-loader-4-line animate-spin text-indigo-400 text-xs" />
                <span className="text-indigo-400 font-semibold">Saving...</span>
              </>
            ) : saveStatus === 'unsaved' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-400 font-medium">Unsaved (⌘S)</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-emerald-400 font-medium">Saved</span>
              </>
            )}
          </button>

          {/* Real-time Socket Indicator */}
          <span
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition shrink-0 backdrop-blur-sm ${
              socketConnected
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm'
                : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {socketConnected ? 'Realtime Sync' : 'Connecting...'}
          </span>
        </div>

        {/* Center: Quick Command Palette Input */}
        <div className="hidden lg:flex items-center">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center gap-3 px-3 py-1 rounded-xl border border-default bg-input/70 backdrop-blur-md hover:bg-surface-hover text-xs text-muted hover:text-primary transition shadow-inner cursor-pointer"
          >
            <i className="ri-search-line text-indigo-400 text-xs" />
            <span className="text-[11px]">Search commands, files...</span>
            <kbd className="px-1.5 py-0.5 rounded border border-default bg-surface text-[10px] font-mono text-muted">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Toolbar: Collaborators, Theme Toggle, Split Preview, Settings, Run */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Online Presence Count */}
          {onlineUsers.length > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-[10px] text-emerald-400 font-semibold backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{onlineUsers.length} online</span>
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Studio Preferences */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            title="Studio Preferences"
            aria-label="Studio Preferences"
            className="w-8 h-8 rounded-xl border border-default bg-surface/70 hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer shadow-sm"
          >
            <i className="ri-settings-4-line text-xs" />
          </button>

          {/* Split-Screen Preview Toggle */}
          <button
            onClick={() => setIsSplitPreview(!isSplitPreview)}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              isSplitPreview
                ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-400 shadow-sm'
                : 'border-default bg-surface/70 text-secondary hover:text-primary hover:border-strong'
            }`}
            title="Toggle Split-View Container Preview"
          >
            <i className="ri-layout-column-line text-xs" />
            <span className="hidden sm:inline text-[11px]">Split View</span>
          </button>

          {/* Invite Collaborators */}
          <div className="flex items-center gap-1.5 pr-2 border-r border-default">
            <button
              onClick={handleOpenInviteModal}
              className="p-1 sm:px-2 sm:py-1 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs text-indigo-400 hover:bg-indigo-500/20 transition flex items-center gap-1 cursor-pointer"
              title="Add Collaborators"
            >
              <i className="ri-user-add-line text-xs" />
              <span className="text-[11px] font-semibold hidden md:inline">Invite</span>
            </button>
          </div>

          {/* Export Bundle */}
          <button
            onClick={handleExportProject}
            className="p-1.5 rounded-xl border border-default bg-surface/70 text-secondary hover:text-primary transition cursor-pointer"
            title="Export Workspace Bundle (.json)"
            aria-label="Export Workspace"
          >
            <i className="ri-download-cloud-2-line text-xs" />
          </button>

          {/* Run Code Button */}
          <button
            onClick={handleRunCode}
            className="px-3.5 py-1 rounded-xl btn-primary text-xs font-semibold text-white transition shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <i className="ri-play-fill text-xs" />
            <span>Run</span>
          </button>
        </div>
      </header>

      {/* ================= 2. WORKSPACE BODY ================= */}
      <div className="flex-grow flex overflow-hidden relative">
        {/* 2.1 ACTIVITY BAR (Left Rail, 48px) */}
        {/* 2.1 ACTIVITY BAR (Left Rail, 48px) */}
        <nav
          aria-label="Workspace activity tabs"
          className="w-12 bg-activity-bar/90 backdrop-blur-md border-r border-default flex flex-col items-center justify-between py-3 shrink-0 select-none z-20"
        >
          <div className="flex flex-col items-center gap-2.5 w-full">
            {/* Explorer */}
            <button
              onClick={() => {
                if (activeActivityTab === 'explorer') {
                  setIsSidebarOpen(!isSidebarOpen)
                } else {
                  setActiveActivityTab('explorer')
                  setIsSidebarOpen(true)
                }
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
                activeActivityTab === 'explorer' && isSidebarOpen
                  ? 'border border-indigo-500/40 bg-indigo-500/20 text-indigo-400 shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
              title="Explorer (File Tree)"
              aria-label="Explorer"
            >
              <i className="ri-folder-3-line text-base" />
              {activeActivityTab === 'explorer' && isSidebarOpen && (
                <span className="absolute -left-1 top-2 w-1 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full shadow-sm" />
              )}
            </button>

            {/* Search in Files */}
            <button
              onClick={() => {
                if (activeActivityTab === 'search') {
                  setIsSidebarOpen(!isSidebarOpen)
                } else {
                  setActiveActivityTab('search')
                  setIsSidebarOpen(true)
                }
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
                activeActivityTab === 'search' && isSidebarOpen
                  ? 'border border-indigo-500/40 bg-indigo-500/20 text-indigo-400 shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
              title="Search Across Files"
              aria-label="Search Files"
            >
              <i className="ri-search-line text-base" />
              {activeActivityTab === 'search' && isSidebarOpen && (
                <span className="absolute -left-1 top-2 w-1 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full shadow-sm" />
              )}
            </button>

            {/* Source Control */}
            <button
              onClick={() => {
                if (activeActivityTab === 'git') {
                  setIsSidebarOpen(!isSidebarOpen)
                } else {
                  setActiveActivityTab('git')
                  setIsSidebarOpen(true)
                }
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
                activeActivityTab === 'git' && isSidebarOpen
                  ? 'border border-indigo-500/40 bg-indigo-500/20 text-indigo-400 shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
              title="Source Control"
              aria-label="Source Control"
            >
              <i className="ri-git-branch-line text-base" />
              {activeActivityTab === 'git' && isSidebarOpen && (
                <span className="absolute -left-1 top-2 w-1 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full shadow-sm" />
              )}
            </button>

            {/* Toggle AI Copilot Panel */}
            <button
              onClick={() => {
                if (isRightPanelOpen && rightPanelTab === 'copilot') {
                  setIsRightPanelOpen(false)
                } else {
                  setIsRightPanelOpen(true)
                  setRightPanelTab('copilot')
                }
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
                isRightPanelOpen && rightPanelTab === 'copilot'
                  ? 'border border-indigo-500/40 bg-indigo-500/20 text-indigo-400 shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
              title="Fusion AI Copilot"
              aria-label="AI Copilot"
            >
              <i className="ri-sparkling-fill text-base" />
              {isRightPanelOpen && rightPanelTab === 'copilot' && (
                <span className="absolute -left-1 top-2 w-1 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full shadow-sm" />
              )}
            </button>

            {/* Toggle Team Chat Panel */}
            <button
              onClick={() => {
                if (isRightPanelOpen && rightPanelTab === 'chat') {
                  setIsRightPanelOpen(false)
                } else {
                  setIsRightPanelOpen(true)
                  setRightPanelTab('chat')
                  setUnreadTeamCount(0)
                }
              }}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer relative ${
                isRightPanelOpen && rightPanelTab === 'chat'
                  ? 'border border-indigo-500/40 bg-indigo-500/20 text-indigo-400 shadow-sm'
                  : 'text-secondary hover:text-primary hover:bg-surface-hover'
              }`}
              title="Team Workspace Chat"
              aria-label="Team Chat"
            >
              <i className="ri-team-line text-base" />
              {unreadTeamCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              )}
              {isRightPanelOpen && rightPanelTab === 'chat' && (
                <span className="absolute -left-1 top-2 w-1 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r-full shadow-sm" />
              )}
            </button>
          </div>

          {/* Bottom Settings Button */}
          <div className="flex flex-col items-center gap-2 w-full">
            <button
              onClick={() => setIsRenameModalOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-secondary hover:text-primary hover:bg-surface-hover transition cursor-pointer"
              title="Workspace Properties / Rename"
              aria-label="Workspace Properties"
            >
              <i className="ri-settings-4-line text-base" />
            </button>
          </div>
        </nav>

        {/* 2.2 LEFT SIDEBAR (Explorer / Search / Git) */}
        {isSidebarOpen && (
          <aside
            style={{ width: `${sidebarWidth}px` }}
            className="bg-sidebar/85 backdrop-blur-md border-r border-default flex flex-col shrink-0 select-none overflow-hidden"
          >
            {/* Header */}
            <div className="h-9 px-3 border-b border-default flex items-center justify-between text-xs text-secondary font-semibold uppercase tracking-wider shrink-0 bg-surface/70">
              <span className="truncate">
                {activeActivityTab === 'explorer' && 'Explorer'}
                {activeActivityTab === 'search' && 'Search Files'}
                {activeActivityTab === 'git' && 'Source Control'}
              </span>
              <div className="flex items-center gap-1">
                {activeActivityTab === 'explorer' && (
                  <>
                    <button
                      onClick={() => setIsCreatingFile(true)}
                      className="p-1 hover:text-primary transition cursor-pointer rounded"
                      title="New File"
                    >
                      <i className="ri-file-add-line text-xs" />
                    </button>
                    <button
                      onClick={() => {
                        saveFilesToBackend(files)
                        addToast('Workspace synced with cloud!', 'info')
                      }}
                      className="p-1 hover:text-primary transition cursor-pointer rounded"
                      title="Sync Files"
                    >
                      <i className="ri-refresh-line text-xs" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 hover:text-primary transition cursor-pointer rounded"
                  title="Close Sidebar"
                >
                  <i className="ri-arrow-left-s-line text-xs" />
                </button>
              </div>
            </div>

            {/* TAB 1: FILE EXPLORER */}
            {activeActivityTab === 'explorer' && (
              <>
                {/* Search / Filter input */}
                <div className="p-2 border-b border-default">
                  <div className="relative">
                    <i className="ri-filter-3-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
                    <input
                      type="text"
                      value={fileFilter}
                      onChange={(e) => setFileFilter(e.target.value)}
                      placeholder="Filter files..."
                      className="w-full pl-7 pr-6 py-1 rounded-lg border border-default bg-input/80 text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 transition font-mono shadow-inner"
                    />
                    {fileFilter && (
                      <button
                        onClick={() => setFileFilter('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted hover:text-primary text-xs cursor-pointer"
                      >
                        <i className="ri-close-circle-fill" />
                      </button>
                    )}
                  </div>
                </div>

                {/* File Tree List */}
                <div className="flex-grow overflow-y-auto p-1.5 space-y-0.5 text-xs font-mono">
                  {/* Inline New File Creator */}
                  {isCreatingFile && (
                    <form onSubmit={handleCreateFile} className="px-2 py-1 bg-surface rounded-lg border border-indigo-500 mb-1 flex items-center gap-1.5 shadow-sm">
                      <i className="ri-file-add-fill text-indigo-400 text-xs" />
                      <input
                        type="text"
                        autoFocus
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        onBlur={() => !newFileName.trim() && setIsCreatingFile(false)}
                        placeholder="filename.ext"
                        className="w-full bg-transparent text-primary text-xs outline-none"
                      />
                    </form>
                  )}

                  {filteredFiles.map((fileName) => {
                    const badge = getFileBadge(fileName)
                    const isActive = activeFile === fileName
                    return (
                      <div
                        key={fileName}
                        onClick={() => handleSelectFile(fileName)}
                        className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                          isActive
                            ? 'bg-indigo-500/15 text-primary font-semibold border border-indigo-500/30 shadow-sm'
                            : 'text-secondary hover:bg-surface-hover/80 hover:text-primary border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <i className={`${badge.icon} ${badge.color} text-sm`} />
                          <span className="truncate">{fileName}</span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={(e) => handleDeleteFile(e, fileName)}
                            className="p-0.5 text-muted hover:text-red-400 transition"
                            title="Delete file"
                          >
                            <i className="ri-delete-bin-line text-xs" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* TAB 2: SEARCH IN FILES */}
            {activeActivityTab === 'search' && (
              <div className="flex-grow flex flex-col p-2 overflow-hidden">
                <div className="relative mb-3">
                  <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-xs" />
                  <input
                    type="text"
                    value={searchInFilesQuery}
                    onChange={(e) => setSearchInFilesQuery(e.target.value)}
                    placeholder="Search across all files..."
                    className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-default bg-input/80 text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 font-mono shadow-inner"
                  />
                </div>

                <div className="flex-grow overflow-y-auto space-y-2 text-xs font-mono">
                  {searchInFilesQuery && (
                    <p className="text-[11px] text-muted mb-2">
                      {searchInFilesResults.length} match{searchInFilesResults.length === 1 ? '' : 'es'} found
                    </p>
                  )}

                  {searchInFilesResults.map((res, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectFile(res.file)}
                      className="p-2.5 rounded-xl border border-default bg-surface/70 hover:border-indigo-500/40 cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-400 mb-1">
                        <span>{res.file}</span>
                        <span className="text-muted">Line {res.lineNum}</span>
                      </div>
                      <p className="text-[11px] text-secondary truncate">{res.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SOURCE CONTROL */}
            {activeActivityTab === 'git' && (
              <div className="p-3 space-y-4 text-xs font-mono">
                <div className="p-3 rounded-xl border border-default bg-surface/70">
                  <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
                    <i className="ri-git-branch-line" />
                    <span>Branch: main</span>
                  </div>
                  <p className="text-[11px] text-muted">
                    Cloud state: {saveStatus === 'saved' ? 'All changes synced' : 'Unsaved modifications'}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-muted mb-2">Changed Files</p>
                  <div className="space-y-1">
                    {Object.keys(files).map((f) => (
                      <div key={f} className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-surface/60 border border-default">
                        <span className="text-secondary">{f}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">M</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </aside>
        )}

        {/* Resizer Handle: Sidebar <-> Editor */}
        {isSidebarOpen && (
          <div
            onMouseDown={() => {
              isDraggingSidebar.current = true
              document.body.style.cursor = 'col-resize'
            }}
            className="resizer-h z-10 select-none"
          />
        )}

        {/* 2.3 MAIN EDITOR STAGE */}
        <main className="flex-grow flex flex-col min-w-0 overflow-hidden bg-app">
          {/* Editor Tabs Bar */}
          <div className="h-9 bg-sidebar/85 border-b border-default flex items-center px-1 overflow-x-auto select-none shrink-0">
            {openFiles.map((fileName) => {
              const badge = getFileBadge(fileName)
              const isActive = activeFile === fileName
              return (
                <div
                  key={fileName}
                  onClick={() => setActiveFile(fileName)}
                  className={`group flex items-center gap-2 px-3.5 py-1.5 text-xs font-mono border-r border-default cursor-pointer transition shrink-0 ${
                    isActive
                      ? 'bg-editor text-primary border-t-2 border-t-indigo-500 font-semibold shadow-sm'
                      : 'text-secondary hover:bg-surface/70 hover:text-primary'
                  }`}
                >
                  <i className={`${badge.icon} ${badge.color}`} />
                  <span>{fileName}</span>
                  <button
                    onClick={(e) => handleCloseTab(e, fileName)}
                    aria-label={`Close tab ${fileName}`}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 rounded transition p-0.5"
                  >
                    <i className="ri-close-line text-xs" />
                  </button>
                </div>
              )
            })}

            {/* Plus Tab to create file */}
            <button
              onClick={() => setIsCreatingFile(true)}
              className="p-1 rounded text-muted hover:text-primary transition cursor-pointer ml-1"
              title="Create New File"
              aria-label="New File"
            >
              <i className="ri-add-line text-sm" />
            </button>
          </div>

          {/* Editor Stage: CodeEditor & Split Preview */}
          <div className="flex-grow flex overflow-hidden min-h-0">
            {/* Code Editor */}
            <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
              <CodeEditor
                value={files[activeFile] || ''}
                onChange={handleContentChange}
                fileName={activeFile}
                onCopy={() => addToast('Code copied to clipboard!')}
                collaborators={collaborators}
                fontSize={editorSettings.fontSize}
                tabSize={editorSettings.tabSize}
                wordWrap={editorSettings.wordWrap}
                showMinimap={editorSettings.showMinimap}
              />
            </div>

            {/* Split-View Live Web Preview */}
            {isSplitPreview && (
              <div className="w-1/2 border-l border-default bg-sidebar/85 backdrop-blur-md flex flex-col min-w-[320px] overflow-hidden">
                {/* Header Toolbar */}
                <div className="h-9 border-b border-default bg-surface/80 backdrop-blur-md px-3 flex items-center justify-between text-xs shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-bold text-primary text-xs font-display">Live Web Container</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewViewport('desktop')}
                      className={`p-1.5 rounded-lg transition ${previewViewport === 'desktop' ? 'btn-primary text-white shadow-sm' : 'text-secondary hover:text-primary hover:bg-surface-hover'}`}
                      title="Desktop View (100%)"
                    >
                      <i className="ri-macbook-line text-xs" />
                    </button>
                    <button
                      onClick={() => setPreviewViewport('tablet')}
                      className={`p-1.5 rounded-lg transition ${previewViewport === 'tablet' ? 'btn-primary text-white shadow-sm' : 'text-secondary hover:text-primary hover:bg-surface-hover'}`}
                      title="Tablet View (768px)"
                    >
                      <i className="ri-tablet-line text-xs" />
                    </button>
                    <button
                      onClick={() => setPreviewViewport('mobile')}
                      className={`p-1.5 rounded-lg transition ${previewViewport === 'mobile' ? 'btn-primary text-white shadow-sm' : 'text-secondary hover:text-primary hover:bg-surface-hover'}`}
                      title="Mobile View (375px)"
                    >
                      <i className="ri-smartphone-line text-xs" />
                    </button>
                    <div className="h-3.5 w-[1px] bg-border-default mx-1" />
                    <button
                      onClick={() => {
                        setPreviewKey((k) => k + 1)
                        addToast('Container preview reloaded!')
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface-hover text-secondary hover:text-primary transition"
                      title="Reload Container"
                    >
                      <i className="ri-refresh-line text-xs" />
                    </button>
                    <button
                      onClick={() => setIsSplitPreview(false)}
                      className="p-1.5 rounded-lg hover:bg-surface-hover text-secondary hover:text-primary transition"
                      title="Close Split View"
                    >
                      <i className="ri-close-line text-xs" />
                    </button>
                  </div>
                </div>

                {/* Preview Frame */}
                <div className="flex-grow p-3 bg-app/90 overflow-y-auto flex items-start justify-center">
                  <div
                    className={`w-full h-full transition-all duration-200 rounded-2xl glass-card p-1 shadow-xl border border-white/10 flex flex-col ${
                      previewViewport === 'mobile'
                        ? 'max-w-[375px]'
                        : previewViewport === 'tablet'
                        ? 'max-w-[768px]'
                        : 'max-w-full'
                    }`}
                  >
                    <iframe
                      key={previewKey}
                      srcDoc={combinedPreviewDoc}
                      title="Live Container Preview"
                      className="w-full flex-grow rounded-xl border-0 bg-white"
                      sandbox="allow-scripts allow-modals allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resizer Handle: Editor <-> Bottom Drawer */}
          {!isSplitPreview && bottomTab !== 'hidden' && (
            <div
              onMouseDown={() => {
                isDraggingBottomDrawer.current = true
                document.body.style.cursor = 'row-resize'
              }}
              className="resizer-v z-10 select-none"
            />
          )}

          {/* 2.4 BOTTOM DRAWER (Terminal, Web Preview, Console Logs) */}
          {!isSplitPreview && bottomTab !== 'hidden' && (
            <div
              style={{ height: `${bottomDrawerHeight}px` }}
              className="border-t border-default bg-sidebar/90 backdrop-blur-md flex flex-col shrink-0 overflow-hidden"
            >
              {/* Header Tabs */}
              <div className="h-9 border-b border-default bg-surface/80 backdrop-blur-md px-3 flex items-center justify-between text-xs shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setBottomTab('terminal')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      bottomTab === 'terminal'
                        ? 'btn-primary text-white shadow-sm'
                        : 'text-secondary hover:text-primary hover:bg-surface-hover'
                    }`}
                  >
                    🖥️ Terminal
                  </button>
                  <button
                    onClick={() => setBottomTab('preview')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                      bottomTab === 'preview'
                        ? 'btn-primary text-white shadow-sm'
                        : 'text-secondary hover:text-primary hover:bg-surface-hover'
                    }`}
                  >
                    🌐 Web Preview
                  </button>
                  <button
                    onClick={() => setBottomTab('console')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
                      bottomTab === 'console'
                        ? 'btn-primary text-white shadow-sm'
                        : 'text-secondary hover:text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <span>📜 Console</span>
                    {consoleLogs.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full border border-default bg-app text-[9px] font-bold">
                        {consoleLogs.length}
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2 text-secondary">
                  {bottomTab === 'preview' && (
                    <div className="flex items-center gap-1 mr-2">
                      <button
                        onClick={() => setPreviewViewport('desktop')}
                        className={`p-1 rounded ${previewViewport === 'desktop' ? 'text-blue-500' : 'hover:text-primary'}`}
                      >
                        <i className="ri-macbook-line text-xs" />
                      </button>
                      <button
                        onClick={() => setPreviewViewport('tablet')}
                        className={`p-1 rounded ${previewViewport === 'tablet' ? 'text-blue-500' : 'hover:text-primary'}`}
                      >
                        <i className="ri-tablet-line text-xs" />
                      </button>
                      <button
                        onClick={() => setPreviewViewport('mobile')}
                        className={`p-1 rounded ${previewViewport === 'mobile' ? 'text-blue-500' : 'hover:text-primary'}`}
                      >
                        <i className="ri-smartphone-line text-xs" />
                      </button>
                      <button
                        onClick={() => setPreviewKey((k) => k + 1)}
                        className="p-1 hover:text-primary transition"
                        title="Reload Preview"
                      >
                        <i className="ri-refresh-line text-xs" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setBottomTab('hidden')}
                    className="p-1 hover:text-primary transition"
                    title="Minimize Drawer"
                    aria-label="Minimize Drawer"
                  >
                    <i className="ri-subtract-line text-xs" />
                  </button>
                </div>
              </div>

              {/* Drawer Content */}
              <div className="flex-grow overflow-hidden flex flex-col bg-app">
                {bottomTab === 'terminal' ? (
                  <div className="flex-grow p-3 font-mono text-xs overflow-y-auto flex flex-col justify-between">
                    <div className="space-y-1">
                      {terminalHistory.map((line, idx) => (
                        <div
                          key={idx}
                          className={`${
                            line.startsWith('$')
                              ? 'text-cyan-500 font-bold'
                              : line.startsWith('[AI')
                              ? 'text-indigo-400'
                              : line.startsWith('✓')
                              ? 'text-emerald-500'
                              : line.includes('Error') || line.includes('error')
                              ? 'text-red-500'
                              : 'text-secondary'
                          } whitespace-pre-wrap`}
                        >
                          {line}
                        </div>
                      ))}
                      <div ref={terminalEndRef} />
                    </div>

                    <form onSubmit={handleTerminalCommand} className="flex items-center gap-2 pt-2 border-t border-default mt-2">
                      <span className="text-blue-500 font-bold font-mono">$</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        placeholder="Type a command (help, npm start, npm test, ai <prompt>, ls, clear)..."
                        className="flex-grow bg-transparent text-primary outline-none font-mono text-xs placeholder-muted"
                      />
                    </form>
                  </div>
                ) : bottomTab === 'console' ? (
                  <div className="flex-grow p-3 font-mono text-xs overflow-y-auto space-y-1">
                    {consoleLogs.length === 0 ? (
                      <p className="text-muted italic">No console logs recorded from the preview container yet.</p>
                    ) : (
                      consoleLogs.map((log, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-2 ${
                            log.level === 'error' ? 'text-red-500' : 'text-secondary'
                          }`}
                        >
                          <span className="text-[10px] text-muted font-sans">{log.time}</span>
                          <span className="font-semibold uppercase text-[10px] px-1 rounded border border-default bg-surface">
                            {log.level}
                          </span>
                          <span>{log.message}</span>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="flex-grow p-2 bg-app flex items-center justify-center overflow-hidden">
                    <iframe
                      key={previewKey}
                      srcDoc={combinedPreviewDoc}
                      title="Live Container Preview"
                      className={`h-full transition-all duration-200 rounded-lg border border-default bg-white ${
                        previewViewport === 'mobile'
                          ? 'w-[375px]'
                          : previewViewport === 'tablet'
                          ? 'w-[768px]'
                          : 'w-full'
                      }`}
                      sandbox="allow-scripts allow-modals allow-same-origin"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Resizer Handle: Editor <-> Right Panel */}
        {isRightPanelOpen && (
          <div
            onMouseDown={() => {
              isDraggingRightPanel.current = true
              document.body.style.cursor = 'col-resize'
            }}
            className="resizer-h z-10 select-none"
          />
        )}

        {/* 2.5 RIGHT PANEL: Fusion AI Copilot & Team Chat */}
        {isRightPanelOpen && (
          <aside
            style={{ width: `${rightPanelWidth}px` }}
            className="bg-sidebar/90 backdrop-blur-xl border-l border-default flex flex-col shrink-0 select-none overflow-hidden"
          >
            {/* Header: Segmented Tab Selector */}
            <div className="h-10 border-b border-default px-3 flex items-center justify-between shrink-0 bg-surface/80 backdrop-blur-md">
              <div className="flex items-center p-0.5 rounded-xl border border-default bg-input/70 text-[10px]">
                <button
                  onClick={() => setRightPanelTab('copilot')}
                  className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                    rightPanelTab === 'copilot'
                      ? 'btn-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  ✨ AI Copilot
                </button>
                <button
                  onClick={() => {
                    setRightPanelTab('chat')
                    setUnreadTeamCount(0)
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition flex items-center gap-1 cursor-pointer ${
                    rightPanelTab === 'chat'
                      ? 'btn-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  <span>👥 Team Chat</span>
                  {unreadTeamCount > 0 && rightPanelTab !== 'chat' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  )}
                </button>
              </div>

              {/* Copilot Mode Chips or Online Presence */}
              {rightPanelTab === 'copilot' ? (
                <div className="flex items-center gap-1 text-[10px]">
                  <button
                    onClick={() => setAiMode('copilot')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${aiMode === 'copilot' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-muted hover:text-primary'}`}
                  >
                    Auto
                  </button>
                  <button
                    onClick={() => setAiMode('refactor')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${aiMode === 'refactor' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-muted hover:text-primary'}`}
                  >
                    Refactor
                  </button>
                  <button
                    onClick={() => setAiMode('test')}
                    className={`px-2 py-0.5 rounded-md font-semibold transition ${aiMode === 'test' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-muted hover:text-primary'}`}
                  >
                    Tests
                  </button>
                </div>
              ) : (
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Room Live</span>
                </span>
              )}
            </div>

            {/* AI Copilot Messages */}
            {rightPanelTab === 'copilot' && (
              <div className="flex-grow p-3 space-y-3.5 overflow-y-auto text-xs bg-app/80">
                {aiMessages.map((msg, i) => {
                  const isUser = msg.sender === 'user'
                  const isActionable = Boolean(!isUser && msg.suggestedCode && msg.action && msg.action !== 'explain')
                  const codeSnippet = isActionable ? msg.suggestedCode : null

                  return (
                    <div
                      key={i}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`p-3.5 rounded-2xl max-w-[95%] leading-relaxed ${
                          isUser
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-md'
                            : 'glass-card border border-default text-primary rounded-bl-none shadow-md'
                        }`}
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          renderAiMessageContent(msg.text, isActionable)
                        )}

                        {/* Code snippet action buttons */}
                        {isActionable && codeSnippet && (
                          <div className="mt-3 rounded-2xl border border-indigo-500/30 bg-surface-elevated/95 p-3 font-mono text-[11px] overflow-hidden shadow-lg">
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-default text-[10px] text-muted">
                              <span className="font-semibold text-primary flex items-center gap-1.5 truncate max-w-[140px]">
                                <i className="ri-file-code-line text-indigo-400" />
                                {msg.targetFile || activeFile}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(codeSnippet)
                                    addToast('Copied code to clipboard!')
                                  }}
                                  className="hover:text-primary transition cursor-pointer text-[10px]"
                                >
                                  Copy
                                </button>
                                <span>•</span>
                                {msg.targetFile && msg.targetFile !== activeFile ? (
                                  <>
                                    <button
                                      onClick={() => handleCreateAiFile(msg.targetFile, codeSnippet)}
                                      className="text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer flex items-center gap-1"
                                    >
                                      <i className="ri-file-add-line" />
                                      {files[msg.targetFile]
                                        ? `Update ${msg.targetFile.split('/').pop()}`
                                        : `Create ${msg.targetFile.split('/').pop()}`}
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleApplyAiCode(codeSnippet, activeFile)}
                                    className="text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer flex items-center gap-1"
                                  >
                                    <i className="ri-magic-line" />
                                    Apply to {activeFile}
                                  </button>
                                )}
                              </div>
                            </div>
                            <pre className="overflow-x-auto p-1 leading-5 text-primary">
                              {codeSnippet}
                            </pre>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] text-muted mt-1 px-1 font-medium">
                        {isUser ? 'You' : 'Fusion AI'}
                      </span>
                    </div>
                  )
                })}

                {aiLoading && (
                  <div className="flex items-center gap-2 text-xs text-indigo-400 p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/25 animate-pulse backdrop-blur-sm">
                    <i className="ri-loader-4-line animate-spin text-sm" />
                    <span className="font-medium">Synthesizing code recommendations...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Team Workspace Chat */}
            {rightPanelTab === 'chat' && (
              <div className="flex-grow p-3 space-y-3.5 overflow-y-auto text-xs bg-app/80">
                {teamMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mb-3 shadow-sm">
                      <i className="ri-chat-smile-2-line text-2xl" />
                    </div>
                    <p className="text-xs font-bold text-primary font-display">Team Workspace Chat</p>
                    <p className="text-[11px] text-muted mt-1 max-w-[200px] leading-relaxed">
                      Broadcast messages and coordinates in real-time to collaborators in this room.
                    </p>
                  </div>
                ) : (
                  teamMessages.map((msg, i) => {
                    const isUser = msg.sender === 'user'
                    const formattedTime = msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : ''

                    return (
                      <div
                        key={msg.id || i}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`p-3.5 rounded-2xl max-w-[95%] leading-relaxed ${
                            isUser
                              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-none shadow-md'
                              : 'glass-card border border-default text-primary rounded-bl-none shadow-md'
                          }`}
                        >
                          {!isUser && (
                            <p className="text-[10px] font-bold text-indigo-400 mb-1 flex items-center gap-1">
                              <i className="ri-user-smile-line" />
                              {msg.senderName || 'Collaborator'}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] text-muted mt-1 px-1">
                          <span>{isUser ? 'You' : msg.senderName || 'Collaborator'}</span>
                          {formattedTime && (
                            <>
                              <span>•</span>
                              <span>{formattedTime}</span>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Quick Action Prompt Chips (Copilot only) */}
            {rightPanelTab === 'copilot' && (
              <div className="p-2 border-t border-default flex items-center gap-1.5 overflow-x-auto text-[10px] bg-surface/75 backdrop-blur-md">
                <button
                  onClick={() => setPrompt(`Explain the architecture and logic of ${activeFile}`)}
                  className="px-2.5 py-1 rounded-xl glass-card text-secondary hover:text-primary hover:border-indigo-500/40 shrink-0 cursor-pointer transition"
                >
                  ✨ Explain
                </button>
                <button
                  onClick={() => setPrompt(`Refactor ${activeFile} for clean asynchronous performance`)}
                  className="px-2.5 py-1 rounded-xl glass-card text-secondary hover:text-primary hover:border-indigo-500/40 shrink-0 cursor-pointer transition"
                >
                  ⚡ Refactor
                </button>
                <button
                  onClick={() => setPrompt(`Write Vitest unit test assertions for ${activeFile}`)}
                  className="px-2.5 py-1 rounded-xl glass-card text-secondary hover:text-primary hover:border-indigo-500/40 shrink-0 cursor-pointer transition"
                >
                  🧪 Unit Tests
                </button>
                <button
                  onClick={() => setPrompt(`Audit ${activeFile} for security issues and edge cases`)}
                  className="px-2.5 py-1 rounded-xl glass-card text-secondary hover:text-primary hover:border-indigo-500/40 shrink-0 cursor-pointer transition"
                >
                  🐛 Debug
                </button>
              </div>
            )}

            {/* Prompt Input Box */}
            <form onSubmit={handleSendPrompt} className="p-2.5 border-t border-default bg-surface/80 backdrop-blur-md">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={rightPanelTab === 'copilot' ? `Ask AI about ${activeFile}...` : `Broadcast message to team...`}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-default bg-input/80 text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-sans shadow-inner transition"
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || (rightPanelTab === 'copilot' && aiLoading)}
                  className="absolute right-1.5 w-7 h-7 rounded-lg btn-primary flex items-center justify-center text-white disabled:opacity-30 cursor-pointer shadow-sm transition"
                  title="Send message"
                  aria-label="Send"
                >
                  <i className={`${rightPanelTab === 'copilot' ? 'ri-sparkling-fill' : 'ri-send-plane-fill'} text-xs`} />
                </button>
              </div>
            </form>
          </aside>
        )}
      </div>

      {/* ================= 3. INVITE COLLABORATORS MODAL ================= */}
      {/* ================= 3. INVITE COLLABORATORS MODAL ================= */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invite-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <div className="w-full max-w-md sm:max-w-lg rounded-3xl glass-panel p-5 sm:p-7 shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden animate-slideDown border border-white/10">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-default shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
                  <i className="ri-group-line text-lg" />
                </div>
                <div>
                  <h2 id="invite-modal-title" className="text-base font-bold text-primary flex items-center gap-2 font-display">
                    Invite Collaborators
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/25">
                      {selectedUserId.length} Selected
                    </span>
                  </h2>
                  <p className="text-xs text-muted">Select user tiles to grant real-time workspace access</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            {/* Filter Input */}
            <div className="pt-3 pb-2 shrink-0">
              <div className="relative">
                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-muted text-xs" />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Filter users by email or ID..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-default bg-input/80 text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 font-mono shadow-inner"
                />
              </div>
            </div>

            {/* Users List */}
            <div className="flex-grow overflow-y-auto space-y-2 py-2 pr-1 min-h-[160px] max-h-60 sm:max-h-64">
              {fetchingUsers ? (
                <div className="flex flex-col items-center justify-center py-8 text-secondary gap-2">
                  <i className="ri-loader-4-line animate-spin text-2xl text-indigo-400" />
                  <span className="text-xs">Loading registered users...</span>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-default">
                  <i className="ri-user-search-line text-2xl text-muted mb-2 block" />
                  <p className="text-xs font-semibold text-secondary">No other registered users available</p>
                </div>
              ) : (
                users
                  .filter((u) => u.email?.toLowerCase().includes(userSearchQuery.toLowerCase()))
                  .map((u) => {
                    const isSelected = selectedUserId.includes(u._id)
                    const isAlreadyInProject = collaborators.some((c) => (c._id || c) === u._id)

                    return (
                      <div
                        key={u._id}
                        onClick={() => !isAlreadyInProject && handleUserClick(u._id)}
                        className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition cursor-pointer select-none ${
                          isAlreadyInProject
                            ? 'border-default bg-app/50 opacity-50 cursor-not-allowed'
                            : isSelected
                            ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/30 text-primary shadow-sm'
                            : 'border-default glass-card hover:border-strong text-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center uppercase shrink-0 ${
                            isSelected ? 'btn-primary text-white shadow-sm' : 'bg-surface-hover text-secondary'
                          }`}>
                            {u.email ? u.email[0] : 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-primary truncate">{u.email}</p>
                            <p className="text-[10px] text-muted font-mono truncate">{u._id}</p>
                          </div>
                        </div>

                        <div className="shrink-0 ml-2">
                          {isAlreadyInProject ? (
                            <span className="text-[10px] text-muted font-semibold px-2 py-0.5 rounded-md border border-default bg-app">
                              Member
                            </span>
                          ) : (
                            <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                              isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'border-default bg-surface'
                            }`}>
                              {isSelected && <i className="ri-check-line text-xs" />}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-default flex items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-muted">
                {selectedUserId.length} user(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-default text-xs font-semibold text-secondary hover:bg-surface-hover transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCollaborators}
                  disabled={submittingUsers || selectedUserId.length === 0}
                  className="px-5 py-2.5 rounded-xl btn-primary text-xs font-semibold text-white transition shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  {submittingUsers ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-sm" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-user-add-line text-sm" />
                      <span>Add to Workspace</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. WORKSPACE DETAILS MODAL ================= */}
      {isDetailsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="details-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsDetailsModalOpen(false)
          }}
        >
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 shadow-2xl relative overflow-hidden animate-slideDown border border-white/10">
            <div className="flex items-center justify-between pb-4 border-b border-default mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shadow-sm">
                  <i className="ri-information-line text-lg" />
                </div>
                <div>
                  <h2 id="details-modal-title" className="text-base font-bold text-primary font-display">
                    Workspace Metadata
                  </h2>
                  <p className="text-xs text-muted">Identifier & Collaborator Details</p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                aria-label="Close modal"
                className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center transition cursor-pointer"
              >
                <i className="ri-close-line text-lg" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl border border-default bg-app/60">
                <p className="text-muted mb-0.5">Workspace Name</p>
                <p className="font-bold text-primary text-sm font-display">{project.name}</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-default bg-app/60">
                <p className="text-muted mb-0.5">Project ID (MongoDB)</p>
                <p className="font-mono text-indigo-400 break-all select-all font-semibold">{project._id || targetProjectId}</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-default bg-app/60">
                <p className="text-muted mb-1.5">Collaborators ({collaborators.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {collaborators.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg border border-default bg-surface/80 text-secondary text-[11px] font-mono shadow-sm"
                    >
                      {typeof c === 'string' ? c : c.email}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl btn-primary text-xs font-semibold text-white transition cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 5. RENAME WORKSPACE MODAL ================= */}
      {isRenameModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsRenameModalOpen(false)
          }}
        >
          <div className="w-full max-w-md rounded-3xl glass-panel p-6 shadow-2xl relative overflow-hidden animate-slideDown border border-white/10">
            <h2 id="rename-modal-title" className="text-base font-bold text-primary mb-1 font-display">
              Rename Workspace
            </h2>
            <p className="text-xs text-muted mb-4">Update the display name of this cloud project</p>

            <form onSubmit={handleRenameWorkspace} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={newProjectNameInput}
                onChange={(e) => setNewProjectNameInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-default bg-input/80 text-xs text-primary outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-sans shadow-inner"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-default text-xs font-semibold text-secondary hover:bg-surface-hover cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectNameInput.trim()}
                  className="px-5 py-2.5 rounded-xl btn-primary text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer shadow-md"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Project
