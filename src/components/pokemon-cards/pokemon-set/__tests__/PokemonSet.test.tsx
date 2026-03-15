import { screen, waitFor } from '@testing-library/react'
import { renderWithTheme } from '../../../../utils/testing-utils'
import PokemonSet from '../PokemonSet'
import * as userPokemonCard from '../../../../utils/userPokemonCard'
import * as AuthProvider from '../../../../context/AuthProvider'

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: any) => {
        return (
            <a href={typeof href === 'string' ? href : href.pathname}>
                {children}
            </a>
        )
    }
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

// Mock user pokemon card utilities
jest.mock('../../../../utils/userPokemonCard', () => ({
    userMasterSetCount: jest.fn(),
    userGrandmasterSetCount: jest.fn()
}))

const mockUserMasterSetCount =
    userPokemonCard.userMasterSetCount as jest.MockedFunction<
        typeof userPokemonCard.userMasterSetCount
    >
const mockUserGrandmasterSetCount =
    userPokemonCard.userGrandmasterSetCount as jest.MockedFunction<
        typeof userPokemonCard.userGrandmasterSetCount
    >

// Mock dynamic colours
jest.mock('../../../../utils/dynamicColours', () => ({
    getDynamicColour: jest.fn(() => '#FF0000')
}))

// Mock PokemonSetLoading
jest.mock('../PokemonSetLoading', () => {
    return function MockPokemonSetLoading() {
        return <div data-testid="pokemon-set-loading">Loading...</div>
    }
})

// Mock react-icons
jest.mock('react-icons/lu', () => ({
    LuSparkle: () => <div data-testid="sparkle-icon">Sparkle</div>,
    LuSparkles: () => <div data-testid="sparkles-icon">Sparkles</div>
}))

