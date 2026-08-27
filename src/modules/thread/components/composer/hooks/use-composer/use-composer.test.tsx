import { describe, expect, it, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import type { ReactNode } from 'react'
import type { ConnectionState } from '@/modules/core/services/hermes/gateway'

/**
 * The composer's behaviour, which lives in `use-composer` rather than in the
 * JSX. Driven through the real component because that is the only way to
 * exercise the parts that matter: which keystroke sends, and what happens to a
 * half-written draft when you switch employee.
 */

const { send, stop } = vi.hoisted(() => ({ send: vi.fn(), stop: vi.fn() }))

vi.mock('@/modules/core/stores/chat-store', () => ({
  useChatStore: { getState: () => ({ send, stop }) },
}))
vi.mock('@/modules/core/hooks/use-hermes', () => ({
  getHermes: () => ({ sessions: {} }),
}))

const { Composer } = await import('../../index')

/**
 * The integrations dropdown queries `/api/mcp/servers` and wraps its trigger in
 * a tooltip, so the composer now needs both providers above it — Radix throws
 * outright without the tooltip one. The query is left to fail; nothing here
 * asserts on it.
 */
const wrap = (ui: ReactNode) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <TooltipProvider>{ui}</TooltipProvider>
    </QueryClientProvider>,
  )

function renderComposer(profile = 'inbox-manager', connection: ConnectionState = 'open') {
  return wrap(
    <Composer
      profile={profile}
      displayName="Inbox Manager"
      working={false}
      connection={connection}
      columnClassName="w-[768px]"
    />,
  )
}

describe('useComposer', () => {
  beforeEach(() => {
    send.mockClear()
    stop.mockClear()
  })

  it('sends on Enter and empties the draft', async () => {
    renderComposer()
    const box = screen.getByLabelText('Message Inbox Manager')

    await userEvent.type(box, 'Park legal in its own folder{Enter}')

    expect(send).toHaveBeenCalledWith('inbox-manager', 'Park legal in its own folder')
    expect(box).toHaveValue('')
  })

  it('treats Shift+Enter as a newline', async () => {
    renderComposer()
    const box = screen.getByLabelText('Message Inbox Manager')

    await userEvent.type(box, 'first{Shift>}{Enter}{/Shift}second')

    expect(send).not.toHaveBeenCalled()
    expect(box).toHaveValue('first\nsecond')
  })

  it('lets an IME commit a candidate with Enter without sending', async () => {
    renderComposer()
    const box = screen.getByLabelText('Message Inbox Manager')

    await userEvent.type(box, 'にほんご')
    fireEvent.keyDown(box, { key: 'Enter', isComposing: true })

    expect(send).not.toHaveBeenCalled()
  })

  it('drops the draft when the employee changes', async () => {
    const { rerender } = renderComposer()
    await userEvent.type(screen.getByLabelText('Message Inbox Manager'), 'half a thought')

    rerender(
      <QueryClientProvider
        client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
      >
        <TooltipProvider>
          <Composer
            profile="sales-outbound"
            displayName="Sales Outbound"
            working={false}
            connection="open"
            columnClassName="w-[768px]"
          />
        </TooltipProvider>
      </QueryClientProvider>,
    )

    expect(screen.getByLabelText('Message Sales Outbound')).toHaveValue('')
  })

  it('shuts the composer while the socket is down', () => {
    renderComposer('inbox-manager', 'closed')

    expect(screen.getByLabelText('Message Inbox Manager')).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(/disconnected from hermes/i)
  })
})
