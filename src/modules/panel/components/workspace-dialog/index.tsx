import type { FC } from 'react'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@repo/ui/dialog'
import { FilesSection } from '@/modules/core/components/workspace/components/files-section'

interface WorkspaceDialogProps {
  profile: string
  displayName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * The whole workspace, opened from the panel's three-row glance.
 *
 * The browser itself is unchanged — this is the same `FilesSection` the info modal used to
 * hold on its Files page, folder descent, viewer and all. What changed is what opens it: a
 * "See all" beside a summary rather than a rail item you had to know to click.
 *
 * A dialog rather than a route, because the panel it opens from is itself beside a
 * conversation: navigating away to browse a file would close the thread the file belongs to.
 */
export const WorkspaceDialog: FC<WorkspaceDialogProps> = ({
  profile,
  displayName,
  open,
  onOpenChange,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    {/* `aria-describedby={undefined}` is Radix's way of saying there is no description,
        rather than leaving it to warn about the missing one. */}
    <DialogContent
      aria-describedby={undefined}
      className="flex max-h-[684px] max-w-[720px] flex-col gap-0 overflow-hidden rounded-3xl border-secondary bg-surface p-0"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 px-5 pt-5 pb-1">
        <DialogTitle className="truncate text-label-lg text-primary">
          {displayName}’s workspace
        </DialogTitle>
        <DialogCloseButton className="rounded-[10px] text-secondary" />
      </header>

      <div className="scrollbar-minimal flex-1 overflow-y-auto px-5 pt-3 pb-6">
        <FilesSection profile={profile} displayName={displayName} />
      </div>
    </DialogContent>
  </Dialog>
)
