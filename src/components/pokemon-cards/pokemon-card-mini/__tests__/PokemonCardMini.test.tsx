import { fireEvent, screen, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../../../../utils/testing-utils'
import PokemonCardMini from '../PokemonCardMini'
import * as wishlistQueries from '../../../../utils/wishlist/wishlistQueries'
import * as AuthProvider from '../../../../context/AuthProvider'

type LinkLikeProps = {
    children: React.ReactNode
    href: string | { pathname?: string }
    onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

// Mock next/link
jest.mock('next/link', () => {
    const MockLink = ({ children, href, onClick }: LinkLikeProps) => {
        return (
            <a
                href={typeof href === 'string' ? href : href.pathname}
                onClick={onClick}
            >
                {children}
            </a>
        )
    }
    MockLink.displayName = 'MockLink'
    return MockLink
})

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush
    })
}))

// Mock AuthProvider
const mockSession = {
    user: { id: 'test-user-123' },
    access_token: 'test-token'
}

jest.mock('../../../../context/AuthProvider', () => ({
    useAuth: jest.fn(() => ({
        session: mockSession
    }))
}))

const mockUseAuth = AuthProvider.useAuth as jest.MockedFunction<
    typeof AuthProvider.useAuth
>
type AuthState = ReturnType<typeof AuthProvider.useAuth>

// Mock wishlist utilities
jest.mock('../../../../utils/wishlist/wishlistQueries', () => ({
    updateWishlist: jest.fn()
}))

const mockUpdateWishlist =
    wishlistQueries.updateWishlist as jest.MockedFunction<
        typeof wishlistQueries.updateWishlist
    >

