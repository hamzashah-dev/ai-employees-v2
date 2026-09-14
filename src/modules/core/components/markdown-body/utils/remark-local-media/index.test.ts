import { describe, expect, it } from 'vitest'
import type { Code, InlineCode, PhrasingContent, Root, Text } from 'mdast'
import { remarkLocalMedia } from './index'

/**
 * The cases that matter are the ones a real reply contains. Hermes now saves every
 * generated file into the agent's working directory and the model reports the absolute
 * path — sometimes bare, sometimes in backticks, sometimes several in one paragraph.
 *
 * Trees are hand-built rather than parsed: this is the transform's unit test, and the
 * parse path is covered by the `MarkdownBody` render tests.
 */

const IMAGE = '/Users/vyro/cloud-computer-hermes/.computer/profiles/ad-creator/workspace/fal-ai-flux-2-klein-9b_20260901_110740_1aa0c9e1.png'

const text = (value: string): Text => ({ type: 'text', value })
const inlineCode = (value: string): InlineCode => ({ type: 'inlineCode', value })

function paragraph(...children: PhrasingContent[]): Root {
  return { type: 'root', children: [{ type: 'paragraph', children }] }
}

/** The transformed children of the first block. */
function transform(tree: Root): PhrasingContent[] {
  remarkLocalMedia()(tree)
  const block = tree.children[0]
  if (!block || !('children' in block)) throw new Error('block has no children')
  return block.children as PhrasingContent[]
}

describe('remarkLocalMedia', () => {
  it('replaces a bare absolute image path with an image node', () => {
    expect(transform(paragraph(text(IMAGE)))).toEqual([
      {
        type: 'image',
        url: IMAGE,
        alt: 'fal-ai-flux-2-klein-9b_20260901_110740_1aa0c9e1.png',
      },
    ])
  })

  it('keeps the prose on either side of the path', () => {
    const children = transform(paragraph(text(`Saved to ${IMAGE} — have a look`)))

    expect(children).toHaveLength(3)
    expect(children[0]).toEqual(text('Saved to '))
    expect(children[1]?.type).toBe('image')
    expect(children[2]).toEqual(text(' — have a look'))
  })

  it('replaces a path the model wrapped in backticks', () => {
    const children = transform(paragraph(inlineCode(IMAGE)))

    expect(children).toHaveLength(1)
    expect(children[0]).toMatchObject({ type: 'image', url: IMAGE })
  })

  it('leaves a fenced code block untouched', () => {
    const code: Code = { type: 'code', lang: 'bash', value: `open ${IMAGE}` }
    const tree: Root = { type: 'root', children: [code] }

    remarkLocalMedia()(tree)

    expect(tree.children).toEqual([code])
  })

  it('leaves an absolute path that is not deliverable media alone', () => {
    const prose = 'I edited /Users/vyro/cloud-computer-hermes/agent/output_dir.py just now'

    expect(transform(paragraph(text(prose)))).toEqual([text(prose)])
  })

  it('renders a video path as a link carrying only its filename', () => {
    const video = '/Users/vyro/workspace/fal_veo-3_20260901_110740_1aa0c9e1.mp4'
    const children = transform(paragraph(text(video)))

    expect(children).toEqual([
      {
        type: 'link',
        url: video,
        children: [text('fal_veo-3_20260901_110740_1aa0c9e1.mp4')],
      },
    ])
  })

  it('replaces every path in a paragraph', () => {
    const second = '/Users/vyro/workspace/second.webp'
    const children = transform(paragraph(text(`${IMAGE} and ${second}`)))

    expect(children.map((child) => child.type)).toEqual(['image', 'text', 'image'])
  })

  it('matches a home-relative path', () => {
    const children = transform(paragraph(text('~/workspace/cat.jpeg')))

    expect(children).toEqual([{ type: 'image', url: '~/workspace/cat.jpeg', alt: 'cat.jpeg' }])
  })

  it('ignores a remote url that ends in an image extension', () => {
    const prose = 'It came from https://v3b.fal.media/files/b/0aa8955a.png originally'

    expect(transform(paragraph(text(prose)))).toEqual([text(prose)])
  })

  it('leaves a path the model already wrote as markdown alone', () => {
    const image = paragraph({ type: 'image', url: IMAGE, alt: 'cat' })

    expect(transform(image)).toEqual([{ type: 'image', url: IMAGE, alt: 'cat' }])
  })

  it('walks nested blocks, not just top-level paragraphs', () => {
    const tree: Root = {
      type: 'root',
      children: [
        {
          type: 'list',
          children: [
            {
              type: 'listItem',
              children: [{ type: 'paragraph', children: [text(IMAGE)] }],
            },
          ],
        },
      ],
    }

    remarkLocalMedia()(tree)

    const list = tree.children[0]
    if (!list || list.type !== 'list') throw new Error('expected a list')
    const item = list.children[0]?.children[0]
    if (!item || item.type !== 'paragraph') throw new Error('expected a paragraph')
    expect(item.children[0]?.type).toBe('image')
  })
})
