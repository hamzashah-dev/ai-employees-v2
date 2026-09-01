import { useCallback, useState, type FC } from 'react'
import { ChevronLeftIcon } from '@repo/icons/chevron-left'
import { Button } from '@repo/ui/button'
import { Dialog, DialogCloseButton, DialogContent, DialogTitle } from '@repo/ui/dialog'
import type { HermesCronJob } from '@/modules/core/services/hermes/types'
import { RoutineEditor } from '../routine-editor'
import { RoutinesSection } from '../routines-section'

interface RoutinesDialogProps {
  profile: string
  displayName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Every routine this employee has, and the editor for one.
 *
 * The list and the editor are the panel's own components, unchanged — what moved is where
 * they are mounted. They used to be a two-deep view stack *inside* the drawer, which meant
 * opening a cron editor replaced the employee you were looking at with a form, in a column
 * 480px wide, beside a conversation you could no longer see the point of.
 *
 * The stack is a boolean here rather than the old `usePanelView`: there are exactly two
 * views and the dialog itself is the third level of "back", handled by Radix.
 */
export const RoutinesDialog: FC<RoutinesDialogProps> = ({
  profile,
  displayName,
  open,
  onOpenChange,
}) => {
  const [editing, setEditing] = useState<{ job: HermesCronJob | null } | null>(null)

  const openEditor = useCallback((job?: HermesCronJob) => {
    setEditing({ job: job ?? null })
  }, [])
  const closeEditor = useCallback(() => setEditing(null), [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* `aria-describedby={undefined}` is Radix's way of saying there is no description,
          rather than leaving it to warn about the missing one. */}
      <DialogContent
        aria-describedby={undefined}
        className="flex max-h-[684px] max-w-[560px] flex-col gap-0 overflow-hidden rounded-3xl border-secondary bg-surface p-0"
      >
        <header className="flex shrink-0 items-center gap-2 px-5 pt-5 pb-1">
          {editing && (
            <Button
              variant="icon-ghost"
              size="icon-sm"
              shape="pill"
              aria-label="Back to routines"
              className="-ml-1 shrink-0 text-secondary [&>svg]:size-4"
              onClick={closeEditor}
            >
              <ChevronLeftIcon />
            </Button>
          )}
          <DialogTitle className="min-w-0 flex-1 truncate text-label-lg text-primary">
            {editing
              ? editing.job
                ? 'Edit routine'
                : 'New routine'
              : `${displayName}’s routines`}
          </DialogTitle>
          <DialogCloseButton className="shrink-0 rounded-[10px] text-secondary" />
        </header>

        <div className="scrollbar-minimal flex-1 overflow-y-auto px-5 pt-3 pb-6">
          {editing ? (
            <RoutineEditor
              profile={profile}
              job={editing.job}
              onDone={closeEditor}
              onCancel={closeEditor}
            />
          ) : (
            <RoutinesSection profile={profile} onEdit={openEditor} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
