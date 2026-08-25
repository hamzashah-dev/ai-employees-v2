import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { HireStrip } from '.'

const renderWith = (state: unknown) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: '/employees/expense-manager', state }]}>
      <HireStrip />
    </MemoryRouter>,
  )

describe('HireStrip', () => {
  it('renders nothing on a thread the user simply navigated to', () => {
    const { container } = renderWith(undefined)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows the line it was handed, and dismisses', () => {
    renderWith({ hired: 'Expense Manager is on your team. Runs nightly.' })

    expect(screen.getByRole('status')).toHaveTextContent('Runs nightly.')

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('ignores state that is not a sentence', () => {
    const { container } = renderWith({ hired: '   ' })

    expect(container).toBeEmptyDOMElement()
  })
})
