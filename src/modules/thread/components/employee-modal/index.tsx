import type { FC } from 'react'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogTitle,
} from '@repo/ui/dialog'
import { useEmployeeProfile } from '@/modules/core/hooks/use-employee-profile'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { ConnectorsSection } from './components/connectors-section'
import { FilesSection } from './components/files-section'
import { IdentityHeader } from './components/identity-header'
import { useIdentityEditor } from './hooks/use-identity-editor'
import { describeEmployeeState } from './utils/employee-state'

export interface EmployeeModalProps {
  profile: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * The employee card, opened by clicking the identity in the thread header.
 *
 * Three blocks, in descending order of how much of them is real:
 *
 * - **Identity** is entirely local. Hermes stores no avatar, colour or display name and has
 *   nowhere to put one (`stores/identity-store` has the receipts), so these are per-device
 *   presentation state and the modal says so while you are editing.
 * - **Connectors** are the profile's MCP servers, listed and toggled against live
 *   endpoints. Brand icons and sign-in state are the two things the payload does not carry.
 * - **Files** are a real directory listing of `<profile.path>/workspace`, newest first,
 *   with no per-file attribution because Hermes keeps none.
 */
export const EmployeeModal: FC<EmployeeModalProps> = ({
  profile,
  open,
  onOpenChange,
}) => {
  const editor = useIdentityEditor(profile)
  const { data: employee } = useEmployeeProfile(profile)

  const status = useChatStore((state) => state.threads[profile]?.status)
  const statusText = useChatStore((state) => state.threads[profile]?.statusText)
  const connection = useChatStore((state) => state.connection)

  const state = describeEmployeeState(status, connection)

  /*
   * The secondary half of the state line. `status.update` text when there is a live turn to
   * describe, otherwise the model the profile runs on — and failing that the slug, which
   * after a rename is the only place the name Hermes knows is still visible.
   */
  const detail = statusText?.trim() || employee?.model?.trim() || profile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* `aria-describedby={undefined}` is Radix's way of saying there is no description,
          rather than leaving it to warn about the missing one. */}
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[560px] gap-0 rounded-3xl bg-surface p-0"
      >
        <div className="flex shrink-0 items-center justify-between px-6 pt-5">
          <DialogTitle className="text-label-sm text-secondary">Employee</DialogTitle>
          <DialogCloseButton className="text-secondary" />
        </div>

        <div className="scrollbar-minimal flex max-h-[70vh] flex-col gap-6 overflow-y-auto px-6 pt-4 pb-6">
          <IdentityHeader
            profile={profile}
            state={state}
            detail={detail}
            editor={editor}
          />
          <ConnectorsSection profile={profile} />
          <FilesSection profile={profile} displayName={editor.displayName} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
