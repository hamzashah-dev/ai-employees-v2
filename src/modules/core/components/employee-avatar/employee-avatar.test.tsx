import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MASCOT_SHAPES } from '../../constants/identity'
import { AGENT_PROP } from '../../constants/avatar-props/assignments'
import { getIdentity } from '../../utils/identity'
import { AgentBlob } from '../agent-blob'
import { EmployeeAvatar } from '.'

/*
 * These two components draw the same employee on two different surfaces, and the regression
 * worth guarding is them disagreeing: an agent hired off the shelf used to lose its silhouette
 * on the way to the sidebar and turn into a generic dot.
 *
 * Everything is read off `data-part` rather than by walking the tree. The previous version of
 * this file reached for `firstElementChild.nextElementSibling` and a gradient stop, both of
 * which were incidental to a renderer that no longer exists — the assertions broke the moment
 * the body stopped carrying a gradient, having never really been about the gradient.
 */

const partOf = (container: HTMLElement, part: string) =>
  container.querySelector(`[data-part="${part}"]`)

/** Geometry only. Two mounts of the same avatar must agree on this. */
const silhouette = (container: HTMLElement): string | null =>
  partOf(container, 'body')?.innerHTML ?? null

const bodyHue = (container: HTMLElement): string | null =>
  partOf(container, 'body')?.getAttribute('fill') ?? null

describe('EmployeeAvatar', () => {
  it.each(['inbox-triage', 'on-call-buddy', 'shorts-maker', 'bug-hunter'])(
    'draws the same character as the marketplace card for %s',
    (profile) => {
      const avatar = render(<EmployeeAvatar profile={profile} />)
      const blob = render(<AgentBlob profile={profile} />)

      expect(silhouette(avatar.container)).not.toBeNull()
      expect(silhouette(avatar.container)).toBe(silhouette(blob.container))
      expect(bodyHue(avatar.container)).toBe(bodyHue(blob.container))
    },
  )

  it('carries the same job prop onto both surfaces', () => {
    // A catalogue agent's prop is the clearest thing about it. The shelf and the roster
    // resolving different ones would be the same class of bug as a different silhouette.
    const avatar = render(<EmployeeAvatar profile="bug-hunter" size={48} />)
    const blob = render(<AgentBlob profile="bug-hunter" />)

    const expected = AGENT_PROP['bug-hunter']
    expect(partOf(avatar.container, 'prop')).toHaveAttribute('data-prop', expected)
    expect(partOf(blob.container, 'prop')).toHaveAttribute('data-prop', expected)
  })

  it('wears no prop for a profile the catalogue has never heard of', () => {
    // Hermes will happily report a profile someone made by hand. Guessing a job for it would
    // be a claim we cannot support, so the honest answer is a bare mark.
    const { container } = render(<EmployeeAvatar profile="some-local-profile" size={48} />)
    expect(partOf(container, 'body')).toBeInTheDocument()
    expect(partOf(container, 'prop')).toBeNull()
  })

  it('is labelled for assistive technology', () => {
    render(<EmployeeAvatar profile="inbox-triage" />)
    expect(screen.getByRole('img', { name: 'inbox-triage avatar' })).toBeInTheDocument()
  })

  it('keeps a face that is visible against its own body', () => {
    // 20px grouped message, 24px thread header, 36px roster row — one component scaled by
    // CSS. At those sizes the only thing separating the eyes from the fill is colour, so the
    // regression this guards is the eyes being drawn in a tint of the body that vanishes on
    // some hues. jsdom has no geometry to measure; that they differ is the assertion that
    // matters and can be made.
    const { container } = render(<EmployeeAvatar profile="shorts-maker" />)

    expect(bodyHue(container)).toMatch(/^#[0-9a-f]{6}$/i)
    expect(partOf(container, 'eyes')?.getAttribute('fill')).not.toBe(bodyHue(container))
  })

  it('only ever draws a silhouette the current vocabulary contains', () => {
    const { container } = render(<EmployeeAvatar profile="shorts-maker" />)
    const { shape } = getIdentity('shorts-maker')

    expect(MASCOT_SHAPES).toContain(shape)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('switches to the working face while a turn is in flight', () => {
    const { container, rerender } = render(<EmployeeAvatar profile="inbox-triage" />)
    expect(partOf(container, 'eyes')).not.toHaveAttribute('data-face', 'working')

    rerender(<EmployeeAvatar profile="inbox-triage" busy />)
    expect(partOf(container, 'eyes')).toHaveAttribute('data-face', 'working')
  })
})
