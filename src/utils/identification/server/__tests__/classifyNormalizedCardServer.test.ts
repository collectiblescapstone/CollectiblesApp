describe('CardClassifierServer', () => {
    const originalReadFile = require('fs/promises').readFile
    const originalJoin = require('path').join

    beforeEach(() => {
        jest.resetModules()
        jest.clearAllMocks()
    })

    afterAll(() => {
        require('fs/promises').readFile = originalReadFile
        require('path').join = originalJoin
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

        return {
            Mat: MockMat,
            Size: MockSize,
            COLOR_RGB2GRAY: 1,
            INTER_AREA: 2,
            cvtColor: jest.fn((src: { __matrix: number[][] }, dst: MockMat) => {
                dst.__matrix = src.__matrix
            }),
            resize: jest.fn((src: MockMat, dst: MockMat) => {
                dst.__matrix = src.__matrix
            })
        }
    }

    const makeIncreasingMatrix = () => {
        const matrix: number[][] = []
        for (let row = 0; row < 16; row++) {
            matrix.push(Array.from({ length: 17 }, (_, col) => col))
        }
        return matrix
    }

    it('computes hash distances and respects k', async () => {
        const readFileMock = jest.fn().mockResolvedValue(
            JSON.stringify({
                best: {
                    hash: 'f'.repeat(64),
                    hashBits: '',
                    card: { id: 'best' }
                },
                worst: {
                    hash: '0'.repeat(64),
                    hashBits: '',
                    card: { id: 'worst' }
                }
            })
        )

        require('fs/promises').readFile = readFileMock
        require('path').join = jest.fn().mockReturnValue('/tmp/card_data.json')

        const { CardClassifierServer } =
            await import('../classifyNormalizedCardServer')

        const classify = await CardClassifierServer()

        const cv = createCV()
        const image = { __matrix: makeIncreasingMatrix() }

        expect(
            classify(cv as any, image as any, 1).map((c) => c.card.id)
        ).toEqual(['best'])
        expect(classify(cv as any, image as any).map((c) => c.card.id)).toEqual(
            ['best', 'worst']
        )
    })

    it('reuses cache and avoids duplicate file reads', async () => {
        const readFileMock = jest.fn().mockResolvedValue(
            JSON.stringify({
                only: {
                    hash: 'f'.repeat(64),
                    hashBits: '',
                    card: { id: 'only' }
                }
            })
        )

        require('fs/promises').readFile = readFileMock
        require('path').join = jest.fn().mockReturnValue('/tmp/card_data.json')

        const { CardClassifierServer } =
            await import('../classifyNormalizedCardServer')

        await CardClassifierServer()
        await CardClassifierServer()

        expect(readFileMock).toHaveBeenCalledTimes(1)
    })
})
