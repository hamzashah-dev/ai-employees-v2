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
import { InfoPage } from './components/info-page'
import { ModalRail } from './components/modal-rail'
import { VaultsSection } from './components/vaults-section'
import { useEmployeeCard } from './hooks/use-employee-card'
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
 * Four pages behind a left rail, in descending order of how much of them is real:
 *
 * - **Info** is who this is, plus a summary of the other three. Identity is entirely local:
 *   Hermes stores no avatar, colour or display name and has nowhere to put one
 *   (`stores/identity-store` has the receipts), so those are per-device presentation state
 *   and the page says so. The model picker beside them is the one thing that writes to disk.
 * - **Files** are a real directory listing of `<profile.path>/workspace`, newest first,
 *   with no per-file attribution because Hermes keeps none.
 * - **Connectors** are the profile's MCP servers, listed and toggled against live
 *   endpoints. Sign-in state is the one thing the payload does not carry.
 * - **Vaults** are the employee's own `.env`, read and written through `/api/env` under
 *   `_profile_scope` — the only per-employee credential store Hermes has.
 */
export const EmployeeModal: FC<EmployeeModalProps> = ({
  profile,
  open,
  onOpenChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {/* `aria-describedby={undefined}` is Radix's way of saying there is no description,
        rather than leaving it to warn about the missing one. */}
    <DialogContent
      aria-describedby={undefined}
      className="max-w-[720px] gap-0 overflow-hidden rounded-3xl border-secondary bg-surface p-0 shadow-lg"
    >
      {/* Mounted only while open, so the card always reopens on Info and a revealed
          credential never survives a close. Radix unmounts the portal on close; keeping the
          page state out here would defeat both. */}
      <EmployeeCard profile={profile} />
    </DialogContent>
  </Dialog>
)

const EmployeeCard: FC<{ profile: string }> = ({ profile }) => {
  const editor = useIdentityEditor(profile)
  const { data: employee } = useEmployeeProfile(profile)
  const model = employee?.model?.trim() || null
  const card = useEmployeeCard(profile, model)

  const status = useChatStore((state) => state.threads[profile]?.status)
  const statusText = useChatStore((state) => state.threads[profile]?.statusText)
  const connection = useChatStore((state) => state.connection)

  const state = describeEmployeeState(status, connection)

  /*
   * The middle of the state line: what the employee is doing right now, if anything.
   *
   * This used to fall back to the model and then to the slug, because the model had nowhere
   * else to live. It has its own control now, so the fallbacks are gone — a slug repeated
   * under the name it was already rendered from said nothing, and the model reading as
   * activity text made a static fact look like a live one.
   */
  const detail = statusText?.trim() ?? ''

  return (
    <div className="flex max-h-[684px] min-h-96">
      <div className="flex shrink-0 flex-col gap-3 border-r border-primary p-3 tablet:w-44">
        <DialogTitle className="sr-only px-2.5 pt-1 text-label-sm text-secondary tablet:not-sr-only">
          Employee
        </DialogTitle>
        <ModalRail active={card.page} onSelect={card.setPage} counts={card.counts} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 items-center justify-between gap-2 px-5 pt-5 pb-1">
          <h2 className="truncate text-label-lg text-primary">{card.title}</h2>
          <DialogCloseButton className="rounded-[10px] text-secondary" />
        </header>

        <div className="scrollbar-minimal flex-1 overflow-y-auto px-5 pt-3 pb-6">
          {card.page === 'info' && (
            <InfoPage
              profile={profile}
              state={state}
              detail={detail}
              model={model}
              editor={editor}
              tiles={card.tiles}
              recent={card.recent}
              totalFiles={card.totalFiles}
              filesLoading={card.filesLoading}
              onSelect={card.setPage}
            />
          )}
          {card.page === 'files' && (
            <FilesSection profile={profile} displayName={editor.displayName} />
          )}
          {card.page === 'connectors' && <ConnectorsSection profile={profile} />}
          {card.page === 'vaults' && (
            <VaultsSection profile={profile} displayName={editor.displayName} />
          )}
        </div>
      </div>
    </div>
  )
}
