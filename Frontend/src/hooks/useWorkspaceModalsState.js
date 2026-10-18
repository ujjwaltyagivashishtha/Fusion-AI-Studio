import { useState } from 'react'

export const useWorkspaceModalsState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false)

  const [newProjectNameInput, setNewProjectNameInput] = useState('')
  const [selectedUserId, setSelectedUserId] = useState([])
  const [users, setUsers] = useState([])
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [fetchingUsers, setFetchingUsers] = useState(false)
  const [submittingUsers, setSubmittingUsers] = useState(false)

  return {
    isModalOpen,
    setIsModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    isRenameModalOpen,
    setIsRenameModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    newProjectNameInput,
    setNewProjectNameInput,
    selectedUserId,
    setSelectedUserId,
    users,
    setUsers,
    userSearchQuery,
    setUserSearchQuery,
    fetchingUsers,
    setFetchingUsers,
    submittingUsers,
    setSubmittingUsers
  }
}
