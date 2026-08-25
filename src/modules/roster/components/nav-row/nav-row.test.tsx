import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { MemoryRouter } from 'react-router-dom'
import { useChatStore } from '@/modules/core/stores/chat-store'
import { useSearchStore } from '@/modules/core/stores/search-store'
import type { EmployeeStatus, EmployeeThread } from '@/modules/core/types/chat'
import { EMPLOYEES_NAV_ITEMS } from '../../constants'
import { SidebarCollapsedProvider } from '../../contexts/sidebar-collapsed'
import { NavRow } from '.'

/**
 * The three things a typecheck cannot catch here: the live chip replacing the
 * Beta badge, `Search` being a button that opens the modal rather than a link,
 * and the collapsed rail's tooltip.
 */

const item = (label: string) => {
  const found = EMPLOYEES_NAV_ITEMS.find((candidate) => candidate.label === label)
  if (!found) throw new Error(`no nav item labelled ${label}`)
  return found
}

const thread = (profile: string, status: EmployeeStatus): EmployeeThread => ({
  profile,
  messages: [],
  hydrated: true,
  status,
})

const renderRow = (label: string, isCollapsed = false) =>
  render(
    <TooltipProvider delayDuration={0}>
      <MemoryRouter>
        <SidebarCollapsedProvider isCollapsed={isCollapsed}>
          <ul>
            <NavRow item={item(label)} />
          </ul>
        </SidebarCollapsedProvider>
      </MemoryRouter>
    </TooltipProvider>,
  )

describe('NavRow', () => {
  beforeEach(() => {
    useChatStore.setState({ threads: {} })
    useSearchStore.setState({ isOpen: false })
  })

  it('shows the Beta badge while nothing is live', () => {
    renderRow('Employees')

    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('replaces the badge with a count chip once employees are working', () => {
    useChatStore.setState({
      threads: { a: thread('a', 'working'), b: thread('b', 'working') },
    })
    renderRow('Employees')

    expect(screen.getByLabelText('2 employees working')).toHaveTextContent('2')
    expect(screen.queryByText('Beta')).not.toBeInTheDocument()
  })

  it('keeps counting everyone live when one of them needs a yes', () => {
    useChatStore.setState({
      threads: { a: thread('a', 'working'), b: thread('b', 'needs-you') },
    })
    renderRow('Employees')

    expect(screen.getByLabelText('2 employees active, 1 needs a yes')).toHaveTextContent(
      '2',
    )
  })

  it('renders Search as a button that opens the modal, not as a link', async () => {
    renderRow('Search')

    expect(screen.queryByRole('link', { name: 'Search' })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(useSearchStore.getState().isOpen).toBe(true)
  })

  it('names the row in a tooltip when the sidebar is a rail', async () => {
    renderRow('Marketplace', true)

    // The label itself is gone from the row — the rail is icons only.
    expect(screen.queryByText('Marketplace')).not.toBeInTheDocument()

    await userEvent.hover(screen.getByRole('link'))

    expect(await screen.findAllByText('Marketplace')).not.toHaveLength(0)
  })
})
