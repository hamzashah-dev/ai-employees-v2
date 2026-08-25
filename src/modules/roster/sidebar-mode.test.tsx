import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { SidebarBody } from './components/sidebar-body'
import { useSyncSidebarEmployeesMode } from './hooks/use-sync-sidebar-employees-mode'
import { useSidebarEmployeesModeStore } from './stores/sidebar-employees-mode-store'

/**
 * The sidebar mode swap — the one branch in this module.
 *
 * Covers the two things that break silently: the early return picking the wrong
 * body, and the sticky allow-list letting a hop to /integrations reset the mode.
 */

const Harness = () => {
  useSyncSidebarEmployeesMode()
  return <SidebarBody />
}

/** The roster's own queries are irrelevant here; they stay pending. */
const renderAt = (path: string) =>
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter initialEntries={[path]}>
        <Harness />
      </MemoryRouter>
    </QueryClientProvider>,
  )

describe('sidebar mode', () => {
  beforeEach(() => {
    useSidebarEmployeesModeStore.setState({ isEmployeesMode: false })
  })

  it('shows the default nav off an Employees route', () => {
    renderAt('/history')

    expect(screen.getByText('Sites')).toBeInTheDocument()
    expect(screen.getByText('AI Tools')).toBeInTheDocument()
    expect(screen.getByText('Projects')).toBeInTheDocument()
    expect(screen.queryByText('Marketplace')).not.toBeInTheDocument()
  })

  it('replaces the whole body on an Employees route, on the very first render', () => {
    // No effect has run yet at this point — the pathname guard is what carries it.
    renderAt('/employees/inbox-manager')

    expect(screen.getByText('Marketplace')).toBeInTheDocument()
    expect(screen.getByText('Team')).toBeInTheDocument()
    expect(screen.queryByText('Sites')).not.toBeInTheDocument()
  })

  it('keeps Employees mode across the sticky routes', () => {
    useSidebarEmployeesModeStore.setState({ isEmployeesMode: true })

    for (const path of ['/customize', '/integrations']) {
      const view = renderAt(path)
      expect(screen.getByText('Team')).toBeInTheDocument()
      expect(useSidebarEmployeesModeStore.getState().isEmployeesMode).toBe(true)
      view.unmount()
    }
  })

  it('drops Employees mode on any other route', () => {
    useSidebarEmployeesModeStore.setState({ isEmployeesMode: true })
    renderAt('/knowledge')

    expect(useSidebarEmployeesModeStore.getState().isEmployeesMode).toBe(false)
  })
})
