import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useThemeStore } from '@/modules/core/stores/theme-store'
import { ThemeToggle } from '.'

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear()
    useThemeStore.getState().setTheme('system')
  })

  afterEach(() => useThemeStore.getState().setTheme('system'))

  it('cycles system → light → dark and moves the class with it', async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    const button = () => screen.getByRole('button', { name: /^Theme:/ })
    expect(button()).toHaveAccessibleName('Theme: System. Switch to Light.')

    await user.click(button())
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(button()).toHaveAccessibleName('Theme: Light. Switch to Dark.')

    await user.click(button())
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(button()).toHaveAccessibleName('Theme: Dark. Switch to System.')

    await user.click(button())
    expect(useThemeStore.getState().preference).toBe('system')
  })
})
