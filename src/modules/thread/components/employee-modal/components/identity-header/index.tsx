import type { FC, KeyboardEvent } from 'react'
import { PencilIcon } from '@repo/icons/pencil'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import { BotAvatar } from '@/modules/core/components/bot-avatar'
import { ColorSwatches } from '../color-swatches'
import { ShapePicker } from '../shape-picker'
import type { EmployeeStateLine } from '../../utils/employee-state'
import type { UseIdentityEditorResult } from '../../hooks/use-identity-editor'

interface IdentityHeaderProps {
  profile: string
  state: EmployeeStateLine
  /** The right half of the state line: what it is doing, or what it runs on. */
  detail: string
  editor: UseIdentityEditorResult
}

const DOT_TONE: Record<EmployeeStateLine['tone'], string> = {
  success: 'bg-fill-success',
  warning: 'bg-fill-warning',
  critical: 'bg-fill-critical',
  neutral: 'bg-fill-tertiary',
}

/**
 * Who this is: the bot itself, its name, its state, and the controls that change the first two.
 *
 * This is the one place in the app that renders the employee in 3D. Everywhere else — roster
 * rows, the thread header, marketplace cards — draws the same shape and hue flat through
 * `EmployeeAvatar`, because those surfaces show many avatars at once and each 3D one is its
 * own WebGL context. The modal shows exactly one, and it is the surface where you are
 * looking *at* the employee rather than past them, so it is worth the context.
 *
 * The name is a *label over the profile slug*, not a rename. Hermes has no rename — the
 * slug is the directory name and the key of every session row, cron job and MCP config —
 * so the editor names the slug outright rather than letting a rename hide it.
 */
export const IdentityHeader: FC<IdentityHeaderProps> = ({
  profile,
  state,
  detail,
  editor,
}) => {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') editor.finishEditing()
    if (event.key === 'Escape') editor.cancelEditing()
  }

  return (
    <section aria-label="Identity" className="flex flex-col gap-4">
      {/* Wraps rather than crushes: below ~440px the swatch row drops to its own line
          instead of squeezing the name to a couple of characters. */}
      <div className="flex flex-wrap items-start gap-4">
        <div className="relative shrink-0">
          {/* Labelled by the slug, like every other avatar in the app, so a rename does not
              change what assistive tech calls the same employee in two places. */}
          <BotAvatar
            shape={editor.shape}
            color={editor.color}
            size={72}
            label={`${profile} avatar`}
          />
          <Button
            type="button"
            variant="icon-secondary"
            size="icon-xs"
            shape="pill"
            aria-label={editor.isEditing ? 'Done editing' : `Edit ${editor.displayName}`}
            aria-expanded={editor.isEditing}
            onClick={editor.isEditing ? editor.finishEditing : editor.startEditing}
            className="absolute -right-1 -bottom-1 border border-primary [&>svg]:size-3.5"
          >
            <PencilIcon />
          </Button>
        </div>

        <div className="flex min-w-40 flex-1 flex-col gap-1.5 pt-1">
          {editor.isEditing ? (
            <input
              autoFocus
              aria-label="Name"
              value={editor.draftName}
              placeholder={editor.placeholder}
              onChange={(event) => editor.setDraftName(event.target.value)}
              onKeyDown={onKeyDown}
              onBlur={editor.commitName}
              className="w-full rounded-xl border border-secondary bg-fill-elevated px-2.5 py-1 text-heading-sm text-primary outline-none placeholder:text-tertiary focus-visible:border-primary"
            />
          ) : (
            <h2 className="truncate text-heading-sm text-primary">{editor.displayName}</h2>
          )}

          <p className="flex min-w-0 items-center gap-1.5 text-label-sm text-secondary">
            <span
              aria-hidden
              className={cn('size-1.5 shrink-0 rounded-full', DOT_TONE[state.tone])}
            />
            <span className="shrink-0">{state.label}</span>
            {detail ? (
              <>
                <span aria-hidden className="shrink-0 text-tertiary">
                  ·
                </span>
                <span className="truncate text-tertiary">{detail}</span>
              </>
            ) : null}
          </p>
        </div>

        <div className="shrink-0 pt-1">
          <ColorSwatches activeIndex={editor.colorIndex} onSelect={editor.chooseColor} />
        </div>
      </div>

      {editor.isEditing && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-fill-elevated px-3 py-2.5">
          <ShapePicker shape={editor.shape} color={editor.color} onSelect={editor.chooseShape} />
          <div className="flex items-center gap-1">
            {editor.isCustomised && (
              <Button type="button" variant="ghost" size="xs" onClick={editor.reset}>
                Reset
              </Button>
            )}
            <Button type="button" variant="primary" size="xs" onClick={editor.finishEditing}>
              Done
            </Button>
          </div>
        </div>
      )}

      {/*
        The one thing that is *not* editable, said out loud. Renaming the profile itself
        would mean renaming its directory, which is the key of every session row, cron job
        and MCP server config — and Hermes exposes no rename endpoint at all.
      */}
      {editor.isEditing && (
        <p className="text-label-xs text-tertiary">
          Saved on this device only — Hermes has no field for an avatar, colour or name.
          Its own name for this employee stays <code>{profile}</code>.
        </p>
      )}
    </section>
  )
}
