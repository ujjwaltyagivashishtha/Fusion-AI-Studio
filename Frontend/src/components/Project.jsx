import { useState, useEffect, useContext, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import CodeEditor from './CodeEditor.jsx'
import CommandPalette from './CommandPalette.jsx'
import ToastContainer from './Toast.jsx'
import { intializeSocket, recieveMessage, sendMessage, disconnectSocket, removeListener } from '../config/socket.js'

const INITIAL_FILES = {
  'app.js': `// Fusion AI Studio - Main Application Server
import express from 'express';
const app = express();

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

app.listen(3000, () => {
  console.log("🚀 Server running smoothly on port 3000");
});`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fusion AI Web Preview</title>
  <style>
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
    }
    h1 { 
      color: #60A5FA; 
      margin-top: 0; 
      display: flex;
      align-items: center;
      gap: 0.75rem;
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
    }
  </style>
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
    <button class="btn" onclick="alert('Container response OK!')">Test Cloud Interaction</button>
  </div>
</body>
</html>`,
  'style.css': `/* Workspace Global Stylesheet */
:root {
  --primary: #3b82f6;
  --bg-dark: #080c14;
}

body {
  margin: 0;
  background-color: var(--bg-dark);
  font-family: 'Outfit', sans-serif;
  color: #f8fafc;
}`,
  'package.json': `{
  "name": "fusion-ai-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
}

const Project = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { id: routeProjectId } = useParams()
    const { user } = useContext(UserContext)

    // Project state & active project ID resolution
    const initialProject = location.state?.project || { name: 'Demo Workspace', users: [user?.email || 'User'] }
    const [project, setProject] = useState(initialProject)
    const targetProjectId = routeProjectId || location.state?.project?._id || project._id

    // Socket Connection State
    const [socketConnected, setSocketConnected] = useState(false)

    // Layout Panes & Activity Bar State
    const [activeActivityTab, setActiveActivityTab] = useState('explorer') // 'explorer' | 'search' | 'git' | 'copilot'
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [sidebarWidth, setSidebarWidth] = useState(240)
    const [rightPanelWidth, setRightPanelWidth] = useState(320)
    const [isRightPanelOpen, setIsRightPanelOpen] = useState(true)
    const [rightPanelTab, setRightPanelTab] = useState('copilot') // 'copilot' | 'chat'

    // Files state
    const [files, setFiles] = useState(INITIAL_FILES)
    const [openFiles, setOpenFiles] = useState(['app.js', 'index.html'])
    const [activeFile, setActiveFile] = useState('app.js')
    const [fileFilter, setFileFilter] = useState('')
    const [newFileName, setNewFileName] = useState('')
    const [isCreatingFile, setIsCreatingFile] = useState(false)

    // AI Assistant State
    const [aiMode, setAiMode] = useState('coder') // 'coder' | 'architect' | 'reviewer'
    const [aiMessages, setAiMessages] = useState([
        {
            sender: 'ai',
            text: `Hello ${user?.email ? user.email.split('@')[0] : 'Developer'}! I'm your Fusion AI Partner for **${project.name}**.\n\nI can generate code, refactor functions, or write unit tests. What would you like to build?`
        }
    ])
    const [prompt, setPrompt] = useState('')
    const [aiLoading, setAiLoading] = useState(false)

    // Bottom Drawer State
    const [bottomDrawerHeight, setBottomDrawerHeight] = useState(200)
    const [bottomTab, setBottomTab] = useState('terminal') // 'terminal' | 'preview' | 'problems' | 'hidden'
    const [terminalInput, setTerminalInput] = useState('')
    const [terminalHistory, setTerminalHistory] = useState([
        `Fusion AI Cloud Terminal (Node v20.10.0, npm v10.2.3)`,
        `Type "help" for a list of available workspace commands.`,
        `[SYSTEM] Connected to workspace container for "${project.name}".`
    ])
    const [isSplitPreview, setIsSplitPreview] = useState(false)
    const [previewViewport, setPreviewViewport] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'
    const [previewKey, setPreviewKey] = useState(0)

    // Command Palette & Modals State
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

    // Users & Collaborators State
    const [users, setUsers] = useState([])
    const [selectedUserId, setSelectedUserId] = useState([])
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [fetchingUsers, setFetchingUsers] = useState(false)
    const [collaborators, setCollaborators] = useState(project.users || [])
    const [addingCollaborators, setAddingCollaborators] = useState(false)

    // Reactive Toasts State
    const [toasts, setToasts] = useState([])

    // Drag Resizer Refs
    const isDraggingSidebar = useRef(false)
    const isDraggingRightPanel = useRef(false)
    const isDraggingBottomDrawer = useRef(false)
    const terminalEndRef = useRef(null)

    const addToast = (message, type = 'success') => {
        const id = Date.now() + Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 3200)
    }

    const dismissToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    // Hotkey handler (Cmd+K / Ctrl+K, Ctrl+Enter)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsCommandPaletteOpen((prev) => !prev)
            } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault()
                handleRunCode()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Sync project details & preload users from Backend API
    useEffect(() => {
        if (targetProjectId) {
            axios.get(`/projects/get-project/${targetProjectId}`)
                .then((res) => {
                    if (res.data.project) {
                        setProject(res.data.project)
                        setCollaborators(res.data.project.users || [])
                    }
                })
                .catch((err) => {
                    console.error('Error fetching project details:', err)
                })
        }

        axios.get('/users/all')
            .then((res) => {
                setUsers(res.data.users || [])
            })
            .catch((err) => {
                console.error('Error fetching users:', err)
            })
    }, [targetProjectId])

    // Initialize Real-time Socket Connection for this project
    useEffect(() => {
        if (!targetProjectId) return

        const socket = intializeSocket(targetProjectId)

        const handleProjectMessage = (data) => {
            console.log('Received socket message:', data)
            const senderId = data.sender?._id || data.sender
            const isSelf = senderId === user?._id || data.sender?.email === user?.email

            if (isSelf) return // Ignore echo of own message

            if (data.sender) {
                const senderName = typeof data.sender === 'object'
                    ? data.sender.email?.split('@')[0] || 'Collaborator'
                    : String(data.sender).split('@')[0]

                setAiMessages((prev) => [
                    ...prev,
                    {
                        sender: 'collaborator',
                        senderName,
                        text: data.message
                    }
                ])
                addToast(`New message from ${senderName}`, 'info')
            } else {
                setAiMessages((prev) => [
                    ...prev,
                    {
                        sender: 'ai',
                        text: data.message
                    }
                ])
            }
        }

        const handleConnect = () => {
            setSocketConnected(true)
            setTerminalHistory((prev) => [...prev, `[SOCKET] Real-time collaboration connected to room: ${targetProjectId}`])
        }

        const handleDisconnect = () => {
            setSocketConnected(false)
            setTerminalHistory((prev) => [...prev, `[SOCKET] Disconnected from workspace channel`])
        }

        const handleConnectError = (err) => {
            setSocketConnected(false)
            console.error('Socket connection error:', err?.message)
        }

        recieveMessage('project-message', handleProjectMessage)
        recieveMessage('connect', handleConnect)
        recieveMessage('disconnect', handleDisconnect)
        recieveMessage('connect_error', handleConnectError)

        if (socket?.connected) {
            setSocketConnected(true)
        }

        return () => {
            removeListener('project-message', handleProjectMessage)
            removeListener('connect', handleConnect)
            removeListener('disconnect', handleDisconnect)
            removeListener('connect_error', handleConnectError)
            disconnectSocket()
        }
    }, [targetProjectId, user?._id, user?.email])

    // Drag Resizer Handlers
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingSidebar.current) {
                const newWidth = Math.min(Math.max(160, e.clientX - 48), 440)
                setSidebarWidth(newWidth)
            } else if (isDraggingRightPanel.current) {
                const newWidth = Math.min(Math.max(240, window.innerWidth - e.clientX), 550)
                setRightPanelWidth(newWidth)
            } else if (isDraggingBottomDrawer.current) {
                const newHeight = Math.min(Math.max(100, window.innerHeight - e.clientY - 26), 500)
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

    // Auto-scroll terminal on new output
    useEffect(() => {
        if (terminalEndRef.current) {
            terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [terminalHistory])

    // Auto-fetch users when modal opens
    const fetchUsers = () => {
        setFetchingUsers(true)
        axios.get('/users/all')
            .then((res) => {
                setUsers(res.data.users || [])
            })
            .catch((err) => {
                console.error('Error fetching users:', err)
            })
            .finally(() => {
                setFetchingUsers(false)
            })
    }

    const handleOpenInviteModal = () => {
        setIsModalOpen(true)
        fetchUsers()
    }

    // Select or toggle user ID in state variable when user tile is clicked
    const handleUserClick = (id) => {
        setSelectedUserId((prev) => {
            if (prev.includes(id)) {
                return prev.filter((uId) => uId !== id)
            } else {
                return [...prev, id]
            }
        })
    }

    // Filter users list based on search query
    const filteredUsersList = users.filter((u) =>
        (u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) ||
        (u._id || '').toLowerCase().includes(userSearchQuery.toLowerCase())
    )

    // Add selected users to project via backend API: PUT /projects/add-user
    const addCollaborators = async (e) => {
        e?.preventDefault()
        const usersToAdd = Array.from(selectedUserId)
        const currentId = project._id || targetProjectId
        if (usersToAdd.length === 0 || !currentId) return

        try {
            setAddingCollaborators(true)
            const res = await axios.put('/projects/add-user', {
                projectId: currentId,
                users: usersToAdd
            })

            if (res.data.project) {
                const updatedRes = await axios.get(`/projects/get-project/${currentId}`)
                if (updatedRes.data.project) {
                    setProject(updatedRes.data.project)
                    setCollaborators(updatedRes.data.project.users || [])
                }
            }

            setTerminalHistory((prev) => [...prev, `[COLLABORATOR] Added ${usersToAdd.length} member(s) to workspace`])
            addToast(`Added ${usersToAdd.length} collaborator(s) to workspace!`)
            setSelectedUserId([])
            setIsModalOpen(false)
        } catch (err) {
            console.error('Failed to add users:', err)
            addToast('Failed to add collaborators. Please try again.', 'error')
        } finally {
            setAddingCollaborators(false)
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
        const remaining = openFiles.filter((f) => f !== fileName)
        setOpenFiles(remaining)
        if (activeFile === fileName && remaining.length > 0) {
            setActiveFile(remaining[remaining.length - 1])
        }
    }

    const handleCreateFile = (e) => {
        e.preventDefault()
        if (!newFileName.trim()) return
        const name = newFileName.trim()
        if (!files[name]) {
            setFiles({ ...files, [name]: `// New file: ${name}\n` })
            setOpenFiles([...openFiles, name])
            setActiveFile(name)
            addToast(`Created new file: ${name}`)
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
        addToast(`Deleted ${fileName}`, 'info')
    }

    const handleContentChange = (content) => {
        setFiles((prev) => ({
            ...prev,
            [activeFile]: content
        }))
    }

    // Run Code & Rebuild Preview
    const handleRunCode = () => {
        setPreviewKey((prev) => prev + 1)
        if (!isSplitPreview) {
            setBottomTab('preview')
        }
        setTerminalHistory((prev) => [
            ...prev,
            `$ npm run build`,
            `> vite build --mode development`,
            `✓ Compiled in 12ms. Web container active on http://localhost:3000`
        ])
        addToast('Live preview container updated!', 'success')
    }

    // Interactive Terminal Command Execution
    const handleTerminalCommand = (e) => {
        e.preventDefault()
        if (!terminalInput.trim()) return

        const cmd = terminalInput.trim()
        setTerminalInput('')
        const newLogs = [...terminalHistory, `$ ${cmd}`]

        if (cmd === 'clear') {
            setTerminalHistory([`Fusion AI Cloud Terminal (Node v20.10.0)`])
            return
        } else if (cmd === 'help') {
            newLogs.push(
                'Available commands:',
                '  npm start       - Launch Express web application',
                '  npm test        - Execute Vitest workspace test suite',
                '  node app.js     - Run main application entry file',
                '  git status      - Show working branch and changes',
                '  ls              - List files in workspace root',
                '  clear           - Clear terminal history'
            )
        } else if (cmd === 'ls') {
            newLogs.push(Object.keys(files).join('   '))
        } else if (cmd === 'git status') {
            newLogs.push(`On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean`)
        } else if (cmd === 'npm test') {
            newLogs.push(`> vitest run\n\n✓ ${activeFile} unit tests passed (3/3)\nTest Files 1 passed (1)\nTests 3 passed (3)`)
        } else if (cmd === 'npm start' || cmd === 'node app.js') {
            newLogs.push(`[nodemon] 3.1.0\n[nodemon] starting 'node app.js'\n🚀 Server running smoothly on port 3000\nConnected to Fusion Cloud Runner`)
        } else {
            newLogs.push(`bash: command not found: ${cmd}. Type "help" for a list of commands.`)
        }

        setTerminalHistory(newLogs)
    }

    // AI Prompt / Project Message Send Handler
    const handleSendPrompt = (e) => {
        e?.preventDefault()
        if (!prompt.trim() || aiLoading) return

        const userMsg = prompt.trim()
        const currentId = project._id || targetProjectId
        setPrompt('')
        setAiMessages((prev) => [...prev, { sender: 'user', text: userMsg }])

        // Emit real-time project message to socket server
        if (currentId) {
            sendMessage('project-message', {
                message: userMsg,
                sender: user,
                projectId: currentId
            })
        }

        setAiLoading(true)

        setTimeout(() => {
            let aiReply = ''
            if (userMsg.toLowerCase().includes('refactor') || userMsg.toLowerCase().includes('explain')) {
                aiReply = `I audited **${activeFile}**. Here is an optimized and modular implementation:\n\n\`\`\`javascript\n// Optimized Handler - Fusion AI Studio\nexport const processWorkspaceRequest = async (req, res) => {\n  try {\n    const timestamp = Date.now();\n    return res.status(200).json({\n      ok: true,\n      executionTime: "1.4ms",\n      timestamp\n    });\n  } catch (error) {\n    return res.status(500).json({ error: error.message });\n  }\n};\n\`\`\`\n\nYou can click **Apply to ${activeFile}** below to insert this directly into your file.`
            } else if (userMsg.toLowerCase().includes('test')) {
                aiReply = `Here is a Jest / Vitest unit test suite for **${activeFile}**:\n\n\`\`\`javascript\nimport { describe, it, expect } from 'vitest';\n\ndescribe('${activeFile} Suite', () => {\n  it('should initialize without exceptions', () => {\n    expect(true).toBe(true);\n  });\n});\n\`\`\``
            } else {
                aiReply = `Understood! I'm synchronized with **${project.name}** in **${aiMode.toUpperCase()}** mode.\n\nWould you like me to generate full code snippets, add a new endpoint, or review syntax in **${activeFile}**?`
            }

            setAiMessages((prev) => [...prev, { sender: 'ai', text: aiReply }])
            setAiLoading(false)
            setTerminalHistory((prev) => [...prev, `[AI-LOG] Generated recommendation for ${activeFile}`])
        }, 850)
    }

    // Helper to extract code block from markdown
    const extractCodeBlock = (text) => {
        const match = text.match(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/)
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
        return { icon: 'ri-file-text-line', color: 'text-slate-400', label: 'TXT' }
    }

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
                onTriggerAiPrompt={(text) => setPrompt(text)}
            />

            {/* ================= 1. TOP MASTER NAVIGATION BAR ================= */}
            <header className="h-12 border-b border-white/5 bg-[#090D16]/90 backdrop-blur-xl px-3 flex items-center justify-between z-30 shrink-0">
                {/* Left: Brand Logo, Back & Project Title */}
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
                        <h1 className="font-bold text-xs text-white truncate max-w-[140px] sm:max-w-xs group-hover:text-blue-300 transition">
                            {project.name}
                        </h1>
                        <i className="ri-information-line text-slate-500 text-xs group-hover:text-blue-400 transition"></i>
                    </button>

                    {/* Environment Pill */}
                    <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Node v20.10
                    </span>

                    {/* Socket Real-time Status */}
                    <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition ${
                        socketConnected 
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                            : 'bg-amber-500/10 border-amber-500/25 text-amber-400'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${socketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
                        {socketConnected ? 'Realtime Live' : 'Connecting...'}
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

                {/* Right: Actions, Layout Controls, Members & Run */}
                <div className="flex items-center gap-2 sm:gap-2.5">
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
                            onClick={() => setIsCommandPaletteOpen(true)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer"
                            title="Search Files & Symbols (⌘K)"
                        >
                            <i className="ri-search-line text-base"></i>
                        </button>

                        <button
                            onClick={() => {
                                setBottomTab(bottomTab === 'terminal' ? 'hidden' : 'terminal')
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                                bottomTab === 'terminal'
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            title="Cloud Terminal Drawer"
                        >
                            <i className="ri-terminal-box-line text-base"></i>
                        </button>

                        <button
                            onClick={() => {
                                if (isSplitPreview) {
                                    setIsSplitPreview(false)
                                } else {
                                    setIsSplitPreview(true)
                                }
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                                isSplitPreview
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            title="Toggle Split Web Preview"
                        >
                            <i className="ri-global-line text-base"></i>
                        </button>

                        <button
                            onClick={() => {
                                setIsRightPanelOpen(!isRightPanelOpen)
                            }}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                                isRightPanelOpen
                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                            title="AI Copilot & Team Chat"
                        >
                            <i className="ri-sparkles-line text-base"></i>
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={handleOpenInviteModal}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-400 hover:bg-slate-900 transition cursor-pointer"
                            title="Team Collaborators"
                        >
                            <i className="ri-group-line text-base"></i>
                        </button>
                        <button
                            onClick={() => setIsDetailsModalOpen(true)}
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-900 transition cursor-pointer"
                            title="Workspace Info"
                        >
                            <i className="ri-settings-4-line text-base"></i>
                        </button>
                    </div>
                </nav>

                {/* 2.2 PRIMARY SIDEBAR (Files Explorer, Resizable) */}
                {isSidebarOpen && (
                    <aside
                        style={{ width: `${sidebarWidth}px` }}
                        className="bg-[#090D16] border-r border-white/5 flex flex-col shrink-0 select-none overflow-hidden"
                    >
                        {/* Explorer Header */}
                        <div className="h-9 border-b border-white/5 px-3 flex items-center justify-between shrink-0 bg-[#080C14]">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <i className="ri-folders-line text-blue-400"></i>
                                Explorer
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsCreatingFile(true)}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                                    title="New File"
                                >
                                    <i className="ri-file-add-line text-xs"></i>
                                </button>
                                <button
                                    onClick={() => setFileFilter('')}
                                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                                    title="Refresh Files"
                                >
                                    <i className="ri-refresh-line text-xs"></i>
                                </button>
                            </div>
                        </div>

                        {/* Search Filter input */}
                        <div className="p-2 border-b border-white/5 shrink-0">
                            <div className="relative">
                                <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]"></i>
                                <input
                                    type="text"
                                    value={fileFilter}
                                    onChange={(e) => setFileFilter(e.target.value)}
                                    placeholder="Filter files..."
                                    className="w-full pl-7 pr-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-white placeholder-slate-500 outline-none focus:border-blue-500 font-mono"
                                />
                            </div>
                        </div>

                        {/* Inline New File Form */}
                        {isCreatingFile && (
                            <form onSubmit={handleCreateFile} className="p-2 border-b border-blue-500/30 bg-blue-500/5 flex items-center gap-1 shrink-0 animate-fadeIn">
                                <input
                                    type="text"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    placeholder="filename.js"
                                    autoFocus
                                    className="w-full px-2 py-1 bg-slate-900 border border-blue-500 rounded text-xs text-white outline-none font-mono"
                                />
                                <button type="submit" className="text-xs text-blue-400 font-bold px-1.5 cursor-pointer">Add</button>
                                <button
                                    type="button"
                                    onClick={() => setIsCreatingFile(false)}
                                    className="text-xs text-slate-500 hover:text-white px-1 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </form>
                        )}

                        {/* Section: OPEN EDITORS */}
                        <div className="border-b border-white/5 pb-1 shrink-0">
                            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                <span>Open Editors</span>
                                <span className="text-slate-600 font-mono">{openFiles.length}</span>
                            </div>
                            <div className="space-y-0.5 px-1.5">
                                {openFiles.map((f) => {
                                    const badge = getFileBadge(f)
                                    const isActive = activeFile === f
                                    return (
                                        <div
                                            key={f}
                                            onClick={() => setActiveFile(f)}
                                            className={`px-2 py-1 rounded-md text-xs flex items-center justify-between cursor-pointer group transition ${
                                                isActive
                                                    ? 'bg-blue-600/15 text-blue-300 font-medium'
                                                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 truncate">
                                                <i className={`${badge.icon} ${badge.color} text-xs`}></i>
                                                <span className="truncate">{f}</span>
                                            </div>
                                            <button
                                                onClick={(e) => handleCloseTab(e, f)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white text-xs transition"
                                                title="Close"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Section: WORKSPACE FILES */}
                        <div className="flex-grow overflow-y-auto p-1.5 space-y-0.5">
                            <div className="px-1.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                                <span>Workspace Files</span>
                                <span className="text-slate-600 font-mono">{filteredFiles.length}</span>
                            </div>

                            {filteredFiles.map((fileName) => {
                                const isActive = activeFile === fileName
                                const badge = getFileBadge(fileName)

                                return (
                                    <div
                                        key={fileName}
                                        onClick={() => handleSelectFile(fileName)}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition group cursor-pointer ${
                                            isActive
                                                ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                                : 'text-slate-300 hover:bg-slate-900/80 hover:text-white border border-transparent'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <i className={`${badge.icon} ${badge.color} text-sm shrink-0`}></i>
                                            <span className="truncate font-mono">{fileName}</span>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1" />}
                                            <button
                                                onClick={(e) => handleDeleteFile(e, fileName)}
                                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-slate-500 transition cursor-pointer"
                                                title="Delete file"
                                            >
                                                <i className="ri-delete-bin-line text-xs"></i>
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Collaborator Footer Widget */}
                        <div className="p-3 border-t border-white/5 bg-[#080C14] shrink-0">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <i className="ri-team-line text-blue-400"></i>
                                    <span>Team Online</span>
                                    <span className="px-1.5 py-0.2 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                                        {collaborators.length}
                                    </span>
                                </span>
                                <button
                                    onClick={handleOpenInviteModal}
                                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold cursor-pointer"
                                >
                                    + Add
                                </button>
                            </div>
                            <div className="space-y-1.5 max-h-20 overflow-y-auto pr-1">
                                {collaborators.map((member, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                                        <span className="truncate font-mono text-[11px]">{typeof member === 'string' ? member : member.email}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                )}

                {/* Vertical Resizer Handle between Sidebar and Editor */}
                {isSidebarOpen && (
                    <div
                        onMouseDown={() => {
                            isDraggingSidebar.current = true
                            document.body.style.cursor = 'col-resize'
                        }}
                        className="resizer-h bg-transparent hover:bg-blue-500 z-10 select-none"
                    />
                )}

                {/* 2.3 CENTER STAGE (Tabs Bar, Code Editor, Bottom Drawer) */}
                <main className="flex-grow flex flex-col min-w-0 bg-[#0B0F19] overflow-hidden">
                    {/* Active File Tab Bar */}
                    <div className="h-9 border-b border-white/5 bg-[#080C14] flex items-center overflow-x-auto shrink-0 px-2 gap-1 select-none">
                        {openFiles.map((file) => {
                            const isActive = activeFile === file
                            const badge = getFileBadge(file)
                            return (
                                <div
                                    key={file}
                                    onClick={() => setActiveFile(file)}
                                    className={`h-7 px-3 rounded-t-lg text-xs font-mono flex items-center gap-2 border-t border-x cursor-pointer transition ${
                                        isActive
                                            ? 'bg-[#0B0F19] border-white/10 text-white font-medium border-t-2 border-t-blue-500 shadow-sm'
                                            : 'bg-[#080C14] border-transparent text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <i className={`${badge.icon} ${badge.color} text-xs`}></i>
                                    <span>{file}</span>
                                    {openFiles.length > 1 && (
                                        <button
                                            onClick={(e) => handleCloseTab(e, file)}
                                            className="text-slate-500 hover:text-red-400 transition ml-1"
                                            title="Close tab"
                                        >
                                            ✕
                                        </button>
                                    )}
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

                                {/* Preview Frame */}
                                <div className="flex-grow p-4 bg-[#070A11] overflow-y-auto flex items-start justify-center">
                                    <div
                                        key={previewKey}
                                        className={`w-full transition-all duration-300 rounded-2xl border border-white/5 bg-[#090D16] p-4 text-white shadow-2xl ${
                                            previewViewport === 'mobile'
                                                ? 'max-w-[360px]'
                                                : previewViewport === 'tablet'
                                                ? 'max-w-[700px]'
                                                : 'max-w-full'
                                        }`}
                                    >
                                        <div
                                            className="text-xs text-slate-300 space-y-2"
                                            dangerouslySetInnerHTML={{ __html: files['index.html'] || '<div>Empty HTML Preview</div>' }}
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

                    {/* 2.4 BOTTOM DRAWER (Terminal, Web Preview, Logs) */}
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
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setTerminalHistory([])}
                                        className="text-[11px] text-slate-500 hover:text-slate-300"
                                        title="Clear terminal logs"
                                    >
                                        Clear
                                    </button>
                                    <button
                                        onClick={() => setBottomTab('hidden')}
                                        className="text-slate-400 hover:text-white"
                                        title="Close drawer"
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-grow overflow-hidden flex flex-col">
                                {bottomTab === 'terminal' ? (
                                    <div className="flex-grow p-3 font-mono text-xs text-slate-300 overflow-y-auto flex flex-col justify-between">
                                        <div className="space-y-1">
                                            {terminalHistory.map((line, idx) => (
                                                <div key={idx} className="leading-5">
                                                    {line.startsWith('$') ? (
                                                        <span className="text-blue-400 font-semibold">{line}</span>
                                                    ) : line.includes('error') || line.includes('Error') ? (
                                                        <span className="text-red-400">{line}</span>
                                                    ) : line.includes('✓') || line.includes('passed') ? (
                                                        <span className="text-emerald-400">{line}</span>
                                                    ) : (
                                                        <span className="text-slate-400">{line}</span>
                                                    )}
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
                                                placeholder="Type a command (help, npm start, npm test, clear)..."
                                                className="flex-grow bg-transparent text-white outline-none font-mono text-xs placeholder-slate-600"
                                            />
                                        </form>
                                    </div>
                                ) : (
                                    <div className="flex-grow p-4 bg-[#070A11] overflow-y-auto">
                                        <div
                                            key={previewKey}
                                            className="rounded-xl border border-white/5 bg-[#090D16] p-4 text-white"
                                            dangerouslySetInnerHTML={{ __html: files['index.html'] || '<div>Empty HTML Preview</div>' }}
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
                                    onClick={() => setRightPanelTab('chat')}
                                    className={`px-2 py-0.5 rounded-md font-semibold transition ${
                                        rightPanelTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    👥 Team Chat
                                </button>
                            </div>

                            {/* Mode Selector (When Copilot is Active) */}
                            {rightPanelTab === 'copilot' ? (
                                <div className="flex items-center gap-1 text-[10px]">
                                    <button
                                        onClick={() => setAiMode('coder')}
                                        className={`px-1.5 py-0.5 rounded transition ${aiMode === 'coder' ? 'text-blue-400 font-bold' : 'text-slate-500'}`}
                                    >
                                        Code
                                    </button>
                                    <span className="text-slate-700">•</span>
                                    <button
                                        onClick={() => setAiMode('reviewer')}
                                        className={`px-1.5 py-0.5 rounded transition ${aiMode === 'reviewer' ? 'text-blue-400 font-bold' : 'text-slate-500'}`}
                                    >
                                        Review
                                    </button>
                                </div>
                            ) : (
                                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Room Live
                                </span>
                            )}
                        </div>

                        {/* Messages Thread Container */}
                        <div className="flex-grow p-3 space-y-3 overflow-y-auto text-xs">
                            {aiMessages.map((msg, i) => {
                                const codeSnippet = extractCodeBlock(msg.text)
                                const isUser = msg.sender === 'user'
                                const isCollab = msg.sender === 'collaborator'

                                return (
                                    <div
                                        key={i}
                                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`p-3 rounded-2xl max-w-[95%] leading-relaxed ${
                                            isUser
                                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                                                : isCollab
                                                ? 'bg-indigo-950/80 border border-indigo-700/50 text-slate-100 rounded-bl-none shadow-md'
                                                : 'bg-[#080C14] border border-white/5 text-slate-200 rounded-bl-none'
                                        }`}>
                                            {isCollab && (
                                                <p className="text-[10px] font-bold text-indigo-400 mb-1 flex items-center gap-1">
                                                    <i className="ri-user-smile-line"></i>
                                                    {msg.senderName || 'Team Member'}
                                                </p>
                                            )}
                                            <p className="whitespace-pre-wrap">{msg.text.split('```')[0]}</p>

                                            {/* Code Snippet Card */}
                                            {codeSnippet && (
                                                <div className="mt-2.5 rounded-xl border border-white/10 bg-[#060911] p-2.5 font-mono text-[11px] text-blue-300">
                                                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/5 text-[10px] text-slate-400">
                                                        <span>Code Proposal</span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(codeSnippet)
                                                                    addToast('Code snippet copied!')
                                                                }}
                                                                className="hover:text-white transition cursor-pointer"
                                                            >
                                                                Copy
                                                            </button>
                                                            <span>•</span>
                                                            <button
                                                                onClick={() => {
                                                                    handleContentChange(codeSnippet)
                                                                    addToast(`Applied to ${activeFile}!`)
                                                                }}
                                                                className="text-blue-400 hover:text-blue-300 font-bold transition cursor-pointer"
                                                            >
                                                                Apply to {activeFile}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <pre className="overflow-x-auto p-1 leading-5 text-slate-200">
                                                        {codeSnippet}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-slate-500 mt-1 px-1">
                                            {isUser ? 'You' : isCollab ? msg.senderName || 'Collaborator' : 'Fusion AI'}
                                        </span>
                                    </div>
                                )
                            })}

                            {aiLoading && (
                                <div className="flex items-center gap-2 text-xs text-blue-400 p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 animate-pulse">
                                    <i className="ri-loader-4-line animate-spin"></i>
                                    <span>Synthesizing code for {activeFile}...</span>
                                </div>
                            )}
                        </div>

                        {/* Quick AI Action Pills */}
                        <div className="p-2 border-t border-white/5 flex items-center gap-1.5 overflow-x-auto text-[10px] bg-[#080C14]">
                            <button
                                onClick={() => setPrompt(`Explain the purpose and logic of ${activeFile}`)}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                            >
                                ✨ Explain
                            </button>
                            <button
                                onClick={() => setPrompt(`Refactor ${activeFile} for modular performance`)}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                            >
                                🚀 Refactor
                            </button>
                            <button
                                onClick={() => setPrompt(`Write complete unit tests for ${activeFile}`)}
                                className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                            >
                                🧪 Tests
                            </button>
                        </div>

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
                                    disabled={!prompt.trim() || aiLoading}
                                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-indigo-400 hover:text-indigo-300 disabled:opacity-30 cursor-pointer"
                                >
                                    <i className="ri-send-plane-fill text-sm"></i>
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

                        {/* Modal Header */}
                        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-800 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-white shadow-md">
                                    <i className="ri-group-line text-lg"></i>
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                        Select Users
                                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                            {selectedUserId.length} Selected
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-400">Click a user tile to select their ID</p>
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

                        {/* Selected State Variable Indicator Bar */}
                        {selectedUserId.length > 0 && (
                            <div className="py-1.5 px-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-center justify-between gap-2 shrink-0 my-1">
                                <div className="flex items-center gap-1.5 truncate">
                                    <i className="ri-checkbox-circle-fill text-blue-400 text-xs shrink-0"></i>
                                    <span className="font-semibold shrink-0">Selected IDs:</span>
                                    <span className="font-mono text-[10px] text-blue-200 truncate">
                                        [{selectedUserId.map(id => `"${id.slice(-5)}..."`).join(', ')}]
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedUserId([])}
                                    className="text-[10px] text-slate-400 hover:text-red-400 font-semibold underline shrink-0 cursor-pointer"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        {/* Users List Container */}
                        <div className="flex-grow overflow-y-auto space-y-2 py-2 pr-1 min-h-[160px] max-h-60 sm:max-h-64">
                            {fetchingUsers ? (
                                <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                                    <i className="ri-loader-4-line animate-spin text-2xl text-blue-400"></i>
                                    <span className="text-xs">Loading registered users...</span>
                                </div>
                            ) : filteredUsersList.length === 0 ? (
                                <div className="text-center py-8 px-4 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
                                    <i className="ri-user-search-line text-3xl text-slate-600 mb-2 block"></i>
                                    <p className="text-xs font-semibold text-slate-400">
                                        {userSearchQuery ? 'No matching users found' : 'No registered users available'}
                                    </p>
                                </div>
                            ) : (
                                filteredUsersList.map((u) => {
                                    const isSelected = selectedUserId.includes(u._id)
                                    const isAlreadyInProject = collaborators.some(c => (c._id || c) === u._id)

                                    return (
                                        <div
                                            key={u._id}
                                            onClick={() => !isAlreadyInProject && handleUserClick(u._id)}
                                            className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all duration-200 select-none ${
                                                isAlreadyInProject
                                                    ? 'bg-slate-900/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                                                    : isSelected
                                                        ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500/40 text-white shadow-lg shadow-blue-500/10 cursor-pointer'
                                                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700 cursor-pointer'
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
                                                    <p className={`font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                                        {u.email}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-mono truncate">
                                                        ID: {u._id}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="shrink-0 ml-2">
                                                {isAlreadyInProject ? (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-semibold border border-slate-700/60">
                                                        Member
                                                    </span>
                                                ) : isSelected ? (
                                                    <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs">
                                                        <span className="hidden sm:inline text-[10px]">Selected</span>
                                                        <i className="ri-checkbox-circle-fill text-lg"></i>
                                                    </div>
                                                ) : (
                                                    <i className="ri-checkbox-blank-circle-line text-slate-600 hover:text-slate-400 text-lg transition"></i>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        {/* Status bar */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-900 shrink-0">
                            <span>
                                {selectedUserId.length > 0
                                    ? `${selectedUserId.length} user${selectedUserId.length > 1 ? 's' : ''} selected`
                                    : 'Select one or more users to add'}
                            </span>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-white transition cursor-pointer text-xs"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Fixed Absolute Bottom Button */}
                        <button
                            type="button"
                            onClick={addCollaborators}
                            disabled={selectedUserId.length === 0 || addingCollaborators}
                            className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-6 sm:right-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs sm:text-sm font-semibold text-white disabled:opacity-40 flex items-center justify-center gap-2 transition shadow-xl shadow-blue-600/30 cursor-pointer"
                        >
                            {addingCollaborators ? (
                                <>
                                    <i className="ri-loader-4-line animate-spin text-sm"></i>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <i className="ri-user-add-line text-sm"></i>
                                    <span>Add Collaborator</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ================= 4. PROJECT DETAILS MODAL ================= */}
            {isDetailsModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsDetailsModalOpen(false)
                    }}
                >
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#090D16] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Header */}
                        <div className="flex items-start justify-between pb-4 mb-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-white shadow-lg">
                                    <i className="ri-folder-3-line text-2xl"></i>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white capitalize">{project.name}</h3>
                                    <p className="text-xs text-blue-400 font-mono">Workspace Details & Configuration</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                            >
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>

                        {/* Body Details */}
                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="text-slate-400 font-medium block mb-1">Project ID</label>
                                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-slate-300 flex items-center justify-between">
                                    <span className="truncate flex-grow">{project._id || 'Local-Development-ID'}</span>
                                    {project._id && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(project._id)
                                                addToast('Copied Project ID!')
                                            }}
                                            className="ml-2 text-blue-400 hover:text-white transition cursor-pointer"
                                        >
                                            Copy
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-slate-400 font-medium block mb-1">Environment</label>
                                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-300 font-mono">Node.js v20.10.0 (Linux Container)</span>
                                    <span className="text-emerald-400 text-[10px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Project
