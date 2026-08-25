import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useShelf } from '.'

describe('useShelf', () => {
  it('withholds nothing when the shelf fits the canvas row', () => {
    const { result } = renderHook(() => useShelf(2))

    expect(result.current.visible).toBe(2)
    expect(result.current.hidden).toBe(0)
  })

  it('counts the rest and then reveals it', () => {
    const { result } = renderHook(() => useShelf(7))

    expect(result.current.visible).toBe(2)
    expect(result.current.hidden).toBe(5)

    act(() => result.current.showAll())

    expect(result.current.visible).toBe(7)
    expect(result.current.hidden).toBe(0)
  })
})
