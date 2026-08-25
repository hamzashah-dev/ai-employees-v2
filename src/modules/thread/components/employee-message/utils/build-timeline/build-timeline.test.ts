import { describe, expect, it } from 'vitest'
import type { ChatMessage, Segment, ThinkingBlock, ToolCall } from '@/modules/core/types/chat'
import { buildTimeline, buildTrailEntries, formatToolName } from '.'

const message = (parts: {
  segments: Segment[]
  thinkingBlocks?: ThinkingBlock[]
  toolCalls?: ToolCall[]
}): ChatMessage => ({
  id: 'm1',
  role: 'employee',
  text: '',
  createdAt: 0,
  thinkingBlocks: parts.thinkingBlocks ?? [],
  toolCalls: Object.fromEntries((parts.toolCalls ?? []).map((call) => [call.id, call])),
  segments: parts.segments,
})

const tool = (id: string, name: string, label?: string): ToolCall => ({
  id,
  name,
  label,
  status: 'done',
})

describe('buildTimeline', () => {
  it('folds contiguous reasoning and tool steps into one group', () => {
    const blocks = buildTimeline(
      message({
        thinkingBlocks: [{ id: 'b1', text: 'thinking' }],
        toolCalls: [tool('t1', 'skills_list'), tool('t2', 'todo')],
        segments: [
          { type: 'thinking', id: 's1', blockId: 'b1' },
          { type: 'tool_call', id: 's2', toolCallId: 't1' },
          { type: 'tool_call', id: 's3', toolCallId: 't2' },
        ],
      }),
    )

    expect(blocks).toHaveLength(1)
    expect(blocks[0]?.kind).toBe('group')
  })

  it('breaks the group on a text run, so prose renders where it happened', () => {
    const blocks = buildTimeline(
      message({
        toolCalls: [tool('t1', 'todo'), tool('t2', 'todo')],
        segments: [
          { type: 'tool_call', id: 's1', toolCallId: 't1' },
          { type: 'text', id: 's2', text: 'Here is what I found.' },
          { type: 'tool_call', id: 's3', toolCallId: 't2' },
        ],
      }),
    )

    expect(blocks.map((block) => block.kind)).toEqual(['group', 'text', 'group'])
  })

  it('does not let the whitespace between tool calls split a group', () => {
    const blocks = buildTimeline(
      message({
        toolCalls: [tool('t1', 'todo'), tool('t2', 'terminal')],
        segments: [
          { type: 'tool_call', id: 's1', toolCallId: 't1' },
          { type: 'text', id: 's2', text: '\n\n' },
          { type: 'tool_call', id: 's3', toolCallId: 't2' },
        ],
      }),
    )

    expect(blocks).toHaveLength(1)
    expect(blocks[0]).toMatchObject({ kind: 'group' })
  })

  it('drops a segment whose target is missing rather than rendering an empty row', () => {
    const blocks = buildTimeline(
      message({ segments: [{ type: 'tool_call', id: 's1', toolCallId: 'gone' }] }),
    )

    expect(blocks).toEqual([])
  })
})

describe('buildTrailEntries', () => {
  it('renders the label Hermes already sent, not the machine name', () => {
    const [entry] = buildTrailEntries([tool('t1', 'skills_list', 'Listing skills')])

    expect(entry?.title).toBe('Listing skills')
  })

  it('falls back to a title-cased name only when there is no label', () => {
    const [entry] = buildTrailEntries([tool('t1', 'terminal')])

    expect(entry?.title).toBe('Terminal')
    expect(formatToolName('web_extract')).toBe('Web Extract')
  })

  it('does not fold sibling skill tools into the skill_view count', () => {
    // Upstream matches any name containing "skill", which reports a `skills_list` call as
    // "Viewed 1 skill" — a different action, described wrongly.
    const entries = buildTrailEntries([
      tool('t1', 'skills_list', 'Listing skills'),
      tool('t2', 'skill_manage', 'Updating skill'),
    ])

    expect(entries.map((entry) => entry.title)).toEqual(['Listing skills', 'Updating skill'])
  })

  it('folds a repeated family into one counted row', () => {
    const entries = buildTrailEntries([
      tool('t1', 'skill_view', 'Reading skill a'),
      tool('t2', 'skill_view', 'Reading skill b'),
      tool('t3', 'skill_view', 'Reading skill c'),
      tool('t4', 'skill_view', 'Reading skill d'),
    ])

    // The reported screenshot: four identical `skill_view` lines become one.
    expect(entries).toHaveLength(1)
    expect(entries[0]?.title).toBe('Viewed 4 skills')
    expect(entries[0]?.members).toHaveLength(4)
  })

  it('keeps a grouped row where its first member ran', () => {
    const entries = buildTrailEntries([
      tool('t1', 'skill_view', 'Reading skill a'),
      tool('t2', 'terminal', 'Running build'),
      tool('t3', 'skill_view', 'Reading skill b'),
    ])

    expect(entries.map((entry) => entry.title)).toEqual(['Viewed 2 skills', 'Running build'])
  })

  it('carries running and failed up to the grouped row', () => {
    const entries = buildTrailEntries([
      { ...tool('t1', 'skill_view'), status: 'failed' },
      { ...tool('t2', 'skill_view'), status: 'running' },
    ])

    expect(entries[0]).toMatchObject({ failed: true, isRunning: true })
  })

  it('leaves unmatched tools alone, one row each', () => {
    const entries = buildTrailEntries([
      tool('t1', 'todo', 'Updating tasks'),
      tool('t2', 'todo', 'Updating tasks'),
    ])

    expect(entries).toHaveLength(2)
  })
})
