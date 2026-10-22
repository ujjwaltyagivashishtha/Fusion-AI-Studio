import { useState, useRef, useEffect } from 'react'

export const useCopilotState = ({ teamMessages, rightPanelTab }) => {
  // Separate prompt states so Nexus AI and Team Chat inputs never bleed into each other
  const [prompt, setPrompt] = useState('')
  const [chatPrompt, setChatPrompt] = useState('')
  const [aiMode, setAiMode] = useState('copilot')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessages, setAiMessages] = useState([
    {
      sender: 'ai',
      text: `👋 **Nexus** is ready!\n\nI am your engineering agent inside Fusion AI Studio. I have indexed your workspace files. Choose an assistance mode (**Auto**, **Refactor**, **Debug**, or **Tests**) or prompt me directly below.`
    }
  ])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages, teamMessages, rightPanelTab])

  return {
    prompt,
    setPrompt,
    chatPrompt,
    setChatPrompt,
    aiMode,
    setAiMode,
    aiLoading,
    setAiLoading,
    aiMessages,
    setAiMessages,
    messagesEndRef
  }
}
