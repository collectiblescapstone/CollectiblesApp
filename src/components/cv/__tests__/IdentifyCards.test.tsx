import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { renderWithTheme } from '@/utils/testing-utils'
import { IdentifyCards } from '../IdentifyCards'

const mockLocateWithYOLO = jest.fn()
const mockCardClassifierFactory = jest.fn()
const mockClassifier = jest.fn()
const mockUseAuth = jest.fn()

const mockGetPlatform = jest.fn()
const mockCapHttpPost = jest.fn()

jest.mock('@chakra-ui/react', () => {
    const actual = jest.requireActual('@chakra-ui/react')

    return {
        ...actual,
        ScrollArea: {
            Root: ({ children, ...props }: any) => (
                <div {...props}>{children}</div>
            ),
            Viewport: ({ children, ...props }: any) => (
                <div {...props}>{children}</div>
            ),
            Content: ({ children, ...props }: any) => (
                <div {...props}>{children}</div>
            ),
            Scrollbar: (props: any) => (
                <div data-testid="scrollbar" {...props} />
            )
        }
    }
})

jest.mock('@/utils/identification/locateWithYOLO', () => ({
    locateWithYOLO: (...args: unknown[]) => mockLocateWithYOLO(...args)
}))

jest.mock('@/utils/identification/classifyNormalizedCard', () => ({
    CardClassifier: (...args: unknown[]) => mockCardClassifierFactory(...args)
}))

jest.mock('@/context/AuthProvider', () => ({
    useAuth: () => mockUseAuth()
}))

jest.mock('@/utils/userPokemonCard', () => ({
    refreshPokemonCards: jest.fn()
}))

jest.mock('@capacitor/core', () => ({
    Capacitor: {
        getPlatform: () => mockGetPlatform()
    },
    CapacitorHttp: {
        post: (...args: unknown[]) => mockCapHttpPost(...args)
    }
}))

jest.mock('@techstark/opencv-js', () => ({
    __esModule: true,
    default: Promise.resolve({ cv: true })
}))

jest.mock('../IdentifiedCard', () => ({
    IdentifiedCard: ({
        data,
        instantAdded,
        onInstantAdd
    }: {
        data: { card: { id: string; name: string } }
        instantAdded: boolean
        onInstantAdd: () => void
    }) => (
        <button onClick={onInstantAdd}>
            {data.card.name}:{instantAdded ? 'instant' : 'normal'}
        </button>
    )
}))

