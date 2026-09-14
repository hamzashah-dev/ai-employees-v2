/**
 * What a reply containing a generated file must look like.
 *
 * The transform itself is unit-tested in `utils/remark-local-media`; these mount the whole
 * pipeline, because the half that only a render can prove is the other half: that
 * react-markdown parses a backticked path into the `inlineCode` node the plugin expects,
 * and that the path becomes an `/api/files/download` URL rather than reaching the DOM raw.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MarkdownBody } from './index'

const IMAGE =
  '/Users/vyro/cloud-computer-hermes/.computer/profiles/ad-creator/workspace/fal-ai-flux-2-klein-9b_20260901_110740_1aa0c9e1.png'
const IMAGE_NAME = 'fal-ai-flux-2-klein-9b_20260901_110740_1aa0c9e1.png'

describe('MarkdownBody', () => {
  it('renders a generated image from the reply that mentions it', () => {
    render(<MarkdownBody text={`Done! 🐱\n\nImage saved to: \`${IMAGE}\``} />)

    const image = screen.getByRole('img', { name: IMAGE_NAME })
    expect(image).toHaveAttribute(
      'src',
      `/api/files/download?path=${encodeURIComponent(IMAGE)}`,
    )
  })

  it('keeps the host path out of the text the user reads', () => {
    const { container } = render(<MarkdownBody text={`Image saved to: \`${IMAGE}\``} />)

    expect(container.textContent).not.toContain('/Users/vyro')
  })

  it('names the file instead of showing a broken image when it cannot be loaded', () => {
    render(<MarkdownBody text={`Image saved to: ${IMAGE}`} />)

    fireEvent.error(screen.getByRole('img', { name: IMAGE_NAME }))

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: IMAGE_NAME })).toHaveAttribute(
      'href',
      `/api/files/download?path=${encodeURIComponent(IMAGE)}`,
    )
  })

  it('offers a video deliverable as a named download', () => {
    const video = '/Users/vyro/workspace/fal_veo-3_20260901_110740_1aa0c9e1.mp4'
    render(<MarkdownBody text={`Video saved to: ${video}`} />)

    expect(screen.getByRole('link', { name: 'fal_veo-3_20260901_110740_1aa0c9e1.mp4' })).toHaveAttribute(
      'href',
      `/api/files/download?path=${encodeURIComponent(video)}`,
    )
  })

  it('leaves a remote image the model linked itself alone', () => {
    const remote = 'https://v3b.fal.media/files/b/0aa8955a.png'
    render(<MarkdownBody text={`![a cat](${remote})`} />)

    expect(screen.getByRole('img', { name: 'a cat' })).toHaveAttribute('src', remote)
  })

  it('still renders ordinary prose', () => {
    render(<MarkdownBody text="**Done** — nothing was generated." />)

    expect(screen.getByText('Done')).toBeInTheDocument()
  })
})
