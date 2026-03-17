import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import {
    PokemonCardsProvider,
    usePokemonCards
} from '@/context/PokemonCardsProvider'
import { CapacitorHttp } from '@capacitor/core'

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

describe('PokemonCardsProvider', () => {
    const originalFetch = global.fetch

    const mockCards = [
        {
            id: 'sv1-1',
            name: 'Bulbasaur',
            category: 'Pokemon',
            types: ['Grass'],
            illustrator: 'Ken',
            rarity: 'Common',
            variants: ['normal', 'reverse'],
            dexId: [1],
            image_url: 'img-1',
            setId: 'base1'
        },
        {
            id: 'sv1-2',
            name: 'Ivysaur',
            category: 'Pokemon',
            types: ['Grass'],
            illustrator: 'Aya',
            rarity: 'Uncommon',
            variants: ['normal'],
            dexId: [1, 2],
            image_url: 'img-2',
            setId: 'base1'
        }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        ;(CapacitorHttp.post as jest.Mock)
            .mockResolvedValueOnce({
                status: 200,
                data: mockCards
            })
            .mockResolvedValueOnce({
                status: 200,
                data: [mockCards[1]]
            })

        global.fetch = jest.fn((input: RequestInfo | URL) => {
            const url = typeof input === 'string' ? input : input.toString()

            if (url === '/api/pokemon-set') {
                return Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            id: 'base1',
                            name: 'Base Set',
                            series: 'Scarlet & Violet',
                            logo: null,
                            symbol: null,
                            official: true,
                            total: 2
                        }
                    ]
                } as Response)
            }

            if (url === '/api/pokemon-subset') {
                return Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            setId: 'base1',
                            name: 'Starter',
                            prefix: 'ST',
                            official: true
                        }
                    ]
                } as Response)
            }

            if (url === '/Pokedex/pokedex.json') {
                return Promise.resolve({
                    ok: true,
                    json: async () => [
                        { id: 1, name: 'Bulbasaur' },
                        { id: 2, name: 'Ivysaur' }
                    ]
                } as Response)
            }

            return Promise.reject(new Error(`Unhandled fetch URL: ${url}`))
        }) as jest.Mock
    })

    afterAll(() => {
        global.fetch = originalFetch
    })

    it('throws when usePokemonCards is used outside provider', () => {
        expect(() => renderHook(() => usePokemonCards())).toThrow(
            'usePokemonCards must be used within a PokemonCardsProvider'
        )
    })

    it('loads data and exposes card query helpers', async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <PokemonCardsProvider>{children}</PokemonCardsProvider>
        )

        const { result } = renderHook(() => usePokemonCards(), { wrapper })

        await waitFor(() => {
            expect(result.current.allCards).toHaveLength(2)
        })

        const bySet = await result.current.getCardsBySetId('base1')
        const byName = await result.current.getCardsByName('Bulba')
        const byDex = await result.current.getCardsByPokedex(2)
        const filtered = await result.current.getFilteredCards({
            ids: ['sv1-2']
        })

        expect(Object.keys(bySet)).toHaveLength(2)
        expect(Object.keys(byName)).toEqual(['sv1-1'])
        expect(Object.keys(byDex)).toEqual(['sv1-2'])
        expect(filtered).toEqual([mockCards[1]])

        await expect(result.current.grandmasterSetCount('base1')).resolves.toBe(
            3
        )
        await expect(
            result.current.pokemonGrandmasterSetCount(1)
        ).resolves.toBe(3)

        await expect(result.current.getPokemonName(1)).resolves.toBe(
            'Bulbasaur'
        )
        await expect(result.current.getPokemonName(2000)).resolves.toBe('N/A')

        expect(result.current.getGeneration(1)).toBe(1)
        expect(result.current.getGeneration(152)).toBe(2)
        expect(result.current.getGeneration(0)).toBe(0)
        expect(result.current.pokemonSets.base1.name).toBe('Base Set')
        expect(result.current.pokemonSubsets.base1[0].name).toBe('Starter')

        expect(CapacitorHttp.post).toHaveBeenCalledTimes(2)
    })
})
