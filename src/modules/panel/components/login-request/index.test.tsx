import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginRequest } from '.'

const REQUEST = {
  requestId: 'req-1',
  question: 'I’m at the Okta login. What email should I sign in with?',
}

describe('LoginRequest', () => {
  it('answers with a choice', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    render(
      <LoginRequest
        request={{ ...REQUEST, choices: ['Use my work account', 'Skip this site'] }}
        onAnswer={onAnswer}
      />,
    )

    expect(screen.getByText(REQUEST.question)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Use my work account' }))
    expect(onAnswer).toHaveBeenCalledWith('Use my work account')
  })

  it('answers with free text, and refuses to send nothing', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    render(<LoginRequest request={REQUEST} onAnswer={onAnswer} />)

    // A question with no choices still has to be answerable.
    expect(screen.queryByRole('button', { name: 'Use my work account' })).not.toBeInTheDocument()

    const send = screen.getByRole('button', { name: 'Send' })
    expect(send).toBeDisabled()

    await user.type(screen.getByLabelText('Your answer'), '  ada@example.com  ')
    await user.click(send)

    expect(onAnswer).toHaveBeenCalledWith('ada@example.com')
  })
})
