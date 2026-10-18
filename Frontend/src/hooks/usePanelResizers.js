import { useState, useRef, useEffect } from 'react'

export const usePanelResizers = () => {
  const [sidebarWidth, setSidebarWidth] = useState(250)
  const [rightPanelWidth, setRightPanelWidth] = useState(360)
  const [bottomDrawerHeight, setBottomDrawerHeight] = useState(220)

  const isDraggingSidebar = useRef(false)
  const isDraggingRightPanel = useRef(false)
  const isDraggingBottomDrawer = useRef(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingSidebar.current) {
        setSidebarWidth(Math.max(180, Math.min(e.clientX - 48, 480)))
      }
      if (isDraggingRightPanel.current) {
        setRightPanelWidth(Math.max(280, Math.min(window.innerWidth - e.clientX, 650)))
      }
      if (isDraggingBottomDrawer.current) {
        setBottomDrawerHeight(Math.max(120, Math.min(window.innerHeight - e.clientY, 500)))
      }
    }

    const handleMouseUp = () => {
      isDraggingSidebar.current = false
      isDraggingRightPanel.current = false
      isDraggingBottomDrawer.current = false
      document.body.style.cursor = 'default'
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  const startDraggingSidebar = () => {
    isDraggingSidebar.current = true
    document.body.style.cursor = 'col-resize'
  }

  const startDraggingRightPanel = () => {
    isDraggingRightPanel.current = true
    document.body.style.cursor = 'col-resize'
  }

  const startDraggingBottomDrawer = () => {
    isDraggingBottomDrawer.current = true
    document.body.style.cursor = 'row-resize'
  }

  return {
    sidebarWidth,
    rightPanelWidth,
    bottomDrawerHeight,
    startDraggingSidebar,
    startDraggingRightPanel,
    startDraggingBottomDrawer
  }
}
