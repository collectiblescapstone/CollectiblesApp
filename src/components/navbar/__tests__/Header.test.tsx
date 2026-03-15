import { fireEvent, screen } from '@testing-library/react'
import { renderWithTheme } from '../../../utils/testing-utils'
import Header from '../Header'
import * as HeaderProvider from '../../../context/HeaderProvider'

// Mock next/navigation
const mockBack = jest.fn()
const mockPathname = jest.fn()

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        back: mockBack,
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn()
    })),
    usePathname: () => mockPathname()
}))

// Mock HeaderProvider
const mockSetProfileID = jest.fn()
let mockProfileId = 'Kollec'

jest.mock('../../../context/HeaderProvider', () => ({
    useHeader: jest.fn(() => ({
        profileId: mockProfileId,
        setProfileID: mockSetProfileID
    }))
}))

const mockUseHeader = HeaderProvider.useHeader as jest.MockedFunction<
    typeof HeaderProvider.useHeader
>

// Mock the constants
jest.mock('../constants', () => ({
    PAGE_HEADINGS: {
        '/home': 'kollec',
        '/trade': 'TradePost',
        '/pokemon-grid': 'kollections',
        '/camera': 'camera',
        '/personal-profile': 'profile'
    }
}))

// Mock react-icons
jest.mock('react-icons/lu', () => ({
    LuStepBack: jest.fn(({ onClick, onKeyDown, ...props }) => (
        <div
            data-testid="back-button"
            onClick={onClick}
            onKeyDown={onKeyDown}
            {...props}
        >
            BackIcon
        </div>
    ))
}))

describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockPathname.mockReturnValue('/home')
        mockProfileId = 'Kollec'
    })

    describe('Rendering', () => {
        it('renders the header component', () => {
            renderWithTheme(<Header />)

            expect(screen.getByRole('heading')).toBeInTheDocument()
        })

        it('displays the correct page heading for /home', () => {
            mockPathname.mockReturnValue('/home')

            renderWithTheme(<Header />)

            expect(screen.getByRole('heading')).toHaveTextContent('kollec')
        })

        it('displays the correct page heading for /trade', () => {
            mockPathname.mockReturnValue('/trade')

            renderWithTheme(<Header />)

            expect(screen.getByRole('heading')).toHaveTextContent('TradePost')
        })

        it('displays the correct page heading for /pokemon-grid', () => {
            mockPathname.mockReturnValue('/pokemon-grid')

            renderWithTheme(<Header />)

            expect(screen.getByRole('heading')).toHaveTextContent('kollections')
        })

        it('displays the correct page heading for /camera', () => {
            mockPathname.mockReturnValue('/camera')

            renderWithTheme(<Header />)

            expect(screen.getByRole('heading')).toHaveTextContent('camera')
        })

        it('displays profileId for /personal-profile (includes "profile")', () => {
            mockPathname.mockReturnValue('/personal-profile')

            renderWithTheme(<Header />)

            // Since pathname includes 'profile', it displays profileId instead of PAGE_HEADINGS value
            expect(screen.getByRole('heading')).toHaveTextContent('Kollec')
        })
    })

    describe('Profile Page Handling', () => {
        it('displays profileId when pathname includes "profile"', () => {
            mockProfileId = 'TestUser123'
            mockUseHeader.mockReturnValue({
                profileId: mockProfileId,
                setProfileID: mockSetProfileID
            })

            mockPathname.mockReturnValue('/profile/user123')

            renderWithTheme(<Header />)

            expect(screen.getByRole('heading')).toHaveTextContent('TestUser123')
        })

        it('displays profileId for uppercase PROFILE in pathname', () => {
            mockProfileId = 'AnotherUser'
            mockUseHeader.mockReturnValue({
                profileId: mockProfileId,
                setProfileID: mockSetProfileID
            })

            mockPathname.mockReturnValue('/PROFILE/456')

            renderWithTheme(<Header />)

            expect(screen.getByRole('heading')).toHaveTextContent('AnotherUser')
        })
    })

    describe('Back Button', () => {
        it('does not show back button for pages in PAGE_HEADINGS', () => {
            mockPathname.mockReturnValue('/home')

            renderWithTheme(<Header />)

            expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
        })

        it('shows back button for pages not in PAGE_HEADINGS', () => {
            mockPathname.mockReturnValue('/some-other-page')

            renderWithTheme(<Header />)

            expect(screen.getByTestId('back-button')).toBeInTheDocument()
        })

        it('calls router.back() when clicking back button', () => {
            mockPathname.mockReturnValue('/some-other-page')

            renderWithTheme(<Header />)

            const backButton = screen.getByTestId('back-button')
            fireEvent.click(backButton)

            expect(mockBack).toHaveBeenCalledTimes(1)
        })

        it('calls router.back() when pressing Enter on back button', () => {
            mockPathname.mockReturnValue('/some-other-page')

            renderWithTheme(<Header />)

            const backButton = screen.getByTestId('back-button')
            fireEvent.keyDown(backButton, { key: 'Enter', code: 'Enter' })

            expect(mockBack).toHaveBeenCalledTimes(1)
        })

        it('calls router.back() when pressing Space on back button', () => {
            mockPathname.mockReturnValue('/some-other-page')

            renderWithTheme(<Header />)

            const backButton = screen.getByTestId('back-button')
            fireEvent.keyDown(backButton, { key: ' ', code: 'Space' })

            expect(mockBack).toHaveBeenCalledTimes(1)
        })

        it('does not call router.back() on other key presses', () => {
            mockPathname.mockReturnValue('/some-other-page')

            renderWithTheme(<Header />)

            const backButton = screen.getByTestId('back-button')
            fireEvent.keyDown(backButton, { key: 'a', code: 'KeyA' })

            expect(mockBack).not.toHaveBeenCalled()
        })
    })

    describe('Back Button Visibility Logic', () => {
        it('hides back button for /home', () => {
            mockPathname.mockReturnValue('/home')
            renderWithTheme(<Header />)
            expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
        })

        it('hides back button for /trade', () => {
            mockPathname.mockReturnValue('/trade')
            renderWithTheme(<Header />)
            expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
        })

        it('hides back button for /pokemon-grid', () => {
            mockPathname.mockReturnValue('/pokemon-grid')
            renderWithTheme(<Header />)
            expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
        })

        it('hides back button for /camera', () => {
            mockPathname.mockReturnValue('/camera')
            renderWithTheme(<Header />)
            expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
        })

        it('hides back button for /personal-profile', () => {
            mockPathname.mockReturnValue('/personal-profile')
            renderWithTheme(<Header />)
            expect(screen.queryByTestId('back-button')).not.toBeInTheDocument()
        })

        it('shows back button for /settings', () => {
            mockPathname.mockReturnValue('/settings')
            renderWithTheme(<Header />)
            expect(screen.getByTestId('back-button')).toBeInTheDocument()
        })
    })

    describe('Accessibility', () => {
        it('has proper aria-label on back button', () => {
            mockPathname.mockReturnValue('/settings')

            renderWithTheme(<Header />)

            const backButton = screen.getByTestId('back-button')
            expect(backButton).toHaveAttribute('aria-label', 'Go back')
        })

        it('has tabIndex on back button for keyboard navigation', () => {
            mockPathname.mockReturnValue('/settings')

            renderWithTheme(<Header />)

            const backButton = screen.getByTestId('back-button')
            expect(backButton).toHaveAttribute('tabIndex', '0')
        })

        it('has role="button" on back button', () => {
            mockPathname.mockReturnValue('/settings')

            renderWithTheme(<Header />)

            const backButton = screen.getByTestId('back-button')
            expect(backButton).toHaveAttribute('role', 'button')
        })
    })
})
