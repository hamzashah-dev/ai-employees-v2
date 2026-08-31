import type { FC } from 'react'
import { Button } from '@repo/ui/button'
import { ColorSwatches } from '../color-swatches'
import { ShapePicker } from '../shape-picker'
import type { UseIdentityEditorResult } from '../../hooks/use-identity-editor'

/** The tray's two group headings, at the same weight as every other section label. */
const GROUP_LABEL = 'text-label-xs text-tertiary uppercase'

/**
 * Colour and shape, behind the pencil.
 *
 * These used to sit permanently beside the name — an eight-dot grid floating over the
 * identity whether or not anyone was editing, which made the loudest thing on the page a
 * control almost nobody touches. Folding them into a tray puts the employee first and the
 * paint job second.
 *
 * Everything here is per-device. Hermes stores no avatar, colour or name and has nowhere to
 * put one (`stores/identity-store` has the receipts), which the tray says out loud rather
 * than letting the user assume a teammate will see the same face.
 */
export const AppearanceTray: FC<{ editor: UseIdentityEditorResult }> = ({ editor }) => (
  <div className="flex flex-col gap-3.5 rounded-2xl border border-primary bg-fill-elevated px-4 py-3.5">
    <div className="flex flex-col gap-2">
      <h4 className={GROUP_LABEL}>Colour</h4>
      <ColorSwatches activeIndex={editor.colorIndex} onSelect={editor.chooseColor} />
    </div>

    <div className="flex flex-col gap-2">
      <h4 className={GROUP_LABEL}>Shape</h4>
      <ShapePicker
        shape={editor.shape}
        color={editor.color}
        onSelect={editor.chooseShape}
      />
    </div>

    <div className="flex flex-wrap items-center justify-between gap-2">
      {/*
        The one thing that is *not* editable, said out loud. Renaming the profile itself
        would mean renaming its directory, which is the key of every session row, cron job
        and MCP server config — and Hermes exposes no rename endpoint at all.
      */}
      <p className="max-w-[380px] text-label-xs text-tertiary">
        Saved on this device only — Hermes has no field for an avatar, colour or name.
      </p>

      <div className="flex shrink-0 items-center gap-1">
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
  </div>
)
