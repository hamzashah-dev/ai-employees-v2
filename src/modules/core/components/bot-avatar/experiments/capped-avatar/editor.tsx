import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FC,
  type PointerEvent,
} from 'react'
import { AVATAR_PROP_GLYPHS } from '@/modules/core/constants/avatar-props'
import { AGENT_PROP } from '@/modules/core/constants/avatar-props/assignments'
import { getIdentity } from '@/modules/core/utils/identity'
import { layoutBlob } from '../../utils/blob'
import { resolveBotPalette } from '../../utils/color'
import { BotMark } from '../../components/bot-mark'

/**
 * TEMPORARY — a drag-to-place editor for the cap and its glyph. Built to answer one question
 * fast: where do `CAP_REL` and `GLYPH_REL` (`capped-avatar/index.tsx`) actually belong,
 * without a hand-measure-edit-reload loop.
 *
 * The *_REL factors, not the on-screen boxes, are the state. A box is derived from them plus
 * the current avatar's head ellipse every render — `CappedAvatarExperiment`'s own forward
 * maths, run live. Dragging goes backwards: a pixel delta becomes a fraction of the head (for
 * the cap) or a fraction of the cap's own box (for the glyph), and that fraction is added to
 * the factor. Deriving the box from the factors, rather than the other way around, is what
 * lets switching the avatar re-place both boxes on the new head automatically — the factors
 * carry over unchanged, which is the actual question this tool exists to answer: does one set
 * of numbers sit right on more than one face.
 */

const AVATAR_SIZE = 360

interface CapRel {
  left: number
  right: number
  top: number
  bottom: number
}
interface GlyphRel {
  centerX: number
  centerY: number
  size: number
}

// Kept in step with the locked values in `capped-avatar/index.tsx` by hand — this is a
// temporary tool, so there's no shared import to enforce it, just this comment.
const INITIAL_CAP_REL: CapRel = { left: -1.097, right: 1.255, top: -1.471, bottom: -0.058 }
const INITIAL_GLYPH_REL: GlyphRel = { centerX: 0.487, centerY: 0.326, size: 0.2 }

const PROFILE_OPTIONS = Object.keys(AGENT_PROP).sort()

interface Box {
  left: number
  top: number
  width: number
  height: number
}

/** A box the pointer can drag by its body, or resize by its bottom-right handle. */
const DraggableBox: FC<{
  box: Box
  containerRef: React.RefObject<HTMLDivElement | null>
  onMove: (dxPct: number, dyPct: number) => void
  onResize: (dxPct: number, dyPct: number) => void
  outline: string
  children: React.ReactNode
}> = ({ box, containerRef, onMove, onResize, outline, children }) => {
  const dragRef = useRef<{ mode: 'move' | 'resize'; startX: number; startY: number } | null>(null)

  const onPointerMove = useCallback(
    (event: globalThis.PointerEvent) => {
      const drag = dragRef.current
      const rect = containerRef.current?.getBoundingClientRect()
      if (!drag || !rect) return
      const dxPct = ((event.clientX - drag.startX) / rect.width) * 100
      const dyPct = ((event.clientY - drag.startY) / rect.height) * 100
      dragRef.current = { ...drag, startX: event.clientX, startY: event.clientY }
      if (drag.mode === 'move') onMove(dxPct, dyPct)
      else onResize(dxPct, dyPct)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onMove, onResize],
  )

  const endDrag = useCallback(() => {
    dragRef.current = null
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
  }, [onPointerMove])

  const startDrag = (mode: 'move' | 'resize') => (event: PointerEvent) => {
    event.preventDefault()
    event.stopPropagation()
    dragRef.current = { mode, startX: event.clientX, startY: event.clientY }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
  }

  return (
    <div
      onPointerDown={startDrag('move')}
      className="absolute cursor-move"
      style={{
        left: `${box.left}%`,
        top: `${box.top}%`,
        width: `${box.width}%`,
        height: `${box.height}%`,
        outline: `2px dashed ${outline}`,
        outlineOffset: 2,
      }}
    >
      {children}
      <div
        onPointerDown={startDrag('resize')}
        className="absolute -right-1.5 -bottom-1.5 size-3 cursor-nwse-resize rounded-full border border-white"
        style={{ background: outline }}
      />
    </div>
  )
}

