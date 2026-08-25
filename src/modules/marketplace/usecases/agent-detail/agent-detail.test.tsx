import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AgentDetailView } from '.'

/**
 * A mount check, not a pixel check. The roster query is left to fail — with no
 * Hermes there is nothing installed, which is the pre-hire state D17 draws.
 */
const renderAt = (path: string) =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <TooltipProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/marketplace/:agentKey" element={<AgentDetailView />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  )

describe('AgentDetailView', () => {
  it('draws the four blocks and the hire footer', () => {
    renderAt('/marketplace/expense-manager')

    expect(screen.getByRole('heading', { name: 'Expense Manager' })).toBeInTheDocument()
    expect(screen.getByText('Money')).toBeInTheDocument()

    for (const block of ['What it does', 'Connects to', 'Needs from you', 'How it works']) {
      expect(screen.getByRole('heading', { name: block })).toBeInTheDocument()
    }

    expect(screen.getByRole('button', { name: 'Hire' })).toBeEnabled()
    expect(screen.getByText(/2,871 runs/)).toBeInTheDocument()
  })

  it('offers no live control for anything the backend cannot serve', () => {
    renderAt('/marketplace/expense-manager')

    expect(
      screen.getByRole('button', { name: /Preview a run — not available/ }),
    ).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /Connect Gmail account — not available/ }),
    ).toBeDisabled()
  })

  it('locks the key fields until there is an employee to store them on', () => {
    renderAt('/marketplace/expense-manager')

    expect(screen.getByLabelText(/SLACK_BOT_TOKEN — added after you hire/)).toBeDisabled()
  })

  it('says so rather than half-rendering an agent with no published detail', () => {
    renderAt('/marketplace/expense-clerk')

    expect(screen.getByText(/no published detail yet/)).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'What it does' })).not.toBeInTheDocument()
  })

  it('stays closeable on an agent key that is not in the catalogue', () => {
    renderAt('/marketplace/not-a-real-agent')

    expect(screen.getByRole('heading', { name: 'No such agent' })).toBeInTheDocument()
  })
})
