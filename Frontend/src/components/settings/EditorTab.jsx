const EditorTab = ({ editorSettings, onUpdateEditorSettings }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="font-size-slider" className="text-xs font-medium text-primary block">
            Editor Font Size
          </label>
          <span className="text-[11px] text-muted font-mono">
            Currently {editorSettings.fontSize || 13}px monospace
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              onUpdateEditorSettings({
                ...editorSettings,
                fontSize: Math.max(11, (editorSettings.fontSize || 13) - 1)
              })
            }
            className="w-7 h-7 rounded border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center font-bold text-xs transition cursor-pointer"
          >
            -
          </button>
          <span className="text-xs font-mono font-medium text-primary w-6 text-center">
            {editorSettings.fontSize || 13}
          </span>
          <button
            onClick={() =>
              onUpdateEditorSettings({
                ...editorSettings,
                fontSize: Math.min(18, (editorSettings.fontSize || 13) + 1)
              })
            }
            className="w-7 h-7 rounded border border-default hover:bg-surface-hover text-secondary hover:text-primary flex items-center justify-center font-bold text-xs transition cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-default">
        <div>
          <p className="text-xs font-medium text-primary">Word Wrap</p>
          <p className="text-[11px] text-muted">Wrap long lines to fit the editor viewport width</p>
        </div>
        <button
          onClick={() => onUpdateEditorSettings({ ...editorSettings, wordWrap: !editorSettings.wordWrap })}
          className={`w-9 h-5 rounded-full transition p-0.5 cursor-pointer ${
            editorSettings.wordWrap ? 'bg-accent' : 'bg-surface-hover border border-default'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
              editorSettings.wordWrap ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-default">
        <div>
          <p className="text-xs font-medium text-primary">Code Minimap</p>
          <p className="text-[11px] text-muted">Display structural overview on the right edge of editor</p>
        </div>
        <button
          onClick={() => onUpdateEditorSettings({ ...editorSettings, showMinimap: !editorSettings.showMinimap })}
          className={`w-9 h-5 rounded-full transition p-0.5 cursor-pointer ${
            editorSettings.showMinimap ? 'bg-accent' : 'bg-surface-hover border border-default'
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
              editorSettings.showMinimap ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-default">
        <div>
          <p className="text-xs font-medium text-primary">Tab Size</p>
          <p className="text-[11px] text-muted">Indentation width for tab key presses</p>
        </div>
        <div className="flex items-center p-0.5 rounded border border-default bg-app text-xs font-mono">
          <button
            onClick={() => onUpdateEditorSettings({ ...editorSettings, tabSize: 2 })}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              (editorSettings.tabSize || 2) === 2
                ? 'bg-surface text-primary font-medium shadow-xs'
                : 'text-secondary hover:text-primary'
            }`}
          >
            2 spaces
          </button>
          <button
            onClick={() => onUpdateEditorSettings({ ...editorSettings, tabSize: 4 })}
            className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
              editorSettings.tabSize === 4
                ? 'bg-surface text-primary font-medium shadow-xs'
                : 'text-secondary hover:text-primary'
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
