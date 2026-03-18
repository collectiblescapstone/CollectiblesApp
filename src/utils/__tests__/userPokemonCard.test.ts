const mockGetSession = jest.fn()
let postMock: jest.Mock

let getUserCard: (userId: string, entryId: string) => Promise<any>
let getUserCards: (userId: string, cardId: string) => Promise<Set<string>>
let getUserCardsByPokemonId: (userId: string, pId: number) => Promise<any[]>
let getUserCardsBySetId: (userId: string, setId: string) => Promise<any[]>
let refreshPokemonCards: (userId: string) => void
let userGrandmasterSetCount: (userId: string, setId: string) => Promise<number>
let userMasterSet: (userId: string, setId: string) => Promise<string[]>
let userMasterSetCount: (userId: string, setId: string) => Promise<number>
let userPokemonGrandmasterSetCount: (
    userId: string,
    pokedexId: number
) => Promise<number>
let userPokemonMasterSet: (
    userId: string,
    pokedexId: number
) => Promise<string[]>
let userPokemonMasterSetCount: (
    userId: string,
    pokedexId: number
) => Promise<number>

jest.mock('@capacitor/core', () => ({
    CapacitorHttp: {
        post: jest.fn()
    }
}))

jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => ({
        auth: {
            getSession: mockGetSession
        }
    }))
}))

