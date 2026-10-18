import SidebarExplorer from './SidebarExplorer'
import SidebarSearch from './SidebarSearch'
import SidebarGit from './SidebarGit'

const WorkspaceSidebar = ({
  isOpen,
  width,
  activeTab,
  files,
  filteredFiles,
  activeFile,
  onSelectFile,
  fileFilter,
  setFileFilter,
  isCreatingFile,
  setIsCreatingFile,
  newFileName,
  setNewFileName,
  onCreateFile,
  onDeleteFile,
  searchInFilesQuery,
  setSearchInFilesQuery,
  searchInFilesResults,
  saveStatus,
  onCommitPush
}) => {
  if (!isOpen) return null

  return (
    <div
      className="border-r border-default bg-sidebar flex flex-col shrink-0 overflow-hidden"
      style={{ width: `${width}px` }}
    >
      {activeTab === 'explorer' && (
        <SidebarExplorer
          files={files}
          filteredFiles={filteredFiles}
          activeFile={activeFile}
          onSelectFile={onSelectFile}
          fileFilter={fileFilter}
          setFileFilter={setFileFilter}
          isCreatingFile={isCreatingFile}
          setIsCreatingFile={setIsCreatingFile}
          newFileName={newFileName}
          setNewFileName={setNewFileName}
          onCreateFile={onCreateFile}
          onDeleteFile={onDeleteFile}
        />
      )}
      {activeTab === 'search' && (
        <SidebarSearch
          searchInFilesQuery={searchInFilesQuery}
          setSearchInFilesQuery={setSearchInFilesQuery}
          searchInFilesResults={searchInFilesResults}
          onSelectFile={onSelectFile}
        />
      )}
      {activeTab === 'git' && (
        <SidebarGit
          files={files}
          saveStatus={saveStatus}
          onCommitPush={onCommitPush}
        />
      )}
    </div>
  )
}

export default WorkspaceSidebar
