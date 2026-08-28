import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserFrame } from '.'

/**
 * The states have opposite failure modes, and all of them are about honesty
 * rather than layout — which is why these assert on text, roles and the `src`,
 * and never on a class.
 */
describe('BrowserFrame', () => {
  it('says there is no live view rather than implying a browser is there', () => {
    render(<BrowserFrame liveUrl={null} agentBrowsing={false} onToggleExpand={vi.fn()} />)

    expect(screen.getByText('No live view')).toBeInTheDocument()
    expect(
      screen.getByText(/no address for this employee’s browser/),
    ).toBeInTheDocument()
    // Nothing to frame, nothing to enlarge, nowhere to open.
    expect(screen.queryByTitle('Live view of the browser')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Enlarge the live view' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('still says there is no live view while the agent is browsing', () => {
    render(<BrowserFrame liveUrl={null} agentBrowsing />)

    // The tool calls are real and worth reporting; a picture of them is not.
    expect(screen.getByText('Using a browser — no live view')).toBeInTheDocument()
    expect(screen.queryByTitle('Live view of the browser')).not.toBeInTheDocument()
  })

  it('frames a live URL, and always offers the way out of the frame', () => {
    render(<BrowserFrame liveUrl="http://127.0.0.1:6080/vnc.html" agentBrowsing />)

    expect(screen.getByTitle('Live view of the browser')).toHaveAttribute(
      'src',
      'http://127.0.0.1:6080/vnc.html',
    )
    // The URL as text and a real link, because a cross-origin frame that failed
    // to load looks exactly like one that worked.
    expect(screen.getByText('http://127.0.0.1:6080/vnc.html')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Open the live view in a new tab' }),
    ).toHaveAttribute('href', 'http://127.0.0.1:6080/vnc.html')
    // And no claim that any of it is working.
    expect(screen.getByText(/cannot tell whether the frame loaded/)).toBeInTheDocument()
  })

  it('hands the expand control to whoever owns the state, and hides it when nobody does', async () => {
    const user = userEvent.setup()
    const onToggleExpand = vi.fn()
    const { rerender } = render(
      <BrowserFrame
        liveUrl="http://127.0.0.1:6080/vnc.html"
        agentBrowsing
        onToggleExpand={onToggleExpand}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Enlarge the live view' }))
    expect(onToggleExpand).toHaveBeenCalledTimes(1)

    rerender(
      <BrowserFrame
        liveUrl="http://127.0.0.1:6080/vnc.html"
        agentBrowsing
        isExpanded
        onToggleExpand={onToggleExpand}
      />,
    )
    // The way back is a control of ours, outside the frame: noVNC keeps the
    // keystrokes, so Escape would never arrive.
    expect(
      screen.getByRole('button', { name: 'Exit the enlarged live view' }),
    ).toBeInTheDocument()
    // The link out survives both states — it is the only thing here that still
    // works when the frame does not.
    expect(
      screen.getByRole('link', { name: 'Open the live view in a new tab' }),
    ).toBeInTheDocument()

    // Below `laptop` there is nothing to expand into, so no control is offered —
    // and the copy must not promise the gesture either, or it reads as broken.
    rerender(<BrowserFrame liveUrl="http://127.0.0.1:6080/vnc.html" agentBrowsing />)
    expect(
      screen.queryByRole('button', { name: /live view$/ }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText(/Click the frame/)).not.toBeInTheDocument()
    // The honest half of that sentence stays.
    expect(screen.getByText(/cannot tell whether the frame loaded/)).toBeInTheDocument()
  })

  it('opens over the conversation on a click, and gets out of the way once open', async () => {
    const user = userEvent.setup()
    const onToggleExpand = vi.fn()
    const { rerender } = render(
      <BrowserFrame
        liveUrl="http://127.0.0.1:6080/vnc.html"
        agentBrowsing
        onToggleExpand={onToggleExpand}
      />,
    )

    /*
     * Collapsed, the frame sits behind a button of ours.
     *
     * This replaced a focus heuristic (blur this window, `activeElement` on the
     * iframe) that a live container disproved twice over: noVNC focuses its own
     * canvas on connect, so the view expanded itself on load untouched, and the
     * window being already blurred meant a real click fired nothing at all.
     */
    await user.click(
      screen.getByRole('button', { name: 'Open the live view over the conversation' }),
    )
    expect(onToggleExpand).toHaveBeenCalledTimes(1)

    // Expanded, nothing of ours covers the frame: every click and keystroke has
    // to reach noVNC, because that is where the signing-in happens.
    rerender(
      <BrowserFrame
        liveUrl="http://127.0.0.1:6080/vnc.html"
        agentBrowsing
        isExpanded
        onToggleExpand={onToggleExpand}
      />,
    )
    expect(
      screen.queryByRole('button', { name: 'Open the live view over the conversation' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Exit the enlarged live view' }),
    ).toBeInTheDocument()
  })
})
