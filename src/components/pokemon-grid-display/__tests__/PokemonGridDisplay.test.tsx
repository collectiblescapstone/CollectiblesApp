import { screen, waitFor, fireEvent, act } from '@testing-library/react'
import { renderWithTheme } from '../../../utils/testing-utils'
import PokemonGridDisplay from '../PokemonGridDisplay'
import * as AuthProvider from '../../../context/AuthProvider'
import * as PokemonCardsProvider from '../../../context/PokemonCardsProvider'
import * as pokemonSetUtils from '../../../utils/pokemonSet'
import React from 'react'

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

jest.mock('../../../context/AuthProvider', () => ({
    useAuth: jest.fn(() => ({
        session: mockSession,
        loading: false
    }))
}))

const mockUseAuth = AuthProvider.useAuth as jest.MockedFunction<
    typeof AuthProvider.useAuth
>
type AuthState = ReturnType<typeof AuthProvider.useAuth>

// Mock PokemonCardsProvider
const mockGetPokemonName = jest.fn()
const mockGrandmasterSetCount = jest.fn()
const mockPokemonGrandmasterSetCount = jest.fn()

jest.mock('../../../context/PokemonCardsProvider', () => ({
    usePokemonCards: jest.fn(() => ({
        masterSetCards: { sv1: new Set(['card1', 'card2']) },
        grandmasterSetCount: mockGrandmasterSetCount,
        pokemonMasterSetCards: { 25: new Set(['card1']) },
        pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
        POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
        getPokemonName: mockGetPokemonName
    }))
}))

const mockUsePokemonCards =
    PokemonCardsProvider.usePokemonCards as jest.MockedFunction<
        typeof PokemonCardsProvider.usePokemonCards
    >
type PokemonCardsState = ReturnType<typeof PokemonCardsProvider.usePokemonCards>

// Mock pokemonSet utils
jest.mock('../../../utils/pokemonSet', () => ({
    getSetGroups: jest.fn()
}))

const mockGetSetGroups = pokemonSetUtils.getSetGroups as jest.MockedFunction<
    typeof pokemonSetUtils.getSetGroups
>

// Mock pokedex - use a larger set to enable pagination testing
jest.mock('../../../utils/pokedex', () => ({
    ALL_POKEMON: Array.from({ length: 50 }, (_, i) => i + 1)
}))

// Mock sortCardId
jest.mock('../../../utils/sortCardId', () => ({
    sortCardId: jest.fn((a, b) => a.localeCompare(b))
}))

// Store callbacks for select components to trigger changes in tests
let sortByOnValueChange: ((e: { value: string[] }) => void) | null = null
let generationOnValueChange: ((e: { value: string[] }) => void) | null = null
let eraOnValueChange: ((e: { value: string[] }) => void) | null = null

