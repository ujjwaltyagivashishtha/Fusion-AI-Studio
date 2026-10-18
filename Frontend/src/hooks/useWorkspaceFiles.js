import { useState, useRef, useCallback } from 'react'
import axios from '../config/axios'
import { INITIAL_FILES } from '../utils/workspaceConstants'
import { sendMessage } from '../config/socket.js'

export const useWorkspaceFiles = ({
  targetProjectId,
  socketConnected,
  addToast
}) => {
  const [files, setFiles] = useState(INITIAL_FILES)
  const [openFiles, setOpenFiles] = useState(['app.js', 'index.html'])
  const [activeFile, setActiveFile] = useState('app.js')
  const [fileFilter, setFileFilter] = useState('')
  const [isCreatingFile, setIsCreatingFile] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [saveStatus, setSaveStatus] = useState('saved')
  const saveTimeoutRef = useRef(null)

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

  return {
    files,
    setFiles,
    openFiles,
    setOpenFiles,
    activeFile,
    setActiveFile,
    fileFilter,
    setFileFilter,
    isCreatingFile,
    setIsCreatingFile,
    newFileName,
    setNewFileName,
    saveStatus,
    setSaveStatus,
    saveFilesToBackend,
    handleSelectFile,
    handleCloseTab,
    handleCreateFile,
    handleDeleteFile,
    handleContentChange,
    handleApplyAiCode,
    handleCreateAiFile
  }
}
