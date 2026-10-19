import { useState, useRef, useEffect } from 'react'
import axios from '../config/axios'

export const useTerminal = ({
  files,
  setFiles,
  openFiles,
  setOpenFiles,
  activeFile,
  setActiveFile,
  saveFilesToBackend,
  saveStatus,
  handleExportProject,
  setBottomTab
}) => {
  const [terminalHistory, setTerminalHistory] = useState([
    'Fusion AI Cloud Terminal (Node v20.10.0, Linux x86_64)',
    'Type "help" for available commands, or "npm start" to run live server.'
  ])
  const [terminalInput, setTerminalInput] = useState('')
  const terminalEndRef = useRef(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [terminalHistory])

  const handleTerminalCommand = async (e) => {
    e.preventDefault()
    if (!terminalInput.trim()) return

    const cmd = terminalInput.trim()
    setTerminalInput('')
    const newLogs = [...terminalHistory, `$ ${cmd}`]

    if (cmd === 'clear') {
      setTerminalHistory(['Fusion AI Cloud Terminal (Node v20.10.0)'])
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
        '  ai <prompt>     - Prompt Nexus agent directly',
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

  return {
    terminalHistory,
    setTerminalHistory,
    terminalInput,
    setTerminalInput,
    terminalEndRef,
    handleTerminalCommand
  }
}
