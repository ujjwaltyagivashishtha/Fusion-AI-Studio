import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('[Fusion Studio Runtime Error]:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleClearAndReset = () => {
    try {
      localStorage.removeItem('fusion_editor_settings')
      sessionStorage.clear()
    } catch {
      // ignore
    }
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-app text-primary flex items-center justify-center p-6 select-none">
          <div className="w-full max-w-xl bg-panel/90 border border-border/80 rounded-2xl p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 text-2xl font-bold">
                ⚠️
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">Workspace Exception Caught</h1>
                <p className="text-sm text-secondary">
                  An unexpected error occurred in the workspace interface.
                </p>
              </div>
            </div>

            <div className="bg-editor/80 border border-border/60 rounded-xl p-4 font-mono text-xs overflow-auto max-h-48 text-red-300">
              <div className="font-semibold text-red-400 mb-1">
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown runtime error'}
              </div>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-secondary/70 whitespace-pre-wrap text-[11px] mt-2">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 min-w-[120px] px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-sm font-medium rounded-xl transition duration-150 shadow-lg shadow-accent/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>↻</span> Reload Workspace
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-4 py-2.5 bg-panel hover:bg-sidebar border border-border text-primary text-sm font-medium rounded-xl transition duration-150 cursor-pointer"
              >
                Go to Dashboard
              </button>

              <button
                type="button"
                onClick={this.handleClearAndReset}
                className="px-4 py-2.5 bg-panel hover:bg-red-500/10 border border-border hover:border-red-500/30 text-secondary hover:text-red-400 text-sm font-medium rounded-xl transition duration-150 cursor-pointer"
                title="Clears cached editor state and returns home"
              >
                Reset State
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
