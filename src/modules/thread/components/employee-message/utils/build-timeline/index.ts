import type { ChatMessage, ThinkingBlock, ToolCall } from '@/modules/core/types/chat'

export interface TimelineGroup {
  kind: 'group'
  id: string
  thinkingBlocks: ThinkingBlock[]
  toolCalls: ToolCall[]
}

export interface TimelineText {
  kind: 'text'
  id: string
  text: string
}

export type TimelineBlock = TimelineGroup | TimelineText

/**
 * Folds the message's segment spine into the blocks the thread renders.
 *
 * Contiguous reasoning and tool steps collapse into one `group`; a text run breaks the group
 * and renders in place. That grouping is the whole answer to "ten tool rows look terrible" —
 * the run ends up behind a single collapsed disclosure rather than as ten loose lines.
 *
 * Pure, and takes no streaming state, so a live turn and a replayed one produce the identical
 * block list from the identical segments.
 */
export const buildTimeline = (message: ChatMessage): TimelineBlock[] => {
  const blocksById = new Map(message.thinkingBlocks.map((block) => [block.id, block]))

  const blocks: TimelineBlock[] = []
  let group: TimelineGroup | null = null

  const flush = (): void => {
    if (group && (group.thinkingBlocks.length > 0 || group.toolCalls.length > 0)) {
      blocks.push(group)
    }
    group = null
  }

  const openGroup = (seedId: string): TimelineGroup => {
    group ??= { kind: 'group', id: `group-${seedId}`, thinkingBlocks: [], toolCalls: [] }
    return group
  }

  for (const segment of message.segments) {
    switch (segment.type) {
      case 'thinking': {
        const block = blocksById.get(segment.blockId)
        if (block) openGroup(segment.id).thinkingBlocks.push(block)
        break
      }

      case 'tool_call': {
        const toolCall = message.toolCalls[segment.toolCallId]
        if (toolCall) openGroup(segment.id).toolCalls.push(toolCall)
        break
      }

      case 'text': {
        // The model emits "\n\n" between tool calls. That renders nothing, so it must not
        // split the surrounding steps into two groups — skip it without flushing.
        if (segment.text.trim().length === 0) break
        flush()
        blocks.push({ kind: 'text', id: segment.id, text: segment.text })
        break
      }
    }
  }

  flush()

  return blocks
}

interface ToolGroupConfig {
  key: string
  match: (name: string) => boolean
  title: (count: number) => string
}

/**
 * Tool families that collapse into one counted row rather than repeating.
 *
 * Ported from upstream, and the reason a turn that reads four skills shows "Viewed 4 skills"
 * instead of four identical `skill_view` lines. This is the documented extension point — add
 * a matcher when a new family starts stuttering.
 */
const TOOL_GROUPS: ToolGroupConfig[] = [
  {
    key: 'publish',
    match: (name) => name.toLowerCase().startsWith('publish_'),
    title: (count) => `Published ${count} ${count === 1 ? 'artifact' : 'artifacts'}`,
  },
  {
    key: 'skill-view',
    // Narrower than upstream's `includes('skill')`, deliberately. That also catches
    // `skills_list` and `skill_manage` — different actions — and reports them as
    // "Viewed 1 skill", which is simply the wrong sentence. `skill_view` is the one that
    // actually repeats in a run, and the only one this title describes.
    match: (name) => name.toLowerCase() === 'skill_view',
    title: (count) => `Viewed ${count} ${count === 1 ? 'skill' : 'skills'}`,
  },
]

export interface TrailEntry {
  id: string
  /** What the row says. A counted title when grouped, else the backend's own label. */
  title: string
  /** Present only on a grouped row: what got folded into it. */
  members?: { id: string; title: string; failed: boolean }[]
  isRunning: boolean
  failed: boolean
  /** The machine name, for icon lookup. */
  name: string
}

/**
 * Turns a group's tool calls into rows, folding matching families together.
 *
 * A grouped row appears where its *first* member did, so the trail keeps chronological order
 * rather than reordering itself as later calls arrive.
 */
export const buildTrailEntries = (toolCalls: ToolCall[]): TrailEntry[] => {
  const entries: TrailEntry[] = []
  const grouped = new Map<string, TrailEntry>()

  for (const call of toolCalls) {
    // `label` is Hermes's own `tool.start.context` — "Listing skills", not `skills_list`.
    // Falling back to the raw name is the last resort, not the default.
    const title = call.label?.trim() || formatToolName(call.name)
    const failed = call.status === 'failed'
    const isRunning = call.status === 'running'

    const config = TOOL_GROUPS.find((candidate) => candidate.match(call.name))

    if (!config) {
      entries.push({ id: call.id, title, isRunning, failed, name: call.name })
      continue
    }

    const existing = grouped.get(config.key)

    if (existing) {
      existing.members?.push({ id: call.id, title, failed })
      existing.isRunning ||= isRunning
      existing.failed ||= failed
      existing.title = config.title(existing.members?.length ?? 0)
      continue
    }

    const entry: TrailEntry = {
      id: `group-${config.key}`,
      title: config.title(1),
      members: [{ id: call.id, title, failed }],
      isRunning,
      failed,
      name: call.name,
    }
    grouped.set(config.key, entry)
    entries.push(entry)
  }

  return entries
}

/** `publish_artifact` -> `Publish Artifact`. Only for tools the backend gave no label. */
export const formatToolName = (name: string): string =>
  name
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
