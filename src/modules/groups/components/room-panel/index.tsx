import type { FC } from 'react'
import { XIcon } from '@repo/icons/x'
import { describeFileKind, formatFileSize } from '@/modules/core/components/workspace/utils/file-kind'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { Spinner } from '@/modules/core/components/spinner'
import { useRoomDeliverables } from '../../hooks/use-room-deliverables'

interface RoomPanelProps {
  members: string[]
  /** `GroupRoom.createdAt` — files older than this predate the room. */
  createdAt: number
  onClose: () => void
}

/**
 * §1e's room-side panel.
 *
 * The canvas draws two sections here: "Deliverables" (files) and a live
 * "Browser" tool-activity card showing a member's in-progress steps. Only the
 * first is real. A room turn is driven by {@link runGroupTurn}
 * (`services/group-turns`), which polls `session.resume` for a finished
 * reply and never surfaces intermediate tool calls — there is no per-step
 * event to render, in a room or otherwise. Building the Browser card would
 * mean inventing tool-call data Hermes never sends for a room turn, which is
 * exactly what this repo's honesty rule forbids. So this panel ships the
 * half that is real and says nothing about the half that would be fiction.
 */
export const RoomPanel: FC<RoomPanelProps> = ({ members, createdAt, onClose }) => {
  const { files, isLoading, error } = useRoomDeliverables(members, createdAt)

  return (
    <aside className="flex h-full w-[320px] shrink-0 flex-col border-l border-primary tablet:w-[400px] desktop-sm:w-[481px]">
      <header className="flex h-12 shrink-0 items-center justify-between px-3">
        <p className="truncate pl-1 text-label-sm text-secondary">Deliverables</p>
        <button
          type="button"
          aria-label="Close room panel"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-full text-secondary hover:bg-fill-variant-hover"
        >
          <XIcon className="size-4" />
        </button>
      </header>

      <div className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <div className="flex items-center justify-between pb-1">
          <p className="text-label-md font-medium text-primary">Deliverables</p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 py-6 text-label-md text-tertiary">
            <Spinner />
            Reading each member&rsquo;s workspace…
          </div>
        )}

        {!isLoading && error && (
          <p className="py-6 text-label-md text-critical">
            Could not read the room&rsquo;s workspaces.
          </p>
        )}

        {!isLoading && !error && files.length === 0 && (
          <p className="py-6 text-label-md text-tertiary">
            Nobody in this room has written a file since it opened.
          </p>
        )}

        {!isLoading && !error && files.length > 0 && (
          <ul className="flex flex-col">
            {files.map((file) => {
              const { icon: KindIcon } = describeFileKind(file.name)
              const size = formatFileSize(file.size)

              return (
                <li key={`${file.member}::${file.path}`}>
                  <div className="flex items-center gap-3 py-2">
                    <KindIcon className="size-5 shrink-0 text-secondary" />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate text-label-md text-primary">{file.name}</p>
                      <span className="flex items-center gap-1.5 text-label-xs text-tertiary">
                        <EmployeeAvatar profile={file.member} size={20} />
                        {file.member}
                        {size && ` · ${size}`}
                      </span>
                    </div>
                    <time dateTime={file.timeIso} className="shrink-0 text-label-xs text-tertiary">
                      {file.timeLabel}
                    </time>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        <p className="pt-2 text-label-xs text-tertiary">
          Files each member has written since this room opened. Hermes stores nothing per room,
          so this reads each employee&rsquo;s own workspace and filters by time.
        </p>
      </div>
    </aside>
  )
}
