import { afterEach, describe, expect, it, vi } from 'vitest'
import type { FC } from 'react'
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { useChatStore } from '@/modules/core/stores/chat-store'
import type { ChatMessage, SecretRequest } from '@/modules/core/types/chat'
import { SecretKeyCard } from '../../components/secret-key-card'
import { useSecretRequest } from '.'

/**
 * Two things are under test: the derivation (a request becomes a labelled card's
 * worth of props) and the wiring (the card the transcript draws actually reaches
 * the store action that answers `secret.respond`). The second is what a
 * typecheck cannot catch and what "the agent hangs" would look like.
 *
 * The store's own actions are replaced with spies rather than driven through a
 * SessionManager: what matters here is that the value the human typed arrives at
 * `submitSecret` unaltered, not what the socket does with it afterwards.
 */

const PROFILE = 'alex'

/** Deliberately not credential-shaped: nothing in this suite should read as a real key. */
const TYPED = 'placeholder-value-not-a-key'

const REQUEST: SecretRequest = {
  requestId: 'sec-1',
  envVar: 'FAL_KEY',
  prompt: 'Paste the key from your Fal dashboard.',
}

const REAL = useChatStore.getState()

const MESSAGE: ChatMessage = {
  id: 'm1',
  role: 'employee',
  text: 'I need a key for that.',
  createdAt: 0,
  thinkingBlocks: [],
  toolCalls: {},
  segments: [{ type: 'text', id: 's1', text: 'I need a key for that.' }],
}

interface Answered {
  submitSecret: ReturnType<typeof vi.fn>
  skipSecret: ReturnType<typeof vi.fn>
}

function seed(secret?: SecretRequest): Answered {
  const submitSecret = vi.fn(async () => {})
  const skipSecret = vi.fn(async () => {})
  useChatStore.setState({
    submitSecret,
    skipSecret,
    threads: {
      [PROFILE]: {
        profile: PROFILE,
        messages: [MESSAGE],
        status: secret ? 'needs-you' : 'ready',
        hydrated: true,
        ...(secret ? { secret } : {}),
      },
    },
  })
  return { submitSecret, skipSecret }
}

/**
 * The card is docked to the prompt box, not rendered in the transcript, so this
 * mirrors `ThreadView`'s wiring rather than mounting `MessageList`: the seam
 * under test is hook → card → store, and pulling the whole `Composer` in would
 * drag its connector queries and file-picker along with it for no extra proof.
 */
const Docked: FC = () => {
  const secret = useSecretRequest(PROFILE)
  if (!secret.request) return null

  return (
    <SecretKeyCard
      label={secret.label}
      envVar={secret.request.envVar}
      {...(secret.request.prompt ? { help: secret.request.prompt } : {})}
      onSubmit={(value) => void secret.submit(value)}
      onSkip={() => void secret.skip()}
      isSubmitting={secret.isSubmitting}
    />
  )
}

function mountTranscript(): void {
  render(
    <TooltipProvider>
      <Docked />
    </TooltipProvider>,
  )
}

/*
 * Inside `act` because Vitest runs this before Testing Library's own cleanup:
 * the components mounted above are still subscribed when the threads are
 * dropped, and an unwrapped store write makes every case log an act warning it
 * did nothing to cause.
 */
afterEach(() => {
  act(() => {
    useChatStore.setState({
      threads: {},
      submitSecret: REAL.submitSecret,
      skipSecret: REAL.skipSecret,
    })
  })
})

describe('useSecretRequest', () => {
  it('has nothing to show while the agent is not asking', () => {
    seed()

    const { result } = renderHook(() => useSecretRequest(PROFILE))

    expect(result.current.request).toBeUndefined()
    expect(result.current.label).toBe('')
    expect(result.current.isSubmitting).toBe(false)
  })

  it('labels the standing request from its variable', () => {
    seed(REQUEST)

    const { result } = renderHook(() => useSecretRequest(PROFILE))

    expect(result.current.request).toEqual(REQUEST)
    expect(result.current.label).toBe('Fal AI · API key')
  })

  it('hands the typed value to the store action untouched', async () => {
    const { submitSecret } = seed(REQUEST)

    const { result } = renderHook(() => useSecretRequest(PROFILE))
    await act(async () => {
      await result.current.submit(TYPED)
    })

    expect(submitSecret).toHaveBeenCalledWith(PROFILE, TYPED)
  })

  it('routes "Not now" to the skip action, which is a real answer', async () => {
    const { skipSecret } = seed(REQUEST)

    const { result } = renderHook(() => useSecretRequest(PROFILE))
    await act(async () => {
      await result.current.skip()
    })

    expect(skipSecret).toHaveBeenCalledWith(PROFILE)
  })

  it('reports in flight until the answer lands, so the card can hold its buttons', async () => {
    let release: (() => void) | undefined
    useChatStore.setState({
      submitSecret: vi.fn(
        () =>
          new Promise<void>((resolve) => {
            release = resolve
          }),
      ),
      threads: {
        [PROFILE]: {
          profile: PROFILE,
          messages: [],
          status: 'needs-you',
          hydrated: true,
          secret: REQUEST,
        },
      },
    })

    const { result } = renderHook(() => useSecretRequest(PROFILE))
    act(() => {
      void result.current.submit(TYPED)
    })

    expect(result.current.isSubmitting).toBe(true)

    await act(async () => {
      release?.()
    })

    expect(result.current.isSubmitting).toBe(false)
  })

  it('never parks the value anywhere in the store', async () => {
    seed(REQUEST)

    const { result } = renderHook(() => useSecretRequest(PROFILE))
    await act(async () => {
      await result.current.submit(TYPED)
    })

    expect(JSON.stringify(useChatStore.getState().threads)).not.toContain(TYPED)
  })
})

describe('the docked secret card', () => {
  it('is asked in the thread, and answering it reaches the store', async () => {
    const { submitSecret } = seed(REQUEST)
    mountTranscript()

    expect(screen.getByRole('heading', { name: 'Add secret key' })).toBeInTheDocument()

    const field = screen.getByLabelText('Fal AI · API key')
    expect(field).toHaveAttribute('type', 'password')

    fireEvent.change(field, { target: { value: TYPED } })
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Submit key' }))
    })

    expect(submitSecret).toHaveBeenCalledWith(PROFILE, TYPED)
  })

  it('sends the skip through as well', async () => {
    const { skipSecret } = seed(REQUEST)
    mountTranscript()

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Not now' }))
    })

    expect(skipSecret).toHaveBeenCalledWith(PROFILE)
  })

  it('draws no card at all when nothing is being asked', () => {
    seed()
    const { container } = render(
      <TooltipProvider>
        <Docked />
      </TooltipProvider>,
    )

    expect(screen.queryByRole('heading', { name: 'Add secret key' })).not.toBeInTheDocument()
    // Nothing rendered, not an empty shell: the dock must add no height to the
    // prompt box when there is no ask, or every thread gains a blank strip.
    expect(container).toBeEmptyDOMElement()
  })
})
