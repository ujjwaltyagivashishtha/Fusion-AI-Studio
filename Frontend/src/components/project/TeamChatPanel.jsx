const TeamChatPanel = ({
  teamMessages,
  prompt,
  setPrompt,
  onSendMessage,
  messagesEndRef
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {teamMessages.map((m) => {
          const isUser = m.sender === 'user'
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-bold text-muted">
                  {m.senderName}
                </span>
                <span className="text-[9px] text-muted font-mono">
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                  isUser
                    ? 'btn-primary text-white'
                    : 'glass-card border-default text-primary'
                }`}
              >
                <p className="whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          )
        })}

        {teamMessages.length === 0 && (
          <div className="p-8 text-center text-xs text-muted space-y-1">
            <i className="ri-chat-smile-2-line text-2xl text-indigo-400" />
            <p className="font-semibold text-primary">No team messages yet</p>
            <p>Send a message to all active workspace collaborators.</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
      <form onSubmit={onSendMessage} className="p-3 border-t border-default bg-surface/75 shrink-0">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Broadcast to workspace team..."
            className="w-full pl-3 pr-10 py-2 rounded-xl border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={!prompt.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg btn-primary disabled:opacity-40 text-white cursor-pointer transition shadow-sm"
          >
            <i className="ri-send-plane-fill text-xs" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default TeamChatPanel
