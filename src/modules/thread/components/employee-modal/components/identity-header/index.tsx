import type { FC, KeyboardEvent } from 'react'
import { PencilIcon } from '@repo/icons/pencil'
import { cn } from '@repo/ui/cn'
import { BotMark } from '@/modules/core/components/bot-avatar'
import { ModelPicker } from '../model-picker'
import type { EmployeeStateLine } from '../../utils/employee-state'
import type { UseIdentityEditorResult } from '../../hooks/use-identity-editor'

interface IdentityHeaderProps {
  profile: string
  state: EmployeeStateLine
  /** The middle of the state line: what it is doing right now, or '' when idle. */
  detail: string
  /** What it runs on. `null` when Hermes has no model set for the profile. */
  model: string | null
  editor: UseIdentityEditorResult
}

const DOT_TONE: Record<EmployeeStateLine['tone'], string> = {
  success: 'bg-fill-success',
  warning: 'bg-fill-warning',
  critical: 'bg-fill-critical',
  neutral: 'bg-fill-variant-active',
}

/**
 * Who this is: the bot itself, its name, its state, and the pencil that opens the rest.
 *
 * This is the one place in the app that renders the employee in 3D. Everywhere else — roster
 * rows, the thread header, marketplace cards — draws the same shape and hue flat through
 * `EmployeeAvatar`, because those surfaces show many avatars at once and each 3D one is its
 * own WebGL context. The card shows exactly one, and it is the surface where you are looking
 * *at* the employee rather than past them, so it is worth the context.
 *
 * The pencil sits on the avatar rather than beside the name, because what it opens is the
 * *appearance* — the colour and shape of the thing it is pinned to. The name is edited in
 * place, where it is read.
 *
 * The name is a *label over the profile slug*, not a rename. Hermes has no rename — the slug
 * is the directory name and the key of every session row, cron job and MCP config — so the
 * card names the slug outright at the foot of the page rather than letting a rename hide it.
 */
export const IdentityHeader: FC<IdentityHeaderProps> = ({
  profile,
  state,
  detail,
  model,
  editor,
}) => {
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') editor.finishEditing()
    if (event.key === 'Escape') editor.cancelEditing()
  }

  return (
    /* Wraps rather than crushes: below ~440px the name column drops to its own line
       instead of squeezing to a couple of characters. */
    <div className="flex flex-wrap items-start gap-4">
      <div className="relative shrink-0">
        {/* Labelled by the slug, like every other avatar in the app, so a rename does not
            change what assistive tech calls the same employee in two places. */}
        <BotMark
          shape={editor.shape}
          color={editor.color}
          prop={editor.prop}
          size={72}
          label={`${profile} avatar`}
          className="drop-shadow-[0_9px_9px_rgba(0,0,0,0.6)]"
        />
        <button
          type="button"
          aria-label={editor.isEditing ? 'Done editing' : `Edit ${editor.displayName}`}
          aria-expanded={editor.isEditing}
          onClick={editor.isEditing ? editor.finishEditing : editor.startEditing}
          className={cn(
            'absolute -right-1 -bottom-1 flex size-7 cursor-pointer items-center justify-center',
            'rounded-full border border-primary outline-none',
            'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            {
              'bg-fill-inverse text-inverse': editor.isEditing,
              'bg-fill-variant-active text-primary hover:bg-fill-variant-hover':
                !editor.isEditing,
            },
          )}
        >
          <PencilIcon className="size-3.5" />
        </button>
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
          <h3 className="truncate text-heading-sm text-primary">{editor.displayName}</h3>
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
          <span aria-hidden className="shrink-0 text-tertiary">
            ·
          </span>
          <ModelPicker profile={profile} model={model} />
        </p>
      </div>
    </div>
  )
}