describe('userPokemonCard utils', () => {
    beforeEach(async () => {
        jest.resetModules()
        jest.clearAllMocks()

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key'

        const core = await import('@capacitor/core')
        postMock = core.CapacitorHttp.post as jest.Mock

        const module = await import('../userPokemonCard')
        getUserCard = module.getUserCard
        getUserCards = module.getUserCards
        getUserCardsByPokemonId = module.getUserCardsByPokemonId
        getUserCardsBySetId = module.getUserCardsBySetId
        refreshPokemonCards = module.refreshPokemonCards
        userGrandmasterSetCount = module.userGrandmasterSetCount
        userMasterSet = module.userMasterSet
        userMasterSetCount = module.userMasterSetCount
        userPokemonGrandmasterSetCount = module.userPokemonGrandmasterSetCount
        userPokemonMasterSet = module.userPokemonMasterSet
        userPokemonMasterSetCount = module.userPokemonMasterSetCount

        mockGetSession.mockResolvedValue({
            data: { session: { access_token: 'token-123' } }
        })
    })

    it('fetches cards and provides derived query/count helpers', async () => {
        postMock.mockResolvedValue({
            status: 200,
            data: {
                cards: [
                    {
                        id: 1,
                        cardId: 'sv1-1',
                        variant: 'normal',
                        condition: null,
                        forTrade: false,
                        showcase: true,
                        grade: null,
                        gradeLevel: null,
                        tags: ['starter'],
                        card: { setId: 'set-a', dexId: [1, 2000] }
                    },
                    {
                        id: 2,
                        cardId: 'sv1-1',
                        variant: 'reverse',
                        condition: 'near-mint',
                        forTrade: true,
                        showcase: false,
                        grade: 'psa',
                        gradeLevel: 'psa-9',
                        tags: [],
                        card: { setId: 'set-a', dexId: [1] }
                    },
                    {
                        id: 3,
                        cardId: 'sv1-2',
                        variant: 'normal',
                        condition: 'lightly-played',
                        forTrade: false,
                        showcase: false,
                        grade: null,
                        gradeLevel: null,
                        tags: [],
                        card: { setId: 'set-b', dexId: [2] }
                    }
                ]
            }
        })

        const ownedEntries = await getUserCards('user-1', 'sv1-1')
        const singleEntry = await getUserCard('user-1', '1')
        const setCards = await getUserCardsBySetId('user-1', 'set-a')
        const dexCards = await getUserCardsByPokemonId('user-1', 1)

        expect(Array.from(ownedEntries)).toEqual(['1', '2'])
        expect(singleEntry?.condition).toBe('')
        expect(setCards).toHaveLength(2)
        expect(dexCards).toHaveLength(2)

        await expect(userMasterSet('user-1', 'set-a')).resolves.toEqual([
            'sv1-1'
        ])
        await expect(userMasterSetCount('user-1', 'set-a')).resolves.toBe(1)
        await expect(userGrandmasterSetCount('user-1', 'set-a')).resolves.toBe(
            2
        )

        await expect(userPokemonMasterSet('user-1', 1)).resolves.toEqual([
            'sv1-1'
        ])
        await expect(userPokemonMasterSetCount('user-1', 1)).resolves.toBe(1)
        await expect(userPokemonGrandmasterSetCount('user-1', 1)).resolves.toBe(
            2
        )
        await expect(
            userPokemonGrandmasterSetCount('user-1', 999)
        ).resolves.toBe(0)

        expect(postMock).toHaveBeenCalledWith(
            expect.objectContaining({
                url: expect.stringContaining('/api/user-cards'),
                headers: expect.objectContaining({
                    Authorization: 'Bearer token-123'
                })
            })
        )
    })

    it('refreshPokemonCards resets cached data and refetches', async () => {
        postMock
            .mockResolvedValueOnce({
                status: 200,
                data: {
                    cards: [
                        {
                            id: 10,
                            cardId: 'old-card',
                            variant: 'normal',
                            condition: null,
                            forTrade: false,
                            showcase: false,
                            grade: null,
                            gradeLevel: null,
                            tags: [],
                            card: { setId: 'old-set', dexId: [10] }
                        }
                    ]
                }
            })
            .mockResolvedValueOnce({
                status: 200,
                data: {
                    cards: [
                        {
                            id: 11,
                            cardId: 'new-card',
                            variant: 'reverse',
                            condition: null,
                            forTrade: false,
                            showcase: false,
                            grade: null,
                            gradeLevel: null,
                            tags: [],
                            card: { setId: 'new-set', dexId: [11] }
                        }
                    ]
                }
            })

        await getUserCards('user-2', 'old-card')
        refreshPokemonCards('user-2')

        // Ensure the background refresh fetch completes
        await userMasterSet('user-2', 'new-set')

        const newCards = await getUserCards('user-2', 'new-card')
        const oldCards = await getUserCards('user-2', 'old-card')

        expect(Array.from(newCards)).toEqual(['11'])
        expect(Array.from(oldCards)).toEqual([])
        expect(postMock).toHaveBeenCalledTimes(2)
    })

    it('handles failed fetch and logs an error', async () => {
        const errorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})

        postMock.mockResolvedValue({
            status: 500,
            data: { cards: [] }
        })

        const result = await getUserCards('user-err', 'missing-card')

        expect(Array.from(result)).toEqual([])
        expect(errorSpy).toHaveBeenCalledWith(
            'Fetch error for pokemon cards:',
            expect.any(Error)
        )

        errorSpy.mockRestore()
    })

    it('lazy-loads data when calling userGrandmasterSetCount first', async () => {
        postMock.mockResolvedValue({
            status: 200,
            data: {
                cards: [
                    {
                        id: 21,
                        cardId: 'set-card',
                        variant: 'normal',
                        condition: null,
                        forTrade: false,
                        showcase: false,
                        grade: null,
                        gradeLevel: null,
                        tags: [],
                        card: { setId: 'set-x', dexId: [25] }
                    },
                    {
                        id: 22,
                        cardId: 'set-card',
                        variant: 'reverse',
                        condition: null,
                        forTrade: false,
                        showcase: false,
                        grade: null,
                        gradeLevel: null,
                        tags: [],
                        card: { setId: 'set-x', dexId: [25] }
                    }
                ]
            }
        })

        await expect(userGrandmasterSetCount('user-3', 'set-x')).resolves.toBe(
            2
        )
        expect(postMock).toHaveBeenCalledTimes(1)
    })

    it('lazy-loads data when calling userPokemonMasterSet first', async () => {
        postMock.mockResolvedValue({
            status: 200,
            data: {
                cards: [
                    {
                        id: 31,
                        cardId: 'dex-card',
                        variant: 'normal',
                        condition: null,
                        forTrade: false,
                        showcase: false,
                        grade: null,
                        gradeLevel: null,
                        tags: [],
                        card: { setId: 'set-y', dexId: [7] }
                    }
                ]
            }
        })

        await expect(userPokemonMasterSet('user-4', 7)).resolves.toEqual([
            'dex-card'
        ])
        expect(postMock).toHaveBeenCalledTimes(1)
    })

    it('lazy-loads data when calling userPokemonGrandmasterSetCount first', async () => {
        postMock.mockResolvedValue({
            status: 200,
            data: {
                cards: [
                    {
                        id: 41,
                        cardId: 'dex-gm-card',
                        variant: 'normal',
                        condition: null,
                        forTrade: false,
                        showcase: false,
                        grade: null,
                        gradeLevel: null,
                        tags: [],
                        card: { setId: 'set-z', dexId: [150] }
                    },
                    {
                        id: 42,
                        cardId: 'dex-gm-card',
                        variant: 'reverse',
                        condition: null,
                        forTrade: false,
                        showcase: false,
                        grade: null,
                        gradeLevel: null,
                        tags: [],
                        card: { setId: 'set-z', dexId: [150] }
                    }
                ]
            }
        })

        await expect(
            userPokemonGrandmasterSetCount('user-5', 150)
        ).resolves.toBe(2)
        expect(postMock).toHaveBeenCalledTimes(1)
    })

    it('fetches without auth header when no session token exists', async () => {
        mockGetSession.mockResolvedValueOnce({ data: { session: null } })
        postMock.mockResolvedValueOnce({ status: 200, data: { cards: [] } })

        await getUserCardsBySetId('user-no-token', 'set-any')

        expect(postMock).toHaveBeenCalledWith(
            expect.objectContaining({
                headers: { 'Content-Type': 'application/json' }
            })
        )
    })

    it('returns empty defaults for missing cached lookups', async () => {
        postMock.mockResolvedValueOnce({
            status: 200,
            data: {
                cards: [
                    {
                        id: 50,
                        cardId: 'single-card',
                        variant: 'normal',
                        condition: null,
                        forTrade: false,
                        showcase: false,
                        grade: null,
                        gradeLevel: null,
                        tags: [],
                        card: { setId: 'set-50', dexId: [50] }
                    }
                ]
            }
        })

        await getUserCards('user-6', 'single-card')

        await expect(getUserCard('user-6', 'missing-entry')).resolves.toBeNull()
        await expect(userMasterSet('user-6', 'unknown-set')).resolves.toEqual(
            []
        )
        await expect(
            userGrandmasterSetCount('user-6', 'unknown-set')
        ).resolves.toBe(0)
        await expect(userPokemonMasterSet('user-6', 9999)).resolves.toEqual([])
        await expect(
            userPokemonGrandmasterSetCount('user-6', 9999)
        ).resolves.toBe(0)
    })

    it('handles entries without card relation by using defaults', async () => {
        postMock.mockResolvedValueOnce({
            status: 200,
            data: {
                cards: [
                    {
                        id: 60,
                        cardId: 'orphan-card',
                        variant: 'normal',
                        condition: null,
                        forTrade: false,
                        showcase: false,
                        grade: null,
                        gradeLevel: null,
                        tags: []
                    }
                ]
            }
        })

        const entry = await getUserCard('user-7', '60')
        const bySet = await getUserCardsBySetId('user-7', 'whatever')
        const byDex = await getUserCardsByPokemonId('user-7', 25)

        expect(entry?.setId).toEqual([])
        expect(entry?.dexId).toEqual([])
        expect(bySet).toEqual([])
        expect(byDex).toEqual([])
    })
})
