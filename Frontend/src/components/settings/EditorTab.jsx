const EditorTab = ({ editorSettings, onUpdateEditorSettings }) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="font-size-slider" className="text-xs font-semibold text-primary block">
            Editor Font Size
          </label>
          <span className="text-[11px] text-muted">Currently {editorSettings.fontSize || 13}px monospace</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateEditorSettings({ ...editorSettings, fontSize: Math.max(11, (editorSettings.fontSize || 13) - 1) })}
            className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center font-bold text-xs transition cursor-pointer"
          >
            -
          </button>
          <span className="text-xs font-mono font-bold text-primary w-6 text-center">
            {editorSettings.fontSize || 13}
          </span>
          <button
            onClick={() => onUpdateEditorSettings({ ...editorSettings, fontSize: Math.min(18, (editorSettings.fontSize || 13) + 1) })}
            className="w-8 h-8 rounded-xl border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center font-bold text-xs transition cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-default">
        <div>
          <p className="text-xs font-semibold text-primary">Word Wrap</p>
          <p className="text-[11px] text-muted">Wrap long lines to fit the editor viewport width</p>
        </div>
        <button
          onClick={() => onUpdateEditorSettings({ ...editorSettings, wordWrap: !editorSettings.wordWrap })}
          className={`w-11 h-6 rounded-full transition p-1 cursor-pointer ${
            editorSettings.wordWrap ? 'btn-primary' : 'bg-surface-hover border border-default'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${editorSettings.wordWrap ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-default">
        <div>
          <p className="text-xs font-semibold text-primary">Code Minimap</p>
          <p className="text-[11px] text-muted">Display structural overview on the right edge of editor</p>
        </div>
        <button
          onClick={() => onUpdateEditorSettings({ ...editorSettings, showMinimap: !editorSettings.showMinimap })}
          className={`w-11 h-6 rounded-full transition p-1 cursor-pointer ${
            editorSettings.showMinimap ? 'btn-primary' : 'bg-surface-hover border border-default'
          }`}
        >
          <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${editorSettings.showMinimap ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-default">
        <div>
          <p className="text-xs font-semibold text-primary">Tab Size</p>
          <p className="text-[11px] text-muted">Indentation width for tab key presses</p>
        </div>
        <div className="flex items-center p-1 rounded-xl border border-default bg-app text-xs font-mono">
          <button
            onClick={() => onUpdateEditorSettings({ ...editorSettings, tabSize: 2 })}
            className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
              (editorSettings.tabSize || 2) === 2 ? 'btn-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
            }`}
          >
            2 spaces
          </button>
          <button
            onClick={() => onUpdateEditorSettings({ ...editorSettings, tabSize: 4 })}
            className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
              editorSettings.tabSize === 4 ? 'btn-primary text-white shadow-sm' : 'text-secondary hover:text-primary'
            }`}
          >
            4 spaces
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditorTab
