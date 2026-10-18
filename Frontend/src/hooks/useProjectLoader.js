import { useEffect } from 'react'
import axios from '../config/axios'

export const useProjectLoader = ({
  targetProjectId,
  user,
  setProject,
  setCollaborators,
  setNewProjectNameInput,
  setTeamMessages,
  setFiles,
  setActiveFile,
  setOpenFiles,
  setSaveStatus,
  setUsers,
  setTerminalHistory,
  setConsoleLogs
}) => {
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
  }, [targetProjectId, user?._id, user?.email, setProject, setCollaborators, setNewProjectNameInput, setTeamMessages, setFiles, setActiveFile, setOpenFiles, setSaveStatus, setUsers])

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
  }, [setConsoleLogs, setTerminalHistory])
}