describe('PokemonCardMini', () => {
    const defaultProps = {
        cardId: 'sv01-001',
        cardName: 'Pikachu',
        image: 'https://example.com/pikachu.png',
        cardSetId: 'SV01-001',
        cardOwned: true,
        wishlist: false
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('Rendering', () => {
        it('renders the card with name and ID', () => {
            renderWithTheme(<PokemonCardMini {...defaultProps} />)

            expect(screen.getByText('Pikachu')).toBeInTheDocument()
            expect(screen.getByText('SV01-001')).toBeInTheDocument()
        })

        it('renders the card image', () => {
            renderWithTheme(<PokemonCardMini {...defaultProps} />)

            const image = screen.getByAltText('Pikachu')
            expect(image).toBeInTheDocument()
            expect(image).toHaveAttribute(
                'src',
                'https://example.com/pikachu.png'
            )
        })

        it('renders fallback image when image is undefined/low.png', () => {
            renderWithTheme(
                <PokemonCardMini {...defaultProps} image="undefined/low.png" />
            )

            const image = screen.getByAltText('Pikachu')
            expect(image).toHaveAttribute('src', '/Images/PokemonCardBack.jpg')
        })

        it('renders fallback image when image is empty string', () => {
            renderWithTheme(<PokemonCardMini {...defaultProps} image="" />)

            const image = screen.getByAltText('Pikachu')
            expect(image).toHaveAttribute('src', '/Images/PokemonCardBack.jpg')
        })

        it('has correct aria-label', () => {
            renderWithTheme(<PokemonCardMini {...defaultProps} />)

            const button = screen.getByRole('button', { name: 'Pikachu' })
            expect(button).toBeInTheDocument()
        })
    })

    describe('Owned Card Behavior', () => {
        it('renders owned card with full opacity', () => {
            renderWithTheme(
                <PokemonCardMini {...defaultProps} cardOwned={true} />
            )

            const image = screen.getByAltText('Pikachu')
            expect(image).toHaveStyle({ opacity: 1 })
        })

        it('does not show plus icon for owned cards', () => {
            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} cardOwned={true} />
            )

            const plusIcon = container.querySelector('svg')
            expect(plusIcon).not.toBeInTheDocument()
        })

        it('links to /user-cards for owned cards', () => {
            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} cardOwned={true} />
            )

            const link = container.querySelector('a')
            expect(link).toHaveAttribute('href', '/user-cards')
        })
    })

    describe('Unowned Card Behavior', () => {
        it('renders unowned card with reduced opacity', () => {
            renderWithTheme(
                <PokemonCardMini {...defaultProps} cardOwned={false} />
            )

            const image = screen.getByAltText('Pikachu')
            expect(image).toHaveStyle({ opacity: 0.4 })
        })

        it('shows plus icon overlay for unowned cards', () => {
            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} cardOwned={false} />
            )

            const plusIcon = container.querySelector('svg')
            expect(plusIcon).toBeInTheDocument()
        })

        it('links to /edit-card for unowned cards', () => {
            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} cardOwned={false} />
            )

            const link = container.querySelector('a')
            expect(link).toHaveAttribute('href', '/edit-card')
        })
    })

    describe('Wishlist Functionality', () => {
        it('calls updateWishlist when wishlist card is clicked', async () => {
            mockUseAuth.mockReturnValue({ session: mockSession } as AuthState)

            mockUpdateWishlist.mockResolvedValue(undefined)

            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} wishlist={true} />
            )

            const link = container.querySelector('a')
            fireEvent.click(link!)

            await waitFor(() => {
                expect(mockUpdateWishlist).toHaveBeenCalledWith(
                    'test-user-123',
                    'sv01-001'
                )
            })
        })

        it('navigates to wishlist page after adding to wishlist', async () => {
            mockUseAuth.mockReturnValue({ session: mockSession } as AuthState)

            mockUpdateWishlist.mockResolvedValue(undefined)

            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} wishlist={true} />
            )

            const link = container.querySelector('a')
            fireEvent.click(link!)

            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/personal-profile/edit-profile/wishlist'
                )
            })
        })

        it('does not call updateWishlist if session is undefined', async () => {
            mockUseAuth.mockReturnValue({
                session: undefined
            } as unknown as AuthState)

            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} wishlist={true} />
            )

            const link = container.querySelector('a')
            fireEvent.click(link!)

            await waitFor(() => {
                expect(mockUpdateWishlist).not.toHaveBeenCalled()
            })
        })

        it('handles error when adding to wishlist fails', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
            mockUseAuth.mockReturnValue({ session: mockSession } as AuthState)

            mockUpdateWishlist.mockRejectedValue(new Error('Network error'))

            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} wishlist={true} />
            )

            const link = container.querySelector('a')
            fireEvent.click(link!)

            await waitFor(() => {
                expect(consoleSpy).toHaveBeenCalled()
            })

            consoleSpy.mockRestore()
        })

        it('prevents multiple simultaneous wishlist additions', async () => {
            mockUseAuth.mockReturnValue({ session: mockSession } as AuthState)

            mockUpdateWishlist.mockImplementation(
                () => new Promise((resolve) => setTimeout(resolve, 100))
            )

            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} wishlist={true} />
            )

            const link = container.querySelector('a')
            fireEvent.click(link!)
            fireEvent.click(link!) // Second click while first is processing

            await waitFor(() => {
                expect(mockUpdateWishlist).toHaveBeenCalledTimes(1)
            })
        })
    })

    describe('Link Behavior', () => {
        it('uses empty object href for wishlist cards', () => {
            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} wishlist={true} />
            )

            // For wishlist cards, the href should be an empty object (handled by Next Link)
            const link = container.querySelector('a')
            expect(link).toBeInTheDocument()
        })

        it('passes correct cardId in query params for non-wishlist cards', () => {
            const { container } = renderWithTheme(
                <PokemonCardMini {...defaultProps} wishlist={false} />
            )

            const link = container.querySelector('a')
            expect(link).toHaveAttribute('href', '/user-cards')
        })
    })

    describe('Styling and Interactions', () => {
        it('renders interactive button container', () => {
            renderWithTheme(<PokemonCardMini {...defaultProps} />)
            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
        })

        it('has hover effects configured', () => {
            renderWithTheme(<PokemonCardMini {...defaultProps} />)

            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
        })
    })
})
