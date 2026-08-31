import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemberPicker } from '.'

const AVAILABLE = [
  { name: 'ada', title: 'Research' },
  { name: 'grace', title: 'Engineering' },
  { name: 'katherine' },
]

describe('MemberPicker', () => {
  it('toggles a member and counts the selection against the cap', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(
      <MemberPicker
        available={AVAILABLE}
        selected={['ada', 'grace']}
        onToggle={onToggle}
        min={2}
        max={6}
      />,
    )

    expect(screen.getByText('2 of 6')).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'ada' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'katherine' })).not.toBeChecked()
    // The optional title is surfaced where it exists, and its absence is not a blank line.
    expect(screen.getByText('Research')).toBeInTheDocument()

    await user.click(screen.getByRole('checkbox', { name: 'katherine' }))
    expect(onToggle).toHaveBeenCalledWith('katherine')
  })

  it('asks for more when the selection is under the floor', () => {
    render(
      <MemberPicker available={AVAILABLE} selected={['ada']} onToggle={vi.fn()} min={2} max={6} />,
    )

    expect(screen.getByText('Pick at least 2.')).toBeInTheDocument()
  })

  it('stops at the cap without stranding the user there', () => {
    render(
      <MemberPicker
        available={AVAILABLE}
        selected={['ada', 'grace']}
        onToggle={vi.fn()}
        min={2}
        max={2}
      />,
    )

    expect(
      screen.getByText('A room holds 2 members. Remove one to pick someone else.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'katherine' })).toBeDisabled()
    // A full room still has to be editable, or there is no way back under the cap.
    expect(screen.getByRole('checkbox', { name: 'ada' })).toBeEnabled()
  })
})
