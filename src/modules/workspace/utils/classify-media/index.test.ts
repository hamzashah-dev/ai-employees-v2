import { describe, expect, it } from 'vitest'
import type { WorkspaceFileRow } from '@/modules/core/components/workspace/utils/workspace-files'
import { classifyWorkspaceFiles } from './index'

function file(overrides: Partial<WorkspaceFileRow>): WorkspaceFileRow {
  return { path: '/x', name: 'file', isDirectory: false, size: 10, timeLabel: '', ...overrides }
}

describe('classifyWorkspaceFiles', () => {
  it('puts a directory in Folders regardless of its name', () => {
    const [item] = classifyWorkspaceFiles([file({ name: 'assets.png', isDirectory: true })])
    expect(item?.tab).toBe('folders')
  })

  it('puts an image, a video and an audio file in Media', () => {
    const items = classifyWorkspaceFiles([
      file({ name: 'hero.png' }),
      file({ name: 'cutdown.mp4' }),
      file({ name: 'vo.mp3' }),
    ])
    expect(items.map((i) => i.tab)).toEqual(['media', 'media', 'media'])
  })

  it('puts everything else in Docs', () => {
    const items = classifyWorkspaceFiles([
      file({ name: 'brief.md' }),
      file({ name: 'notes.txt' }),
      file({ name: 'plan.pdf' }),
    ])
    expect(items.map((i) => i.tab)).toEqual(['docs', 'docs', 'docs'])
  })
})
