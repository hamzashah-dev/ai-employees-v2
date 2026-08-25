import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AgentBlob } from '../agent-blob'
import { EmployeeAvatar } from '.'

const silhouette = (container: HTMLElement): string | null =>
  container.querySelector('path')?.getAttribute('d') ?? null

describe('EmployeeAvatar', () => {
  it.each(['inbox-triage', 'on-call-buddy', 'shorts-maker', 'bug-hunter'])(
    'draws the same character as the marketplace card for %s',
    (profile) => {
      // One shelf card and one roster row for the same employee. The regression this
      // catches is the avatar quietly falling back to a generic circle after a hire.
      const avatar = render(<EmployeeAvatar profile={profile} />)
      const blob = render(<AgentBlob profile={profile} />)

      expect(silhouette(avatar.container)).not.toBeNull()
      expect(silhouette(avatar.container)).toBe(silhouette(blob.container))
      expect(avatar.container.querySelector('path')?.getAttribute('fill')).toBe(
        blob.container.querySelector('path')?.getAttribute('fill'),
      )
    },
  )

  it('is labelled for assistive technology', () => {
    render(<EmployeeAvatar profile="inbox-triage" />)
    expect(screen.getByRole('img', { name: 'inbox-triage avatar' })).toBeInTheDocument()
  })

  it('keeps its eyes on the silhouette at every size it is used at', () => {
    // 20px grouped message, 24px thread header, 28px roster row, 40px dashboard card — one
    // component scaled by CSS, so the eyes must sit inside the path's own viewBox at every
    // one of them. jsdom implements no SVG geometry, so this is the bounds sanity check;
    // that the eyes land on each silhouette's *mass* was verified in a real engine with
    // `isPointInFill` around the full eye circumference (see the component's note).
    const { container } = render(<EmployeeAvatar profile="shorts-maker" />)
    const eyes = container.querySelectorAll('circle')

    expect(eyes).toHaveLength(2)
    eyes.forEach((eye) => {
      const cx = Number(eye.getAttribute('cx'))
      const cy = Number(eye.getAttribute('cy'))
      expect(cx).toBeGreaterThan(0)
      expect(cx).toBeLessThan(120)
      expect(cy).toBeGreaterThan(0)
      expect(cy).toBeLessThan(120)
    })
  })
})
