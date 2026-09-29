import { useState, useEffect, useContext } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import { UserContext } from '../context/user.context'

const INITIAL_FILES = {
  'app.js': `// Fusion AI Studio - Main Application Entry
import express from 'express';
const app = express();

app.get('/', (req, res) => {
  res.json({ message: "Welcome to Fusion AI Cloud Workspace!" });
});

app.listen(3000, () => {
  console.log("Server running smoothly on port 3000");
});`,
  'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Fusion AI Web Preview</title>
  <style>
    body { font-family: system-ui; background: #0b0f19; color: #fff; padding: 2rem; }
    .card { background: rgba(255,255,255,0.05); padding: 1.5rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.1); }
    h1 { color: #60a5fa; margin-top: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🚀 Fusion AI Live Web Container</h1>
    <p>Your full-stack application preview is live and rendering in real-time.</p>
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

    // Project data passed via router state or fallback
    const initialProject = location.state?.project || { name: 'Demo Workspace', users: [user?.email || 'User'] }
    const [project, setProject] = useState(initialProject)

    // Files state
    const [files, setFiles] = useState(INITIAL_FILES)
    const [openFiles, setOpenFiles] = useState(['app.js', 'index.html'])
    const [activeFile, setActiveFile] = useState('app.js')
    const [newFileName, setNewFileName] = useState('')
    const [isCreatingFile, setIsCreatingFile] = useState(false)

    // AI Chat State
    const [aiMessages, setAiMessages] = useState([
        {
            sender: 'ai',
            text: `Hello ${user?.email ? user.email.split('@')[0] : 'Developer'}! I'm your Fusion AI Coding Partner for **${project.name}**. How can I help you build or refactor today?`
        }
    ])
    const [prompt, setPrompt] = useState('')
    const [aiLoading, setAiLoading] = useState(false)

    // Bottom Drawer State ('terminal' | 'preview' | 'hidden')
    const [bottomTab, setBottomTab] = useState('terminal')
    const [logs, setLogs] = useState([
        `[SYSTEM] Workspace initialized for project "${project.name}"`,
        `[SUCCESS] Connected to Fusion AI Cloud Runner (Node v20.10.0)`,
        `[INFO] Web container listening on port 3000...`
    ])

    // Invite Modal & Collaborators State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
    const [copiedId, setCopiedId] = useState(false)
    const [allUsers, setAllUsers] = useState([])
    const [selectedUserIds, setSelectedUserIds] = useState([])
    const [collaborators, setCollaborators] = useState(project.users || [])
    const [addingCollaborators, setAddingCollaborators] = useState(false)


    // Sync project details from Backend API
    useEffect(() => {
        if (project._id) {
            axios.get(`/projects/get-project/${project._id}`)
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
    }, [project._id])

    // Fetch registered users when invite modal opens
    const handleOpenInviteModal = () => {
        setIsInviteModalOpen(true)
        axios.get('/users/all')
            .then((res) => {
                setAllUsers(res.data.users || [])
            })
            .catch((err) => {
                console.error('Error fetching users:', err)
            })
    }

    // Toggle user selection
    const toggleSelectUser = (id) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(selectedUserIds.filter(uId => uId !== id))
        } else {
            setSelectedUserIds([...selectedUserIds, id])
        }
    }

    // Add collaborators to backend
    const handleAddCollaboratorsSubmit = async (e) => {
        e.preventDefault()
        if (selectedUserIds.length === 0 || !project._id) return

        try {
            setAddingCollaborators(true)
            const res = await axios.put('/projects/add-user', {
                projectId: project._id,
                users: selectedUserIds
            })

            if (res.data.project) {
                // Re-fetch project to get populated user objects
                const updatedRes = await axios.get(`/projects/get-project/${project._id}`)
                if (updatedRes.data.project) {
                    setProject(updatedRes.data.project)
                    setCollaborators(updatedRes.data.project.users || [])
                }
            }

            setLogs(prev => [...prev, `[MEMBER] Added ${selectedUserIds.length} new collaborator(s)`])
            setSelectedUserIds([])
            setIsInviteModalOpen(false)
        } catch (err) {
            console.error('Failed to add users:', err)
        } finally {
            setAddingCollaborators(false)
        }
    }


    // Select file handler
    const handleSelectFile = (fileName) => {
        if (!openFiles.includes(fileName)) {
            setOpenFiles([...openFiles, fileName])
        }
        setActiveFile(fileName)
    }

    // Close open file tab
    const handleCloseTab = (e, fileName) => {
        e.stopPropagation()
        const remaining = openFiles.filter(f => f !== fileName)
        setOpenFiles(remaining)
        if (activeFile === fileName && remaining.length > 0) {
            setActiveFile(remaining[remaining.length - 1])
        }
    }

    // Add new file handler
    const handleCreateFile = (e) => {
        e.preventDefault()
        if (!newFileName.trim()) return
        const name = newFileName.trim()
        if (!files[name]) {
            setFiles({ ...files, [name]: `// New file: ${name}\n` })
            setOpenFiles([...openFiles, name])
            setActiveFile(name)
        }
        setNewFileName('')
        setIsCreatingFile(false)
    }

    // Update active file content
    const handleContentChange = (content) => {
        setFiles({
            ...files,
            [activeFile]: content
        })
    }

    // Send AI prompt handler
    const handleSendPrompt = (e) => {
        e?.preventDefault()
        if (!prompt.trim() || aiLoading) return

        const userMsg = prompt.trim()
        setPrompt('')
        setAiMessages(prev => [...prev, { sender: 'user', text: userMsg }])
        setAiLoading(true)

        // Simulate AI response stream
        setTimeout(() => {
            let aiReply = ''
            if (userMsg.toLowerCase().includes('refactor') || userMsg.toLowerCase().includes('explain')) {
                aiReply = `I analyzed **${activeFile}**. The structure follows clean modular patterns. Here is an optimized suggestion:\n\n\`\`\`javascript\n// Optimized function block\nexport const handleRequest = (req, res) => {\n  return res.status(200).json({ ok: true, timestamp: Date.now() });\n};\n\`\`\``
            } else if (userMsg.toLowerCase().includes('bug') || userMsg.toLowerCase().includes('fix')) {
                aiReply = `I audited your code in **${activeFile}**. No critical syntax errors found. Make sure environment variables like \`PORT\` or \`JWT_SECRET\` are defined.`
            } else {
                aiReply = `Got it! I am ready to process changes for **${project.name}**. Would you like me to write code snippets directly to **${activeFile}** or execute a test run?`
            }

            setAiMessages(prev => [...prev, { sender: 'ai', text: aiReply }])
            setAiLoading(false)
            setLogs(prev => [...prev, `[AI-LOG] Generated code recommendation for ${activeFile}`])
        }, 1000)
    }

    // Add collaborator handler
    const handleAddCollaborator = async (e) => {
        e.preventDefault()
        if (!inviteEmail.trim()) return

        try {
            setCollaborators(prev => [...prev, inviteEmail.trim()])
            setLogs(prev => [...prev, `[MEMBER] Invited ${inviteEmail.trim()} to project ${projectData.name}`])
            setInviteEmail('')
            setIsInviteModalOpen(false)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="h-screen w-screen bg-[#080C14] text-white flex flex-col overflow-hidden font-sans select-none">
            
            {/* ================= WORKSPACE HEADER ================= */}
            <header className="h-14 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl px-4 flex items-center justify-between z-30 shrink-0">
                {/* Left: Back button & Project Title */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/')}
                        className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold"
                        title="Back to Dashboard"
                    >
                        <i className="ri-arrow-left-line text-sm"></i>
                        <span className="hidden sm:inline">Dashboard</span>
                    </button>

                    <div className="h-5 w-[1px] bg-slate-800" />

                    <button
                        onClick={() => setIsDetailsModalOpen(true)}
                        className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-900 transition border border-transparent hover:border-slate-800 cursor-pointer group"
                        title="Click to view full project details"
                    >
                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition">
                            <i className="ri-folder-3-line text-sm"></i>
                        </div>
                        <h1 className="font-bold text-sm text-white truncate max-w-[180px] sm:max-w-xs group-hover:text-blue-300 transition">
                            {project.name}
                        </h1>
                        <i className="ri-information-line text-slate-400 text-sm group-hover:text-blue-400 transition"></i>
                    </button>
                    <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Live
                    </span>
                </div>

                {/* Right Actions: Members & Controls */}
                <div className="flex items-center gap-3">
                    {/* Member Avatars */}
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
                        >
                            <i className="ri-user-add-line"></i>
                            <span className="text-[11px] font-semibold">Invite</span>
                        </button>
                    </div>

                    {/* Run / Deploy Button */}
                    <button
                        onClick={() => {
                            setBottomTab('preview')
                            setLogs(prev => [...prev, `[RUN] Rebuilding web preview container...`])
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white transition shadow-lg shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
                    >
                        <i className="ri-play-fill text-sm"></i>
                        <span>Run Code</span>
                    </button>
                </div>
            </header>

            {/* ================= WORKSPACE BODY ================= */}
            <div className="flex-grow flex overflow-hidden relative">

                {/* 1. LEFT SIDEBAR: File Tree & Explorer */}
                <aside className="w-56 sm:w-64 border-r border-white/10 bg-slate-950/80 backdrop-blur-xl flex flex-col shrink-0">
                    <div className="p-3 border-b border-white/10 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <i className="ri-folders-line text-blue-400"></i>
                            Explorer
                        </span>
                        <button
                            onClick={() => setIsCreatingFile(true)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="New File"
                        >
                            <i className="ri-file-add-line text-base"></i>
                        </button>
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
                            <button type="submit" className="text-xs text-blue-400 font-bold px-1">Add</button>
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
                                <button
                                    key={fileName}
                                    onClick={() => handleSelectFile(fileName)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition group ${
                                        isActive 
                                            ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30' 
                                            : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <i className={icon}></i>
                                        <span className="truncate">{fileName}</span>
                                    </div>
                                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                                </button>
                            )
                        })}
                    </div>

                    {/* Collaborator Footer Widget */}
                    <div className="p-3 border-t border-white/10 bg-slate-900/40">
                        <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center justify-between">
                            <span>TEAM MEMBERS</span>
                            <span className="text-blue-400">{collaborators.length}</span>
                        </p>
                        <div className="space-y-1.5">
                            {collaborators.map((member, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 truncate">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <span className="truncate">{typeof member === 'string' ? member : member.email}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* 2. CENTER PANEL: Code Editor & Console */}
                <div className="flex-grow flex flex-col min-w-0 bg-[#0B0F19]">
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
                                            ? 'bg-[#0B0F19] border-white/10 text-blue-300' 
                                            : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    <span>{file}</span>
                                    {openFiles.length > 1 && (
                                        <button
                                            onClick={(e) => handleCloseTab(e, file)}
                                            className="hover:text-red-400 transition"
                                        >
                                            <i className="ri-close-line text-xs"></i>
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Code Editor Area */}
                    <div className="flex-grow relative font-mono text-sm overflow-hidden flex">
                        {/* Line Numbers Bar */}
                        <div className="w-12 bg-slate-950/50 py-4 text-slate-600 text-right pr-3 select-none text-xs font-mono border-r border-slate-900 leading-6">
                            {(files[activeFile] || '').split('\n').map((_, i) => (
                                <div key={i}>{i + 1}</div>
                            ))}
                        </div>

                        {/* Editor Textarea */}
                        <textarea
                            value={files[activeFile] || ''}
                            onChange={(e) => handleContentChange(e.target.value)}
                            spellCheck={false}
                            className="flex-grow p-4 bg-transparent text-slate-100 outline-none resize-none leading-6 font-mono text-xs sm:text-sm selection:bg-blue-600/40"
                        />
                    </div>

                    {/* Editor Footer Status Bar */}
                    <div className="h-7 border-t border-white/10 bg-slate-950 px-4 flex items-center justify-between text-[11px] text-slate-400 font-mono shrink-0">
                        <div className="flex items-center gap-4">
                            <span>UTF-8</span>
                            <span>JavaScript / HTML</span>
                            <span>{files[activeFile]?.split('\n').length || 0} Lines</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                            <span>Ready</span>
                        </div>
                    </div>

                    {/* Bottom Console / Web Container Drawer */}
                    {bottomTab !== 'hidden' && (
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
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
                                <i className="ri-sparkles-line text-sm"></i>
                            </div>
                            <div>
                                <h3 className="font-bold text-xs text-white">Fusion AI Assistant</h3>
                                <p className="text-[10px] text-blue-400">Context Aware • Node v20</p>
                            </div>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-grow p-3 space-y-3 overflow-y-auto text-xs">
                        {aiMessages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                                    msg.sender === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                                <span className="text-[9px] text-slate-500 mt-1 px-1">
                                    {msg.sender === 'user' ? 'You' : 'Fusion AI'}
                                </span>
                            </div>
                        ))}

                        {aiLoading && (
                            <div className="flex items-center gap-2 text-xs text-blue-400 p-2 bg-slate-900/50 rounded-xl animate-pulse">
                                <i className="ri-loader-4-line animate-spin"></i>
                                <span>Generating code response...</span>
                            </div>
                        )}
                    </div>

                    {/* Action Chips */}
                    <div className="p-2 border-t border-slate-900 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                        <button
                            onClick={() => setPrompt(`Explain ${activeFile} code`)}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0"
                        >
                            ✨ Explain File
                        </button>
                        <button
                            onClick={() => setPrompt(`Refactor ${activeFile}`)}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0"
                        >
                            🚀 Refactor
                        </button>
                    </div>

                    {/* Prompt Input Box */}
                    <form onSubmit={handleSendPrompt} className="p-3 border-t border-white/10 bg-slate-950">
                        <div className="relative">
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ask Fusion AI to generate code..."
                                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                            />
                            <button
                                type="submit"
                                disabled={!prompt.trim() || aiLoading}
                                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-blue-400 hover:text-blue-300 disabled:opacity-40"
                            >
                                <i className="ri-send-plane-fill text-sm"></i>
                            </button>
                        </div>
                    </form>
                </aside>

            </div>

            {/* ================= INVITE MEMBER MODAL ================= */}
            {isInviteModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setIsInviteModalOpen(false)
                    }}
                >
                    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <i className="ri-user-add-line text-blue-400"></i>
                                Add Collaborators
                            </h3>
                            <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-white">
                                <i className="ri-close-line text-lg"></i>
                            </button>
                        </div>

                        <form onSubmit={handleAddCollaboratorsSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-2">
                                    Select Registered Users ({selectedUserIds.length} selected)
                                </label>
                                
                                <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                                    {allUsers.length === 0 ? (
                                        <p className="text-xs text-slate-500 py-4 text-center">No other registered users found.</p>
                                    ) : (
                                        allUsers.map((u) => {
                                            const isSelected = selectedUserIds.includes(u._id)
                                            const isAlreadyInProject = collaborators.some(c => (c._id || c) === u._id)

                                            return (
                                                <div
                                                    key={u._id}
                                                    onClick={() => !isAlreadyInProject && toggleSelectUser(u._id)}
                                                    className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition cursor-pointer ${
                                                        isAlreadyInProject 
                                                            ? 'bg-slate-900/40 border-slate-800/60 opacity-50 cursor-not-allowed'
                                                            : isSelected 
                                                                ? 'bg-blue-600/20 border-blue-500/50 text-white' 
                                                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center uppercase">
                                                            {u.email[0]}
                                                        </div>
                                                        <span className="font-medium truncate">{u.email}</span>
                                                    </div>
                                                    {isAlreadyInProject ? (
                                                        <span className="text-[10px] text-slate-500 font-semibold">Already Member</span>
                                                    ) : (
                                                        <i className={isSelected ? "ri-checkbox-circle-fill text-blue-400 text-lg" : "ri-checkbox-blank-circle-line text-slate-600 text-lg"}></i>
                                                    )}
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-900">
                                <button
                                    type="button"
                                    onClick={() => setIsInviteModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={selectedUserIds.length === 0 || addingCollaborators}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                                >
                                    {addingCollaborators ? (
                                        <>
                                            <i className="ri-loader-4-line animate-spin"></i>
                                            <span>Adding...</span>
                                        </>
                                    ) : (
                                        <span>Add Selected Members</span>
                                    )}
                                </button>
                            </div>
                        </form>
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
                                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition"
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
                                                setTimeout(() => setCopiedId(false), 2000)
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-white text-[11px] font-sans font-semibold transition flex items-center gap-1"
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
                                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
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

