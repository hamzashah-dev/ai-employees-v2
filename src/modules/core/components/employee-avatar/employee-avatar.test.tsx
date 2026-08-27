import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MASCOT_SHAPES } from '../../constants/identity'
import { getIdentity } from '../../utils/identity'
import { AgentBlob } from '../agent-blob'
import { EmployeeAvatar } from '.'

/*
 * jsdom has no WebGL, so both components fall back to `BotGlyph` here and these assertions
 * are about the flat stand-in. That is the right thing to test: the sprite is a photograph
 * of the shared stage and cannot disagree with itself, whereas the two components picking
 * *different shapes* is a real and previously-shipped bug.
 *
 * The body is the element after `<defs>` — a path for most shapes, a circle or a rect for
 * the ones that are exactly those. Compared as markup rather than by `d`, so the check does
 * not quietly stop testing anything the day a shape stops being a `<path>`.
 */
const silhouette = (container: HTMLElement): string | null => {
  const body = container.querySelector('svg')?.firstElementChild?.nextElementSibling
  if (!body) return null
  // `fill` carries a `useId`-unique gradient reference, which differs between two mounts of
  // the same avatar by design. The geometry is the part that must match.
  const withoutFill = body.cloneNode(true) as Element
  withoutFill.removeAttribute('fill')
  return withoutFill.outerHTML
}

/** The hue, read off the gradient's midpoint stop rather than a flat `fill`. */
const bodyHue = (container: HTMLElement): string | null =>
  container.querySelector('stop[offset="52%"]')?.getAttribute('stop-color') ?? null

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
      expect(bodyHue(avatar.container)).toBe(bodyHue(blob.container))
    },
  )

  it('is labelled for assistive technology', () => {
    render(<EmployeeAvatar profile="inbox-triage" />)
    expect(screen.getByRole('img', { name: 'inbox-triage avatar' })).toBeInTheDocument()
  })

  it('keeps a face that is visible against its own body', () => {
    // 20px grouped message, 24px thread header, 28px roster row, 40px dashboard card — one
    // component scaled by CSS. At those sizes the only thing separating the eyes from the
    // fill is colour, so the regression this guards is the eyes being drawn in a tint of
    // the body that vanishes on the pale hues. jsdom has no SVG geometry to measure, so
    // the assertion is the one that matters and can be made: they are not the same colour.
    const { container } = render(<EmployeeAvatar profile="shorts-maker" />)
    const eyes = container.querySelector('svg')?.lastElementChild

    expect(bodyHue(container)).toMatch(/^#[0-9a-f]{6}$/)
    expect(eyes?.getAttribute('stroke') ?? eyes?.getAttribute('fill')).not.toBe(
      bodyHue(container),
    )
  })

  it('draws the same bot the 3D hero draws', () => {
    // The hero in the employee modal is `BotAvatar` off the same identity. If the flat and
    // the 3D vocabularies ever diverge, an employee changes shape when you open its card.
    const { container } = render(<EmployeeAvatar profile="shorts-maker" />)
    const { shape } = getIdentity('shorts-maker')

    expect(MASCOT_SHAPES).toContain(shape)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })
})
