import { renderWithTheme } from '@/utils/testing-utils'
import { screen, waitFor, fireEvent, act } from '@testing-library/react'
import CameraPage from '../page'
import { useAuth } from '@/context/AuthProvider'
import { Session, User } from '@supabase/supabase-js'
import { Camera } from '@capacitor/camera'
import { CameraPreview } from '@capacitor-community/camera-preview'
import { Capacitor } from '@capacitor/core'
import { releaseModel } from '@/utils/identification/loadModel'

jest.mock('../../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

const mockedUseAuth = jest.mocked(useAuth)

// Mock Capacitor
jest.mock('@capacitor/core', () => ({
    Capacitor: {
        getPlatform: jest.fn().mockReturnValue('web'),
        isNativePlatform: jest.fn().mockReturnValue(false),
        convertFileSrc: jest.fn((src: string) => src)
    }
}))

const mockedCapacitor = jest.mocked(Capacitor)

// Mock Camera
jest.mock('@capacitor/camera', () => ({
    Camera: {
        requestPermissions: jest.fn().mockResolvedValue({ camera: 'granted' })
    }
}))

const mockedCamera = jest.mocked(Camera)

// Mock CameraPreview
jest.mock('@capacitor-community/camera-preview', () => ({
    CameraPreview: {
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
        capture: jest.fn().mockResolvedValue({ value: 'test-image-path' }),
        flip: jest.fn().mockResolvedValue(undefined)
    }
}))

const mockedCameraPreview = jest.mocked(CameraPreview)

// Mock releaseModel
jest.mock('../../../utils/identification/loadModel', () => ({
    releaseModel: jest.fn()
}))

const mockedReleaseModel = jest.mocked(releaseModel)

// Mock IdentifyCards component
let capturedOnProcessed: (() => void) | null = null
jest.mock('../../../components/cv/IdentifyCards', () => ({
    IdentifyCards: ({
        sourceImageData,
        onProcessed
    }: {
        sourceImageData: ImageData | null
        onProcessed: () => void
    }) => {
        capturedOnProcessed = onProcessed
        return (
            <div data-testid="identify-cards">
                {sourceImageData ? 'Image Data Available' : 'No Image Data'}
            </div>
        )
    }
}))

// Mock TipsPopup
const mockTipsPopupOpen = jest.fn()
const mockTipsPopupClose = jest.fn()
jest.mock('../../../components/ui/PopupUI', () => ({
    __esModule: true,
    default: {
        open: (...args: unknown[]) => mockTipsPopupOpen(...args),
        close: (...args: unknown[]) => mockTipsPopupClose(...args),
        Viewport: () => <div data-testid="tips-popup-viewport" />
    }
}))

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn()
const mockStopTrack = jest.fn()

Object.defineProperty(global.navigator, 'mediaDevices', {
    value: {
        getUserMedia: mockGetUserMedia
    },
    writable: true
})

const baseAuthContext = {
    session: {
        user: {
            id: 'user-1',
            email: 'test@email.com'
        } as User,
        access_token: 'token-123'
    } as Session,
    signOut: jest.fn(),
    signUp: jest.fn(),
    signIn: jest.fn(),
    loading: false,
    signInWithGoogle: jest.fn(),
    deleteAccount: jest.fn()
}

describe('CameraPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        capturedOnProcessed = null
        mockGetUserMedia.mockResolvedValue({
            getTracks: () => [{ stop: mockStopTrack }]
        })
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders loading spinner when auth is loading', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            loading: true
        })

        renderWithTheme(<CameraPage />)
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders loading spinner when session is null', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            session: null
        })

        renderWithTheme(<CameraPage />)
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders camera page when session is available', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        expect(
            screen.getByRole('button', { name: /start camera/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /switch camera/i })
        ).toBeInTheDocument()
    })

    it('shows TipsPopup viewport', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        expect(screen.getByTestId('tips-popup-viewport')).toBeInTheDocument()
    })

    it('opens tips popup on mount when session is available', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        await waitFor(() => {
            expect(mockTipsPopupOpen).toHaveBeenCalledWith(
                'camera-tips',
                expect.objectContaining({
                    title: 'Scanning Tips',
                    description:
                        'For better card recognition, follow these tips:'
                })
            )
        })
    })

    it('does not open tips popup when loading', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            loading: true
        })

        renderWithTheme(<CameraPage />)

        expect(mockTipsPopupOpen).not.toHaveBeenCalled()
    })

    it('does not open tips popup when session is null', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            session: null
        })

        renderWithTheme(<CameraPage />)

        expect(mockTipsPopupOpen).not.toHaveBeenCalled()
    })

    it('shows "No image captured" when no sourceImageData', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        expect(screen.getByText('No image captured.')).toBeInTheDocument()
    })

    it('renders video element for non-iOS platforms', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const video = document.querySelector('video')
        expect(video).toBeInTheDocument()
    })

    it('renders start camera button when camera is not active', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        expect(
            screen.getByRole('button', { name: /start camera/i })
        ).toBeInTheDocument()
    })

    it('renders switch camera button', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        expect(
            screen.getByRole('button', { name: /switch camera/i })
        ).toBeInTheDocument()
    })

    it('handles switch camera button click', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const switchButton = screen.getByRole('button', {
            name: /switch camera/i
        })
        fireEvent.click(switchButton)

        // The toggle should work without errors
        expect(switchButton).toBeInTheDocument()
    })

    it('renders canvas overlay element', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const canvas = document.querySelector('canvas')
        expect(canvas).toBeInTheDocument()
    })

    it('renders camera preview container with correct id', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const cameraPreview = document.getElementById('cameraPreview')
        expect(cameraPreview).toBeInTheDocument()
    })

    it('shows no image message when sourceImageData is null', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        // When no image is captured, we see this message instead of IdentifyCards
        expect(screen.getByText('No image captured.')).toBeInTheDocument()
    })

    it('starts camera when start button is clicked', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })
        await act(async () => {
            fireEvent.click(startButton)
        })

        expect(mockedCamera.requestPermissions).toHaveBeenCalledWith({
            permissions: ['camera', 'photos']
        })
        expect(mockGetUserMedia).toHaveBeenCalledWith({
            audio: false,
            video: {
                facingMode: 'environment',
                frameRate: { ideal: 20 },
                width: { ideal: 1280 },
                height: { ideal: 1280 }
            }
        })
    })

    it('handles camera permission error gracefully', async () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockedCamera.requestPermissions.mockRejectedValueOnce(
            new Error('Permission denied')
        )
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })
        await act(async () => {
            fireEvent.click(startButton)
        })

        expect(consoleSpy).toHaveBeenCalledWith(
            'Error requesting camera permissions',
            expect.any(Error)
        )
        consoleSpy.mockRestore()
    })

    it('ignores "Not implemented on web" permission error', async () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockedCamera.requestPermissions.mockRejectedValueOnce(
            new Error('Not implemented on web')
        )
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })
        await act(async () => {
            fireEvent.click(startButton)
        })

        // Should not log error for "Not implemented on web"
        expect(consoleSpy).not.toHaveBeenCalledWith(
            'Error requesting camera permissions',
            expect.any(Error)
        )
        consoleSpy.mockRestore()
    })

    it('handles camera access error gracefully', async () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockGetUserMedia.mockRejectedValueOnce(
            new Error('Camera access denied')
        )
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })
        await act(async () => {
            fireEvent.click(startButton)
        })

        expect(consoleSpy).toHaveBeenCalledWith(
            'Error accessing camera',
            expect.any(Error)
        )
        consoleSpy.mockRestore()
    })

    it('releases model on unmount', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        const { unmount } = renderWithTheme(<CameraPage />)
        unmount()

        expect(mockedReleaseModel).toHaveBeenCalled()
    })

    it('stops stream on unmount', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        const { unmount } = renderWithTheme(<CameraPage />)

        // Start camera first
        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })
        await act(async () => {
            fireEvent.click(startButton)
        })

        unmount()

        expect(mockStopTrack).toHaveBeenCalled()
    })

    it('calls onClickClose when tips popup close is triggered', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        await waitFor(() => {
            expect(mockTipsPopupOpen).toHaveBeenCalled()
        })

        // Get the onClickClose callback that was passed
        const openCall = mockTipsPopupOpen.mock.calls[0]
        const options = openCall[1] as { onClickClose: () => void }
        options.onClickClose()

        expect(mockTipsPopupClose).toHaveBeenCalledWith('camera-tips')
    })

    it('handles video processing when camera is active', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        // Create a mock video element with proper properties
        const mockVideo = document.createElement('video')
        Object.defineProperty(mockVideo, 'videoWidth', { value: 640 })
        Object.defineProperty(mockVideo, 'videoHeight', { value: 480 })
        Object.defineProperty(mockVideo, 'paused', { value: false })
        Object.defineProperty(mockVideo, 'ended', { value: false })

        renderWithTheme(<CameraPage />)

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })

        await act(async () => {
            fireEvent.click(startButton)
            jest.advanceTimersByTime(100)
        })

        // handleProcessed should have been called after starting camera
        expect(mockGetUserMedia).toHaveBeenCalled()
    })

    it('does not process when camera is not active', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        // Manually trigger onProcessed without starting camera
        if (capturedOnProcessed) {
            await act(async () => {
                capturedOnProcessed!()
                jest.advanceTimersByTime(100)
            })
        }

        // No image should be set since camera wasn't started
        expect(screen.getByText('No image captured.')).toBeInTheDocument()
    })

    it('processes frame when video is playing', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        // Mock play to resolve successfully
        HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined)

        const mockCtx = {
            drawImage: jest.fn(),
            getImageData: jest.fn(() => ({
                data: new Uint8ClampedArray(4),
                width: 320,
                height: 320
            }))
        }
        const getContextSpy = jest
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)

        renderWithTheme(<CameraPage />)

        const video = document.querySelector('video') as HTMLVideoElement
        Object.defineProperty(video, 'videoWidth', { value: 640 })
        Object.defineProperty(video, 'videoHeight', { value: 480 })
        Object.defineProperty(video, 'paused', { value: false })
        Object.defineProperty(video, 'ended', { value: false })

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })

        await act(async () => {
            fireEvent.click(startButton)
        })

        // Simulate the callback chain
        await act(async () => {
            jest.advanceTimersByTime(200)
        })

        expect(mockGetUserMedia).toHaveBeenCalled()
        expect(mockCtx.drawImage).toHaveBeenCalled()
        expect(screen.getByText('Image Data Available')).toBeInTheDocument()

        getContextSpy.mockRestore()
    })

    it('handles video paused state correctly', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined)

        renderWithTheme(<CameraPage />)

        const video = document.querySelector('video')
        if (video) {
            Object.defineProperty(video, 'paused', { value: true })
        }

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })

        await act(async () => {
            fireEvent.click(startButton)
        })

        // No crash should occur
        expect(startButton).toBeInTheDocument()
    })

    it('handles video ended state correctly', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue(undefined)

        renderWithTheme(<CameraPage />)

        const video = document.querySelector('video')
        if (video) {
            Object.defineProperty(video, 'ended', { value: true })
        }

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })

        await act(async () => {
            fireEvent.click(startButton)
        })

        expect(startButton).toBeInTheDocument()
    })
})

