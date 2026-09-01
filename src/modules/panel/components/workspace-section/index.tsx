import { useId, useState, type FC } from 'react'
import { ArrowUpRightIcon } from '@repo/icons/arrow-up-right'
import { Skeleton } from '@repo/ui/skeleton'
import { FileRows } from '@/modules/core/components/workspace/components/file-rows'
import { GLANCE_FILES } from '@/modules/core/components/workspace/constants'
import { useWorkspaceFiles } from '@/modules/core/components/workspace/hooks/use-workspace-files'
import { WorkspaceDialog } from '../workspace-dialog'

interface WorkspaceSectionProps {
  profile: string
  displayName: string
}

/**
 * The newest thing this employee wrote, and the way into everything else.
 *
 * Three rows, newest first — a glance, not a file manager. Rows are deliberately inert here:
 * this is a summary of a browser one click away, and a row that opened a viewer from the
 * panel would leave the user somewhere other than where they aimed.
 *
 * "See all" carries the count because the count is the useful part of it: three of three is
 * a different invitation from three of ninety. It is omitted until the listing has answered
 * — "no files" and "not asked yet" are different claims.
 */
export const WorkspaceSection: FC<WorkspaceSectionProps> = ({ profile, displayName }) => {
  const headingId = useId()
  const [open, setOpen] = useState(false)
  const { files, isLoading, error } = useWorkspaceFiles(profile)

  const shown = files.slice(0, GLANCE_FILES)
  const ready = !isLoading && error === null

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-2 pb-1">
        <h2 id={headingId} className="text-label-md font-medium text-primary">
          Workspace
        </h2>
        {ready && files.length > 0 && (
          <button
            type="button"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
            className="flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-1.5 py-0.5 text-label-sm text-secondary transition-colors duration-200 ease-linear hover:bg-fill-variant-hover hover:text-primary focus-visible:bg-fill-variant-hover focus-visible:outline-none"
          >
            See all {files.length}
            <ArrowUpRightIcon className="size-3" />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3 py-2">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-4 w-full bg-fill-elevated" />
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="py-2 text-label-sm text-critical">
          {error.message || 'Couldn’t read this employee’s workspace.'}
        </p>
      )}

      {ready &&
        (shown.length === 0 ? (
          <p className="py-2 text-label-sm text-tertiary">
            Nothing written yet. Files this employee creates land here.
          </p>
        ) : (
          <FileRows files={shown} />
        ))}

      {open && (
        <WorkspaceDialog
          profile={profile}
          displayName={displayName}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </section>
  )
}
