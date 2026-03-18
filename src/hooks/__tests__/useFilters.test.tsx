import { act, renderHook } from '@testing-library/react'
import { defaultFilters, FiltersProvider, useFilters } from '@/hooks/useFilters'

describe('useFilters', () => {
    it('throws when used outside FiltersProvider', () => {
        expect(() => renderHook(() => useFilters())).toThrow(
            'useFilters must be used within a FiltersProvider'
        )
    })

    it('returns default filters inside FiltersProvider', () => {
        const { result } = renderHook(() => useFilters(), {
            wrapper: FiltersProvider
        })

        expect(result.current.filters).toEqual(defaultFilters)
        expect(typeof result.current.setFilters).toBe('function')
    })

    it('updates filters through setFilters', () => {
        const { result } = renderHook(() => useFilters(), {
            wrapper: FiltersProvider
        })

        act(() => {
            result.current.setFilters((prev) => ({
                ...prev,
                generations: [1, 2],
                categories: ['Pokémon']
            }))
        })

        expect(result.current.filters.generations).toEqual([1, 2])
        expect(result.current.filters.categories).toEqual(['Pokémon'])
        expect(result.current.filters.types.Grass).toBe(true)
    })
})
