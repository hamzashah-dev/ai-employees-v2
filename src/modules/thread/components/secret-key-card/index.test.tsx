import type { ComponentProps, FormEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { SecretKeyCard } from '.'

const LABEL = 'Fal AI · API key'

/** Deliberately not credential-shaped: nothing in this suite should read as a real key. */
const TYPED = 'placeholder-value-not-a-key'

/**
 * `TooltipProvider` is not optional — the header's help affordance is a Radix tooltip
 * trigger, and `Tooltip.Root` throws without a provider above it.
 *
 * `field` is a getter so the saved and expired cases can use this helper too: those two
 * states render no input at all, and an eager `getByLabelText` would throw before the test
 * body ran.
 */
const renderCard = (overrides: Partial<ComponentProps<typeof SecretKeyCard>> = {}) => {
  const onSubmit = vi.fn()
  const onSkip = vi.fn()

  render(
    <TooltipProvider>
      <SecretKeyCard
        label={LABEL}
        envVar="FAL_KEY"
        onSubmit={onSubmit}
        onSkip={onSkip}
        isSubmitting={false}
        {...overrides}
      />
    </TooltipProvider>,
  )

  return {
    onSubmit,
    onSkip,
    get field() {
      return screen.getByLabelText(LABEL)
    },
  }
}

/** Opens the (?) panel and hands back the dialog. */
const openHelp = (): HTMLElement => {
  fireEvent.click(screen.getByRole('button', { name: 'About FAL_KEY' }))

  return screen.getByRole('dialog')
}

describe('SecretKeyCard', () => {
  it('asks for the named key, masked, with both ways out', () => {
    const { field } = renderCard()

    expect(screen.getByRole('heading', { name: 'Add secret key' })).toBeInTheDocument()
    expect(field).toHaveAttribute('type', 'password')
    expect(screen.getByText('Never printed in the transcript')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Not now' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit key' })).toBeInTheDocument()
  })

  it('names the variable on the help affordance', () => {
    renderCard({ help: 'Found under Keys in the Fal dashboard' })

    expect(screen.getByRole('button', { name: 'About FAL_KEY' })).toBeInTheDocument()
  })

  it('keeps submit out of reach until there is something to send', () => {
    const { field } = renderCard()
    const submit = screen.getByRole('button', { name: 'Submit key' })

    expect(submit).toBeDisabled()

    fireEvent.change(field, { target: { value: TYPED } })

    expect(submit).toBeEnabled()
  })

  it('hands over exactly what was typed, then keeps nothing', () => {
    const { field, onSubmit } = renderCard()

    fireEvent.change(field, { target: { value: TYPED } })
    fireEvent.click(screen.getByRole('button', { name: 'Submit key' }))

    expect(onSubmit).toHaveBeenCalledWith(TYPED)
    expect(field).toHaveValue('')
  })

  it('submits on Enter', () => {
    const { field, onSubmit } = renderCard()

    fireEvent.change(field, { target: { value: TYPED } })
    fireEvent.keyDown(field, { key: 'Enter' })

    expect(onSubmit).toHaveBeenCalledWith(TYPED)
  })

  it('ignores Enter on an empty field', () => {
    const { field, onSubmit } = renderCard()

    fireEvent.keyDown(field, { key: 'Enter' })

    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('reveals and re-masks the value', () => {
    const { field } = renderCard()

    fireEvent.click(screen.getByRole('button', { name: 'Show key' }))

    expect(field).toHaveAttribute('type', 'text')
    expect(screen.queryByRole('button', { name: 'Show key' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Hide key' }))

    expect(field).toHaveAttribute('type', 'password')
    expect(screen.getByRole('button', { name: 'Show key' })).toBeInTheDocument()
  })

  /**
   * The one class assertion in this file, and it is deliberate. The design's annotation is
   * "Revealed — mono, so l and 1 are tellable apart": the monospace face is the *reason* the
   * reveal exists, not a skin choice, so a suite that skipped it would not be testing the
   * feature. Nothing else here looks at classes.
   */
  it('renders the revealed value in mono, and only then', () => {
    const { field } = renderCard()

    expect(field).not.toHaveClass('font-mono')

    fireEvent.click(screen.getByRole('button', { name: 'Show key' }))

    expect(field).toHaveClass('font-mono')

    fireEvent.click(screen.getByRole('button', { name: 'Hide key' }))

    expect(field).not.toHaveClass('font-mono')
  })

  it('says who can see a revealed value, in place of the transcript promise', () => {
    renderCard()

    fireEvent.click(screen.getByRole('button', { name: 'Show key' }))

    expect(screen.getByText('Visible only to you, on this screen')).toBeInTheDocument()
    expect(screen.queryByText('Never printed in the transcript')).not.toBeInTheDocument()
  })

  it('re-masks before the value leaves the card', () => {
    const { field, onSubmit } = renderCard()

    fireEvent.change(field, { target: { value: TYPED } })
    fireEvent.click(screen.getByRole('button', { name: 'Show key' }))

    expect(field).toHaveAttribute('type', 'text')

    fireEvent.click(screen.getByRole('button', { name: 'Submit key' }))

    expect(onSubmit).toHaveBeenCalledWith(TYPED)
    expect(field).toHaveAttribute('type', 'password')
    expect(field).not.toHaveClass('font-mono')
    expect(screen.getByRole('button', { name: 'Show key' })).toBeInTheDocument()
    expect(screen.queryByText('Visible only to you, on this screen')).not.toBeInTheDocument()
  })

  it('skips from the button and from Escape', () => {
    const { field, onSkip } = renderCard()

    fireEvent.click(screen.getByRole('button', { name: 'Not now' }))

    expect(onSkip).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(field, { key: 'Escape' })

    expect(onSkip).toHaveBeenCalledTimes(2)
  })

  it('holds submit while a value is in flight', () => {
    const { field } = renderCard({ isSubmitting: true })

    fireEvent.change(field, { target: { value: TYPED } })

    expect(screen.getByRole('button', { name: 'Submit key' })).toBeDisabled()
  })

  it('locks every control while a value is in flight', () => {
    const { field } = renderCard({ isSubmitting: true })
    const submit = screen.getByRole('button', { name: 'Submit key' })

    expect(field).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Show key' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Not now' })).toBeDisabled()
    expect(submit).toBeDisabled()
    expect(screen.getByRole('region', { name: 'Add secret key' })).toHaveAttribute(
      'aria-busy',
      'true',
    )
    /* The Spinner rides on the submit button; it has no role of its own to query. */
    expect(submit.querySelector('svg')).not.toBeNull()
  })

  it('never claims to be checking the key, because nothing checks it', () => {
    renderCard({ isSubmitting: true })

    expect(screen.queryByText(/Checking the key/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/verif/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/valid/i)).not.toBeInTheDocument()
  })

  describe('saved', () => {
    const saved = { envVar: 'FAL_KEY', last4: '4d2f' }

    it('collapses to a confirmation naming the variable and the last four', () => {
      renderCard({ saved })

      expect(screen.getByRole('status')).toHaveTextContent(
        'Fal AI · API key saved — ends 4d2f. FAL_KEY is set on this employee now, so it can use the key. You can remove it any time from Settings › Vault.',
      )
    })

    it('leaves nothing to submit and no value on screen', () => {
      renderCard({ saved })

      expect(screen.queryByLabelText(LABEL)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Submit key' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Show key' })).not.toBeInTheDocument()
      expect(screen.queryByText(TYPED)).not.toBeInTheDocument()
    })

    it('does not claim the key was validated', () => {
      renderCard({ saved })

      const status = screen.getByRole('status')

      expect(status).not.toHaveTextContent(/valid/i)
      expect(status).not.toHaveTextContent(/verif/i)
      expect(status).not.toHaveTextContent(/works/i)
    })

    it('outranks an expiry, because the write landed', () => {
      renderCard({ saved, expired: true })

      expect(screen.getByRole('status')).toHaveTextContent('saved — ends 4d2f')
      expect(screen.queryByText(/timed out/i)).not.toBeInTheDocument()
    })
  })

  describe('expired', () => {
    it('says the ask lapsed and that nothing was saved', () => {
      renderCard({ expired: true })

      expect(screen.getByRole('status')).toHaveTextContent(
        'This ask timed out and nothing was saved. Ask again when you have the key to hand.',
      )
      expect(screen.queryByLabelText(LABEL)).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Submit key' })).not.toBeInTheDocument()
    })

    it('dismisses through the skip callback', () => {
      const { onSkip } = renderCard({ expired: true })

      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }))

      expect(onSkip).toHaveBeenCalledTimes(1)
    })

    it('shows no countdown', () => {
      renderCard({ expired: true })

      expect(screen.queryByText(/\d+:\d\d/)).not.toBeInTheDocument()
      expect(screen.queryByText(/remaining|left/i)).not.toBeInTheDocument()
    })
  })

  describe('the (?) panel', () => {
    it('answers the three questions the design names', () => {
      renderCard()
      const help = openHelp()

      expect(
        screen.getByRole('heading', { name: 'What happens to a key you paste here' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: 'Where to get a Fal AI key' })).toBeInTheDocument()
      expect(screen.getByText('Rules this card follows')).toBeInTheDocument()
      expect(help).toHaveTextContent('stored with that employee’s profile')
      expect(help).toHaveTextContent('never written into the transcript')
      expect(help).toHaveTextContent('FAL_KEY')
    })

    it('lists the four rules', () => {
      renderCard()
      openHelp()

      expect(screen.getByText('Masked by default.')).toBeInTheDocument()
      expect(
        screen.getByText('Reveal is a deliberate press, and it never survives submit.'),
      ).toBeInTheDocument()
      expect(screen.getByText('Never a chat message.')).toBeInTheDocument()
      expect(screen.getByText('No countdown.')).toBeInTheDocument()
    })

    it('quotes the request’s own guidance when there is some', () => {
      renderCard({ help: 'Found under Keys in the Fal dashboard' })
      openHelp()

      expect(screen.getByText('Found under Keys in the Fal dashboard')).toBeInTheDocument()
    })

    it('points at the provider’s own docs rather than inventing a link', () => {
      renderCard()
      openHelp()

      expect(
        screen.getByText(/own documentation is where this key comes from/),
      ).toBeInTheDocument()
      expect(screen.queryByRole('link')).not.toBeInTheDocument()
    })

    it('does not name a provider the label does not name', () => {
      renderCard({ label: 'ACME_WIDGET_TOKEN', envVar: 'ACME_WIDGET_TOKEN' })
      fireEvent.click(screen.getByRole('button', { name: 'About ACME_WIDGET_TOKEN' }))

      expect(screen.getByRole('heading', { name: 'Where to get this key' })).toBeInTheDocument()
      expect(screen.getByText(/The provider’s own documentation/)).toBeInTheDocument()
    })
  })
})

