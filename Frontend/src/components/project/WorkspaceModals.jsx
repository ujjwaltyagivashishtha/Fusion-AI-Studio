import SettingsModal from '../SettingsModal.jsx'
import CommandPalette from '../CommandPalette.jsx'
import InviteModal from './InviteModal'
import DetailsModal from './DetailsModal'
import RenameModal from './RenameModal'

const WorkspaceModals = ({
  modalsState,
  editorSettings,
  setEditorSettings,
  user,
  onLogout,
  files,
  activeFile,
  onSelectFile,
  onRunCode,
  onToggleSplitPreview,
  onOpenInviteModal,
  onOpenDetailsModal,
  onTriggerAiPrompt,
  collaborators,
  project,
  onAddCollaborators,
  onRenameWorkspace
}) => {
  return (
    <>
      <SettingsModal
        isOpen={modalsState.isSettingsModalOpen}
        onClose={() => modalsState.setIsSettingsModalOpen(false)}
        editorSettings={editorSettings}
        onUpdateEditorSettings={setEditorSettings}
        user={user}
        onLogout={onLogout}
      />

      <CommandPalette
        isOpen={modalsState.isCommandPaletteOpen}
        onClose={() => modalsState.setIsCommandPaletteOpen(false)}
        files={files}
        activeFile={activeFile}
        onSelectFile={onSelectFile}
        onRunCode={onRunCode}
        onToggleSplitPreview={onToggleSplitPreview}
        onOpenSettingsModal={() => modalsState.setIsSettingsModalOpen(true)}
        onOpenInviteModal={onOpenInviteModal}
        onOpenDetailsModal={onOpenDetailsModal}
        onTriggerAiPrompt={onTriggerAiPrompt}
      />

      <InviteModal
        isOpen={modalsState.isModalOpen}
        onClose={() => modalsState.setIsModalOpen(false)}
        users={modalsState.users}
        collaborators={collaborators}
        selectedUserId={modalsState.selectedUserId}
        onUserClick={(id) =>
          modalsState.setSelectedUserId((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
          )
        }
        userSearchQuery={modalsState.userSearchQuery}
        setUserSearchQuery={modalsState.setUserSearchQuery}
        fetchingUsers={modalsState.fetchingUsers}
        submittingUsers={modalsState.submittingUsers}
        onAddCollaborators={onAddCollaborators}
      />

      <DetailsModal
        isOpen={modalsState.isDetailsModalOpen}
        onClose={() => modalsState.setIsDetailsModalOpen(false)}
        project={project}
        filesCount={Object.keys(files).length}
        collaboratorsCount={collaborators.length}
      />

      <RenameModal
        isOpen={modalsState.isRenameModalOpen}
        onClose={() => modalsState.setIsRenameModalOpen(false)}
        projectNameInput={modalsState.newProjectNameInput}
        setProjectNameInput={modalsState.setNewProjectNameInput}
        onRename={onRenameWorkspace}
      />
    </>
  )
}

export default WorkspaceModals
