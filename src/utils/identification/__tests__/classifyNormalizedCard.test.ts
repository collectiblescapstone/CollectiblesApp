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

        const cv = {
            Mat: MockMat,
            MatVector: MockMatVector,
            Size: MockSize,
            INTER_AREA: 3,
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

        return cv
    }

    const makeIncreasingMatrix = () => {
        const matrix: number[][] = []
        for (let row = 0; row < 16; row++) {
            matrix.push(Array.from({ length: 17 }, (_, col) => col))
        }

        return matrix
    }

    it('returns null when card data fetch fails', async () => {
        const { CardClassifier } = await import('../classifyNormalizedCard')
        ;(global.fetch as jest.Mock).mockResolvedValue({ ok: false })

        const classify = await CardClassifier()

        const cv = createCV()
        const image = new cv.Mat()
        image.__matrix = makeIncreasingMatrix()

        expect(classify(cv as any, image as any)).toBeNull()
    })

    it('computes dhash and sorts by Hamming distance', async () => {
        const { CardClassifier } = await import('../classifyNormalizedCard')
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                best: {
                    hash: 'f'.repeat(64 * 3),
                    hashBits: '',
                    card: { id: 'best' }
                },
                middle: {
                    hash: 'a'.repeat(64 * 3),
                    hashBits: '',
                    card: { id: 'middle' }
                },
                worst: {
                    hash: '0'.repeat(64 * 3),
                    hashBits: '',
                    card: { id: 'worst' }
                }
            })
        })

        const classify = await CardClassifier()

        const cv = createCV()
        const image = new cv.Mat()
        image.__matrix = makeIncreasingMatrix()

        const topResult = classify(cv as any, image as any)
        expect(topResult?.card.id).toEqual('best')

        expect(image.convertTo).toHaveBeenCalledWith(image, cv.CV_8UC3)
        expect(cv.split).toHaveBeenCalled()
        expect(cv.resize).toHaveBeenCalled()

        const resizedMat = (cv.resize as jest.Mock).mock.calls[0][1] as {
            delete: jest.Mock
        }
        expect(resizedMat.delete).toHaveBeenCalledTimes(1)

        const channels = (cv.split as jest.Mock).mock.calls[0][1] as {
            get: (index: number) => { delete: jest.Mock }
            delete: jest.Mock
        }
        expect(channels.get(0).delete).toHaveBeenCalledTimes(1)
        expect(channels.get(1).delete).toHaveBeenCalledTimes(1)
        expect(channels.get(2).delete).toHaveBeenCalledTimes(1)
        expect(channels.delete).toHaveBeenCalledTimes(1)
    })

    it('caches loaded card data across classifier instances', async () => {
        const { CardClassifier } = await import('../classifyNormalizedCard')
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                only: {
                    hash: 'f'.repeat(64 * 3),
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
