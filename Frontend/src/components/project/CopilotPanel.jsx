const AI_MODES = [
  { id: 'copilot', label: 'Auto', icon: 'ri-magic-line' },
  { id: 'refactor', label: 'Refactor', icon: 'ri-refresh-line' },
  { id: 'debug', label: 'Debug', icon: 'ri-bug-line' },
  { id: 'test', label: 'Tests', icon: 'ri-test-tube-line' },
  { id: 'explain', label: 'Explain', icon: 'ri-question-line' }
]

const CopilotPanel = ({
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
  messagesEndRef,
  addToast
}) => {
  const renderMessageContent = (text, isActionable = false) => {
    if (!text) return null
    if (isActionable && text.includes('```')) {
      const preamble = text.split('```')[0].trim()
      return <p className="whitespace-pre-wrap">{preamble || 'Here is the requested implementation:'}</p>
    }
    if (!text.includes('```')) {
      return <p className="whitespace-pre-wrap">{text}</p>
    }
    const parts = text.split(/(```[\s\S]*?```)/g)
    return (
      <div className="space-y-2">
        {parts.map((part, idx) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            const content = part.slice(3, -3).replace(/^\r?\n/, '')
            const firstNewline = content.indexOf('\n')
            const lang = firstNewline !== -1 ? content.slice(0, firstNewline).trim() : ''
            const snippet = firstNewline !== -1 ? content.slice(firstNewline + 1) : content
            return (
              <div key={idx} className="my-2 rounded-xl border border-default bg-surface p-2 font-mono text-[11px] overflow-hidden">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-default text-[10px] text-muted">
                  <span className="font-semibold text-primary flex items-center gap-1">
                    <i className="ri-code-line text-blue-500" />
                    {lang || 'example'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(snippet)
                      addToast('Copied code to clipboard!', 'info')
                    }}
                    className="hover:text-primary transition cursor-pointer text-[10px]"
                  >
                    Copy
                  </button>
                </div>
                <pre className="overflow-x-auto p-1 leading-4 text-primary">{snippet}</pre>
              </div>
            )
          }
          const trimmed = part.trim()
          return trimmed ? <p key={idx} className="whitespace-pre-wrap">{part}</p> : null
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">
      {/* Mode Switcher Rail */}
      <div className="p-2.5 border-b border-default bg-surface/50 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
        {AI_MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setAiMode(m.id)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              aiMode === m.id
                ? 'btn-primary text-white shadow-sm'
                : 'text-secondary hover:text-primary hover:bg-surface-hover'
            }`}
          >
            <i className={`${m.icon} text-xs`} />
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {aiMessages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-2xl p-3.5 text-xs shadow-md leading-relaxed ${
                m.sender === 'user'
                  ? 'btn-primary text-white'
                  : 'glass-card border-default text-primary'
              }`}
            >
              {renderMessageContent(m.text, !!m.suggestedCode)}

              {/* Action Buttons for AI Code */}
              {m.suggestedCode && (
                <div className="mt-3 pt-2.5 border-t border-default/60 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onApplyAiCode(m.suggestedCode, m.targetFile)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-sm transition cursor-pointer"
                  >
                    <i className="ri-check-double-line" />
                    <span>Apply to {m.targetFile || activeFile}</span>
                  </button>

                  <button
                    onClick={() => onCreateAiFile(m.targetFile || `ai-${Date.now()}.js`, m.suggestedCode)}
                    className="px-3 py-1.5 rounded-xl border border-default bg-surface hover:bg-surface-hover text-secondary hover:text-primary font-semibold text-[11px] flex items-center gap-1 transition cursor-pointer"
                  >
                    <i className="ri-file-add-line" />
                    <span>Save as New File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {aiLoading && (
          <div className="flex items-center gap-2 p-3.5 rounded-2xl glass-card border-default max-w-[80%] text-xs text-indigo-400">
            <i className="ri-loader-4-line animate-spin text-base" />
            <span className="font-semibold">Synthesizing intelligent code recommendation...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Input Form */}
      <form onSubmit={onSendPrompt} className="p-3 border-t border-default bg-surface/75 shrink-0 space-y-2">
        <div className="relative">
          <textarea
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                onSendPrompt(e)
              }
            }}
            placeholder={`Prompt Copilot (${aiMode} mode)...`}
            className="w-full pl-3 pr-10 py-2 rounded-xl border border-default bg-input text-xs text-primary placeholder-muted outline-none focus:border-indigo-500 font-sans resize-none"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || aiLoading}
            className="absolute right-2.5 bottom-2.5 p-1.5 rounded-lg btn-primary disabled:opacity-40 text-white cursor-pointer transition shadow-sm"
          >
            <i className="ri-send-plane-fill text-xs" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default CopilotPanel
