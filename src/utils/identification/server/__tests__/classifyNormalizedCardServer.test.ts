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
            convertTo = jest.fn((dst: MockMat) => {
                dst.__matrix = this.__matrix
                return dst
            })
            ucharPtr(row: number, col: number) {
                return [this.__matrix[row][col]]
            }
        }

        class MockMatVector {
            private mats: MockMat[] = []
            delete = jest.fn()
            setMats(mats: MockMat[]) {
                this.mats = mats
            }
            get(index: number) {
                return this.mats[index]
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
            MatVector: MockMatVector,
            Size: MockSize,
            INTER_AREA: 2,
            CV_8UC3: 16,
            split: jest.fn((src: MockMat, channels: MockMatVector) => {
                const r = new MockMat()
                const g = new MockMat()
                const b = new MockMat()
                r.__matrix = src.__matrix
                g.__matrix = src.__matrix
                b.__matrix = src.__matrix
                channels.setMats([r, g, b])
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

    it('computes hash distances', async () => {
        const readFileMock = jest.fn().mockResolvedValue(
            JSON.stringify({
                best: {
                    hash: 'f'.repeat(64 * 3),
                    hashBits: '',
                    card: { id: 'best' }
                },
                worst: {
                    hash: '0'.repeat(64 * 3),
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
        const image = new cv.Mat()
        image.__matrix = makeIncreasingMatrix()

        const result = classify(cv as any, image as any)

        expect(result?.card.id).toEqual('best')
        expect(image.convertTo).toHaveBeenCalledWith(image, cv.CV_8UC3)
        expect(cv.split).toHaveBeenCalled()
        expect(cv.resize).toHaveBeenCalled()

        const channels = (cv.split as jest.Mock).mock.calls[0][1] as {
            get: (index: number) => { delete: jest.Mock }
            delete: jest.Mock
        }
        expect(channels.get(0).delete).toHaveBeenCalledTimes(1)
        expect(channels.get(1).delete).toHaveBeenCalledTimes(1)
        expect(channels.get(2).delete).toHaveBeenCalledTimes(1)
        expect(channels.delete).toHaveBeenCalledTimes(1)
    })

    it('reuses cache and avoids duplicate file reads', async () => {
        const readFileMock = jest.fn().mockResolvedValue(
            JSON.stringify({
                only: {
                    hash: 'f'.repeat(64 * 3),
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
