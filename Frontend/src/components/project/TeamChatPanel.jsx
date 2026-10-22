const TeamChatPanel = ({
  teamMessages,
  chatPrompt,
  setChatPrompt,
  onSendMessage,
  messagesEndRef
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden select-none bg-sidebar text-primary">
      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto p-3.5 space-y-3">
        {teamMessages.map((m) => {
          const isUser = m.sender === 'user'
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-mono font-medium text-muted">
                  {m.senderName}
                </span>
                <span className="text-[9px] text-muted font-mono">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-surface-elevated border border-default text-primary'
                    : 'bg-surface border border-default text-primary'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
              </div>
            </div>
          )
        })}

        {teamMessages.length === 0 && (
          <div className="py-12 text-center text-xs text-muted space-y-2">
            <div className="w-9 h-9 rounded-md border border-default bg-surface flex items-center justify-center mx-auto text-secondary">
              <i className="ri-team-line text-base" />
            </div>
            <p className="font-semibold text-primary">No team messages yet</p>
            <p className="text-[11px] max-w-xs mx-auto">
              Messages sent here are broadcast over WebSocket to all active collaborators on this workspace.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={onSendMessage} className="p-3 border-t border-default bg-surface shrink-0">
        <div className="relative rounded-md border border-default focus-within:border-accent bg-app transition">
          <input
            type="text"
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            placeholder="Broadcast to workspace team..."
            className="w-full pl-3 pr-10 py-2.5 bg-transparent text-xs text-primary placeholder-muted outline-none font-sans"
          />
          <button
            type="submit"
            disabled={!chatPrompt?.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-accent text-accent-contrast disabled:opacity-30 cursor-pointer transition shadow-xs hover:opacity-90"
            title="Send message"
          >
            <i className="ri-arrow-up-line text-xs font-bold" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default TeamChatPanel
