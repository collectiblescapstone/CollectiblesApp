describe('CardClassifier', () => {
    const originalFetch = global.fetch

    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()
        Object.defineProperty(global, 'fetch', {
            writable: true,
            value: jest.fn()
        })
    })

    afterAll(() => {
        global.fetch = originalFetch
    })

    const createCV = () => {
        class MockMat {
            __matrix: number[][] = []
            delete = jest.fn()
            ucharPtr(row: number, col: number) {
                return [this.__matrix[row][col]]
            }
        }

        class MockSize {
            width: number
            height: number
            constructor(width: number, height: number) {
                this.width = width
                this.height = height
            }
        }

        const cv = {
            Mat: MockMat,
            Size: MockSize,
            COLOR_RGB2GRAY: 7,
            INTER_AREA: 3,
            cvtColor: jest.fn((src: { __matrix: number[][] }, dst: MockMat) => {
                dst.__matrix = src.__matrix
            }),
            resize: jest.fn((src: MockMat, dst: MockMat) => {
                dst.__matrix = src.__matrix
            })
        }

        return cv
    }

    const makeIncreasingMatrix = () => {
        const matrix: number[][] = []
        for (let row = 0; row < 16; row++) {
            matrix.push(Array.from({ length: 17 }, (_, col) => col))
        }

        return matrix
    }

    it('returns empty results when card data fetch fails', async () => {
        const { CardClassifier } = await import('../classifyNormalizedCard')
        ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false })

        const classify = await CardClassifier()

        const cv = createCV()
        const image = { __matrix: makeIncreasingMatrix() }

        expect(classify(cv as any, image as any)).toEqual([])
    })

    it('computes dhash, sorts by Hamming distance, and respects k', async () => {
        const { CardClassifier } = await import('../classifyNormalizedCard')
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                best: {
                    hash: 'f'.repeat(64),
                    hashBits: '',
                    card: { id: 'best' }
                },
                middle: {
                    hash: 'a'.repeat(64),
                    hashBits: '',
                    card: { id: 'middle' }
                },
                worst: {
                    hash: '0'.repeat(64),
                    hashBits: '',
                    card: { id: 'worst' }
                }
            })
        })

        const classify = await CardClassifier()

        const cv = createCV()
        const image = { __matrix: makeIncreasingMatrix() }

        const topTwo = classify(cv as any, image as any, 2)
        expect(topTwo.map((c) => c.card.id)).toEqual(['best', 'middle'])

        const defaultTop = classify(cv as any, image as any)
        expect(defaultTop.map((c) => c.card.id)).toEqual([
            'best',
            'middle',
            'worst'
        ])

        expect(cv.cvtColor).toHaveBeenCalled()
        expect(cv.resize).toHaveBeenCalled()

        const colorMat = (cv.cvtColor as jest.Mock).mock.calls[0][1] as {
            delete: jest.Mock
        }
        const resizedMat = (cv.resize as jest.Mock).mock.calls[0][1] as {
            delete: jest.Mock
        }
        expect(colorMat.delete).toHaveBeenCalledTimes(1)
        expect(resizedMat.delete).toHaveBeenCalledTimes(1)
    })

    it('caches loaded card data across classifier instances', async () => {
        const { CardClassifier } = await import('../classifyNormalizedCard')
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                only: {
                    hash: 'f'.repeat(64),
                    hashBits: '',
                    card: { id: 'only' }
                }
            })
        })

        await CardClassifier()
        await CardClassifier()

        expect(global.fetch).toHaveBeenCalledTimes(1)
        expect(global.fetch).toHaveBeenCalledWith('/card_data.json')
    })
})
