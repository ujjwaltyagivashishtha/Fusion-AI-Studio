import { useState, useRef, useCallback, useMemo } from 'react'

export const useCodeEditorState = ({
  value,
  onChange,
  tabSize,
  setIsSearchOpen
}) => {
  const textareaRef = useRef(null)
  const lineNumbersRef = useRef(null)
  const preHighlightRef = useRef(null)
  const minimapRef = useRef(null)

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 })
  const [copied, setCopied] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)

  const handleScroll = () => {
    if (!textareaRef.current) return
    const { scrollTop, scrollLeft } = textareaRef.current
    if (lineNumbersRef.current) lineNumbersRef.current.scrollTop = scrollTop
    if (preHighlightRef.current) {
      preHighlightRef.current.scrollTop = scrollTop
      preHighlightRef.current.scrollLeft = scrollLeft
    }
  }

  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return
    const selStart = textareaRef.current.selectionStart
    const textBefore = (value || '').substring(0, selStart)
    const currentLines = textBefore.split('\n')
    const line = currentLines.length
    const col = currentLines[currentLines.length - 1].length + 1
    setCursorPos({ line, col })
  }, [value])

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !value) return []
    const query = searchQuery.toLowerCase()
    const text = value.toLowerCase()
    const indices = []
    let startIndex = 0
    while ((startIndex = text.indexOf(query, startIndex)) !== -1) {
      indices.push(startIndex)
      startIndex += query.length
    }
    return indices
  }, [searchQuery, value])

  const highlightSearchMatch = (charIndex) => {
    if (!textareaRef.current || charIndex === undefined) return
    textareaRef.current.focus()
    textareaRef.current.setSelectionRange(charIndex, charIndex + searchQuery.length)
    updateCursorPosition()
  }

  const handleNextSearch = () => {
    if (searchResults.length === 0) return
    const nextIndex = (currentSearchIndex + 1) % searchResults.length
    setCurrentSearchIndex(nextIndex)
    highlightSearchMatch(searchResults[nextIndex])
  }

  const handlePrevSearch = () => {
    if (searchResults.length === 0) return
    const prevIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length
    setCurrentSearchIndex(prevIndex)
    highlightSearchMatch(searchResults[prevIndex])
  }

  const handleKeyDown = (e) => {
    const textarea = textareaRef.current
    if (!textarea) return

    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault()
      setIsSearchOpen(true)
      return
    }

    const { selectionStart, selectionEnd } = textarea

    if (e.key === 'Tab') {
      e.preventDefault()
      const spaces = ' '.repeat(tabSize)
      const newValue = value.substring(0, selectionStart) + spaces + value.substring(selectionEnd)
      onChange(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + spaces.length
        updateCursorPosition()
      }, 0)
      return
    }

    const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '`': '`' }
    if (pairs[e.key] && selectionStart === selectionEnd) {
      e.preventDefault()
      const openChar = e.key
      const closeChar = pairs[e.key]
      const newValue = value.substring(0, selectionStart) + openChar + closeChar + value.substring(selectionEnd)
      onChange(newValue)
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
        updateCursorPosition()
      }, 0)
      return
    }

    const closingChars = [')', '}', ']', '"', "'", '`']
    if (closingChars.includes(e.key) && value[selectionStart] === e.key) {
      e.preventDefault()
      textarea.selectionStart = textarea.selectionEnd = selectionStart + 1
      updateCursorPosition()
    }
  }

  return {
    textareaRef,
    lineNumbersRef,
    preHighlightRef,
    minimapRef,
    cursorPos,
    copied,
    setCopied,
    searchQuery,
    setSearchQuery,
    currentSearchIndex,
    searchResults,
    handleScroll,
    updateCursorPosition,
    handleNextSearch,
    handlePrevSearch,
    handleKeyDown
  }
}
