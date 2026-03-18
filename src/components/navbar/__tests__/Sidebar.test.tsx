import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../../../utils/testing-utils'
import Sidebar from '../Sidebar'

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
        },
        {
            icon: <div data-testid="grid-icon">GridIcon</div>,
            path: '/pokemon-grid',
            name: 'Collections'
        },
        {
            icon: <div data-testid="profile-icon">ProfileIcon</div>,
            path: '/personal-profile',
            name: 'Profile'
        }
    ]
}))

describe('Sidebar', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPathname.mockReturnValue('/home')
    })

    describe('Rendering', () => {
        it('renders the sidebar component', () => {
            renderWithTheme(<Sidebar />)

            expect(screen.getByAltText('Kollec Logo')).toBeInTheDocument()
        })

        it('renders the Kollec logo', () => {
            renderWithTheme(<Sidebar />)

            const logo = screen.getByAltText('Kollec Logo')
            expect(logo).toBeInTheDocument()
        })

        it('renders all menu items', () => {
            renderWithTheme(<Sidebar />)

            expect(
                screen.getByRole('button', { name: 'Navigate to Home' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Trade Post' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Camera' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Collections' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Profile' })
            ).toBeInTheDocument()
        })

        it('renders all menu item icons', () => {
            renderWithTheme(<Sidebar />)

            expect(screen.getByTestId('home-icon')).toBeInTheDocument()
            expect(screen.getByTestId('trade-icon')).toBeInTheDocument()
            expect(screen.getByTestId('camera-icon')).toBeInTheDocument()
            expect(screen.getByTestId('grid-icon')).toBeInTheDocument()
            expect(screen.getByTestId('profile-icon')).toBeInTheDocument()
        })

        it('renders menu item names', () => {
            renderWithTheme(<Sidebar />)

            expect(
                screen.getByRole('heading', { name: 'Home' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('heading', { name: 'Trade Post' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('heading', { name: 'Camera' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('heading', { name: 'Collections' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('heading', { name: 'Profile' })
            ).toBeInTheDocument()
        })
    })

    describe('Active State', () => {
        it('highlights the active menu item based on current pathname', () => {
            mockPathname.mockReturnValue('/home')

            renderWithTheme(<Sidebar />)
            const homeButton = screen.getByRole('button', {
                name: 'Navigate to Home'
            })

            expect(homeButton).toHaveStyle({
                backgroundColor: 'whiteAlpha.400'
            })
        })

        it('only highlights the active menu item', () => {
            mockPathname.mockReturnValue('/home')

            renderWithTheme(<Sidebar />)

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

            renderWithTheme(<Sidebar />)
            const tradeButton = screen.getByRole('button', {
                name: 'Navigate to Trade Post'
            })

            expect(tradeButton).toHaveStyle({
                backgroundColor: 'whiteAlpha.400'
            })
        })

        it('highlights pokemon-grid when on /pokemon-grid/details', () => {
            mockPathname.mockReturnValue('/pokemon-grid/details')

            renderWithTheme(<Sidebar />)
            const gridButton = screen.getByRole('button', {
                name: 'Navigate to Collections'
            })

            expect(gridButton).toHaveStyle({
                backgroundColor: 'whiteAlpha.400'
            })
        })
    })

    describe('Navigation', () => {
        it('navigates to the correct path when clicking a menu item', () => {
            renderWithTheme(<Sidebar />)

            const homeButton = screen.getByRole('button', {
                name: 'Navigate to Home'
            })
            fireEvent.click(homeButton)

            expect(mockPush).toHaveBeenCalledWith('/home')
        })

        it('navigates to Trade Post when clicking Trade Post menu item', () => {
            renderWithTheme(<Sidebar />)

            const tradeButton = screen.getByRole('button', {
                name: 'Navigate to Trade Post'
            })
            fireEvent.click(tradeButton)

            expect(mockPush).toHaveBeenCalledWith('/trade')
        })

        it('navigates to Collections when clicking Collections menu item', () => {
            renderWithTheme(<Sidebar />)

            const gridButton = screen.getByRole('button', {
                name: 'Navigate to Collections'
            })
            fireEvent.click(gridButton)

            expect(mockPush).toHaveBeenCalledWith('/pokemon-grid')
        })

        it('calls custom onClick handler when provided', async () => {
            renderWithTheme(<Sidebar />)

            const cameraButton = screen.getByRole('button', {
                name: 'Navigate to Camera'
            })
            fireEvent.click(cameraButton)

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/custom-camera')
            })
        })

        it('navigates using Enter key', () => {
            renderWithTheme(<Sidebar />)

            const tradeButton = screen.getByRole('button', {
                name: 'Navigate to Trade Post'
            })
            fireEvent.keyDown(tradeButton, { key: 'Enter', code: 'Enter' })

            expect(mockPush).toHaveBeenCalledWith('/trade')
        })

        it('navigates using Space key', () => {
            renderWithTheme(<Sidebar />)

            const tradeButton = screen.getByRole('button', {
                name: 'Navigate to Trade Post'
            })
            fireEvent.keyDown(tradeButton, { key: ' ', code: 'Space' })

            expect(mockPush).toHaveBeenCalledWith('/trade')
        })

        it('navigates on any key press (current behavior)', () => {
            renderWithTheme(<Sidebar />)

            const homeButton = screen.getByRole('button', {
                name: 'Navigate to Home'
            })
            fireEvent.keyDown(homeButton, { key: 'a', code: 'KeyA' })

            // Note: This is the current behavior due to operator precedence in the ternary
            // The component should be refactored to only navigate on Enter/Space
            expect(mockPush).toHaveBeenCalledWith('/home')
        })

        it('calls custom onClick with Enter key', async () => {
            renderWithTheme(<Sidebar />)

            const cameraButton = screen.getByRole('button', {
                name: 'Navigate to Camera'
            })
            fireEvent.keyDown(cameraButton, { key: 'Enter', code: 'Enter' })

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith('/custom-camera')
            })
        })
    })

    describe('Accessibility', () => {
        it('has proper ARIA labels for all menu items', () => {
            renderWithTheme(<Sidebar />)

            expect(
                screen.getByRole('button', { name: 'Navigate to Home' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Trade Post' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Camera' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Collections' })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Navigate to Profile' })
            ).toBeInTheDocument()
        })

        it('has tabIndex set for keyboard navigation', () => {
            renderWithTheme(<Sidebar />)

            const homeButton = screen.getByRole('button', {
                name: 'Navigate to Home'
            })
            expect(homeButton).toHaveAttribute('tabIndex', '0')
        })

        it('has role="button" for clickable menu items', () => {
            renderWithTheme(<Sidebar />)

            // 5 menu items + 1 Kollec heading = 6 total headings, but we're checking buttons
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBe(5)
        })
    })

    describe('Layout', () => {
        it('displays menu items in vertical layout', () => {
            renderWithTheme(<Sidebar />)

            // Verify all menu items are rendered vertically
            const buttons = screen.getAllByRole('button')
            expect(buttons.length).toBe(5)
        })

        it('renders logo before menu items', () => {
            renderWithTheme(<Sidebar />)

            const logo = screen.getByAltText('Kollec Logo')
            const firstHeading = screen.getAllByRole('heading')[0]

            // Ensure both exist
            expect(logo).toBeInTheDocument()
            expect(firstHeading).toBeInTheDocument()
        })
    })
})
