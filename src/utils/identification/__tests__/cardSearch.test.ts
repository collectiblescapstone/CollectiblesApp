import { CardSearcher } from '../cardSearch'

const tokenizerFromPretrained = jest.fn()
const textModelFromPretrained = jest.fn()

jest.mock('@xenova/transformers', () => ({
    AutoTokenizer: {
        from_pretrained: (...args: unknown[]) =>
            tokenizerFromPretrained(...args)
    },
    CLIPTextModelWithProjection: {
        from_pretrained: (...args: unknown[]) =>
            textModelFromPretrained(...args)
    }
}))

describe('CardSearcher', () => {
    const originalFetch = global.fetch
    const originalCaches = global.caches
    const originalDecompressionStream = global.DecompressionStream
    const originalResponse = global.Response

    const cacheMatch = jest.fn()
    const cachePut = jest.fn()
    const mockTokenizer = jest.fn((query: string) => ({ query }))
    const mockTextModel = jest.fn(async () => ({
        text_embeds: { data: [1, 0] }
    }))

    const setEmbeddingsPayload = (payload: Record<string, number[]>) => {
        const response = {
            body: {
                pipeThrough: jest.fn(() => ({ payload }))
            },
            clone: jest.fn().mockReturnThis(),
            json: jest.fn(async () => payload)
        } as any

        cacheMatch.mockResolvedValue(response)
        ;(global.fetch as jest.Mock).mockResolvedValue(response)
    }

    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()

        tokenizerFromPretrained.mockResolvedValue(mockTokenizer)
        textModelFromPretrained.mockResolvedValue(mockTextModel)

        Object.defineProperty(global, 'caches', {
            writable: true,
            value: {
                open: jest.fn().mockResolvedValue({
                    match: cacheMatch,
                    put: cachePut
                })
            }
        })

        Object.defineProperty(global, 'fetch', {
            writable: true,
            value: jest.fn()
        })

        Object.defineProperty(global, 'DecompressionStream', {
            writable: true,
            value: jest.fn().mockImplementation(() => ({}))
        })

        Object.defineProperty(global, 'Response', {
            writable: true,
            value: jest
                .fn()
                .mockImplementation(
                    (stream: { payload: Record<string, number[]> }) => ({
                        json: async () => stream.payload
                    })
                )
        })
    })

    afterAll(() => {
        global.fetch = originalFetch
        Object.defineProperty(global, 'caches', {
            writable: true,
            value: originalCaches
        })
        Object.defineProperty(global, 'DecompressionStream', {
            writable: true,
            value: originalDecompressionStream
        })
        Object.defineProperty(global, 'Response', {
            writable: true,
            value: originalResponse
        })
    })

    it('loads dependencies, reads embeddings from cache, and searches by score', async () => {
        setEmbeddingsPayload({
            c1: [1, 0],
            c2: [0.5, 0],
            c3: [-1, 0]
        })

        const searcher = await CardSearcher()
        const results = await searcher.search('grass starter')

        expect(tokenizerFromPretrained).toHaveBeenCalledWith(
            'Xenova/clip-vit-base-patch32',
            { local_files_only: true }
        )
        expect(textModelFromPretrained).toHaveBeenCalledWith(
            'Xenova/clip-vit-base-patch32',
            { local_files_only: true }
        )
        expect(mockTokenizer).toHaveBeenCalledWith('grass starter')
        expect(mockTextModel).toHaveBeenCalledWith({ query: 'grass starter' })
        expect(results.map((r) => r.id)).toEqual(['c1', 'c2', 'c3'])
        expect(global.fetch).not.toHaveBeenCalled()
        expect(cachePut).not.toHaveBeenCalled()
    })

    it('fetches embeddings and writes to cache on cache miss', async () => {
        setEmbeddingsPayload({ c1: [1, 0], c2: [0, 1] })
        cacheMatch.mockResolvedValueOnce(undefined)

        const searcher = await CardSearcher()
        const results = await searcher.search('fire')

        expect(global.fetch).toHaveBeenCalledWith('/pokemon_embeddings.bin.gz')
        expect(cachePut).toHaveBeenCalledTimes(1)
        expect(results).toHaveLength(2)
    })

    it('returns top 15 results and supports filtered search', async () => {
        const embeddings: Record<string, number[]> = {}
        for (let i = 0; i < 20; i++) {
            embeddings[`c${i}`] = [20 - i, 0]
        }
        setEmbeddingsPayload(embeddings)

        const searcher = await CardSearcher()

        const all = await searcher.search('query')
        expect(all).toHaveLength(20)
        expect(all[0].id).toBe('c0')
        expect(all[14].id).toBe('c14')

        const filteredSearch = searcher.getFilteredSearch([
            'c2',
            'c17',
            'missing'
        ])
        const filtered = await filteredSearch('query')

        expect(filtered.map((r) => r.id)).toEqual(['c2', 'c17'])
    })
})
