import { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'
import CodeEditor from './CodeEditor.jsx'
import CommandPalette from './CommandPalette.jsx'
import ToastContainer from './Toast.jsx'

const INITIAL_FILES = {
  'app.js': `// Fusion AI Studio - Main Application Entry
import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome to Fusion AI Cloud Workspace!",
    status: "Operational",
    version: "2.5.0"
  });
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
      background: rgba(30, 41, 59, 0.4); 
      padding: 2rem; 
      border-radius: 1.25rem; 
      border: 1px solid rgba(255, 255, 255, 0.08); 
      backdrop-filter: blur(12px);
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
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
}`,
  'package.json': `{
  "name": "fusion-ai-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
}

const Project = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { user } = useContext(UserContext)

    // Project state
    const initialProject = location.state?.project || { name: 'Demo Workspace', users: [user?.email || 'User'] }
    const [project, setProject] = useState(initialProject)

    // Files state
    const [files, setFiles] = useState(INITIAL_FILES)
    const [openFiles, setOpenFiles] = useState(['app.js', 'index.html'])
    const [activeFile, setActiveFile] = useState('app.js')
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

    // Layout & Viewport States
    const [isSplitPreview, setIsSplitPreview] = useState(false)
    const [previewViewport, setPreviewViewport] = useState('desktop') // 'desktop' | 'tablet' | 'mobile'
    const [previewKey, setPreviewKey] = useState(0)
    const [bottomTab, setBottomTab] = useState('terminal') // 'terminal' | 'preview' | 'hidden'
    const [logs, setLogs] = useState([
        `[SYSTEM] Workspace initialized for "${project.name}"`,
        `[SUCCESS] Connected to Fusion Cloud Runner (Node v20.10.0)`,
        `[INFO] Web container listening on port 3000...`
    ])

    // Command Palette & Modals State
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [copiedId, setCopiedId] = useState(false)

    // Users & Collaborators State
    const [users, setUsers] = useState([])
    const [selectedUserId, setSelectedUserId] = useState([])
    const [userSearchQuery, setUserSearchQuery] = useState('')
    const [fetchingUsers, setFetchingUsers] = useState(false)
    const [collaborators, setCollaborators] = useState(project.users || [])
    const [addingCollaborators, setAddingCollaborators] = useState(false)

    // Reactive Toasts State
    const [toasts, setToasts] = useState([])

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

    // Global Command Palette Hotkey (Cmd+K or Ctrl+K)
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
        const projectId = location.state?.project?._id || project._id
        if (projectId) {
            axios.get(`/projects/get-project/${projectId}`)
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

        // Preload users list from /users/all
        axios.get('/users/all')
            .then((res) => {
                setUsers(res.data.users || [])
            })
            .catch((err) => {
                console.error('Error fetching users:', err)
            })
    }, [location.state?.project?._id])

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

    useEffect(() => {
        if (isModalOpen) {
            fetchUsers()
        }
    }, [isModalOpen])

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
        if (usersToAdd.length === 0 || !project._id) return

        try {
            setAddingCollaborators(true)
            const res = await axios.put('/projects/add-user', {
                projectId: project._id,
                users: usersToAdd
            })

            if (res.data.project) {
                // Re-fetch project to get populated user objects
                const updatedRes = await axios.get(`/projects/get-project/${project._id}`)
                if (updatedRes.data.project) {
                    setProject(updatedRes.data.project)
                    setCollaborators(updatedRes.data.project.users || [])
                }
            }

            setLogs((prev) => [...prev, `[MEMBER] Added ${usersToAdd.length} new collaborator(s)`])
            addToast(`Added ${usersToAdd.length} new collaborator(s) to workspace!`)
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
            addToast(`Created new file ${name}`)
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
        setLogs((prev) => [...prev, `[RUN] Rebuilding container preview at ${new Date().toLocaleTimeString()}...`])
        addToast('Live preview container updated!', 'success')
    }

    // AI Prompt Send Handler
    const handleSendPrompt = (e) => {
        e?.preventDefault()
        if (!prompt.trim() || aiLoading) return

        const userMsg = prompt.trim()
        setPrompt('')
        setAiMessages((prev) => [...prev, { sender: 'user', text: userMsg }])
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
            setLogs((prev) => [...prev, `[AI-LOG] Generated recommendation for ${activeFile}`])
        }, 900)
    }

    // Helper to extract code block from markdown
    const extractCodeBlock = (text) => {
        const match = text.match(/```(?:[a-zA-Z0-9]+)?\n([\s\S]*?)```/)
        return match ? match[1].trim() : null
    }

    return (
        <div className="h-screen w-screen bg-[#080C14] text-white flex flex-col overflow-hidden font-sans select-none">
            {/* Ambient Background Lights */}
            <div className="fixed top-0 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

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
                }}
            />

            {/* ================= WORKSPACE HEADER ================= */}
            <header className="h-14 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl px-4 flex items-center justify-between z-30 shrink-0">
                {/* Left: Back button & Project Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                        title="Back to Dashboard"
                    >
                        <i className="ri-arrow-left-line text-sm"></i>
                        <span className="hidden sm:inline">Dashboard</span>
                    </button>

                    <div className="h-5 w-[1px] bg-slate-800" />

                    <button
                        onClick={() => setIsDetailsModalOpen(true)}
                        className="flex items-center gap-2 px-2.5 py-1 rounded-xl hover:bg-slate-900 transition border border-transparent hover:border-slate-800 cursor-pointer group"
                        title="Click to view workspace details & ID"
                    >
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
                            <i className="ri-folder-3-line text-sm"></i>
                        </div>
                        <h1 className="font-bold text-sm text-white truncate max-w-[150px] sm:max-w-xs group-hover:text-blue-300 transition">
                            {project.name}
                        </h1>
                        <i className="ri-information-line text-slate-500 text-sm group-hover:text-blue-400 transition"></i>
                    </button>

                    <span className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Node v20.10
                    </span>
                </div>

                {/* Center: Command Palette Trigger */}
                <div className="hidden lg:flex items-center">
                    <button
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-400 hover:text-white transition shadow-sm cursor-pointer"
                    >
                        <i className="ri-search-line text-blue-400"></i>
                        <span>Search commands, files...</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                            ⌘K
                        </kbd>
                    </button>
                </div>

                {/* Right: Actions, Layout Controls & Members */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Split View Toggle */}
                    <button
                        onClick={() => setIsSplitPreview(!isSplitPreview)}
                        className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                            isSplitPreview
                                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400 shadow-md shadow-blue-500/10'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                        }`}
                        title="Toggle Split-Screen Web Preview"
                    >
                        <i className="ri-layout-column-line text-sm"></i>
                        <span className="hidden sm:inline">Split Preview</span>
                    </button>

                    {/* Member Avatars & Desktop Invite Button */}
                    <div className="hidden md:flex items-center gap-2 pr-2 border-r border-slate-800">
                        <div className="flex -space-x-2">
                            {collaborators.slice(0, 4).map((c, i) => (
                                <div
                                    key={i}
                                    className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 border border-slate-900 text-[10px] font-bold text-white flex items-center justify-center uppercase shadow"
                                    title={typeof c === 'string' ? c : c.email}
                                >
                                    {(typeof c === 'string' ? c : c.email || 'U')[0]}
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={handleOpenInviteModal}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-blue-400 hover:text-white hover:border-blue-500/30 transition flex items-center gap-1 cursor-pointer"
                            title="Add Collaborators"
                        >
                            <i className="ri-user-add-line"></i>
                            <span className="text-[11px] font-semibold">Invite</span>
                        </button>
                    </div>

                    {/* Mobile Users Button */}
                    <button
                        onClick={handleOpenInviteModal}
                        className="flex md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-blue-400 hover:text-white transition cursor-pointer"
                        title="Collaborators"
                    >
                        <i className="ri-user-add-line text-sm"></i>
                    </button>

                    {/* Run Code Button */}
                    <button
                        onClick={handleRunCode}
                        className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-xs font-semibold text-white transition shadow-lg shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer"
                    >
                        <i className="ri-play-fill text-sm"></i>
                        <span>Run</span>
                    </button>
                </div>
            </header>

            {/* ================= WORKSPACE BODY ================= */}
            <div className="flex-grow flex overflow-hidden relative">

                {/* 1. LEFT SIDEBAR: File Tree & Explorer */}
                <aside className="w-56 sm:w-60 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl flex flex-col shrink-0">
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <i className="ri-folders-line text-blue-400"></i>
                            Explorer
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleOpenInviteModal}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-blue-400 transition"
                                title="Add Collaborators"
                            >
                                <i className="ri-user-add-line text-base"></i>
                            </button>
                            <button
                                onClick={() => setIsCreatingFile(true)}
                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                                title="New File"
                            >
                                <i className="ri-file-add-line text-base"></i>
                            </button>
                        </div>
                    </div>

                    {/* New File Inline Form */}
                    {isCreatingFile && (
                        <form onSubmit={handleCreateFile} className="p-2 border-b border-slate-800 flex items-center gap-1">
                            <input
                                type="text"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                placeholder="filename.js"
                                autoFocus
                                className="w-full px-2 py-1 bg-slate-900 border border-blue-500 rounded text-xs text-white outline-none"
                            />
                            <button type="submit" className="text-xs text-blue-400 font-bold px-1.5">Add</button>
                            <button
                                type="button"
                                onClick={() => setIsCreatingFile(false)}
                                className="text-xs text-slate-500 hover:text-white px-1"
                            >
                                ✕
                            </button>
                        </form>
                    )}

                    {/* File List */}
                    <div className="p-2 space-y-1 overflow-y-auto flex-grow">
                        {Object.keys(files).map((fileName) => {
                            const isActive = activeFile === fileName
                            let icon = "ri-file-text-line text-slate-400"
                            if (fileName.endsWith('.js')) icon = "ri-javascript-line text-amber-400"
                            if (fileName.endsWith('.html')) icon = "ri-html5-line text-orange-400"
                            if (fileName.endsWith('.css')) icon = "ri-css3-line text-blue-400"
                            if (fileName.endsWith('.json')) icon = "ri-code-s-slash-line text-emerald-400"

                            return (
                                <div
                                    key={fileName}
                                    onClick={() => handleSelectFile(fileName)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition group cursor-pointer ${
                                        isActive
                                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                                            : 'text-slate-300 hover:bg-slate-900 hover:text-white border border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <i className={icon}></i>
                                        <span className="truncate">{fileName}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1"></span>}
                                        <button
                                            onClick={(e) => handleDeleteFile(e, fileName)}
                                            className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-slate-500 transition"
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
                    <div className="p-3 border-t border-white/10 bg-slate-900/40">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                                <i className="ri-team-line text-blue-400"></i>
                                <span>COLLABORATORS</span>
                                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                                    {collaborators.length}
                                </span>
                            </span>
                            <button
                                onClick={handleOpenInviteModal}
                                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5 transition cursor-pointer"
                                title="Add Collaborators"
                            >
                                <i className="ri-user-add-line text-xs"></i>
                                <span>Add</span>
                            </button>
                        </div>
                        <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                            {collaborators.map((member, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 truncate">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                                    <span className="truncate">{typeof member === 'string' ? member : member.email}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* 2. CENTER PANEL: Code Editor & Web Container */}
                <div className="flex-grow flex flex-col min-w-0 bg-[#070B12]">
                    {/* Active File Tab Bar */}
                    <div className="h-10 border-b border-white/10 bg-slate-950/60 flex items-center overflow-x-auto shrink-0 px-2 gap-1">
                        {openFiles.map((file) => {
                            const isActive = activeFile === file
                            return (
                                <div
                                    key={file}
                                    onClick={() => setActiveFile(file)}
                                    className={`h-8 px-3 rounded-t-lg text-xs font-medium flex items-center gap-2 border-t border-x cursor-pointer transition ${
                                        isActive
                                            ? 'bg-[#070B12] border-white/10 text-blue-300'
                                            : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <span>{file}</span>
                                    {openFiles.length > 1 && (
                                        <button
                                            onClick={(e) => handleCloseTab(e, file)}
                                            className="hover:text-red-400 transition"
                                            title="Close tab"
                                        >
                                            <i className="ri-close-line text-xs"></i>
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Main Workspace Stage: Code Editor & Optional Split-Preview */}
                    <div className="flex-grow flex overflow-hidden min-h-0">
                        {/* Interactive Smart Code Editor */}
                        <div className="flex-grow flex flex-col min-w-0 overflow-hidden">
                            <CodeEditor
                                value={files[activeFile] || ''}
                                onChange={handleContentChange}
                                fileName={activeFile}
                                onCopy={() => addToast('Code copied to clipboard!')}
                            />
                        </div>

                        {/* Split-View Live Preview (If enabled) */}
                        {isSplitPreview && (
                            <div className="w-1/2 border-l border-white/10 bg-[#0B0F19] flex flex-col min-w-[320px] overflow-hidden">
                                {/* Preview Controls Header */}
                                <div className="h-9 border-b border-white/10 bg-slate-950 px-3 flex items-center justify-between text-xs shrink-0">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                        <span className="font-semibold text-slate-200">Live Web Container</span>
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
                                <div className="flex-grow p-4 bg-slate-950/60 overflow-y-auto flex items-start justify-center">
                                    <div
                                        key={previewKey}
                                        className={`w-full transition-all duration-300 rounded-2xl border border-slate-800 bg-[#080C14] p-4 text-white shadow-2xl ${
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

                    {/* Bottom Console / Web Container Drawer (When not in split view) */}
                    {!isSplitPreview && bottomTab !== 'hidden' && (
                        <div className="h-44 border-t border-white/10 bg-slate-950 flex flex-col shrink-0">
                            {/* Drawer Header Tabs */}
                            <div className="h-8 border-b border-slate-900 bg-slate-900/50 px-3 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setBottomTab('terminal')}
                                        className={`px-3 py-1 rounded-md font-semibold transition ${bottomTab === 'terminal' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Terminal Log
                                    </button>
                                    <button
                                        onClick={() => setBottomTab('preview')}
                                        className={`px-3 py-1 rounded-md font-semibold transition ${bottomTab === 'preview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Web Preview
                                    </button>
                                </div>
                                <button
                                    onClick={() => setBottomTab('hidden')}
                                    className="text-slate-400 hover:text-white"
                                >
                                    <i className="ri-close-line"></i>
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-grow p-3 overflow-y-auto font-mono text-xs">
                                {bottomTab === 'terminal' && (
                                    <div className="space-y-1 text-slate-300">
                                        {logs.map((log, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                                                <span className={log.includes('SUCCESS') ? 'text-emerald-400' : log.includes('RUN') ? 'text-blue-400' : 'text-slate-300'}>
                                                    {log}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {bottomTab === 'preview' && (
                                    <div className="w-full h-full rounded-xl border border-slate-800 bg-[#0B0F19] p-4 text-white">
                                        <div className="flex items-center justify-between mb-2 text-xs text-blue-400 font-bold border-b border-slate-800 pb-2">
                                            <span>http://localhost:3000</span>
                                            <span className="text-emerald-400 text-[10px]">● Live Web Container</span>
                                        </div>
                                        <div
                                            className="text-xs text-slate-300 space-y-2"
                                            dangerouslySetInnerHTML={{ __html: files['index.html'] || '<div>Preview Container</div>' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. RIGHT PANEL: AI Assistant Chat Panel */}
                <aside className="w-72 sm:w-80 border-l border-white/10 bg-slate-950/90 backdrop-blur-2xl flex flex-col shrink-0">
                    {/* AI Chat Header */}
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                                <i className="ri-sparkles-line text-sm"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-white">Fusion AI Assistant</h3>
                                <p className="text-[10px] text-blue-400">Context Aware • {activeFile}</p>
                            </div>
                        </div>

                        {/* Mode Selector */}
                        <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px]">
                            <button
                                onClick={() => setAiMode('coder')}
                                className={`px-2 py-0.5 rounded-md font-medium transition ${aiMode === 'coder' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                            >
                                Code
                            </button>
                            <button
                                onClick={() => setAiMode('reviewer')}
                                className={`px-2 py-0.5 rounded-md font-medium transition ${aiMode === 'reviewer' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                            >
                                Review
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-grow p-3 space-y-3 overflow-y-auto text-xs">
                        {aiMessages.map((msg, i) => {
                            const codeSnippet = extractCodeBlock(msg.text)
                            const isUser = msg.sender === 'user'

                            return (
                                <div
                                    key={i}
                                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                                >
                                    <div className={`p-3 rounded-2xl max-w-[95%] leading-relaxed ${
                                        isUser
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                                    }`}>
                                        <p className="whitespace-pre-wrap">{msg.text.split('```')[0]}</p>

                                        {/* If response contains a code snippet, display interactive card */}
                                        {codeSnippet && (
                                            <div className="mt-2.5 rounded-xl border border-slate-700 bg-slate-950 p-2.5 font-mono text-[11px] text-blue-300">
                                                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800 text-[10px] text-slate-400">
                                                    <span>Snippet Recommendation</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(codeSnippet)
                                                                addToast('Snippet copied to clipboard!')
                                                            }}
                                                            className="hover:text-white transition"
                                                            title="Copy snippet"
                                                        >
                                                            Copy
                                                        </button>
                                                        <span>•</span>
                                                        <button
                                                            onClick={() => {
                                                                handleContentChange(codeSnippet)
                                                                addToast(`Applied code to ${activeFile}!`)
                                                            }}
                                                            className="text-blue-400 hover:text-blue-300 font-bold transition"
                                                            title="Replace active file content"
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
                                        {isUser ? 'You' : 'Fusion AI'}
                                    </span>
                                </div>
                            )
                        })}

                        {aiLoading && (
                            <div className="flex items-center gap-2 text-xs text-blue-400 p-2.5 bg-slate-900/60 rounded-xl border border-blue-500/20 animate-pulse">
                                <i className="ri-loader-4-line animate-spin"></i>
                                <span>Analyzing {activeFile} & writing response...</span>
                            </div>
                        )}
                    </div>

                    {/* Quick AI Action Chips */}
                    <div className="p-2 border-t border-slate-900 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                        <button
                            onClick={() => setPrompt(`Explain the architecture of ${activeFile}`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                        >
                            ✨ Explain
                        </button>
                        <button
                            onClick={() => setPrompt(`Refactor ${activeFile} for cleaner performance`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                        >
                            🚀 Refactor
                        </button>
                        <button
                            onClick={() => setPrompt(`Write unit tests for ${activeFile}`)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
                        >
                            🧪 Tests
                        </button>
                    </div>

                    {/* Prompt Input Box */}
                    <form onSubmit={handleSendPrompt} className="p-3 border-t border-white/10 bg-slate-950">
                        <div className="relative">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={`Ask AI about ${activeFile}...`}
                                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
                            />
                            <button
                                type="submit"
                                disabled={!prompt.trim() || aiLoading}
                                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-blue-400 hover:text-blue-300 disabled:opacity-40 cursor-pointer"
                            >
                                <i className="ri-send-plane-fill text-sm"></i>
                            </button>
                        </div>
                    </form>
                </aside>

            </div>

            {/* ================= USERS / COLLABORATORS MODAL ================= */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fadeIn"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsModalOpen(false)
                    }}
                >
                    <div className="w-full max-w-md sm:max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-5 sm:p-6 pb-20 sm:pb-24 shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
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
                                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition"
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
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {userSearchQuery ? 'Try adjusting your search query' : 'New users will appear here once registered'}
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

            {/* ================= PROJECT DETAILS MODAL ================= */}
            {isDetailsModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsDetailsModalOpen(false)
                    }}
                >
                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Header */}
                        <div className="flex items-start justify-between pb-4 mb-5 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-500/30 flex items-center justify-center text-white shadow-lg">
                                    <i className="ri-folder-3-line text-2xl"></i>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-white">{project.name}</h3>
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                                            Active Studio
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">Project Workspace Information</p>
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
                        <div className="space-y-5">
                            {/* Project Database ID */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                                    Project ID
                                </label>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200">
                                    <span className="truncate flex-grow">{project._id || 'Local-Development-ID'}</span>
                                    {project._id && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(project._id)
                                                setCopiedId(true)
                                                addToast('Project ID copied to clipboard!')
                                                setTimeout(() => setCopiedId(false), 2000)
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-white text-[11px] font-sans font-semibold transition flex items-center gap-1 cursor-pointer"
                                        >
                                            <i className={copiedId ? "ri-check-line text-emerald-400" : "ri-file-copy-line"}></i>
                                            <span>{copiedId ? "Copied!" : "Copy"}</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Collaborators List */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Project Members ({collaborators.length})
                                    </label>
                                    <button
                                        onClick={() => {
                                            setIsDetailsModalOpen(false)
                                            handleOpenInviteModal()
                                        }}
                                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                        <i className="ri-user-add-line"></i>
                                        <span>Add Member</span>
                                    </button>
                                </div>

                                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                                    {collaborators.map((member, idx) => {
                                        const emailStr = typeof member === 'string' ? member : member.email
                                        const isOwner = idx === 0

                                        return (
                                            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                                                <div className="flex items-center gap-3 truncate">
                                                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-[10px] text-white flex items-center justify-center uppercase shrink-0">
                                                        {emailStr ? emailStr[0] : 'U'}
                                                    </div>
                                                    <span className="font-medium text-slate-200 truncate">{emailStr}</span>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${isOwner ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>
                                                    {isOwner ? 'Owner' : 'Collaborator'}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Workspace Stats */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                    <p className="text-[11px] text-slate-400 font-medium">Files Count</p>
                                    <p className="text-base font-bold text-white mt-0.5">{Object.keys(files).length} Files</p>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                                    <p className="text-[11px] text-slate-400 font-medium">Environment</p>
                                    <p className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                        Node v20.10
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end">
                            <button
                                onClick={() => setIsDetailsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition cursor-pointer"
                            >
                                Close Details
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Project