describe('IdentifyCards', () => {
    const onProcessed = jest.fn()

    const cardA = {
        hash: 'h1',
        hashBits: 'b1',
        card: {
            id: 'sv1-1',
            name: 'Bulbasaur',
            image: 'https://img/a',
            set: {
                id: 'sv1',
                name: 'Set A',
                cardCount: { official: 1, total: 1 }
            }
        }
    } as any

    const cardB = {
        hash: 'h2',
        hashBits: 'b2',
        card: {
            id: 'sv1-2',
            name: 'Ivysaur',
            image: 'https://img/b',
            set: {
                id: 'sv1',
                name: 'Set A',
                cardCount: { official: 2, total: 2 }
            }
        }
    } as any

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAuth.mockReturnValue({ session: { user: { id: 'u1' } } })
        mockGetPlatform.mockReturnValue('web')
        mockCardClassifierFactory.mockResolvedValue(mockClassifier)
        mockClassifier.mockReturnValue([cardA])
    })

    it('shows empty state when no source image provided', () => {
        renderWithTheme(
            <IdentifyCards
                onProcessed={onProcessed}
                overlayRef={null}
                sourceImageData={undefined}
            />
        )

        expect(screen.getByText('No cards identified.')).toBeInTheDocument()
        expect(onProcessed).not.toHaveBeenCalled()
    })

    it.skip('runs web pipeline, draws overlay, classifies cards, and cleans up mats', async () => {
        const putImageData = jest.fn()
        const overlayCanvas = {
            width: 0,
            height: 0,
            getContext: jest.fn(() => ({ putImageData }))
        } as unknown as HTMLCanvasElement
        const overlayRef = {
            current: overlayCanvas
        } as React.RefObject<HTMLCanvasElement | null>

        const matA = {
            delete: jest.fn(),
            isDeleted: jest.fn(() => false)
        }
        const matB = {
            delete: jest.fn(),
            isDeleted: jest.fn(() => true)
        }

        mockLocateWithYOLO.mockResolvedValue({
            overlay: { width: 321, height: 123 },
            results: [{ image: matA }, { image: matB }]
        })

        renderWithTheme(
            <IdentifyCards
                sourceImageData={{} as ImageData}
                onProcessed={onProcessed}
                overlayRef={overlayRef}
            />
        )

        await waitFor(() => {
            expect(mockLocateWithYOLO).toHaveBeenCalled()
            expect(mockCardClassifierFactory).toHaveBeenCalled()
            expect(mockClassifier).toHaveBeenCalledTimes(2)
            expect(onProcessed).toHaveBeenCalledTimes(1)
        })

        expect(overlayCanvas.width).toBe(321)
        expect(overlayCanvas.height).toBe(123)
        expect(putImageData).toHaveBeenCalled()
        expect(screen.getAllByText('Bulbasaur:normal').length).toBeGreaterThan(
            0
        )
        expect(matA.delete).toHaveBeenCalledTimes(1)
        expect(matB.delete).not.toHaveBeenCalled()
    })

    it('uses iOS server flow and handles missing input canvas', async () => {
        mockGetPlatform.mockReturnValue('ios')
        const errorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => undefined)

        renderWithTheme(
            <IdentifyCards
                sourceImageData={{} as ImageData}
                onProcessed={onProcessed}
                overlayRef={null}
            />
        )

        await waitFor(() => {
            expect(onProcessed).toHaveBeenCalledTimes(1)
            expect(mockCapHttpPost).not.toHaveBeenCalled()
        })

        expect(errorSpy).toHaveBeenCalledWith(
            'Input canvas ref not provided for iOS processing.'
        )
        errorSpy.mockRestore()
    })

    it('uses iOS server flow and renders predicted cards on success', async () => {
        mockGetPlatform.mockReturnValue('ios')
        mockCapHttpPost.mockResolvedValue({
            status: 200,
            data: {
                predictedCards: [
                    { data: cardA, imageURL: 'https://img/a/low.jpg' }
                ]
            }
        })

        const inputCanvasForIOS = {
            current: {
                toDataURL: jest.fn(() => 'data:image/jpeg;base64,abc')
            }
        } as unknown as React.RefObject<HTMLCanvasElement | null>

        renderWithTheme(
            <IdentifyCards
                sourceImageData={{} as ImageData}
                onProcessed={onProcessed}
                overlayRef={null}
                inputCanvasForIOS={inputCanvasForIOS}
            />
        )

        await waitFor(() => {
            expect(mockCapHttpPost).toHaveBeenCalledWith(
                expect.objectContaining({
                    method: 'POST',
                    data: { imageDataUrl: 'data:image/jpeg;base64,abc' }
                })
            )
            expect(onProcessed).toHaveBeenCalledTimes(1)
            expect(screen.getByText('Bulbasaur:normal')).toBeInTheDocument()
        })
    })

    it('stops after iOS server failure and does not call onProcessed', async () => {
        mockGetPlatform.mockReturnValue('ios')
        mockCapHttpPost.mockResolvedValue({
            status: 500,
            data: { message: 'no' }
        })
        const errorSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => undefined)

        const inputCanvasForIOS = {
            current: {
                toDataURL: jest.fn(() => 'data:image/jpeg;base64,abc')
            }
        } as unknown as React.RefObject<HTMLCanvasElement | null>

        renderWithTheme(
            <IdentifyCards
                sourceImageData={{} as ImageData}
                onProcessed={onProcessed}
                overlayRef={null}
                inputCanvasForIOS={inputCanvasForIOS}
            />
        )

        await waitFor(() => {
            expect(mockCapHttpPost).toHaveBeenCalledTimes(1)
        })

        expect(onProcessed).not.toHaveBeenCalled()
        expect(errorSpy).toHaveBeenCalledWith(
            'Failed to identify cards on server:',
            { message: 'no' }
        )

        errorSpy.mockRestore()
    })

    it('removes stale instant-added ids when predictions change', async () => {
        mockGetPlatform.mockReturnValue('ios')
        mockCapHttpPost
            .mockResolvedValueOnce({
                status: 200,
                data: {
                    predictedCards: [{ data: cardA, imageURL: 'a.jpg' }]
                }
            })
            .mockResolvedValueOnce({
                status: 200,
                data: {
                    predictedCards: [{ data: cardB, imageURL: 'b.jpg' }]
                }
            })
            .mockResolvedValueOnce({
                status: 200,
                data: {
                    predictedCards: [{ data: cardA, imageURL: 'a.jpg' }]
                }
            })

        const inputCanvasForIOS = {
            current: {
                toDataURL: jest.fn(() => 'data:image/jpeg;base64,abc')
            }
        } as unknown as React.RefObject<HTMLCanvasElement | null>

        const { rerender } = renderWithTheme(
            <IdentifyCards
                sourceImageData={{} as ImageData}
                onProcessed={onProcessed}
                overlayRef={null}
                inputCanvasForIOS={inputCanvasForIOS}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Bulbasaur:normal')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('Bulbasaur:normal'))

        await waitFor(() => {
            expect(screen.getByText('Bulbasaur:instant')).toBeInTheDocument()
        })

        rerender(
            <IdentifyCards
                sourceImageData={{ x: 2 } as unknown as ImageData}
                onProcessed={onProcessed}
                overlayRef={null}
                inputCanvasForIOS={inputCanvasForIOS}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Ivysaur:normal')).toBeInTheDocument()
        })

        rerender(
            <IdentifyCards
                sourceImageData={{ x: 3 } as unknown as ImageData}
                onProcessed={onProcessed}
                overlayRef={null}
                inputCanvasForIOS={inputCanvasForIOS}
            />
        )

        await waitFor(() => {
            expect(screen.getByText('Bulbasaur:normal')).toBeInTheDocument()
        })
    })
})