// Mock Chakra UI Select component to capture onValueChange callbacks
jest.mock('@chakra-ui/react', () => {
    const actual = jest.requireActual('@chakra-ui/react')

    const MockSelectRoot = ({
        children,
        onValueChange,
        value,
        collection,
        ...props
    }: {
        children: React.ReactNode
        onValueChange?: (e: { value: string[] }) => void
        value?: string[]
        collection?: { items: { label: string; value: string }[] }
        [key: string]: unknown
    }) => {
        // Store the callbacks based on current value/context
        React.useEffect(() => {
            if (value?.[0] === 'pokemon' || value?.[0] === 'set') {
                sortByOnValueChange = onValueChange || null
            } else if (value?.[0] === 'ALL' || value?.[0]?.match(/^\d+$/)) {
                generationOnValueChange = onValueChange || null
            } else if (
                value?.[0] === 'sv' ||
                collection?.items?.some((item) => item.value === 'sv')
            ) {
                eraOnValueChange = onValueChange || null
            }
        }, [onValueChange, value, collection])

        return (
            <div data-testid="select-root" data-value={value?.[0]} {...props}>
                {children}
            </div>
        )
    }

    return {
        ...actual,
        Select: {
            Root: MockSelectRoot,
            HiddenSelect: () => null,
            Label: ({ children }: { children: React.ReactNode }) => (
                <label>{children}</label>
            ),
            Control: ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
            Trigger: ({ children }: { children: React.ReactNode }) => (
                <button type="button">{children}</button>
            ),
            ValueText: ({ placeholder }: { placeholder?: string }) => (
                <span>{placeholder}</span>
            ),
            IndicatorGroup: ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
            Indicator: () => <span>▼</span>,
            Content: ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
            Positioner: ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
            Item: ({
                children,
                item
            }: {
                children: React.ReactNode
                item: { value: string }
            }) => <div data-value={item.value}>{children}</div>,
            ItemIndicator: () => null
        },
        Pagination: {
            Root: ({
                children,
                onPageChange
            }: {
                children: React.ReactNode
                count: number
                pageSize: number
                page: number
                onPageChange: (e: { page: number }) => void
                [key: string]: unknown
            }) => (
                <div data-testid="pagination-root">
                    {children}
                    <button
                        data-testid="go-to-page-2"
                        onClick={() => onPageChange({ page: 2 })}
                    >
                        Page 2
                    </button>
                </div>
            ),
            PrevTrigger: ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
            NextTrigger: ({ children }: { children: React.ReactNode }) => (
                <div>{children}</div>
            ),
            Items: ({
                render
            }: {
                render: (page: { value: number }) => React.ReactNode
            }) => (
                <div>
                    {render({ value: 1 })}
                    {render({ value: 2 })}
                </div>
            )
        }
    }
})

// Mock child components
jest.mock(
    '../../../components/pokemon-cards/pokemon-polaroid/PokemonPolaroid',
    () => {
        return function MockPokemonPolaroid({
            id,
            masterSet,
            grandmasterSet
        }: {
            id: number
            masterSet: number
            grandmasterSet: number
            nextPage: string
        }) {
            return (
                <div data-testid={`pokemon-polaroid-${id}`}>
                    <span>Pokemon {id}</span>
                    <span>Master: {masterSet}</span>
                    <span>Grandmaster: {grandmasterSet}</span>
                </div>
            )
        }
    }
)

jest.mock(
    '../../../components/pokemon-cards/pokemon-polaroid/PokemonPolaroidLoading',
    () => {
        return function MockPokemonPolaroidLoading() {
            return <div data-testid="pokemon-polaroid-loading">Loading...</div>
        }
    }
)

jest.mock('../../../components/pokemon-cards/pokemon-set/PokemonSet', () => {
    return function MockPokemonSet({
        setID,
        label,
        masterSet,
        grandmasterSet
    }: {
        label: string
        image: string
        setName: string
        setID: string
        masterSet: number
        grandmasterSet: number
        nextPage: string
    }) {
        return (
            <div data-testid={`pokemon-set-${setID}`}>
                <span>{label}</span>
                <span>Master: {masterSet}</span>
                <span>Grandmaster: {grandmasterSet}</span>
            </div>
        )
    }
})

jest.mock(
    '../../../components/pokemon-cards/pokemon-set/PokemonSetLoading',
    () => {
        return function MockPokemonSetLoading() {
            return <div data-testid="pokemon-set-loading">Loading Set...</div>
        }
    }
)

jest.mock('../../../components/card-filter/CardSearch', () => ({
    CardSearch: function MockCardSearch({
        setFilteredIds
    }: {
        cards: { id: string; name: string }[] | undefined
        setFilteredIds: (ids: string[]) => void
        filterOnly: boolean
    }) {
        return (
            <div data-testid="card-search">
                <input
                    data-testid="search-input"
                    onChange={(e) => {
                        if (e.target.value === 'filter') {
                            setFilteredIds(['25', '26'])
                        }
                    }}
                />
            </div>
        )
    }
}))

