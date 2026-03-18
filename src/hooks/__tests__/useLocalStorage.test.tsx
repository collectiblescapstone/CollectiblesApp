import { act, renderHook } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

describe('useLocalStorage', () => {
    beforeEach(() => {
        window.localStorage.clear()
        jest.restoreAllMocks()
    })

    it('uses default value when localStorage key is missing', () => {
        const { result } = renderHook(() =>
            useLocalStorage('missing-key', { enabled: true })
        )

        expect(result.current[0]).toEqual({ enabled: true })
    })

    it('reads existing value from localStorage on mount', () => {
        window.localStorage.setItem('theme', JSON.stringify('dark'))

        const { result } = renderHook(() => useLocalStorage('theme', 'light'))

        expect(result.current[0]).toBe('dark')
    })

    it('writes updated value to localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('count', 0))

        act(() => {
            result.current[1](7)
        })

        expect(window.localStorage.getItem('count')).toBe(JSON.stringify(7))
        expect(result.current[0]).toBe(7)
    })

    it('persists default value to localStorage on first render', () => {
        renderHook(() => useLocalStorage('first-render', 'default-value'))

        expect(window.localStorage.getItem('first-render')).toBe(
            JSON.stringify('default-value')
        )
    })
})
