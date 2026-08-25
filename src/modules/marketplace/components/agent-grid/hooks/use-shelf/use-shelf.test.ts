import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useShelf } from '.'

describe('useShelf', () => {
  it('withholds nothing when the shelf fits the two-row preview', () => {
    const { result } = renderHook(() => useShelf(6))

    expect(result.current.visible).toBe(6)
    expect(result.current.hidden).toBe(0)
  })

  it('counts the rest and then reveals it', () => {
    const { result } = renderHook(() => useShelf(9))

    expect(result.current.visible).toBe(6)
    expect(result.current.hidden).toBe(3)

    act(() => result.current.showAll())

    expect(result.current.visible).toBe(9)
    expect(result.current.hidden).toBe(0)
  })

  it('withholds nothing at all once the page is already filtered', () => {
    const { result } = renderHook(() => useShelf(9, true))

    expect(result.current.visible).toBe(9)
    expect(result.current.hidden).toBe(0)
  })
})
