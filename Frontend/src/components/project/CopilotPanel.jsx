import CopilotMarkdown from './CopilotMarkdown'

const AI_MODES = [
  { id: 'copilot', label: 'Auto', icon: 'ri-magic-line' },
  { id: 'refactor', label: 'Refactor', icon: 'ri-refresh-line' },
  { id: 'debug', label: 'Debug', icon: 'ri-bug-line' },
  { id: 'test', label: 'Tests', icon: 'ri-test-tube-line' },
  { id: 'explain', label: 'Explain', icon: 'ri-question-line' }
]

const QUICK_PROMPTS = [
  { label: 'Create Express Server', prompt: 'create a express server with routes and health check' },
  { label: 'Refactor Active File', prompt: 'Refactor the active file for clarity, performance, and best practices.' },
  { label: 'Add Unit Tests', prompt: 'Write comprehensive unit tests covering edge cases for this file.' },
  { label: 'Explain Architecture', prompt: 'Provide an architectural walkthrough and explanation of this code.' },
  { label: 'Audit Bugs & Errors', prompt: 'Analyze this code for potential memory leaks, bugs, or unhandled errors.' }
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
  return (
    <div className="flex flex-col h-full overflow-hidden select-none bg-sidebar text-primary">
      {/* Mode Switcher */}
      <div className="px-3 py-2 border-b border-default bg-surface flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
        {AI_MODES.map((m) => {
          const isActive = aiMode === m.id
          return (
            <button
              key={m.id}
              onClick={() => setAiMode(m.id)}
              className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition-colors duration-150 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-app text-primary font-medium border border-default shadow-xs'
                  : 'text-muted hover:text-primary hover:bg-surface-hover'
              }`}
            >
              <i className={`${m.icon} text-xs ${isActive ? 'text-accent' : ''}`} />
              <span>{m.label}</span>
            </button>
          )
        })}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto p-3.5 space-y-4">
        {aiMessages.length === 0 ? (
          <div className="py-6 px-1 space-y-4">
            <div className="text-center space-y-1.5">
              <span className="tech-badge">
                <i className="ri-sparkling-line text-accent text-xs" />
                NEXUS
              </span>
              <h4 className="text-xs font-semibold text-primary">Nexus Intelligent Agent</h4>
              <p className="text-[11px] text-muted max-w-xs mx-auto leading-relaxed">
                Connected to active workspace files. Ask architectural questions, refactor functions, or generate tests.
              </p>
            </div>

            <div className="pt-2 space-y-1">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider block px-1">
                Suggested Actions
              </span>
              {QUICK_PROMPTS.map((qp, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrompt(qp.prompt)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-surface-hover transition-colors duration-150 text-xs text-secondary hover:text-primary flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{qp.label}</span>
                  <i className="ri-arrow-right-s-line text-muted group-hover:text-primary transition" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          aiMessages.map((m, idx) => {
            const isUser = m.sender === 'user'
            const isError = Boolean(m.isError)

            return (
              <div
                key={idx}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-muted font-mono">
                  <span>{isUser ? 'You' : 'Nexus'}</span>
                  <span>•</span>
                  <span className={isError ? 'text-rose-400 font-semibold' : !isUser ? 'text-cyan' : ''}>
                    {isError ? 'Diagnostic' : isUser ? 'Prompt' : m.mode || aiMode}
                  </span>
                </div>

                <div
                  className={`text-xs leading-relaxed ${
                    isUser
                      ? 'max-w-[90%] bg-surface-elevated rounded-lg p-2.5 text-primary border border-subtle shadow-xs'
                      : isError
                      ? 'w-full rounded-lg border border-rose-500/30 bg-rose-500/5 p-3.5 shadow-xs text-primary'
                      : 'w-full py-1 text-primary'
                  }`}
                >
                  {isError && (
                    <div className="flex items-center gap-1.5 mb-2 text-rose-400 font-semibold text-xs border-b border-rose-500/20 pb-1.5">
                      <i className="ri-error-warning-line text-sm" />
                      <span>AI Service Advisory</span>
                    </div>
                  )}

                  <CopilotMarkdown content={m.text} addToast={addToast} />

                  {/* Retry Button on Error States */}
                  {isError && m.retryPrompt && (
                    <div className="mt-3 pt-2.5 border-t border-rose-500/20 flex items-center justify-between">
                      <span className="text-[10px] text-muted font-mono">Check API status or retry request</span>
                      <button
                        type="button"
                        onClick={() => onSendPrompt(null, m.retryPrompt)}
                        className="btn btn-sm bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-mono flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="ri-refresh-line text-xs" />
                        <span>Retry</span>
                      </button>
                    </div>
                  )}

                  {/* Action Buttons for AI Code */}
                  {!isError && m.suggestedCode && (
                    <div className="mt-2.5 pt-2 border-t border-default/70 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onApplyAiCode(m.suggestedCode, m.targetFile)}
                        className="btn btn-sm btn-primary text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                      >
                        <i className="ri-check-double-line text-xs" />
                        <span>Apply to {m.targetFile || activeFile}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onCreateAiFile(
                            m.targetFile || `generated-${Date.now().toString().slice(-4)}.js`,
                            m.suggestedCode
                          )
                        }
                        className="btn btn-sm btn-secondary text-xs flex items-center gap-1.5 font-mono cursor-pointer"
                      >
                        <i className="ri-file-add-line text-xs" />
                        <span>Save New File</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {aiLoading && (
          <div className="flex items-center gap-2 py-2 text-xs text-secondary font-mono animate-fadeIn">
            <i className="ri-loader-4-line animate-spin text-accent text-sm" />
            <span>Analyzing AST & generating patch...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Input Form */}
      <form onSubmit={onSendPrompt} className="p-3 border-t border-default bg-surface shrink-0 space-y-2">
        <div className="relative rounded-md border border-default focus-within:border-accent bg-app transition-colors duration-150">
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
            placeholder={`Ask Nexus in ${aiMode} mode...`}
            className="w-full pl-3 pr-10 py-2.5 bg-transparent text-xs text-primary placeholder-muted outline-none font-sans resize-none"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || aiLoading}
            className="absolute right-2 bottom-2 p-1.5 rounded-md bg-accent text-accent-contrast disabled:opacity-30 cursor-pointer transition shadow-xs hover:opacity-90"
            title="Send prompt (Enter)"
          >
            <i className="ri-arrow-up-line text-xs font-bold" />
          </button>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted font-mono px-0.5">
          <span className="flex items-center gap-1">
            <span className="text-secondary">Target:</span>
            <span className="text-cyan">{activeFile || 'workspace'}</span>
          </span>
          <span>Shift+↵ for newline</span>
        </div>
      </form>
    </div>
  )
}

export default CopilotPanel
