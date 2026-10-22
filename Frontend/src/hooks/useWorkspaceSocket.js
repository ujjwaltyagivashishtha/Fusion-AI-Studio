import { useState, useEffect, useRef } from 'react'
import {
  intializeSocket,
  recieveMessage,
  disconnectSocket,
  removeListener
} from '../config/socket.js'

export const useWorkspaceSocket = ({
  targetProjectId,
  user,
  rightPanelTab,
  addToast,
  setFiles,
  setOpenFiles,
  setTerminalHistory
}) => {
  const [socketConnected, setSocketConnected] = useState(false)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [teamMessages, setTeamMessages] = useState([])
  const [unreadTeamCount, setUnreadTeamCount] = useState(0)
  // Stable ref so handlers close over current tab value without triggering socket reconnect
  const rightPanelTabRef = useRef(rightPanelTab)
  useEffect(() => { rightPanelTabRef.current = rightPanelTab }, [rightPanelTab])

  useEffect(() => {
    if (!targetProjectId) return

    const socket = intializeSocket(targetProjectId)

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
      if (rightPanelTabRef.current !== 'chat') {
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
      queueMicrotask(() => {
        setSocketConnected(true)
      })
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
  }, [targetProjectId, user?._id, user?.email, addToast, setFiles, setOpenFiles, setTerminalHistory])

  return {
    socketConnected,
    onlineUsers,
    teamMessages,
    setTeamMessages,
    unreadTeamCount,
    setUnreadTeamCount
  }
}
