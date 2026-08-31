import type { FC } from 'react'
import { useGroupStore } from '@/modules/core/stores/group-store'
import { useGroupCandidates } from '../../hooks/use-group-candidates'
import { CreateGroupDialog } from '../create-group-dialog'

interface NewGroupFlowProps {
  onClose: () => void
  /** Handed the new room's id so the caller can open it. */
  onCreated: (id: string) => void
}

/**
 * The create flow with its data and its store wired up.
 *
 * Exists so the shell can mount the flow without importing the store, the roster
 * query and the dialog separately — the shell's job is to say *where* the flow
 * lives, not to assemble it.
 */
export const NewGroupFlow: FC<NewGroupFlowProps> = ({ onClose, onCreated }) => {
  const { candidates, isLoading, error } = useGroupCandidates()

  return (
    <CreateGroupDialog
      open
      onClose={onClose}
      onCreate={(name, members) => {
        onCreated(useGroupStore.getState().createRoom(name, members))
      }}
      available={candidates}
      isLoading={isLoading}
      error={error}
    />
  )
}
