import { screen, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../../../../utils/testing-utils'
import PokemonPolaroid from '../PokemonPolaroid'
import * as userPokemonCard from '../../../../utils/userPokemonCard'
import * as AuthProvider from '../../../../context/AuthProvider'
import * as PokemonCardsProvider from '../../../../context/PokemonCardsProvider'

type LinkLikeProps = {
    children: React.ReactNode
    href: string | { pathname?: string }
}

// Mock next/link
jest.mock('next/link', () => {
    const MockLink = ({ children, href }: LinkLikeProps) => {
        return (
            <a href={typeof href === 'string' ? href : href.pathname}>
                {children}
            </a>
        )
    }
    MockLink.displayName = 'MockLink'
    return MockLink
})

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

// Mock PokemonCardsProvider
const mockGetPokemonName = jest.fn()
jest.mock('../../../../context/PokemonCardsProvider', () => ({
    usePokemonCards: jest.fn(() => ({
        getPokemonName: mockGetPokemonName
    }))
}))

const mockUsePokemonCards =
    PokemonCardsProvider.usePokemonCards as jest.MockedFunction<
        typeof PokemonCardsProvider.usePokemonCards
    >
type PokemonCardsState = ReturnType<typeof PokemonCardsProvider.usePokemonCards>

// Mock user pokemon card utilities
jest.mock('../../../../utils/userPokemonCard', () => ({
    userPokemonMasterSetCount: jest.fn(),
    userPokemonGrandmasterSetCount: jest.fn()
}))

const mockUserPokemonMasterSetCount =
    userPokemonCard.userPokemonMasterSetCount as jest.MockedFunction<
        typeof userPokemonCard.userPokemonMasterSetCount
    >
const mockUserPokemonGrandmasterSetCount =
    userPokemonCard.userPokemonGrandmasterSetCount as jest.MockedFunction<
        typeof userPokemonCard.userPokemonGrandmasterSetCount
    >

// Mock dynamic colours
jest.mock('../../../../utils/dynamicColours', () => ({
    getDynamicColour: jest.fn(() => '#FF0000')
}))

// Mock PokemonSetLoading
jest.mock('../../pokemon-set/PokemonSetLoading', () => {
    return function MockPokemonSetLoading() {
        return <div data-testid="pokemon-set-loading">Loading...</div>
    }
})

// Mock react-icons
jest.mock('react-icons/lu', () => ({
    LuSparkle: () => <div data-testid="sparkle-icon">Sparkle</div>,
    LuSparkles: () => <div data-testid="sparkles-icon">Sparkles</div>
}))

describe('PokemonPolaroid', () => {
    const defaultProps = {
        id: 25,
        masterSet: 100,
        grandmasterSet: 200,
        nextPage: '/pokemon-details'
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAuth.mockReturnValue({ session: mockSession } as AuthState)
        mockUsePokemonCards.mockReturnValue({
            getPokemonName: mockGetPokemonName
        } as unknown as PokemonCardsState)
        mockGetPokemonName.mockResolvedValue('Pikachu')
        mockUserPokemonMasterSetCount.mockResolvedValue(50)
        mockUserPokemonGrandmasterSetCount.mockResolvedValue(75)
    })

    const waitForLoadedState = async () => {
        await waitFor(() => {
            expect(
                screen.queryByTestId('pokemon-set-loading')
            ).not.toBeInTheDocument()
        })
    }

    describe('Loading State', () => {
        it('displays loading component initially', () => {
            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            expect(
                screen.getByTestId('pokemon-set-loading')
            ).toBeInTheDocument()
        })

        it('shows loading when masterSetCount is null', async () => {
            mockUseAuth.mockReturnValue({ session: null } as AuthState)

            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            expect(
                screen.getByTestId('pokemon-set-loading')
            ).toBeInTheDocument()
        })
    })

    describe('Pokemon Display', () => {
        it('renders pokemon image with correct URL', async () => {
            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitForLoadedState()
            const image = screen.getByAltText('Pokemon 25')
            expect(image).toBeInTheDocument()
            expect(image).toHaveAttribute(
                'src',
                'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
            )
        })

        it('renders pokemon name', async () => {
            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Pikachu' })
            ).toBeInTheDocument()
        })

        it('fetches and displays different pokemon names', async () => {
            mockGetPokemonName.mockResolvedValue('Charizard')

            renderWithTheme(<PokemonPolaroid {...defaultProps} id={6} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Charizard' })
            ).toBeInTheDocument()
        })
    })

    describe('Progress Bars', () => {
        it('renders master set progress icons', async () => {
            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitForLoadedState()
            expect(screen.getByTestId('sparkle-icon')).toBeInTheDocument()
        })

        it('renders grandmaster set progress icons', async () => {
            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitForLoadedState()
            expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
        })

        it('fetches correct counts for user', async () => {
            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitForLoadedState()
            expect(mockUserPokemonMasterSetCount).toHaveBeenCalledWith(
                'test-user-123',
                25
            )
            expect(mockUserPokemonGrandmasterSetCount).toHaveBeenCalledWith(
                'test-user-123',
                25
            )
        })
    })

    describe('Navigation Link', () => {
        it('renders as a link with correct path', async () => {
            const { container } = renderWithTheme(
                <PokemonPolaroid {...defaultProps} />
            )

            await waitFor(() => {
                const link = container.querySelector('a')
                expect(link).toHaveAttribute('href', '/pokemon-details')
            })
        })

        it('has correct styling for clickable card', async () => {
            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitForLoadedState()
            const button = screen.getByRole('button')
            expect(button).toBeInTheDocument()
        })
    })

    describe('Session Handling', () => {
        it('does not fetch when session is missing', async () => {
            mockUseAuth.mockReturnValue({ session: null } as AuthState)

            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitFor(
                () => {
                    expect(mockUserPokemonMasterSetCount).not.toHaveBeenCalled()
                },
                { timeout: 500 }
            )
        })

        it('refetches when id changes', async () => {
            const { rerender } = renderWithTheme(
                <PokemonPolaroid {...defaultProps} />
            )

            await waitForLoadedState()
            expect(mockUserPokemonMasterSetCount).toHaveBeenCalledWith(
                'test-user-123',
                25
            )

            mockUserPokemonMasterSetCount.mockClear()
            mockUserPokemonGrandmasterSetCount.mockClear()

            rerender(<PokemonPolaroid {...defaultProps} id={6} />)

            await waitFor(() => {
                expect(mockUserPokemonMasterSetCount).toHaveBeenCalledWith(
                    'test-user-123',
                    6
                )
            })
        })
    })

    describe('Edge Cases', () => {
        it('handles zero counts', async () => {
            mockUserPokemonMasterSetCount.mockResolvedValue(0)
            mockUserPokemonGrandmasterSetCount.mockResolvedValue(0)

            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Pikachu' })
            ).toBeInTheDocument()
        })

        it('handles counts exceeding max values', async () => {
            mockUserPokemonMasterSetCount.mockResolvedValue(150)
            mockUserPokemonGrandmasterSetCount.mockResolvedValue(250)

            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Pikachu' })
            ).toBeInTheDocument()
        })

        it('handles missing pokemon name gracefully', async () => {
            mockGetPokemonName.mockResolvedValue(undefined)

            renderWithTheme(<PokemonPolaroid {...defaultProps} />)

            await waitForLoadedState()
            const image = screen.getByAltText('Pokemon 25')
            expect(image).toBeInTheDocument()
        })
    })
})
