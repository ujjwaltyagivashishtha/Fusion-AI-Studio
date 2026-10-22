import { useState, useEffect } from 'react'

const DEFAULT_EDITOR_SETTINGS = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  showMinimap: true
}

export const useEditorSettings = () => {
  const [editorSettings, setEditorSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('fusion_editor_settings')
      if (saved) return JSON.parse(saved)
    } catch {
      // Fallback
    }
    return DEFAULT_EDITOR_SETTINGS
  })

  useEffect(() => {
    try {
      localStorage.setItem('fusion_editor_settings', JSON.stringify(editorSettings))
    } catch {
      // ignore storage errors
    }
  }, [editorSettings])

  return [editorSettings, setEditorSettings]
}
