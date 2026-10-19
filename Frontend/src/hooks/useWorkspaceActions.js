import { useCallback, useEffect } from 'react'
import axios from '../config/axios'
import { sendMessage } from '../config/socket.js'

export const useWorkspaceActions = ({
  project,
  setProject,
  targetProjectId,
  files,
  saveFilesToBackend,
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
  activeFile
}) => {
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

  const handleRunCode = useCallback(() => {
    setPreviewKey((prev) => prev + 1)
    if (!isSplitPreview) {
      setBottomTab('preview')
    }
    terminalManager.setTerminalHistory((prev) => [
      ...prev,
      `$ npm run build`,
      `> vite build --mode development`,
      `✓ Compiled in 14ms. Web container updated and running.`
    ])
    addToast('Container preview refreshed!', 'success')
  }, [isSplitPreview, addToast, terminalManager, setBottomTab, setPreviewKey])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        modalsState.setIsCommandPaletteOpen((prev) => !prev)
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
  }, [files, saveFilesToBackend, addToast, handleRunCode, modalsState])

  const handleOpenInviteModal = () => {
    modalsState.setSelectedUserId([])
    modalsState.setIsModalOpen(true)
    modalsState.setFetchingUsers(true)
    axios.get('/users/all')
      .then((res) => modalsState.setUsers(res.data.users || []))
      .catch((err) => console.error(err))
      .finally(() => modalsState.setFetchingUsers(false))
  }

  const handleAddCollaborators = async () => {
    if (!modalsState.selectedUserId.length) {
      addToast('Please select at least one user to add', 'error')
      return
    }
    const currentId = project._id || targetProjectId
    try {
      modalsState.setSubmittingUsers(true)
      const res = await axios.put('/projects/add-user', {
        projectId: currentId,
        users: modalsState.selectedUserId
      })
      if (res.data?.project) {
        setProject(res.data.project)
        setCollaborators(res.data.project.users || [])
      }
      addToast(`Added ${modalsState.selectedUserId.length} collaborator(s) successfully!`, 'success')
      modalsState.setIsModalOpen(false)
      modalsState.setSelectedUserId([])
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add collaborators', 'error')
    } finally {
      modalsState.setSubmittingUsers(false)
    }
  }

  const handleRenameWorkspace = async (e) => {
    e?.preventDefault()
    if (!modalsState.newProjectNameInput.trim() || !targetProjectId) return
    try {
      const res = await axios.put(`/projects/${targetProjectId}`, {
        name: modalsState.newProjectNameInput.trim()
      })
      if (res.data?.project) {
        setProject((prev) => ({ ...prev, name: res.data.project.name }))
        addToast('Workspace renamed successfully!', 'success')
        modalsState.setIsRenameModalOpen(false)
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to rename workspace', 'error')
    }
  }

  const handleSendPrompt = async (e, retryPrompt = null) => {
    e?.preventDefault()
    const userMsg = (typeof retryPrompt === 'string' ? retryPrompt : copilotManager.prompt).trim()
    if (!userMsg || (rightPanelTab === 'copilot' && copilotManager.aiLoading)) return

    const currentId = project._id || targetProjectId
    if (!retryPrompt) {
      copilotManager.setPrompt('')
    }

    if (rightPanelTab === 'chat') {
      socketManager.setTeamMessages((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), sender: 'user', senderName: 'You', text: userMsg, timestamp: new Date().toISOString() }
      ])
      if (currentId) {
        sendMessage('project-message', { message: userMsg, sender: user, projectId: currentId })
      }
      return
    }

    copilotManager.setAiMessages((prev) => [...prev, { sender: 'user', text: userMsg }])
    copilotManager.setAiLoading(true)

    try {
      const res = await axios.post('/ai/prompt', {
        prompt: userMsg,
        activeFile,
        fileContent: files[activeFile] || '',
        mode: copilotManager.aiMode,
        files,
        history: copilotManager.aiMessages.slice(-6)
      })
      const data = res.data
      const isError = Boolean(
        data.isError ||
        (data.source === 'fallback' && !data.suggestedCode && data.reply?.includes('Offline'))
      )

      copilotManager.setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || 'AI recommendation completed.',
          suggestedCode: data.suggestedCode || null,
          targetFile: data.targetFile || null,
          action: data.action || 'explain',
          isError,
          errorDetails: data.errorDetails || null,
          retryPrompt: isError ? userMsg : null,
          source: data.source || 'gemini'
        }
      ])
      terminalManager.setTerminalHistory((prev) => [
        ...prev,
        data.suggestedCode
          ? `[AI-LOG] Generated patch for ${data.targetFile || activeFile} (${data.source || 'gemini'})`
          : `[AI-LOG] Completed query response (${data.source || 'gemini'})`
      ])
    } catch (err) {
      const errMsg = err.response?.data?.message || 'AI assistant encountered an error.'
      copilotManager.setAiMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `### ⚠️ AI Service Error\n\n${errMsg}`,
          isError: true,
          retryPrompt: userMsg,
          source: 'error'
        }
      ])
      addToast('AI prompt failed', 'error')
    } finally {
      copilotManager.setAiLoading(false)
    }
  }

  return {
    handleExportProject,
    handleRunCode,
    handleOpenInviteModal,
    handleAddCollaborators,
    handleRenameWorkspace,
    handleSendPrompt
  }
}
