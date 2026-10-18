import CopilotPanel from './CopilotPanel'
import TeamChatPanel from './TeamChatPanel'

const WorkspaceRightPanel = ({
  isOpen,
  width,
  onClose,
  rightPanelTab,
  setRightPanelTab,
  unreadTeamCount,
  setUnreadTeamCount,
  aiMode,
  setAiMode,
  aiMessages,
  aiLoading,
  prompt,
  setPrompt,
  onSendPrompt,
  onApplyAiCode,
  onCreateAiFile,
  activeFile,
  teamMessages,
  messagesEndRef,
  addToast
}) => {
  if (!isOpen) return null

  return (
    <aside
      className="border-l border-default bg-sidebar flex flex-col shrink-0 overflow-hidden"
      style={{ width: `${width}px` }}
    >
      <div className="h-9 border-b border-default bg-surface/75 px-3 flex items-center justify-between text-xs text-secondary shrink-0 select-none">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRightPanelTab('copilot')}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              rightPanelTab === 'copilot'
                ? 'btn-primary text-white shadow-sm'
                : 'text-muted hover:text-primary hover:bg-surface-hover'
            }`}
          >
            <i className="ri-sparkling-fill text-xs" />
            <span>AI Copilot</span>
          </button>
          <button
            onClick={() => {
              setRightPanelTab('chat')
              setUnreadTeamCount(0)
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer relative ${
              rightPanelTab === 'chat'
                ? 'btn-primary text-white shadow-sm'
                : 'text-muted hover:text-primary hover:bg-surface-hover'
            }`}
          >
            <i className="ri-chat-1-line text-xs" />
            <span>Team Chat</span>
            {unreadTeamCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded text-muted hover:text-primary transition cursor-pointer"
          title="Collapse Panel"
        >
          <i className="ri-layout-right-line text-xs" />
        </button>
      </div>

      <div className="flex-grow overflow-hidden">
        {rightPanelTab === 'copilot' ? (
          <CopilotPanel
            aiMode={aiMode}
            setAiMode={setAiMode}
            aiMessages={aiMessages}
            aiLoading={aiLoading}
            prompt={prompt}
            setPrompt={setPrompt}
            onSendPrompt={onSendPrompt}
            onApplyAiCode={onApplyAiCode}
            onCreateAiFile={onCreateAiFile}
            activeFile={activeFile}
            messagesEndRef={messagesEndRef}
            addToast={addToast}
          />
        ) : (
          <TeamChatPanel
            teamMessages={teamMessages}
            prompt={prompt}
            setPrompt={setPrompt}
            onSendMessage={onSendPrompt}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>
    </aside>
  )
}

export default WorkspaceRightPanel