describe('docked inside the composer form', () => {
  /**
   * The panel renders inside the composer's `<form>` (Composer's `above` slot).
   * It must never own a form of its own — nested forms are invalid HTML, the
   * parser drops the inner one, and any `type="submit"` inside it is silently
   * reassigned to the OUTER form. The visible symptom is the page reloading the
   * moment a key is submitted, losing the whole thread.
   *
   * The plain `renderCard` harness cannot catch this: with no enclosing form
   * there is nothing to submit. So these mount the card the way the app does.
   */
  const renderDocked = () => {
    const onSubmit = vi.fn()
    const onSkip = vi.fn()
    const outerSubmit = vi.fn((event: FormEvent) => event.preventDefault())

    render(
      <TooltipProvider>
        <form onSubmit={outerSubmit}>
          <SecretKeyCard
            label={LABEL}
            envVar="FAL_KEY"
            onSubmit={onSubmit}
            onSkip={onSkip}
            isSubmitting={false}
          />
        </form>
      </TooltipProvider>,
    )

    return { onSubmit, onSkip, outerSubmit }
  }

  it('renders no form of its own', () => {
    const { container } = render(
      <TooltipProvider>
        <SecretKeyCard
          label={LABEL}
          envVar="FAL_KEY"
          onSubmit={vi.fn()}
          onSkip={vi.fn()}
          isSubmitting={false}
        />
      </TooltipProvider>,
    )

    expect(container.querySelector('form')).toBeNull()
  })

  it('submits by button without submitting the composer form', () => {
    const { onSubmit, outerSubmit } = renderDocked()

    fireEvent.change(screen.getByLabelText(LABEL), {
      target: { value: 'placeholder-value' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Submit key' }))

    expect(onSubmit).toHaveBeenCalledWith('placeholder-value')
    expect(outerSubmit).not.toHaveBeenCalled()
  })

  it('submits on Enter without submitting the composer form', () => {
    const { onSubmit, outerSubmit } = renderDocked()

    const field = screen.getByLabelText(LABEL)
    fireEvent.change(field, { target: { value: 'placeholder-value' } })
    fireEvent.keyDown(field, { key: 'Enter' })

    expect(onSubmit).toHaveBeenCalledWith('placeholder-value')
    expect(outerSubmit).not.toHaveBeenCalled()
  })

  it('declines without submitting the composer form', () => {
    const { onSkip, outerSubmit } = renderDocked()

    fireEvent.click(screen.getByRole('button', { name: 'Not now' }))

    expect(onSkip).toHaveBeenCalledTimes(1)
    expect(outerSubmit).not.toHaveBeenCalled()
  })
})

