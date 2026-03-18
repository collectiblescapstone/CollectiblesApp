import { processONNXSessionResultsServer } from '../YOLOONNXUtilsServer'

describe('processONNXSessionResultsServer', () => {
    class MockMat {
        rows: number
        cols: number
        data32F: Float32Array
        constructor(rows = 0, cols = 0) {
            this.rows = rows
            this.cols = cols
            this.data32F = new Float32Array(rows * cols || 1).fill(1)
        }
        delete = jest.fn()
        size() {
            return { width: this.cols, height: this.rows }
        }
        row() {
            return { data32F: this.data32F }
        }
        roi() {
            return new MockMat(2, 2)
        }
        copyTo = jest.fn()
        convertTo(dst: MockMat) {
            dst.data32F = this.data32F
        }
    }

    const createCV = () => {
        const cv: any = {
            CV_32F: 1,
            CV_8UC4: 2,
            CV_8U: 3,
            INTER_LINEAR: 4,
            THRESH_BINARY: 5,
            Mat: MockMat,
            Scalar: jest.fn(),
            Size: jest.fn((w: number, h: number) => ({ width: w, height: h })),
            Rect: jest.fn((x: number, y: number, w: number, h: number) => ({
                x,
                y,
                w,
                h
            })),
            matFromArray: jest.fn(
                (rows: number, cols: number, _type: number, data: any) => {
                    const mat = new MockMat(rows, cols)
                    mat.data32F =
                        data instanceof Float32Array
                            ? data
                            : new Float32Array(data)
                    return mat
                }
            ),
            gemm: jest.fn(
                (
                    a: MockMat,
                    b: MockMat,
                    _a: number,
                    _e: MockMat,
                    _b: number,
                    out: MockMat
                ) => {
                    out.rows = a.rows
                    out.cols = b.cols
                    out.data32F = new Float32Array(a.rows * b.cols).fill(0.8)
                }
            ),
            multiply: jest.fn((src: MockMat, _t: MockMat, dst: MockMat) => {
                dst.rows = src.rows
                dst.cols = src.cols
                dst.data32F = new Float32Array(src.data32F)
            }),
            exp: jest.fn(),
            add: jest.fn(),
            divide: jest.fn(),
            resize: jest.fn((_src: MockMat, dst: MockMat, size: any) => {
                dst.rows = size.height
                dst.cols = size.width
            }),
            threshold: jest.fn()
        }
        cv.Mat.ones = jest.fn(() => new MockMat(2, 2))
        return cv
    }

    it('processes detections and creates masks', () => {
        const cv = createCV()
        const detections = {
            dims: [1, 2, 38],
            data: new Float32Array([
                10,
                20,
                110,
                220,
                0.9,
                1,
                ...Array(32).fill(0.5),
                0,
                0,
                0,
                0,
                0.1,
                0,
                ...Array(32).fill(0)
            ])
        } as any
        const proto = {
            dims: [1, 32, 4, 4],
            data: new Float32Array(32 * 4 * 4).fill(1)
        } as any

        const result = processONNXSessionResultsServer(cv, detections, proto)

        expect(result.results).toHaveLength(1)
        expect(result.masksMat).toBeTruthy()
    })

    it('returns null mask on processing error', () => {
        const cv = createCV()
        cv.gemm = jest.fn(() => {
            throw new Error('gemm-bad')
        })
        const errorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => undefined)

        const detections = {
            dims: [1, 1, 38],
            data: new Float32Array([
                10,
                20,
                110,
                220,
                0.9,
                1,
                ...Array(32).fill(0.5)
            ])
        } as any
        const proto = {
            dims: [1, 32, 4, 4],
            data: new Float32Array(32 * 4 * 4).fill(1)
        } as any

        const result = processONNXSessionResultsServer(cv, detections, proto)

        expect(result.masksMat).toBeNull()
        expect(errorSpy).toHaveBeenCalled()
        errorSpy.mockRestore()
    })
})
