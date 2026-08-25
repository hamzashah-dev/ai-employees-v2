import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Providers } from '@/app/providers'
import { CATALOG } from './constants/catalog'
import { MarketplaceView } from '.'

/**
 * Mount smoke test.
 *
 * The comparators and the filter have their own unit tests; this covers what
 * those cannot — that the tree renders at all, that the three tabs and the two
 * dropdowns are wired to the same state as the count, and that a card's body
 * actually links at the detail route rather than merely looking clickable.
 */

function stubFetch() {
  return vi.fn(
    async () =>
      new Response(JSON.stringify({ profiles: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
  )
}

async function mount(): Promise<void> {
  vi.stubGlobal('fetch', stubFetch())
  await act(async () => {
    render(
      <Providers>
        <MemoryRouter>
          <MarketplaceView />
        </MemoryRouter>
      </Providers>,
    )
  })
}

const count = (n: number): string => `Agents ${n} of ${CATALOG.length}`

describe('MarketplaceView', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('renders the control row, the shelves and the whole-catalog count', async () => {
    await mount()

    expect(screen.getByRole('heading', { level: 1, name: 'Agent Marketplace' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Discover/, selected: true })).toBeVisible()
    expect(screen.getByRole('tab', { name: /Made by Imagine/ })).toBeVisible()
    expect(screen.getByRole('link', { name: /AI Market/ })).toHaveAttribute('href', '/ai-market')
    expect(screen.getByText(count(CATALOG.length))).toBeVisible()
    expect(screen.getByRole('heading', { level: 2, name: 'Personal' })).toBeVisible()
  })

  it('links a card body at the agent detail route, with Install as a separate control', async () => {
    await mount()

    const link = screen.getByRole('link', { name: 'Inbox Triage' })
    expect(link).toHaveAttribute('href', '/marketplace/inbox-triage')
    // A button inside an anchor is invalid HTML and eats the keyboard, so the
    // two have to be siblings.
    expect(within(link).queryByRole('button')).toBeNull()
    expect(screen.getByRole('button', { name: 'Install Inbox Triage' })).toBeInTheDocument()
  })

  it('narrows to one category from the dropdown, shows its blurb, and drops the shelf headers', async () => {
    await mount()

    await userEvent.click(screen.getByRole('button', { name: 'Category' }))
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Money' }))

    expect(screen.getByText('Watch what leaves the account')).toBeVisible()
    expect(screen.queryByRole('heading', { level: 2 })).toBeNull()

    const money = CATALOG.filter((agent) => agent.category === 'Money').length
    expect(screen.getByText(count(money))).toBeVisible()
    // A category the user asked for is not then withheld behind "Show more".
    expect(screen.queryByRole('button', { name: /Show more/ })).toBeNull()
  })

  it('splits the catalog across the maker tabs without losing or duplicating an agent', async () => {
    await mount()

    await userEvent.click(screen.getByRole('tab', { name: /Made by Imagine/ }))
    const first = screen.getAllByRole('article').length

    await userEvent.click(screen.getByRole('tab', { name: /Community/ }))
    const rest = screen.getAllByRole('article').length

    expect(first).toBeGreaterThan(0)
    expect(first + rest).toBe(CATALOG.length)
    expect(screen.getByText(count(rest))).toBeVisible()
  })

  it('reorders on sort, and keeps the empty state reachable with a category on', async () => {
    await mount()

    const firstBefore = screen.getAllByRole('heading', { level: 3 })[0]?.textContent
    await userEvent.click(screen.getByRole('button', { name: 'Sort agents' }))
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'A–Z' }))
    expect(screen.getAllByRole('heading', { level: 3 })[0]?.textContent).not.toBe(firstBefore)

    await userEvent.click(screen.getByRole('button', { name: 'Category' }))
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Money' }))
    await userEvent.type(screen.getByRole('textbox', { name: 'Search agents' }), 'zzzz')

    expect(screen.getByText('No agents in Money match “zzzz”.')).toBeVisible()
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText(count(CATALOG.length))).toBeVisible()
  })
})
