import EditorTabsBar from './EditorTabsBar'
import CodeEditor from '../CodeEditor.jsx'
import LivePreviewFrame from './LivePreviewFrame'
import BottomDrawer from './BottomDrawer'

const WorkspaceCenterArea = ({
  openFiles,
  activeFile,
  onSelectFile,
  onCloseTab,
  onAddNewFile,
  files,
  onContentChange,
  editorSettings,
  isSplitPreview,
  combinedPreviewDoc,
  previewKey,
  onRefreshPreview,
  bottomTab,
  setBottomTab,
  bottomDrawerHeight,
  onStartDraggingBottomDrawer,
  terminalHistory,
  terminalInput,
  setTerminalInput,
  onTerminalSubmit,
  terminalEndRef,
  consoleLogs,
  onClearConsole,
  addToast
}) => {
  const isPreviewTab = bottomTab === 'preview'

  return (
    <div className="flex-grow flex flex-col min-w-0 min-h-0 overflow-hidden relative">
      {!isPreviewTab && (
        <>
          <EditorTabsBar
            openFiles={openFiles}
            activeFile={activeFile}
            onSelectFile={onSelectFile}
            onCloseTab={onCloseTab}
            onAddNewFile={onAddNewFile}
          />

          <div className="flex-grow flex min-h-0 overflow-hidden relative">
            <CodeEditor
              value={files[activeFile] || ''}
              onChange={onContentChange}
              fileName={activeFile}
              onCopy={() => addToast('Code copied to clipboard!', 'info')}
              fontSize={editorSettings.fontSize}
              wordWrap={editorSettings.wordWrap}
              tabSize={editorSettings.tabSize}
              showMinimap={editorSettings.showMinimap}
            />

            {isSplitPreview && (
              <LivePreviewFrame
                previewDoc={combinedPreviewDoc}
                previewKey={previewKey}
                onRefresh={onRefreshPreview}
              />
            )}
          </div>

          {bottomTab !== 'hidden' && (
            <div
              className="resizer-v"
              onMouseDown={onStartDraggingBottomDrawer}
            />
          )}
        </>
      )}

      <BottomDrawer
        bottomTab={bottomTab}
        setBottomTab={setBottomTab}
        bottomDrawerHeight={bottomDrawerHeight}
        isExpanded={isPreviewTab}
        terminalHistory={terminalHistory}
        terminalInput={terminalInput}
        setTerminalInput={setTerminalInput}
        onTerminalSubmit={onTerminalSubmit}
        terminalEndRef={terminalEndRef}
        consoleLogs={consoleLogs}
        onClearConsole={onClearConsole}
        previewDoc={combinedPreviewDoc}
        previewKey={previewKey}
        onRefreshPreview={onRefreshPreview}
      />
    </div>
  )
}

export default WorkspaceCenterArea
