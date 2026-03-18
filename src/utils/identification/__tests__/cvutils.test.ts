import {
    biggestContour,
    drawRectangle,
    filterContours,
    reorderCorners,
    sortVals,
    swap
} from '../cvutils'

describe('cvutils', () => {
    class MockMat {
        rows: number
        data32S: number[]
        private points: [number, number][]
        private deleted = false

        constructor(rows = 0, points: [number, number][] = []) {
            this.rows = rows
            this.points = points
            this.data32S = [1]
        }

        intAt(i: number, j: number) {
            return this.points[i]?.[j] ?? 0
        }

        delete() {
            this.deleted = true
        }

        isDeleted() {
            return this.deleted
        }
    }

    class MockMatVector {
        constructor(private items: any[]) {}
        size() {
            return this.items.length
        }
        get(i: number) {
            return this.items[i]
        }
    }

    const createCV = () => {
        return {
            Mat: MockMat,
            contourArea: jest.fn((cnt: any) => cnt.area),
            arcLength: jest.fn((cnt: any) => cnt.peri ?? 100),
            approxPolyDP: jest.fn((cnt: any, approx: MockMat) => {
                approx.rows = cnt.approxRows
            }),
            Scalar: jest.fn(),
            Point: jest.fn((x: number, y: number) => ({ x, y })),
            line: jest.fn()
        }
    }

    it('finds the biggest valid 4-sided contour', () => {
        const cv = createCV()
        const contours = new MockMatVector([
            { area: 2000, approxRows: 4, delete: jest.fn() },
            { area: 8000, approxRows: 3, delete: jest.fn() },
            { area: 9000, approxRows: 4, delete: jest.fn() }
        ])

        const { biggest, maxArea } = biggestContour(cv as any, contours as any)

        expect(biggest).toBeTruthy()
        expect(maxArea).toBe(9000)
    })

    it('filters contours by edge, area, and side count', () => {
        const cv = createCV()
        const contours = new MockMatVector([
            {
                rows: 1,
                intAt: () => 0,
                area: 7000,
                approxRows: 4,
                delete: jest.fn()
            },
            {
                rows: 1,
                intAt: (_i: number, j: number) => (j === 0 ? 100 : 100),
                area: 1000,
                approxRows: 4,
                delete: jest.fn()
            },
            {
                rows: 1,
                intAt: (_i: number, j: number) => (j === 0 ? 120 : 120),
                area: 8000,
                approxRows: 4,
                delete: jest.fn()
            },
            {
                rows: 1,
                intAt: (_i: number, j: number) => (j === 0 ? 120 : 120),
                area: 8000,
                approxRows: 5,
                delete: jest.fn()
            }
        ])

        const filtered = filterContours(cv as any, contours as any)

        expect(filtered).toHaveLength(1)
    })

    it('reorders corners into top-left, top-right, bottom-left, bottom-right', () => {
        const mat = new MockMat(4, [
            [100, 50],
            [10, 10],
            [10, 50],
            [100, 10]
        ])

        const ordered = reorderCorners(mat as any)
        expect(ordered).toEqual([
            [10, 50],
            [10, 10],
            [100, 50],
            [100, 10]
        ])
    })

    it('sorts and swaps values', () => {
        const arr = [3, 1, 2]
        const { vals, indexes } = sortVals(arr)
        expect(vals).toEqual([1, 2, 3])
        expect(indexes).toEqual([1, 2, 0])

        const arr2 = ['a', 'b']
        swap(arr2, 0, 1)
        expect(arr2).toEqual(['b', 'a'])
    })

    it('draws rectangle lines and swallows drawing errors', () => {
        const cv = createCV()
        const img = {} as any
        drawRectangle(cv as any, img, [
            [0, 0],
            [10, 0],
            [0, 20],
            [10, 20]
        ])
        expect(cv.line).toHaveBeenCalledTimes(4)

        const brokenCV = {
            ...cv,
            Point: jest.fn(() => {
                throw new Error('bad point')
            })
        }
        expect(() =>
            drawRectangle(brokenCV as any, img, [
                [0, 0],
                [10, 0],
                [0, 20],
                [10, 20]
            ])
        ).not.toThrow()
    })
})
