import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import { Skeleton } from '@repo/ui/skeleton'
import { AppearanceTray } from '../appearance-tray'
import { FileRows } from '../file-rows'
import { GlanceTiles, type GlanceTile } from '../glance-tiles'
import { IdentityHeader } from '../identity-header'
import { SectionLabel } from '../section-label'
import { GLANCE_FILES } from '../../constants'
import type { EmployeeModalPage } from '../../types'
import type { EmployeeStateLine } from '../../utils/employee-state'
import type { WorkspaceFileRow } from '../../utils/workspace-files'
import type { UseIdentityEditorResult } from '../../hooks/use-identity-editor'

interface InfoPageProps {
  profile: string
  state: EmployeeStateLine
  detail: string
  model: string | null
  editor: UseIdentityEditorResult
  tiles: GlanceTile[]
  recent: WorkspaceFileRow[]
  totalFiles?: number
  filesLoading: boolean
  onSelect: (page: EmployeeModalPage) => void
}

/**
 * Info: who this employee is, and what the other three pages hold.
 *
 * The summary tiles and the workspace preview are the whole point of landing here — see
 * `GlanceTiles`. Appearance is behind the pencil rather than permanently on screen, so the
 * page opens on the employee rather than on a colour picker.
 */
export const InfoPage: FC<InfoPageProps> = ({
  profile,
  state,
  detail,
  model,
  editor,
  tiles,
  recent,
  totalFiles,
  filesLoading,
  onSelect,
}) => (
  <section aria-label="Identity" className="flex flex-col gap-4">
    <IdentityHeader
      profile={profile}
      state={state}
      detail={detail}
      model={model}
      editor={editor}
    />

    {editor.isEditing && <AppearanceTray editor={editor} />}

    <GlanceTiles tiles={tiles} onSelect={onSelect} />

    <div className="flex flex-col gap-0.5">
      <SectionLabel
        action={
          totalFiles !== undefined && totalFiles > recent.length ? (
            <Button
              type="button"
              variant="link-secondary"
              size="xs"
              onClick={() => onSelect('files')}
            >
              See all {totalFiles}
            </Button>
          ) : undefined
        }
      >
        Latest in workspace
      </SectionLabel>

      {filesLoading ? (
        <div className="flex flex-col gap-2 py-2">
          <Skeleton className="h-4 w-2/3 bg-fill-elevated" />
          <Skeleton className="h-4 w-1/2 bg-fill-elevated" />
        </div>
      ) : recent.length === 0 ? (
        <p className="py-2 text-label-md text-tertiary">
          Nothing in {editor.displayName}’s workspace yet.
        </p>
      ) : (
        <FileRows files={recent.slice(0, GLANCE_FILES)} />
      )}
    </div>

    {/*
      The one thing that is *not* editable, said out loud rather than hidden behind the
      pencil: renaming the profile would mean renaming its directory, which is the key of
      every session row, cron job and MCP server config — and Hermes exposes no rename at all.
    */}
    <p className="text-label-xs text-tertiary">
      Hermes’ own name for this employee is <code className="font-mono">{profile}</code>.
    </p>
  </section>
)