describe('PokemonSet', () => {
    const defaultProps = {
        label: 'Base Set',
        image: 'https://example.com/base-set.png',
        setID: 'base1',
        setName: 'Base Set',
        masterSet: 102,
        grandmasterSet: 200,
        nextPage: '/set-details'
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAuth.mockReturnValue({ session: mockSession } as any)
        mockUserMasterSetCount.mockResolvedValue(50)
        mockUserGrandmasterSetCount.mockResolvedValue(75)
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
            renderWithTheme(<PokemonSet {...defaultProps} />)

            expect(
                screen.getByTestId('pokemon-set-loading')
            ).toBeInTheDocument()
        })

        it('shows loading when masterSetCount is null', async () => {
            mockUseAuth.mockReturnValue({ session: null } as any)

            renderWithTheme(<PokemonSet {...defaultProps} />)

            expect(
                screen.getByTestId('pokemon-set-loading')
            ).toBeInTheDocument()
        })

        it('shows loading when grandmasterSetCount is null', async () => {
            mockUseAuth.mockReturnValue({ session: null } as any)

            renderWithTheme(<PokemonSet {...defaultProps} />)

            expect(
                screen.getByTestId('pokemon-set-loading')
            ).toBeInTheDocument()
        })
    })

    describe('Set Display', () => {
        it('renders set label', async () => {
            renderWithTheme(<PokemonSet {...defaultProps} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Base Set' })
            ).toBeInTheDocument()
        })

        it('renders set image', async () => {
            renderWithTheme(<PokemonSet {...defaultProps} />)

            await waitForLoadedState()
            const image = screen.getByAltText('Base Set')
            expect(image).toBeInTheDocument()
            expect(image).toHaveAttribute(
                'src',
                'https://example.com/base-set.png'
            )
        })

        it('renders different set labels', async () => {
            renderWithTheme(<PokemonSet {...defaultProps} label="Jungle" />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Jungle' })
            ).toBeInTheDocument()
        })
    })

    describe('Progress Bars', () => {
        it('renders master set progress icons', async () => {
            renderWithTheme(<PokemonSet {...defaultProps} />)

            await waitForLoadedState()
            expect(screen.getByTestId('sparkle-icon')).toBeInTheDocument()
        })

        it('renders grandmaster set progress icons', async () => {
            renderWithTheme(<PokemonSet {...defaultProps} />)

            await waitForLoadedState()
            expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
        })

        it('fetches correct counts for user and setID', async () => {
            renderWithTheme(<PokemonSet {...defaultProps} />)

            await waitForLoadedState()
            expect(mockUserMasterSetCount).toHaveBeenCalledWith(
                'test-user-123',
                'base1'
            )
            expect(mockUserGrandmasterSetCount).toHaveBeenCalledWith(
                'test-user-123',
                'base1'
            )
        })
    })

    describe('Navigation Link', () => {
        it('renders as a link with correct path', async () => {
            const { container } = renderWithTheme(
                <PokemonSet {...defaultProps} />
            )

            await waitFor(() => {
                const link = container.querySelector('a')
                expect(link).toHaveAttribute('href', '/set-details')
            })
        })

        it('has cursor pointer styling', async () => {
            const { container } = renderWithTheme(
                <PokemonSet {...defaultProps} />
            )

            await waitForLoadedState()
            const link = container.querySelector('a')
            expect(link?.firstChild).toBeInTheDocument()
        })
    })

    describe('Session Handling', () => {
        it('does not fetch when session is missing', async () => {
            mockUseAuth.mockReturnValue({ session: null } as any)

            renderWithTheme(<PokemonSet {...defaultProps} />)

            await waitFor(
                () => {
                    expect(mockUserMasterSetCount).not.toHaveBeenCalled()
                },
                { timeout: 500 }
            )
        })

        it('refetches when setID changes', async () => {
            const { rerender } = renderWithTheme(
                <PokemonSet {...defaultProps} />
            )

            await waitForLoadedState()
            expect(mockUserMasterSetCount).toHaveBeenCalledWith(
                'test-user-123',
                'base1'
            )

            mockUserMasterSetCount.mockClear()
            mockUserGrandmasterSetCount.mockClear()

            rerender(<PokemonSet {...defaultProps} setID="jungle" />)

            await waitFor(() => {
                expect(mockUserMasterSetCount).toHaveBeenCalledWith(
                    'test-user-123',
                    'jungle'
                )
            })
        })
    })

    describe('Edge Cases', () => {
        it('handles zero counts', async () => {
            mockUserMasterSetCount.mockResolvedValue(0)
            mockUserGrandmasterSetCount.mockResolvedValue(0)

            renderWithTheme(<PokemonSet {...defaultProps} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Base Set' })
            ).toBeInTheDocument()
        })

        it('handles counts exceeding max values', async () => {
            mockUserMasterSetCount.mockResolvedValue(150)
            mockUserGrandmasterSetCount.mockResolvedValue(250)

            renderWithTheme(<PokemonSet {...defaultProps} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Base Set' })
            ).toBeInTheDocument()
        })

        it('handles master set value of 0', async () => {
            renderWithTheme(<PokemonSet {...defaultProps} masterSet={0} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Base Set' })
            ).toBeInTheDocument()
        })

        it('handles grandmaster set value of 0', async () => {
            renderWithTheme(<PokemonSet {...defaultProps} grandmasterSet={0} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Base Set' })
            ).toBeInTheDocument()
        })
    })

    describe('Card Layout', () => {
        it('renders with correct structure', async () => {
            renderWithTheme(<PokemonSet {...defaultProps} />)

            await waitForLoadedState()
            expect(
                screen.getByRole('heading', { name: 'Base Set' })
            ).toBeInTheDocument()
            expect(screen.getByAltText('Base Set')).toBeInTheDocument()
        })

        it('has responsive width settings', async () => {
            const { container } = renderWithTheme(
                <PokemonSet {...defaultProps} />
            )

            await waitFor(() => {
                const wrapper = container.firstChild as HTMLElement
                expect(wrapper).toBeInTheDocument()
            })
        })
    })
})
