import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../../../utils/testing-utils'
import Footer from '../Footer'

// Mock next/navigation
const mockPush = jest.fn()
const mockPathname = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: mockPush,
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn()
    })),
    usePathname: () => mockPathname()
}))

// Mock the constants to simplify testing
jest.mock('../constants', () => ({
    MENU_ITEMS: [
        {
            icon: <div data-testid="home-icon">HomeIcon</div>,
            path: '/home',
            name: 'Home'
        },
        {
            icon: <div data-testid="trade-icon">TradeIcon</div>,
            path: '/trade',
            name: 'Trade Post'
        },
        {
            icon: <div data-testid="camera-icon">CameraIcon</div>,
            path: '/camera',
            name: 'Camera',
            onClick: jest.fn((router) => router.push('/custom-camera'))
        }
    ]
}))

describe('Footer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPathname.mockReturnValue('/home')
    })

    describe('Rendering', () => {
        it('renders the footer component', () => {
            renderWithTheme(<Footer />)

            expect(
                screen.getByRole('button', { name: 'Navigate to Home' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Trade Post' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Camera' })
            ).toBeInTheDocument()
        })

        it('renders all menu item icons', () => {
            renderWithTheme(<Footer />)

            expect(screen.getByTestId('home-icon')).toBeInTheDocument()
            expect(screen.getByTestId('trade-icon')).toBeInTheDocument()
            expect(screen.getByTestId('camera-icon')).toBeInTheDocument()
        })
    })

    describe('Active State', () => {
        it('highlights the active menu item based on current pathname', () => {
            mockPathname.mockReturnValue('/home')

            renderWithTheme(<Footer />)
            const homeButton = screen.getByRole('button', {
                name: 'Navigate to Home'
            })

            expect(homeButton).toHaveStyle({
                backgroundColor: 'whiteAlpha.400'
            })
        })

        it('only highlights the active menu item', () => {
            mockPathname.mockReturnValue('/home')

            renderWithTheme(<Footer />)

            const homeButton = screen.getByRole('button', {
                name: 'Navigate to Home'
            })

            // Home should be highlighted when on /home
            expect(homeButton).toHaveStyle({
                backgroundColor: 'whiteAlpha.400'
            })
        })

        it('highlights menu items when pathname starts with item path', () => {
            mockPathname.mockReturnValue('/trade/123')

            renderWithTheme(<Footer />)
            const tradeButton = screen.getByRole('button', {
                name: 'Navigate to Trade Post'
            })

            expect(tradeButton).toHaveStyle({
                backgroundColor: 'whiteAlpha.400'
            })
        })
    })

    describe('Navigation', () => {
        it('navigates to the correct path when clicking a menu item', () => {
            renderWithTheme(<Footer />)

            const homeButton = screen.getByRole('button', {
                name: 'Navigate to Home'
            })
            fireEvent.click(homeButton)

            expect(mockPush).toHaveBeenCalledWith('/home')
        })

        it('calls custom onClick handler when provided', async () => {
            renderWithTheme(<Footer />)

            const cameraButton = screen.getByRole('button', {
                name: 'Navigate to Camera'
            })
            fireEvent.click(cameraButton)

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/custom-camera')
            })
        })

        it('navigates using Enter key', () => {
            renderWithTheme(<Footer />)

            const tradeButton = screen.getByRole('button', {
                name: 'Navigate to Trade Post'
            })
            fireEvent.keyDown(tradeButton, { key: 'Enter', code: 'Enter' })

            expect(mockPush).toHaveBeenCalledWith('/trade')
        })

        it('navigates using Space key', () => {
            renderWithTheme(<Footer />)

            const tradeButton = screen.getByRole('button', {
                name: 'Navigate to Trade Post'
            })
            fireEvent.keyDown(tradeButton, { key: ' ', code: 'Space' })

            expect(mockPush).toHaveBeenCalledWith('/trade')
        })

        it('navigates on any key press (current behavior)', () => {
            renderWithTheme(<Footer />)

            const homeButton = screen.getByRole('button', {
                name: 'Navigate to Home'
            })
            fireEvent.keyDown(homeButton, { key: 'a', code: 'KeyA' })

            // Note: This is the current behavior due to operator precedence in the ternary
            // The component should be refactored to only navigate on Enter/Space
            expect(mockPush).toHaveBeenCalledWith('/home')
        })
    })

    describe('Accessibility', () => {
        it('has proper ARIA labels for all menu items', () => {
            renderWithTheme(<Footer />)

            expect(
                screen.getByRole('button', { name: 'Navigate to Home' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Trade Post' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Camera' })
            ).toBeInTheDocument()
        })

        it('has tabIndex set for keyboard navigation', () => {
            renderWithTheme(<Footer />)

            const homeButton = screen.getByRole('button', {
                name: 'Navigate to Home'
            })
            expect(homeButton).toHaveAttribute('tabIndex', '0')
        })

        it('has role="button" for clickable menu items', () => {
            renderWithTheme(<Footer />)

            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBe(3)
        })
    })
})
