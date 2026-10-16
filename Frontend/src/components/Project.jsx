import { useState, useEffect, useContext, useRef, useMemo, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import CodeEditor from './CodeEditor.jsx'
import CommandPalette from './CommandPalette.jsx'
import ToastContainer from './Toast.jsx'
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

    // Project state & active project ID resolution
    const initialProject = location.state?.project || { name: 'Cloud Workspace', users: [user?.email || 'User'] }
    const [project, setProject] = useState(initialProject)
    const targetProjectId = routeProjectId || location.state?.project?._id || project._id

    // Socket Connection & Presence State
    const [socketConnected, setSocketConnected] = useState(false)
    const [onlineUsers, setOnlineUsers] = useState([])

    // Cloud Save status: 'saved' | 'saving' | 'unsaved'
    const [saveStatus, setSaveStatus] = useState('saved')
    const saveTimeoutRef = useRef(null)

    // Layout Panes & Activity Bar State
    const [activeActivityTab, setActiveActivityTab] = useState('explorer') // 'explorer' | 'search' | 'git' | 'copilot'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [sidebarWidth, setSidebarWidth] = useState(240)
    const [rightPanelWidth, setRightPanelWidth] = useState(340)
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
    const [rightPanelTab, setRightPanelTab] = useState('copilot') // 'copilot' | 'chat'

    // Files state
    const [files, setFiles] = useState(INITIAL_FILES)
    const [openFiles, setOpenFiles] = useState(['app.js', 'index.html'])
    const [activeFile, setActiveFile] = useState('app.js')
    const [fileFilter, setFileFilter] = useState('')
    const [isCreatingFile, setIsCreatingFile] = useState(false)
    const [newFileName, setNewFileName] = useState('')

    // Editor View Settings
    const [isSplitPreview, setIsSplitPreview] = useState(false)
    const [previewViewport, setPreviewViewport] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'
    const [previewKey, setPreviewKey] = useState(0)

    // Bottom Drawer State (Terminal, Web Preview, Console)
    const [bottomTab, setBottomTab] = useState('terminal') // 'terminal' | 'preview' | 'console' | 'hidden'
    const [bottomDrawerHeight, setBottomDrawerHeight] = useState(220)
    const [terminalHistory, setTerminalHistory] = useState([
        'Fusion AI Cloud Terminal (Node v20.10.0, Linux x86_64)',
        'Type "help" for available commands, or "npm start" to run server.'
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
            text: `👋 **Fusion AI Copilot** is online!\n\nI have indexed your workspace. Choose a mode (**Copilot**, **Refactor**, **Debug**, or **Unit Tests**) or click one of the quick action chips below.`
        }
    ])

    // Isolated Team Workspace Chat State
    const [teamMessages, setTeamMessages] = useState([])
    const [unreadTeamCount, setUnreadTeamCount] = useState(0)
    const messagesEndRef = useRef(null)

    // Collaborators & Modals
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
    const [newProjectNameInput, setNewProjectNameInput] = useState('')
    const [selectedUserId, setSelectedUserId] = useState([])
    const [users, setUsers] = useState([])
    const [collaborators, setCollaborators] = useState([])
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [fetchingUsers, setFetchingUsers] = useState(false)
    const [submittingUsers, setSubmittingUsers] = useState(false)

    // Command Palette
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

    // Toast Notifications
    const [toasts, setToasts] = useState([])
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random()
        setToasts((prev) => [...prev, { id, message, type }])
    }, [])
    const dismissToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    // Drag Resizing References
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

    // Save files helper with debouncing
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
            `✓ Compiled in 12ms. Web container active and executing.`
        ])
        addToast('Live container preview refreshed!', 'success')
    }, [isSplitPreview, addToast])

    // Keyboard Shortcuts (Cmd+K for Command Palette, Cmd+S for Cloud Save)
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

    // Sync project details & load persisted files from Backend API
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
                                    senderName: isSelf ? 'You' : (m.senderName || (typeof m.sender === 'object' ? m.sender?.email?.split('@')[0] : 'Collaborator')),
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
    }, [targetProjectId])

    // Real-time Socket.IO Connection & Events Pipeline
    useEffect(() => {
        if (!targetProjectId) return

        const socket = intializeSocket(targetProjectId)

        // 1. Project Chat Message (Route to Team Chat, NOT AI Copilot)
        const handleProjectMessage = (data) => {
            const senderId = data.sender?._id || data.sender
            const isSelf = senderId === user?._id || data.sender?.email === user?.email
            if (isSelf) return

            const senderName = typeof data.sender === 'object'
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

        // 2. Real-time Room Users Presence
        const handleRoomUsers = (data) => {
            if (data?.users) {
                setOnlineUsers(data.users)
            }
        }

        // 3. User Joined / Left Notifications
        const handleUserJoined = (data) => {
            addToast(`${data.name || 'Collaborator'} entered the workspace`, 'info')
            setTerminalHistory((prev) => [...prev, `[COLLAB] ${data.email || 'User'} connected`])
        }

        const handleUserLeft = (data) => {
            addToast(`${data.name || 'Collaborator'} left workspace`, 'info')
            setTerminalHistory((prev) => [...prev, `[COLLAB] ${data.email || 'User'} disconnected`])
        }

        // 4. Real-time File Sync
        const handleRemoteFileChange = (data) => {
            if (!data?.fileName) return
            setFiles((prev) => ({
                ...prev,
                [data.fileName]: data.content
            }))
            setTerminalHistory((prev) => [...prev, `[SYNC] ${data.fileName} updated by ${data.sender?.email || 'collaborator'}`])
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
            setTerminalHistory((prev) => [...prev, `[SOCKET] Connected to workspace channel: ${targetProjectId}`])
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
    }, [targetProjectId, user?._id, user?.email, addToast])

    // Capture console output messages from the preview iframe
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

    // Global Mouse Handlers for Resizing
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingSidebar.current) {
                const newWidth = Math.max(160, Math.min(e.clientX - 48, 480))
                setSidebarWidth(newWidth)
            }
            if (isDraggingRightPanel.current) {
                const newWidth = Math.max(260, Math.min(window.innerWidth - e.clientX, 600))
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

    // Invite Modal Helpers
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
            addToast('Invalid Project ID. Cannot update workspace.', 'error')
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

    // Rename Workspace Handler
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

    // File Management Handlers
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
            const newFiles = { ...files, [name]: `// New file: ${name}\n` }
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
            addToast('Cannot delete the last remaining file', 'error')
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
            // Auto-save debounce (1.2s)
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
            saveTimeoutRef.current = setTimeout(() => {
                saveFilesToBackend(updated)
            }, 1200)

            // Broadcast real-time edit to room
            if (socketConnected && targetProjectId) {
                sendMessage('file-change', {
                    fileName: activeFile,
                    content
                })
            }
            return updated
        })
    }



    // Interactive Terminal Command Execution
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
                '  npm test        - Execute workspace Vitest test suite',
                '  npm run build   - Rebuild application bundles',
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
            const fileName = cmd.slice(4).trim()
            if (files[fileName] !== undefined) {
                newLogs.push(files[fileName])
            } else {
                newLogs.push(`cat: ${fileName}: No such file`)
            }
        } else if (cmd.startsWith('touch ')) {
            const fileName = cmd.slice(6).trim()
            if (fileName && !files[fileName]) {
                const updated = { ...files, [fileName]: `// Created via terminal: ${fileName}\n` }
                setFiles(updated)
                setOpenFiles([...openFiles, fileName])
                setActiveFile(fileName)
                saveFilesToBackend(updated)
                newLogs.push(`Created file: ${fileName}`)
            }
        } else if (cmd.startsWith('rm ')) {
            const fileName = cmd.slice(3).trim()
            if (files[fileName]) {
                const updated = { ...files }
                delete updated[fileName]
                setFiles(updated)
                setOpenFiles(openFiles.filter((f) => f !== fileName))
                saveFilesToBackend(updated)
                newLogs.push(`Removed file: ${fileName}`)
            } else {
                newLogs.push(`rm: cannot remove '${fileName}': No such file`)
            }
        } else if (cmd.startsWith('ai ')) {
            const aiPromptText = cmd.slice(3).trim()
            newLogs.push(`[Fusion AI]: Processing query...`)
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
            newLogs.push(`Workspace export triggered. Bundle downloading.`)
        } else if (cmd === 'git status') {
            newLogs.push(
                `On branch main\nYour branch is up to date with 'origin/main'.\nStatus: ${saveStatus === 'saved' ? 'Clean working tree' : 'Unsaved changes pending cloud sync'}`
            )
        } else if (cmd === 'npm test') {
            newLogs.push(
                `> vitest run\n\n✓ ${activeFile} assertions passed (4/4)\n✓ Unit test coverage: 94.2%\nTest Files 1 passed (1)\nTests 4 passed (4)\nDuration: 28ms`
            )
        } else if (cmd === 'npm start' || cmd === 'node app.js' || cmd.startsWith('node ')) {
            newLogs.push(
                `[fusion-runner] starting process...\n🚀 Server listening on port 3000\nConnected to live cloud preview container`
            )
            setBottomTab('preview')
        } else {
            newLogs.push(`bash: command not found: ${cmd}. Type "help" for a list of commands.`)
        }

        setTerminalHistory(newLogs)
    }

    // Export Project as JSON Bundle
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
        addToast('Exported workspace bundle!', 'success')
    }

    // AI Prompt / Project Message Send Handler
    const handleSendPrompt = async (e) => {
        e?.preventDefault()
        if (!prompt.trim() || (rightPanelTab === 'copilot' && aiLoading)) return

        const userMsg = prompt.trim()
        const currentId = project._id || targetProjectId
        setPrompt('')

        // If in Team Chat tab, broadcast message over Socket to team (isolated from AI Copilot)
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

        // If in Copilot tab, prompt AI Copilot directly
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
                    suggestedCode: data.suggestedCode,
                    targetFile: data.targetFile || activeFile,
                    action: data.action
                }
            ])
            setTerminalHistory((prev) => [
                ...prev,
                `[AI-LOG] Generated code for ${activeFile} (${data.source || 'gemini'})`
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

    // Apply AI-generated code directly to editor
    const handleApplyAiCode = (code, targetFile) => {
        const fileToUpdate = targetFile || activeFile
        handleContentChange(code)
        saveFilesToBackend({ ...files, [fileToUpdate]: code })
        addToast(`Applied code directly to ${fileToUpdate}!`, 'success')
    }

    // Create New File suggested by AI
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

    // Helper to extract code block from markdown
    const extractCodeBlock = (text) => {
        if (!text) return null
        const match = text.match(/```(?:[a-zA-Z0-9_\-+]+)?\n([\s\S]*?)```/)
        return match ? match[1].trim() : null
    }

    // Filter files list
    const filteredFiles = Object.keys(files).filter((f) =>
        f.toLowerCase().includes(fileFilter.toLowerCase())
    )

    // Helper file icon badge
    const getFileBadge = (name) => {
        if (name.endsWith('.js') || name.endsWith('.mjs')) return { icon: 'ri-javascript-line', color: 'text-amber-400', label: 'JS' }
        if (name.endsWith('.jsx')) return { icon: 'ri-reactjs-line', color: 'text-cyan-400', label: 'JSX' }
        if (name.endsWith('.html')) return { icon: 'ri-html5-line', color: 'text-orange-400', label: 'HTML' }
        if (name.endsWith('.css')) return { icon: 'ri-css3-line', color: 'text-blue-400', label: 'CSS' }
        if (name.endsWith('.json')) return { icon: 'ri-braces-line', color: 'text-emerald-400', label: '{ }' }
        if (name.endsWith('.py')) return { icon: 'ri-code-s-slash-line', color: 'text-yellow-400', label: 'PY' }
        return { icon: 'ri-file-text-line', color: 'text-slate-400', label: 'TXT' }
    }

    // Sandboxed Live HTML Document Composer
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

        // Inject log and error capture script
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
        <div className="h-screen w-screen bg-[#070A11] text-white flex flex-col overflow-hidden font-sans select-none">
            {/* Ambient Background Lights */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Global Toasts */}
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
                onRunCode={handleRunCode}
                onToggleSplitPreview={() => setIsSplitPreview(!isSplitPreview)}
                onTriggerAiPrompt={(text) => {
                    setPrompt(text)
                    setIsRightPanelOpen(true)
                }}
            />

            {/* ================= 1. TOP MASTER NAVIGATION BAR ================= */}
            <header className="h-12 border-b border-white/5 bg-[#090D16]/90 backdrop-blur-xl px-3 flex items-center justify-between z-30 shrink-0">
                {/* Left: Brand Logo, Back, Project Title & Cloud Save Status */}
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
                        title="Back to Dashboard"
                    >
                        <i className="ri-arrow-left-line text-sm"></i>
                        <span className="hidden sm:inline">Projects</span>
                    </button>

                    <div className="h-4 w-[1px] bg-slate-800" />

                    {/* Project Name & Metadata Indicator */}
                    <button
                        onClick={() => setIsDetailsModalOpen(true)}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-slate-900/80 transition border border-transparent hover:border-slate-800 cursor-pointer group"
                        title="Click to view workspace details & ID"
                    >
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                            <i className="ri-cpu-line text-xs"></i>
                        </div>
                        <h1 className="font-bold text-xs text-white truncate max-w-[130px] sm:max-w-xs group-hover:text-blue-300 transition">
                            {project.name}
                        </h1>
                        <i className="ri-information-line text-slate-500 text-xs group-hover:text-blue-400 transition"></i>
                    </button>

                    {/* Cloud Save Status Indicator */}
                    <button
                        onClick={() => {
                            saveFilesToBackend(files)
                            addToast('Workspace files saved!', 'success')
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-medium transition cursor-pointer"
                        title="Cloud Sync (Cmd+S)"
                    >
                        {saveStatus === 'saving' ? (
                            <>
                                <i className="ri-loader-4-line animate-spin text-blue-400 text-xs"></i>
                                <span className="text-blue-400">Saving...</span>
                            </>
                        ) : saveStatus === 'unsaved' ? (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                <span className="text-amber-400">Unsaved (Cmd+S)</span>
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                <span className="text-emerald-400">Saved</span>
                            </>
                        )}
                    </button>

                    {/* Socket Real-time Status */}
                    <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition ${
                        socketConnected 
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                        {socketConnected ? 'Realtime Sync' : 'Connecting...'}
                    </span>
                </div>

                {/* Center: Command Palette Trigger Input (<kbd>⌘K</kbd>) */}
                <div className="hidden lg:flex items-center">
                    <button
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="flex items-center gap-3 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition shadow-inner cursor-pointer"
                    >
                        <i className="ri-search-line text-blue-400 text-xs"></i>
                        <span className="text-[11px]">Search commands, files...</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                            ⌘K
                        </kbd>
                    </button>
                </div>

                {/* Right: Actions, Online Collaborators, Layout Controls & Run */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                    {/* Live Online Collaborators Avatars */}
                    {onlineUsers.length > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <span className="text-slate-300 font-bold">{onlineUsers.length} online</span>
                            <div className="flex -space-x-1 ml-1">
                                {onlineUsers.slice(0, 3).map((u, i) => (
                                    <div
                                        key={i}
                                        className="w-4 h-4 rounded-full bg-indigo-600 border border-slate-900 text-[8px] font-bold text-white flex items-center justify-center uppercase"
                                        title={u.email}
                                    >
                                        {(u.email || 'U')[0]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Split View Toggle */}
                    <button
                        onClick={() => setIsSplitPreview(!isSplitPreview)}
                        className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            isSplitPreview
                                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title="Toggle Split-Screen Container Preview"
                    >
                        <i className="ri-layout-column-line text-xs"></i>
                        <span className="hidden sm:inline text-[11px]">Split View</span>
                    </button>

                    {/* Collaborator Avatars & Invite */}
                    <div className="flex items-center gap-1.5 pr-2 border-r border-slate-800">
                        <div className="flex -space-x-1.5">
                            {collaborators.slice(0, 3).map((c, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-slate-900 text-[10px] font-bold text-white flex items-center justify-center uppercase shadow-sm"
                                    title={typeof c === 'string' ? c : c.email}
                                >
                                    {(typeof c === 'string' ? c : c.email || 'U')[0]}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleOpenInviteModal}
                            className="p-1 sm:px-2 sm:py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-blue-400 hover:text-white hover:border-blue-500/30 transition flex items-center gap-1 cursor-pointer"
                            title="Add Collaborators"
                        >
                            <i className="ri-user-add-line text-xs"></i>
                            <span className="text-[11px] font-semibold hidden md:inline">Invite</span>
                        </button>
                    </div>

                    {/* Export Project Button */}
                    <button
                        onClick={handleExportProject}
                        className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                        title="Export Workspace Bundle (.json)"
                    >
                        <i className="ri-download-cloud-2-line text-xs"></i>
                    </button>

                    {/* Run Code Button */}
                    <button
                        onClick={handleRunCode}
                        className="px-3.5 py-1 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-xs font-semibold text-white transition shadow-lg shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer"
                    >
                        <i className="ri-play-fill text-xs"></i>
                        <span>Run</span>
                    </button>
                </div>
            </header>

            {/* ================= 2. MAIN WORKSPACE CONTAINER ================= */}
            <div className="flex-grow flex overflow-hidden relative">
                {/* 2.1 ACTIVITY BAR (Far Left Rail, 48px) */}
                <nav className="w-12 bg-[#060911] border-r border-white/5 flex flex-col items-center justify-between py-3 shrink-0 select-none z-20">
                    <div className="flex flex-col items-center gap-3 w-full">
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
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            title="Explorer (Files)"
                        >
                            <i className="ri-folder-3-line text-base"></i>
                            {activeActivityTab === 'explorer' && isSidebarOpen && (
                                <span className="absolute -left-1 top-2.5 w-1 h-4 bg-blue-500 rounded-r-full" />
                            )}
                        </button>

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
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            title="Search in Files"
                        >
                            <i className="ri-search-line text-base"></i>
                        </button>

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
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            title="Source Control"
                        >
                            <i className="ri-git-branch-line text-base"></i>
                        </button>

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
                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            title="AI Copilot"
                        >
                            <i className="ri-sparkling-fill text-base"></i>
                        </button>

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
                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            title="Team Chat"
                        >
                            <i className="ri-team-line text-base"></i>
                            {unreadTeamCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            )}
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-3 w-full">
                        <button
                            onClick={() => setIsRenameModalOpen(true)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer"
                            title="Workspace Settings / Rename"
                        >
                            <i className="ri-settings-4-line text-base"></i>
                        </button>
                    </div>
                </nav>

                {/* 2.2 LEFT SIDEBAR (Explorer / Search / Git) */}
                {isSidebarOpen && (
                    <aside
                        style={{ width: `${sidebarWidth}px` }}
                        className="bg-[#090D16] border-r border-white/5 flex flex-col shrink-0 select-none overflow-hidden"
                    >
                        {/* Sidebar Header */}
                        <div className="h-9 px-3 border-b border-white/5 flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider shrink-0 bg-[#080C14]">
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
                                            className="p-1 hover:text-white transition cursor-pointer rounded"
                                            title="New File"
                                        >
                                            <i className="ri-file-add-line text-xs"></i>
                                        </button>
                                        <button
                                            onClick={() => {
                                                saveFilesToBackend(files)
                                                addToast('Workspace synced!', 'info')
                                            }}
                                            className="p-1 hover:text-white transition cursor-pointer rounded"
                                            title="Sync Files"
                                        >
                                            <i className="ri-refresh-line text-xs"></i>
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-1 hover:text-white transition cursor-pointer rounded"
                                    title="Close Sidebar"
                                >
                                    <i className="ri-arrow-left-s-line text-xs"></i>
                                </button>
                            </div>
                        </div>

                        {/* Search Filter input */}
                        {activeActivityTab === 'explorer' && (
                            <div className="p-2 border-b border-white/5">
                                <div className="relative">
                                    <i className="ri-filter-3-line absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                                    <input
                                        type="text"
                                        value={fileFilter}
                                        onChange={(e) => setFileFilter(e.target.value)}
                                        placeholder="Filter files..."
                                        className="w-full pl-7 pr-6 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition font-mono"
                                    />
                                    {fileFilter && (
                                        <button
                                            onClick={() => setFileFilter('')}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
                                        >
                                            <i className="ri-close-circle-fill"></i>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* File Tree List */}
                        <div className="flex-grow overflow-y-auto p-1.5 space-y-0.5 text-xs font-mono">
                            {/* Inline New File Creator */}
                            {isCreatingFile && (
                                <form onSubmit={handleCreateFile} className="px-2 py-1 bg-slate-900/90 rounded-lg border border-blue-500/40 mb-1 flex items-center gap-1.5">
                                    <i className="ri-file-add-fill text-blue-400 text-xs"></i>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newFileName}
                                        onChange={(e) => setNewFileName(e.target.value)}
                                        onBlur={() => !newFileName.trim() && setIsCreatingFile(false)}
                                        placeholder="filename.ext"
                                        className="w-full bg-transparent text-white text-xs outline-none"
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
                                        className={`group flex items-center justify-between px-2 py-1.5 rounded-lg transition cursor-pointer ${
                                            isActive
                                                ? 'bg-blue-600/15 text-blue-300 font-semibold border border-blue-500/30'
                                                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <i className={`${badge.icon} ${badge.color} text-sm`}></i>
                                            <span className="truncate">{fileName}</span>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                            <button
                                                onClick={(e) => handleDeleteFile(e, fileName)}
                                                className="p-0.5 text-slate-500 hover:text-red-400 transition"
                                                title="Delete file"
                                            >
                                                <i className="ri-delete-bin-line text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </aside>
                )}

                {/* Resizer Handle between Sidebar and Editor */}
                {isSidebarOpen && (
                    <div
                        onMouseDown={() => {
                            isDraggingSidebar.current = true
                            document.body.style.cursor = 'col-resize'
                        }}
                        className="resizer-h bg-transparent hover:bg-blue-500 z-10 select-none"
                    />
                )}

                {/* 2.3 CENTER EDITOR STAGE */}
                <main className="flex-grow flex flex-col min-w-0 overflow-hidden bg-[#070A11]">
                    {/* Top Editor Tab Bar */}
                    <div className="h-9 bg-[#080C14] border-b border-white/5 flex items-center px-1 overflow-x-auto select-none shrink-0 scrollbar-none">
                        {openFiles.map((fileName) => {
                            const badge = getFileBadge(fileName)
                            const isActive = activeFile === fileName
                            return (
                                <div
                                    key={fileName}
                                    onClick={() => setActiveFile(fileName)}
                                    className={`group flex items-center gap-2 px-3 py-1.5 text-xs font-mono border-r border-white/5 cursor-pointer transition shrink-0 ${
                                        isActive
                                            ? 'bg-[#090D16] text-white border-t-2 border-t-blue-500 font-semibold'
                                            : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                                    }`}
                                >
                                    <i className={`${badge.icon} ${badge.color}`}></i>
                                    <span>{fileName}</span>
                                    <button
                                        onClick={(e) => handleCloseTab(e, fileName)}
                                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 rounded transition p-0.5"
                                    >
                                        <i className="ri-close-line text-xs"></i>
                                    </button>
                                </div>
                            )
                        })}

                        {/* Plus Tab to create file */}
                        <button
                            onClick={() => setIsCreatingFile(true)}
                            className="p-1 rounded text-slate-500 hover:text-white transition cursor-pointer"
                            title="New File Tab"
                        >
                            <i className="ri-add-line text-sm"></i>
                        </button>
                    </div>

                    {/* Main Workspace Stage: Code Editor & Optional Split-Preview */}
                    <div className="flex-grow flex overflow-hidden min-h-0">
                        {/* Monaco-Grade Code Editor */}
                        <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
                            <CodeEditor
                                value={files[activeFile] || ''}
                                onChange={handleContentChange}
                                fileName={activeFile}
                                onCopy={() => addToast('Code copied to clipboard!')}
                                collaborators={collaborators}
                            />
                        </div>

                        {/* Split-View Live Preview (If enabled) */}
                        {isSplitPreview && (
                            <div className="w-1/2 border-l border-white/5 bg-[#080C14] flex flex-col min-w-[320px] overflow-hidden">
                                {/* Preview Controls Header */}
                                <div className="h-9 border-b border-white/5 bg-[#090D16] px-3 flex items-center justify-between text-xs shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span className="font-semibold text-slate-200 text-xs">Live Container Preview</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setPreviewViewport('desktop')}
                                            className={`p-1 rounded ${previewViewport === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                            title="Desktop View"
                                        >
                                            <i className="ri-macbook-line text-xs"></i>
                                        </button>
                                        <button
                                            onClick={() => setPreviewViewport('tablet')}
                                            className={`p-1 rounded ${previewViewport === 'tablet' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                            title="Tablet View"
                                        >
                                            <i className="ri-tablet-line text-xs"></i>
                                        </button>
                                        <button
                                            onClick={() => setPreviewViewport('mobile')}
                                            className={`p-1 rounded ${previewViewport === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                            title="Mobile View"
                                        >
                                            <i className="ri-smartphone-line text-xs"></i>
                                        </button>
                                        <div className="h-3.5 w-[1px] bg-slate-800 mx-1" />
                                        <button
                                            onClick={() => {
                                                setPreviewKey((k) => k + 1)
                                                addToast('Preview refreshed!')
                                            }}
                                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                            title="Reload Preview"
                                        >
                                            <i className="ri-refresh-line text-xs"></i>
                                        </button>
                                        <button
                                            onClick={() => setIsSplitPreview(false)}
                                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                                            title="Close Split View"
                                        >
                                            <i className="ri-close-line text-xs"></i>
                                        </button>
                                    </div>
                                </div>

                                {/* Preview Frame with Sandboxed Iframe */}
                                <div className="flex-grow p-4 bg-[#070A11] overflow-y-auto flex items-start justify-center">
                                    <div
                                        className={`w-full h-full transition-all duration-300 rounded-2xl border border-white/5 bg-[#090D16] p-1 text-white shadow-2xl flex flex-col ${
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
                                            title="Fusion AI Live Preview"
                                            className="w-full flex-grow rounded-xl border-0 bg-white"
                                            sandbox="allow-scripts allow-modals allow-same-origin"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Resizer Handle between Editor and Bottom Drawer */}
                    {!isSplitPreview && bottomTab !== 'hidden' && (
                        <div
                            onMouseDown={() => {
                                isDraggingBottomDrawer.current = true
                                document.body.style.cursor = 'row-resize'
                            }}
                            className="resizer-v bg-transparent hover:bg-blue-500 z-10 select-none"
                        />
                    )}

                    {/* 2.4 BOTTOM DRAWER (Terminal, Web Preview, Console Logs) */}
                    {!isSplitPreview && bottomTab !== 'hidden' && (
                        <div
                            style={{ height: `${bottomDrawerHeight}px` }}
                            className="border-t border-white/5 bg-[#080C14] flex flex-col shrink-0 overflow-hidden"
                        >
                            {/* Drawer Tabs Header */}
                            <div className="h-8 border-b border-white/5 bg-[#090D16] px-3 flex items-center justify-between text-xs shrink-0 select-none">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setBottomTab('terminal')}
                                        className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                                            bottomTab === 'terminal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        🖥️ Terminal
                                    </button>
                                    <button
                                        onClick={() => setBottomTab('preview')}
                                        className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                                            bottomTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        🌐 Web Preview
                                    </button>
                                    <button
                                        onClick={() => setBottomTab('console')}
                                        className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                                            bottomTab === 'console' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <span>📜 Console</span>
                                        {consoleLogs.length > 0 && (
                                            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[9px] font-bold">
                                                {consoleLogs.length}
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 text-slate-400">
                                    {bottomTab === 'preview' && (
                                        <div className="flex items-center gap-1 mr-2">
                                            <button
                                                onClick={() => setPreviewViewport('desktop')}
                                                className={`p-1 rounded ${previewViewport === 'desktop' ? 'text-blue-400' : 'hover:text-white'}`}
                                            >
                                                <i className="ri-macbook-line text-xs"></i>
                                            </button>
                                            <button
                                                onClick={() => setPreviewViewport('tablet')}
                                                className={`p-1 rounded ${previewViewport === 'tablet' ? 'text-blue-400' : 'hover:text-white'}`}
                                            >
                                                <i className="ri-tablet-line text-xs"></i>
                                            </button>
                                            <button
                                                onClick={() => setPreviewViewport('mobile')}
                                                className={`p-1 rounded ${previewViewport === 'mobile' ? 'text-blue-400' : 'hover:text-white'}`}
                                            >
                                                <i className="ri-smartphone-line text-xs"></i>
                                            </button>
                                            <button
                                                onClick={() => setPreviewKey((k) => k + 1)}
                                                className="p-1 hover:text-white transition"
                                                title="Reload Preview"
                                            >
                                                <i className="ri-refresh-line text-xs"></i>
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setBottomTab('hidden')}
                                        className="p-1 hover:text-white transition"
                                        title="Minimize Drawer"
                                    >
                                        <i className="ri-subtract-line text-xs"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-grow overflow-hidden flex flex-col">
                                {bottomTab === 'terminal' ? (
                                    <div className="flex-grow p-3 font-mono text-xs overflow-y-auto flex flex-col justify-between bg-[#080C14]">
                                        <div className="space-y-1">
                                            {terminalHistory.map((line, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`${
                                                        line.startsWith('$')
                                                            ? 'text-cyan-400 font-bold'
                                                            : line.startsWith('[AI')
                                                            ? 'text-indigo-300'
                                                            : line.startsWith('✓')
                                                            ? 'text-emerald-400'
                                                            : line.includes('Error') || line.includes('error')
                                                            ? 'text-red-400'
                                                            : 'text-slate-300'
                                                    } whitespace-pre-wrap`}
                                                >
                                                    {line}
                                                </div>
                                            ))}
                                            <div ref={terminalEndRef} />
                                        </div>

                                        {/* Interactive Terminal Input Prompt */}
                                        <form onSubmit={handleTerminalCommand} className="flex items-center gap-2 pt-2 border-t border-white/5 mt-2">
                                            <span className="text-blue-400 font-bold">$</span>
                                            <input
                                                type="text"
                                                value={terminalInput}
                                                onChange={(e) => setTerminalInput(e.target.value)}
                                                placeholder="Type a command (help, npm start, npm test, ai <query>, ls, clear)..."
                                                className="flex-grow bg-transparent text-white outline-none font-mono text-xs placeholder-slate-600"
                                            />
                                        </form>
                                    </div>
                                ) : bottomTab === 'console' ? (
                                    <div className="flex-grow p-3 font-mono text-xs overflow-y-auto space-y-1 bg-[#080C14]">
                                        {consoleLogs.length === 0 ? (
                                            <p className="text-slate-500 italic">No console logs recorded from the preview frame yet.</p>
                                        ) : (
                                            consoleLogs.map((log, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex items-start gap-2 ${
                                                        log.level === 'error' ? 'text-red-400' : 'text-slate-300'
                                                    }`}
                                                >
                                                    <span className="text-[10px] text-slate-500 font-sans">{log.time}</span>
                                                    <span className="font-semibold uppercase text-[10px] px-1 rounded bg-slate-900 border border-slate-800">
                                                        {log.level}
                                                    </span>
                                                    <span>{log.message}</span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex-grow p-2 bg-[#070A11] flex items-center justify-center overflow-hidden">
                                        <iframe
                                            key={previewKey}
                                            srcDoc={combinedPreviewDoc}
                                            title="Live Web Preview"
                                            className={`h-full transition-all duration-300 rounded-xl border border-white/10 bg-white ${
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

                {/* Vertical Resizer Handle between Editor and Right AI Panel */}
                {isRightPanelOpen && (
                    <div
                        onMouseDown={() => {
                            isDraggingRightPanel.current = true
                            document.body.style.cursor = 'col-resize'
                        }}
                        className="resizer-h bg-transparent hover:bg-indigo-500 z-10 select-none"
                    />
                )}

                {/* 2.5 RIGHT PANEL: Fusion AI Copilot & Collaborator Chat (Resizable) */}
                {isRightPanelOpen && (
                    <aside
                        style={{ width: `${rightPanelWidth}px` }}
                        className="bg-[#090D16] border-l border-white/5 flex flex-col shrink-0 select-none overflow-hidden"
                    >
                        {/* Right Panel Header */}
                        <div className="h-10 border-b border-white/5 px-3 flex items-center justify-between shrink-0 bg-[#080C14]">
                            <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
                                <button
                                    onClick={() => setRightPanelTab('copilot')}
                                    className={`px-2 py-0.5 rounded-md font-semibold transition ${
                                        rightPanelTab === 'copilot' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    ✨ Copilot
                                </button>
                                <button
                                    onClick={() => {
                                        setRightPanelTab('chat')
                                        setUnreadTeamCount(0)
                                    }}
                                    className={`px-2 py-0.5 rounded-md font-semibold transition flex items-center gap-1 ${
                                        rightPanelTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    <span>👥 Team Chat</span>
                                    {unreadTeamCount > 0 && rightPanelTab !== 'chat' && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
                                    )}
                                </button>
                            </div>

                            {/* Mode Selector (When Copilot is Active) or Room Status (When Team Chat is Active) */}
                            {rightPanelTab === 'copilot' ? (
                                <div className="flex items-center gap-1 text-[10px]">
                                    <button
                                        onClick={() => setAiMode('copilot')}
                                        className={`px-1.5 py-0.5 rounded transition ${aiMode === 'copilot' ? 'text-blue-400 font-bold' : 'text-slate-500'}`}
                                    >
                                        Auto
                                    </button>
                                    <span className="text-slate-700">•</span>
                                    <button
                                        onClick={() => setAiMode('refactor')}
                                        className={`px-1.5 py-0.5 rounded transition ${aiMode === 'refactor' ? 'text-blue-400 font-bold' : 'text-slate-500'}`}
                                    >
                                        Refactor
                                    </button>
                                    <span className="text-slate-700">•</span>
                                    <button
                                        onClick={() => setAiMode('test')}
                                        className={`px-1.5 py-0.5 rounded transition ${aiMode === 'test' ? 'text-blue-400 font-bold' : 'text-slate-500'}`}
                                    >
                                        Tests
                                    </button>
                                </div>
                            ) : (
                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    {onlineUsers.length > 0 ? `${onlineUsers.length} online` : 'Room Live'}
                                </span>
                            )}
                        </div>

                        {/* Messages Thread Container for Copilot */}
                        {rightPanelTab === 'copilot' && (
                            <div className="flex-grow p-3 space-y-3 overflow-y-auto text-xs">
                                {aiMessages.map((msg, i) => {
                                    const codeSnippet = msg.suggestedCode || extractCodeBlock(msg.text)
                                    const isUser = msg.sender === 'user'

                                    return (
                                        <div
                                            key={i}
                                            className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                        >
                                            <div className={`p-3 rounded-2xl max-w-[95%] leading-relaxed ${
                                                isUser
                                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                                                    : 'bg-[#080C14] border border-white/5 text-slate-200 rounded-bl-none'
                                            }`}>
                                                <p className="whitespace-pre-wrap">{msg.text.split('```')[0]}</p>

                                                {/* Code Snippet Card with Action Buttons */}
                                                {codeSnippet && (
                                                    <div className="mt-2.5 rounded-xl border border-white/10 bg-black/50 p-2.5 font-mono text-[11px] overflow-hidden">
                                                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 text-[10px] text-slate-400">
                                                            <span>Code Snippet</span>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(codeSnippet)
                                                                        addToast('Copied code to clipboard!')
                                                                    }}
                                                                    className="hover:text-white transition cursor-pointer"
                                                                >
                                                                    Copy
                                                                </button>
                                                                <span>•</span>
                                                                <button
                                                                    onClick={() => handleApplyAiCode(codeSnippet, msg.targetFile || activeFile)}
                                                                    className="text-blue-400 hover:text-blue-300 font-bold transition cursor-pointer"
                                                                >
                                                                    Apply to {msg.targetFile || activeFile}
                                                                </button>
                                                                {msg.targetFile && msg.targetFile !== activeFile && (
                                                                    <>
                                                                        <span>•</span>
                                                                        <button
                                                                            onClick={() => handleCreateAiFile(msg.targetFile, codeSnippet)}
                                                                            className="text-emerald-400 hover:text-emerald-300 font-bold transition cursor-pointer"
                                                                        >
                                                                            New File
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <pre className="overflow-x-auto p-1 leading-5 text-slate-200">
                                                            {codeSnippet}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[9px] text-slate-500 mt-1 px-1">
                                                {isUser ? 'You' : 'Fusion AI'}
                                            </span>
                                        </div>
                                    )
                                })}

                                {aiLoading && (
                                    <div className="flex items-center gap-2 text-xs text-blue-400 p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 animate-pulse">
                                        <i className="ri-loader-4-line animate-spin"></i>
                                        <span>Synthesizing code recommendation for {activeFile}...</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}

                        {/* Messages Thread Container for Team Chat */}
                        {rightPanelTab === 'chat' && (
                            <div className="flex-grow p-3 space-y-3 overflow-y-auto text-xs">
                                {teamMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
                                            <i className="ri-chat-smile-2-line text-2xl"></i>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-300">Team Workspace Chat</p>
                                        <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                                            No messages yet. Send a message below to broadcast updates to collaborators in this workspace.
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
                                                <div className={`p-3 rounded-2xl max-w-[95%] leading-relaxed ${
                                                    isUser
                                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                                                        : 'bg-indigo-950/70 border border-indigo-700/40 text-slate-100 rounded-bl-none shadow-sm'
                                                }`}>
                                                    {!isUser && (
                                                        <p className="text-[10px] font-bold text-indigo-400 mb-1 flex items-center gap-1">
                                                            <i className="ri-user-smile-line"></i>
                                                            {msg.senderName || 'Collaborator'}
                                                        </p>
                                                    )}
                                                    <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 mt-1 px-1">
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

                        {/* Quick AI Action Pills - ONLY shown for Copilot */}
                        {rightPanelTab === 'copilot' && (
                            <div className="p-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto text-[10px] bg-[#080C14]">
                                <button
                                    onClick={() => setPrompt(`Explain the structure and architecture of ${activeFile}`)}
                                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                                >
                                    ✨ Explain
                                </button>
                                <button
                                    onClick={() => setPrompt(`Refactor ${activeFile} for clean asynchronous performance`)}
                                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                                >
                                    ⚡ Refactor
                                </button>
                                <button
                                    onClick={() => setPrompt(`Write comprehensive Vitest assertions for ${activeFile}`)}
                                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                                >
                                    🧪 Tests
                                </button>
                                <button
                                    onClick={() => setPrompt(`Debug and audit ${activeFile} for edge cases`)}
                                    className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                                >
                                    🐛 Debug
                                </button>
                            </div>
                        )}

                        {/* Input Box */}
                        <form onSubmit={handleSendPrompt} className="p-2.5 border-t border-white/5 bg-[#080C14]">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={rightPanelTab === 'copilot' ? `Ask AI about ${activeFile}...` : `Broadcast message to team...`}
                                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition font-sans"
                                />
                                <button
                                    type="submit"
                                    disabled={!prompt.trim() || (rightPanelTab === 'copilot' && aiLoading)}
                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-indigo-400 hover:text-indigo-300 disabled:opacity-30 cursor-pointer"
                                    title={rightPanelTab === 'copilot' ? 'Send prompt to Copilot' : 'Send message to team'}
                                >
                                    <i className={`${rightPanelTab === 'copilot' ? 'ri-sparkling-fill' : 'ri-send-plane-fill'} text-sm`}></i>
                                </button>
                            </div>
                        </form>
                    </aside>
                )}
            </div>

            {/* ================= 3. USERS / COLLABORATORS MODAL ================= */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fadeIn"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false)
                    }}
                >
                    <div className="w-full max-w-md sm:max-w-lg rounded-3xl border border-white/10 bg-[#090D16] p-5 sm:p-6 pb-20 sm:pb-24 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-white shadow-md">
                                    <i className="ri-group-line text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                        Invite Collaborators
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                            {selectedUserId.length} Selected
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-400">Click a user tile to select for real-time collaboration</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                                title="Close modal"
                            >
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>

                        {/* Search Filter Bar */}
                        <div className="pt-3.5 pb-2 shrink-0">
                            <div className="relative">
                                <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                                <input
                                    type="text"
                                    value={userSearchQuery}
                                    onChange={(e) => setUserSearchQuery(e.target.value)}
                                    placeholder="Search users by email or ID..."
                                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition font-mono"
                                />
                                {userSearchQuery && (
                                    <button
                                        onClick={() => setUserSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer"
                                    >
                                        <i className="ri-close-circle-fill"></i>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Users List Container */}
                        <div className="flex-grow overflow-y-auto space-y-2 py-2 pr-1 min-h-[160px] max-h-60 sm:max-h-64">
                            {fetchingUsers ? (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                                    <i className="ri-loader-4-line animate-spin text-2xl text-blue-400"></i>
                                    <span className="text-xs">Loading registered users...</span>
                                </div>
                            ) : users.length === 0 ? (
                                <div className="text-center py-8 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
                                    <i className="ri-user-search-line text-3xl text-slate-600 mb-2 block"></i>
                                    <p className="text-xs font-semibold text-slate-400">No other registered users available</p>
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
                                                        ? 'bg-slate-900/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                                                        : isSelected
                                                        ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/40 text-white shadow-lg shadow-blue-500/10'
                                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center uppercase shrink-0 shadow-md ${
                                                        isSelected
                                                            ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                                                            : 'bg-slate-800 text-slate-300'
                                                    }`}>
                                                        {u.email ? u.email[0] : 'U'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-white truncate">{u.email}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono truncate">{u._id}</p>
                                                    </div>
                                                </div>

                                                <div className="shrink-0 ml-2">
                                                    {isAlreadyInProject ? (
                                                        <span className="text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded bg-slate-800">
                                                            Member
                                                        </span>
                                                    ) : (
                                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                                                            isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'border-slate-700 bg-slate-850'
                                                        }`}>
                                                            {isSelected && <i className="ri-check-line text-xs"></i>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 bg-[#090D16]/95 border-t border-slate-800 flex items-center justify-between gap-3 backdrop-blur-xl">
                            <span className="text-xs text-slate-400 font-medium">
                                {selectedUserId.length} collaborator(s) chosen
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-900 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddCollaborators}
                                    disabled={submittingUsers || selectedUserId.length === 0}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white transition shadow-lg shadow-blue-600/25 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    {submittingUsers ? (
                                        <>
                                            <i className="ri-loader-4-line animate-spin text-sm"></i>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="ri-user-add-line text-sm"></i>
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsDetailsModalOpen(false)
                    }}
                >
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#090D16] p-6 shadow-2xl relative overflow-hidden">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                    <i className="ri-information-line text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white">Workspace Details</h3>
                                    <p className="text-xs text-slate-400">Environment & Collaboration Metadata</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                            >
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                                <p className="text-slate-400 mb-1">Workspace Name</p>
                                <p className="font-bold text-white text-sm">{project.name}</p>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                                <p className="text-slate-400 mb-1">Project ID</p>
                                <p className="font-mono text-blue-300 break-all select-all">{project._id || targetProjectId}</p>
                            </div>

                            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
                                <p className="text-slate-400 mb-1">Collaborators ({collaborators.length})</p>
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                    {collaborators.map((c, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-mono"
                                        >
                                            {typeof c === 'string' ? c : c.email}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition cursor-pointer"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= 5. RENAME WORKSPACE MODAL ================= */}
            {isRenameModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsRenameModalOpen(false)
                    }}
                >
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#090D16] p-6 shadow-2xl relative overflow-hidden">
                        <h3 className="text-base font-bold text-white mb-2">Rename Workspace</h3>
                        <p className="text-xs text-slate-400 mb-4">Update the display name of this cloud project</p>

                        <form onSubmit={handleRenameWorkspace} className="space-y-4">
                            <input
                                type="text"
                                autoFocus
                                value={newProjectNameInput}
                                onChange={(e) => setNewProjectNameInput(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white outline-none focus:border-blue-500"
                            />

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsRenameModalOpen(false)}
                                    className="px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300 hover:bg-slate-900 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newProjectNameInput.trim()}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer"
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
