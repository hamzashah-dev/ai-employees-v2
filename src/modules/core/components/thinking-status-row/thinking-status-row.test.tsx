import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { ThinkingStatusRow } from '.'

/**
 * The house rule is to assert on text and roles rather than classes, but this row *is*
 * its marker and its shimmer — there is nothing else to it. So the classes are the
 * behaviour here, and a re-skin of these three specifically should break this test.
 */
describe('ThinkingStatusRow', () => {
  it('shimmers the label and shows the gradient dot while active', () => {
    const { container, getByText } = render(
      <ThinkingStatusRow status="active" label="Thinking" />,
    )

    const label = getByText('Thinking')
    expect(label.className).toContain('animate-shimmer')
    expect(label.className).toContain('bg-clip-text')
    expect(label.className).toContain('text-transparent')

    // The dot is a pair of nested spans, not an icon.
    expect(container.querySelector('svg')).toBeNull()
    expect(container.querySelector('span[aria-hidden]')).not.toBeNull()
  })

  it('shows a check and a static secondary label when done', () => {
    const { container, getByText } = render(
      <ThinkingStatusRow status="done" label="Done" />,
    )

    const icon = container.querySelector('svg')
    // 24-unit box identifies CheckCircleIcon; CrossCircleIcon is 22.
    expect(icon?.getAttribute('viewBox')).toBe('0 0 24 24')
    expect(icon?.getAttribute('class')).toContain('text-secondary')

    expect(getByText('Done').className).toContain('text-secondary')
    expect(getByText('Done').className).not.toContain('animate-shimmer')
  })

  it('shows a critical cross and a critical label when failed', () => {
    const { container, getByText } = render(
      <ThinkingStatusRow status="failed" label="Failed" />,
    )

    const icon = container.querySelector('svg')
    expect(icon?.getAttribute('viewBox')).toBe('0 0 22 22')
    expect(icon?.getAttribute('class')).toContain('text-critical')

    expect(getByText('Failed').className).toContain('text-critical')
    expect(getByText('Failed').className).not.toContain('animate-shimmer')
  })

  it('only draws the upward connector when asked', () => {
    const plain = render(<ThinkingStatusRow status="done" label="Done" />)
    expect(plain.container.querySelectorAll('[aria-hidden]')).toHaveLength(0)

    const linked = render(
      <ThinkingStatusRow status="done" label="Done" connectTop />,
    )
    expect(linked.container.querySelectorAll('[aria-hidden]')).toHaveLength(1)
  })
})