export const CapEditorPage: FC = () => {
  const [profile, setProfile] = useState('ops-reporter')
  const [capRel, setCapRel] = useState<CapRel>(INITIAL_CAP_REL)
  const [glyphRel, setGlyphRel] = useState<GlyphRel>(INITIAL_GLYPH_REL)
  const containerRef = useRef<HTMLDivElement>(null)

  const identity = useMemo(() => getIdentity(profile || 'employee'), [profile])
  const palette = resolveBotPalette(identity.color)
  const { head } = useMemo(() => layoutBlob(identity.seed, 'round'), [identity.seed])
  const Glyph = identity.prop ? AVATAR_PROP_GLYPHS[identity.prop] : undefined

  const capBox: Box = {
    left: head.cx + capRel.left * head.rx,
    top: head.cy + capRel.top * head.ry,
    width: (capRel.right - capRel.left) * head.rx,
    height: (capRel.bottom - capRel.top) * head.ry,
  }
  const glyphBox: Box = {
    width: capBox.width * glyphRel.size,
    height: capBox.width * glyphRel.size,
    left: capBox.left + capBox.width * glyphRel.centerX - (capBox.width * glyphRel.size) / 2,
    top: capBox.top + capBox.height * glyphRel.centerY - (capBox.width * glyphRel.size) / 2,
  }

  const onCapMove = (dxPct: number, dyPct: number) =>
    setCapRel((rel) => ({
      left: rel.left + dxPct / head.rx,
      right: rel.right + dxPct / head.rx,
      top: rel.top + dyPct / head.ry,
      bottom: rel.bottom + dyPct / head.ry,
    }))
  const onCapResize = (dxPct: number, dyPct: number) =>
    setCapRel((rel) => ({
      ...rel,
      right: Math.max(rel.left + 0.1, rel.right + dxPct / head.rx),
      bottom: Math.max(rel.top + 0.1, rel.bottom + dyPct / head.ry),
    }))
  const onGlyphMove = (dxPct: number, dyPct: number) =>
    setGlyphRel((rel) => ({
      ...rel,
      centerX: rel.centerX + dxPct / capBox.width,
      centerY: rel.centerY + dyPct / capBox.height,
    }))
  const onGlyphResize = (dxPct: number) =>
    setGlyphRel((rel) => ({ ...rel, size: Math.max(0.02, rel.size + dxPct / capBox.width) }))

  const onProfileChange = (event: ChangeEvent<HTMLSelectElement>) => setProfile(event.target.value)

  return (
    <div className="flex min-h-screen gap-10 bg-primary p-8">
      <div>
        <h1 className="mb-1 text-heading-sm text-primary">Cap placement editor</h1>
        <p className="mb-4 text-label-sm text-tertiary">
          Drag a box by its body to move it, or by its dot to resize it. The numbers on the
          right are relative to the head, so switching the avatar re-places both boxes on the
          new face — try a few to see if one setting generalises.
        </p>

        <label className="mb-6 flex max-w-[360px] flex-col gap-1">
          <span className="text-label-xs uppercase text-tertiary">Avatar</span>
          <select
            value={profile}
            onChange={onProfileChange}
            className="rounded-xl border border-secondary bg-fill-elevated px-2.5 py-1.5 text-label-md text-primary outline-none focus-visible:border-primary"
          >
            {PROFILE_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p} ({AGENT_PROP[p]})
              </option>
            ))}
          </select>
          <span className="text-label-xs text-tertiary">
            {identity.prop
              ? `prop "${identity.prop}", colour "${identity.color}"`
              : 'No job on file for this seed — drawing no icon, honestly'}
          </span>
        </label>

        <div
          ref={containerRef}
          className="relative shrink-0 select-none"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        >
          <BotMark
            shape="round"
            color={identity.color}
            seed={identity.seed}
            size={AVATAR_SIZE}
            label={null}
            className="absolute inset-0"
          />

          <DraggableBox
            box={capBox}
            containerRef={containerRef}
            onMove={onCapMove}
            onResize={onCapResize}
            outline="#fa4d56"
          >
            <img
              src="/avatars/cap-blank.png"
              alt=""
              className="pointer-events-none size-full"
              draggable={false}
            />
          </DraggableBox>

          <DraggableBox
            box={glyphBox}
            containerRef={containerRef}
            onMove={onGlyphMove}
            onResize={onGlyphResize}
            outline="#24a148"
          >
            {Glyph ? (
              <div className="pointer-events-none size-full" style={{ color: palette.eye }}>
                <Glyph className="size-full" />
              </div>
            ) : null}
          </DraggableBox>
        </div>
      </div>

      <div className="min-w-[360px]">
        <h2 className="mb-2 text-label-lg text-secondary">CAP_REL</h2>
        <pre className="mb-6 rounded-xl bg-fill-elevated p-4 text-label-sm text-primary">
          {`{
  left: ${round(capRel.left)},
  right: ${round(capRel.right)},
  top: ${round(capRel.top)},
  bottom: ${round(capRel.bottom)},
}`}
        </pre>

        <h2 className="mb-2 text-label-lg text-secondary">GLYPH_REL</h2>
        <pre className="rounded-xl bg-fill-elevated p-4 text-label-sm text-primary">
          {`{
  centerX: ${round(glyphRel.centerX)},
  centerY: ${round(glyphRel.centerY)},
  size: ${round(glyphRel.size)},
}`}
        </pre>

        <button
          type="button"
          className="mt-6 rounded-xl bg-fill-inverse px-4 py-2 text-label-md text-inverse"
          onClick={() => {
            setCapRel(INITIAL_CAP_REL)
            setGlyphRel(INITIAL_GLYPH_REL)
          }}
        >
          Reset to current values
        </button>
      </div>
    </div>
  )
}

const round = (n: number) => Math.round(n * 1000) / 1000