describe('CameraPage - iOS Native', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.useFakeTimers()
        capturedOnProcessed = null
        mockedCapacitor.getPlatform.mockReturnValue('ios')
        mockedCapacitor.isNativePlatform.mockReturnValue(true)
    })

    afterEach(() => {
        mockedCapacitor.getPlatform.mockReturnValue('web')
        mockedCapacitor.isNativePlatform.mockReturnValue(false)
        jest.useRealTimers()
    })

    it('does not render video element on iOS native', () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const video = document.querySelector('video')
        expect(video).not.toBeInTheDocument()
    })

    it('starts CameraPreview on iOS native', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })
        await act(async () => {
            fireEvent.click(startButton)
        })

        expect(mockedCameraPreview.start).toHaveBeenCalledWith({
            parent: 'cameraPreview',
            position: 'rear',
            toBack: false,
            disableAudio: true,
            storeToFile: true,
            enableOpacity: false,
            height: 300,
            width: 300
        })
    })

    it('flips camera on iOS native when switch is clicked', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const switchButton = screen.getByRole('button', {
            name: /switch camera/i
        })
        await act(async () => {
            fireEvent.click(switchButton)
        })

        expect(mockedCameraPreview.flip).toHaveBeenCalled()
    })

    it('handles flip camera error gracefully', async () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockedCameraPreview.flip.mockRejectedValueOnce(new Error('Flip failed'))
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<CameraPage />)

        const switchButton = screen.getByRole('button', {
            name: /switch camera/i
        })
        await act(async () => {
            fireEvent.click(switchButton)
        })

        expect(consoleSpy).toHaveBeenCalledWith(
            'Error flipping camera',
            expect.any(Error)
        )
        consoleSpy.mockRestore()
    })

    it('stops CameraPreview on unmount for iOS', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        const { unmount } = renderWithTheme(<CameraPage />)

        // Start camera first
        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })
        await act(async () => {
            fireEvent.click(startButton)
        })

        unmount()

        expect(mockedCameraPreview.stop).toHaveBeenCalled()
    })

    it('handles stop camera error gracefully', async () => {
        const consoleSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {})
        mockedCameraPreview.stop.mockRejectedValueOnce(new Error('Stop failed'))
        mockedUseAuth.mockReturnValue(baseAuthContext)

        const { unmount } = renderWithTheme(<CameraPage />)

        // Start camera first
        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })
        await act(async () => {
            fireEvent.click(startButton)
        })

        unmount()

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith(
                'Error stopping camera preview',
                expect.any(Error)
            )
        })
        consoleSpy.mockRestore()
    })

    it('captures image on iOS native during handleProcessed', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        const OriginalImage = global.Image
        class MockImage {
            width = 720
            height = 720
            crossOrigin = ''
            onload: null | (() => void) = null
            onerror: null | (() => void) = null

            set src(_value: string) {
                if (this.onload) this.onload()
            }
        }
        // @ts-expect-error test-only mock
        global.Image = MockImage

        const mockCtx = {
            drawImage: jest.fn(),
            getImageData: jest.fn(() => ({
                data: new Uint8ClampedArray(4),
                width: 320,
                height: 320
            }))
        }
        const getContextSpy = jest
            .spyOn(HTMLCanvasElement.prototype, 'getContext')
            .mockReturnValue(mockCtx as unknown as CanvasRenderingContext2D)

        renderWithTheme(<CameraPage />)

        const startButton = screen.getByRole('button', {
            name: /start camera/i
        })
        await act(async () => {
            fireEvent.click(startButton)
        })

        // Advance timers to trigger handleProcessed
        await act(async () => {
            jest.advanceTimersByTime(200)
        })

        expect(mockedCameraPreview.capture).toHaveBeenCalledWith({
            quality: 90,
            width: 1280,
            height: 1280
        })
        expect(mockCtx.drawImage).toHaveBeenCalled()
        expect(screen.getByText('Image Data Available')).toBeInTheDocument()

        getContextSpy.mockRestore()
        global.Image = OriginalImage
    })
})
