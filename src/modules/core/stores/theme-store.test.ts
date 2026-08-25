import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { applyTheme, resolveTheme, useThemeStore } from './theme-store'

describe('resolveTheme', () => {
  it('follows the system signal when the preference is system', () => {
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('ignores the system signal once a theme is chosen explicitly', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
  })
})

describe('applyTheme', () => {
  it('never leaves both palette classes on the element', () => {
    const root = document.documentElement
    root.classList.add('light', 'dark')

    applyTheme('light')

    expect(root.classList.contains('light')).toBe(true)
    expect(root.classList.contains('dark')).toBe(false)
    expect(root.style.colorScheme).toBe('light')
  })
})

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear()
    window.__prefersDarkScheme = false
  })

  afterEach(() => {
    window.__prefersDarkScheme = false
    useThemeStore.getState().setTheme('system')
  })

  it('writes the resolved class and persists the preference', () => {
    useThemeStore.getState().setTheme('light')

    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('employees:theme')).toBe('light')
    expect(useThemeStore.getState().resolved).toBe('light')

    useThemeStore.getState().setTheme('dark')

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('reads matchMedia when the preference is system', () => {
    window.__prefersDarkScheme = true
    useThemeStore.getState().setTheme('system')

    expect(useThemeStore.getState().resolved).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)

    window.__prefersDarkScheme = false
    useThemeStore.getState().setTheme('system')

    expect(useThemeStore.getState().resolved).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })
})
