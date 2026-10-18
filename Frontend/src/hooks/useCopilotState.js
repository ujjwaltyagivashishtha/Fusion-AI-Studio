import { useState, useRef, useEffect } from 'react'

export const useCopilotState = ({ teamMessages, rightPanelTab }) => {
  const [prompt, setPrompt] = useState('')
  const [aiMode, setAiMode] = useState('copilot')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: `👋 **Fusion AI Copilot** is ready!\n\nI have indexed your workspace files. Choose an assistance mode (**Auto**, **Refactor**, **Debug**, or **Tests**) or prompt me directly below.`
    }
  ])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, teamMessages, rightPanelTab])

  return {
    prompt,
    setPrompt,
    aiMode,
    setAiMode,
    aiLoading,
    setAiLoading,
    aiMessages,
    setAiMessages,
    messagesEndRef
  }
}