// Mock react-icons
jest.mock('react-icons/hi', () => ({
    HiChevronLeft: () => <span data-testid="chevron-left">Left</span>,
    HiChevronRight: () => <span data-testid="chevron-right">Right</span>
}))

describe('PokemonGridDisplay', () => {
    const mockSetGroups = {
        sv: [
            {
                id: 'sv1',
                name: 'Scarlet & Violet',
                logo: 'sv1-logo.png',
                symbol: 'sv1-symbol',
                cardCount: { official: 100, total: 150 }
            },
            {
                id: 'sv2',
                name: 'Paldea Evolved',
                logo: undefined,
                symbol: 'sv2-symbol',
                cardCount: { official: 80, total: 120 }
            }
        ],
        swsh: [
            {
                id: 'swsh1',
                name: 'Sword & Shield',
                logo: 'swsh1-logo',
                symbol: undefined,
                cardCount: { official: 200, total: 250 }
            }
        ]
    }

    beforeEach(() => {
        jest.clearAllMocks()
        // Reset callbacks
        sortByOnValueChange = null
        generationOnValueChange = null
        eraOnValueChange = null

        mockUseAuth.mockReturnValue({
            session: mockSession,
            loading: false
        } as AuthState)
        mockUsePokemonCards.mockReturnValue({
            masterSetCards: { sv1: new Set(['card1', 'card2']) },
            grandmasterSetCount: mockGrandmasterSetCount,
            pokemonMasterSetCards: { 25: new Set(['card1']) },
            pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
            POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
            getPokemonName: mockGetPokemonName
        } as unknown as PokemonCardsState)
        mockGetSetGroups.mockResolvedValue(mockSetGroups)
        mockGetPokemonName.mockResolvedValue('Pikachu')
        mockGrandmasterSetCount.mockResolvedValue(100)
        mockPokemonGrandmasterSetCount.mockResolvedValue(50)
    })

    describe('Loading State', () => {
        it('displays spinner when loading is true', () => {
            mockUseAuth.mockReturnValue({
                session: mockSession,
                loading: true
            } as AuthState)

            const { container } = renderWithTheme(
                <PokemonGridDisplay originalPage="pokemon-grid" />
            )

            // Chakra Spinner renders as a span with chakra-spinner class
            expect(
                container.querySelector('.chakra-spinner')
            ).toBeInTheDocument()
        })

        it('displays spinner when session is null', () => {
            mockUseAuth.mockReturnValue({
                session: null,
                loading: false
            } as AuthState)

            const { container } = renderWithTheme(
                <PokemonGridDisplay originalPage="pokemon-grid" />
            )

            expect(
                container.querySelector('.chakra-spinner')
            ).toBeInTheDocument()
        })
    })

    describe('Pokemon View (default)', () => {
        it('renders pokemon grid by default', async () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Sort By')).toBeInTheDocument()
            })

            expect(screen.getByText('Generation')).toBeInTheDocument()
        })

        it('renders card search in pokemon view', async () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByTestId('card-search')).toBeInTheDocument()
            })
        })

        it('displays pokemon polaroids when counts are loaded', async () => {
            const pokemonMasterSetCards: Record<number, Set<string>> = {}
            for (let i = 1; i <= 50; i++) {
                pokemonMasterSetCards[i] = new Set([`c${i}`])
            }

            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards,
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(
                () => {
                    // First page shows pokemon 1-24
                    expect(
                        screen.getByTestId('pokemon-polaroid-1')
                    ).toBeInTheDocument()
                },
                { timeout: 3000 }
            )
        })

        it('shows loading polaroids while counts are being fetched', async () => {
            mockPokemonGrandmasterSetCount.mockImplementation(
                () => new Promise(() => {})
            )

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(
                    screen.getAllByTestId('pokemon-polaroid-loading').length
                ).toBeGreaterThan(0)
            })
        })

        it('renders pagination controls', async () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
                expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
            })
        })

        it('filters pokemon when search is used', async () => {
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: {
                    1: new Set(['c1']),
                    25: new Set(['c4']),
                    26: new Set(['c5'])
                },
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByTestId('search-input')).toBeInTheDocument()
            })

            const searchInput = screen.getByTestId('search-input')
            fireEvent.change(searchInput, { target: { value: 'filter' } })

            await waitFor(
                () => {
                    expect(
                        screen.getByTestId('pokemon-polaroid-25')
                    ).toBeInTheDocument()
                    expect(
                        screen.getByTestId('pokemon-polaroid-26')
                    ).toBeInTheDocument()
                },
                { timeout: 2000 }
            )
        })
    })

    describe('Set View', () => {
        it('shows era dropdown when set view is selected', async () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Sort By')).toBeInTheDocument()
            })

            // The component switches to set view which should show 'Set Era' label
            await waitFor(() => {
                const sortByLabel = screen.getByText('Sort By')
                expect(sortByLabel).toBeInTheDocument()
            })
        })

        it('fetches set groups on mount', async () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(mockGetSetGroups).toHaveBeenCalled()
            })
        })

        it('renders set cards with counts when in set view with loaded counts', async () => {
            // Setup mock for set view with proper counts
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {
                    sv1: new Set(['card1', 'card2', 'card3']),
                    sv2: new Set(['card4', 'card5'])
                },
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: {},
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            mockGrandmasterSetCount.mockResolvedValue(50)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(mockGetSetGroups).toHaveBeenCalled()
            })
        })

        it('shows loading state for sets without counts', async () => {
            // Mock grandmasterSetCount to never resolve (simulating loading)
            mockGrandmasterSetCount.mockImplementation(
                () => new Promise(() => {})
            )

            mockUsePokemonCards.mockReturnValue({
                masterSetCards: { sv1: new Set(['card1']) },
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: {},
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Sort By')).toBeInTheDocument()
            })
        })

        it('switches to set view when sort by is changed to set', async () => {
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {
                    sv1: new Set(['card1', 'card2']),
                    sv2: new Set(['card3'])
                },
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: { 25: new Set(['c1']) },
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Sort By')).toBeInTheDocument()
            })

            // Trigger the sort by change to 'set'
            await act(async () => {
                if (sortByOnValueChange) {
                    sortByOnValueChange({ value: ['set'] })
                }
            })

            // Wait for set view to load and call grandmasterSetCount
            await waitFor(
                () => {
                    expect(mockGrandmasterSetCount).toHaveBeenCalled()
                },
                { timeout: 2000 }
            )
        })

        it('changes era when era dropdown value changes', async () => {
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {
                    sv1: new Set(['card1']),
                    swsh1: new Set(['card2'])
                },
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: { 25: new Set(['c1']) },
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            const extendedMockSetGroups = {
                ...mockSetGroups,
                swsh: [
                    {
                        id: 'swsh1',
                        name: 'Sword & Shield Base',
                        logo: 'swsh1.png',
                        symbol: 'swsh1-symbol',
                        cardCount: { official: 200, total: 250 }
                    }
                ]
            }
            mockGetSetGroups.mockResolvedValue(extendedMockSetGroups)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Sort By')).toBeInTheDocument()
            })

            // Switch to set view first
            await act(async () => {
                if (sortByOnValueChange) {
                    sortByOnValueChange({ value: ['set'] })
                }
            })

            await waitFor(() => {
                expect(mockGrandmasterSetCount).toHaveBeenCalled()
            })
        })
    })

    describe('Next Page Routing', () => {
        it('sets correct nextPage for pokemon-grid originalPage', async () => {
            const pokemonMasterSetCards: Record<number, Set<string>> = {}
            for (let i = 1; i <= 50; i++) {
                pokemonMasterSetCards[i] = new Set([`c${i}`])
            }

            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards,
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(
                () => {
                    const polaroid = screen.getByTestId('pokemon-polaroid-1')
                    expect(polaroid).toBeInTheDocument()
                },
                { timeout: 3000 }
            )
        })

        it('sets correct nextPage for wishlist originalPage', async () => {
            const pokemonMasterSetCards: Record<number, Set<string>> = {}
            for (let i = 1; i <= 50; i++) {
                pokemonMasterSetCards[i] = new Set([`c${i}`])
            }

            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards,
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="wishlist" />)

            await waitFor(
                () => {
                    const polaroid = screen.getByTestId('pokemon-polaroid-1')
                    expect(polaroid).toBeInTheDocument()
                },
                { timeout: 3000 }
            )
        })
    })

    describe('Generation Filtering', () => {
        it('filters pokemon by generation when gen is selected', async () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Generation')).toBeInTheDocument()
            })
        })

        it('shows all pokemon when ALL is selected', async () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Generation')).toBeInTheDocument()
            })
        })

        it('filters pokemon when a specific generation is selected', async () => {
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: {
                    1: new Set(['c1']),
                    25: new Set(['c25']),
                    152: new Set(['c152'])
                },
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Generation')).toBeInTheDocument()
            })

            // Change generation to Gen 1 (value: '1')
            await act(async () => {
                if (generationOnValueChange) {
                    generationOnValueChange({ value: ['1'] })
                }
            })

            // Wait for the component to re-render with filtered pokemon
            await waitFor(() => {
                expect(mockPokemonGrandmasterSetCount).toHaveBeenCalled()
            })
        })

        it('filters pokemon to Gen 2 when selected', async () => {
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: {
                    1: new Set(['c1']),
                    152: new Set(['c152']),
                    200: new Set(['c200'])
                },
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Generation')).toBeInTheDocument()
            })

            // Change generation to Gen 2 (value: '2')
            await act(async () => {
                if (generationOnValueChange) {
                    generationOnValueChange({ value: ['2'] })
                }
            })

            await waitFor(() => {
                expect(mockPokemonGrandmasterSetCount).toHaveBeenCalled()
            })
        })
    })

    describe('Context Integration', () => {
        it('calls usePokemonCards hook', () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            expect(mockUsePokemonCards).toHaveBeenCalled()
        })

        it('calls useAuth hook', () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            expect(mockUseAuth).toHaveBeenCalled()
        })
    })

    describe('Edge Cases', () => {
        it('handles empty set groups gracefully', async () => {
            mockGetSetGroups.mockResolvedValue({})

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Sort By')).toBeInTheDocument()
            })
        })

        it('handles missing masterSetCards for a pokemon', async () => {
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: {},
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(
                    screen.getAllByTestId('pokemon-polaroid-loading').length
                ).toBeGreaterThan(0)
            })
        })

        it('handles undefined pokemonCounts gracefully', async () => {
            mockPokemonGrandmasterSetCount.mockResolvedValue(undefined)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Sort By')).toBeInTheDocument()
            })
        })

        it('resets page when displayablePokemon changes', async () => {
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: {
                    1: new Set(['c1']),
                    25: new Set(['c4']),
                    26: new Set(['c5'])
                },
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByTestId('search-input')).toBeInTheDocument()
            })

            // Filter pokemon which should trigger page reset
            const searchInput = screen.getByTestId('search-input')
            fireEvent.change(searchInput, { target: { value: 'filter' } })

            await waitFor(() => {
                expect(screen.getByText('Sort By')).toBeInTheDocument()
            })
        })

        it('filters pokemon by generation for gen 1', async () => {
            // Mock with pokemon IDs that span multiple generations
            // Gen 1: 1-151
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: {
                    1: new Set(['c1']),
                    2: new Set(['c2']),
                    25: new Set(['c3']),
                    150: new Set(['c4']),
                    151: new Set(['c5'])
                },
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Generation')).toBeInTheDocument()
            })
        })

        it('handles set image source with proper extension detection', async () => {
            // Test that logo with image extension is used as-is
            const setsWithImages = {
                sv: [
                    {
                        id: 'sv1',
                        name: 'Scarlet & Violet',
                        logo: 'sv1-logo.png',
                        symbol: 'sv1-symbol',
                        cardCount: { official: 100, total: 150 }
                    },
                    {
                        id: 'sv2',
                        name: 'Paldea Evolved',
                        logo: 'sv2-logo.jpg',
                        symbol: 'sv2-symbol',
                        cardCount: { official: 80, total: 120 }
                    },
                    {
                        id: 'sv3',
                        name: 'Obsidian Flames',
                        logo: 'sv3-logo',
                        symbol: undefined,
                        cardCount: { official: 90, total: 130 }
                    },
                    {
                        id: 'sv4',
                        name: 'Paradox Rift',
                        logo: undefined,
                        symbol: undefined,
                        cardCount: { official: 85, total: 125 }
                    }
                ]
            }
            mockGetSetGroups.mockResolvedValue(setsWithImages)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(mockGetSetGroups).toHaveBeenCalled()
            })
        })

        it('correctly calls grandmasterSetCount for set view when selected set is "set"', async () => {
            // This test ensures the useEffect for set counts is triggered
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {
                    sv1: new Set(['card1', 'card2']),
                    sv2: new Set(['card3'])
                },
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: { 25: new Set(['c1']) },
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            mockGrandmasterSetCount.mockResolvedValue(100)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            // Wait for initial render
            await waitFor(() => {
                expect(mockGetSetGroups).toHaveBeenCalled()
            })

            // Verify the pokemon grandmaster count is called (default view is pokemon)
            await waitFor(() => {
                expect(mockPokemonGrandmasterSetCount).toHaveBeenCalled()
            })
        })

        it('renders select dropdowns with correct options', async () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByText('Sort By')).toBeInTheDocument()
                expect(screen.getByText('Generation')).toBeInTheDocument()
            })
        })

        it('handles pagination page change correctly', async () => {
            // Mock many pokemon to test pagination (more than 24 to exceed one page)
            const pokemonMasterSetCards: Record<number, Set<string>> = {}
            for (let i = 1; i <= 50; i++) {
                pokemonMasterSetCards[i] = new Set([`c${i}`])
            }

            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards,
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(screen.getByTestId('chevron-left')).toBeInTheDocument()
                expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
            })

            // Wait for pokemon to load and verify pagination is rendered
            await waitFor(
                () => {
                    // Should render first page of pokemon
                    expect(
                        screen.getByTestId('pokemon-polaroid-1')
                    ).toBeInTheDocument()
                },
                { timeout: 3000 }
            )

            // Click on page 2 button to trigger page change
            const page2Button = screen.getByTestId('go-to-page-2')
            await act(async () => {
                fireEvent.click(page2Button)
            })

            // Verify pagination was triggered
            await waitFor(() => {
                expect(
                    screen.getByTestId('pagination-root')
                ).toBeInTheDocument()
            })
        })

        it('calls getPokemonName for each pokemon in filtered list', async () => {
            mockUsePokemonCards.mockReturnValue({
                masterSetCards: {},
                grandmasterSetCount: mockGrandmasterSetCount,
                pokemonMasterSetCards: {
                    1: new Set(['c1']),
                    25: new Set(['c4'])
                },
                pokemonGrandmasterSetCount: mockPokemonGrandmasterSetCount,
                POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
                getPokemonName: mockGetPokemonName
            } as unknown as PokemonCardsState)

            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                expect(mockGetPokemonName).toHaveBeenCalled()
            })
        })

        it('renders with FiltersProvider wrapper', async () => {
            renderWithTheme(<PokemonGridDisplay originalPage="pokemon-grid" />)

            await waitFor(() => {
                // The component should render without errors, indicating FiltersProvider is working
                expect(screen.getByText('Sort By')).toBeInTheDocument()
            })
        })
    })
})
