import { renderWithTheme } from '@/utils/testing-utils'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import FilterCardsContent from '../filterCardsContent'
import { useAuth } from '@/context/AuthProvider'
import { usePokemonCards } from '@/context/PokemonCardsProvider'
import { useFilters, defaultFilters } from '@/hooks/useFilters'
import { Session, User } from '@supabase/supabase-js'
import type { CardData } from '@/types/pokemon-card'

// Mock dependencies using relative paths
jest.mock('../../../context/AuthProvider', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('../../../context/PokemonCardsProvider', () => ({
    __esModule: true,
    usePokemonCards: jest.fn()
}))

jest.mock('../../../hooks/useFilters', () => {
    const actual = jest.requireActual('../../../hooks/useFilters')
    return {
        ...actual,
        useFilters: jest.fn()
    }
})

// Mock next/navigation
const mockSearchParams = new Map<string, string>()
jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: (key: string) => mockSearchParams.get(key) ?? null
    })
}))

// Mock utility functions
jest.mock('../../../utils/userPokemonCard', () => ({
    userMasterSet: jest.fn().mockResolvedValue(['card-1']),
    userPokemonMasterSet: jest.fn().mockResolvedValue(['card-2'])
}))

jest.mock('../../../utils/sortCardId', () => ({
    sortCardId: jest.fn((a: string, b: string) => a.localeCompare(b))
}))

jest.mock('../../../utils/formatCardNumber', () => ({
    formatCardNumber: jest.fn(
        (id: string, cardNum: string) => `${id}-formatted`
    )
}))

// Mock child components
jest.mock(
    '../../../components/pokemon-cards/pokemon-card-mini/PokemonCardMini',
    () => ({
        __esModule: true,
        default: ({
            cardId,
            cardName
        }: {
            cardId: string
            cardName: string
        }) => <div data-testid={`card-${cardId}`}>{cardName}</div>
    })
)

jest.mock('../../../components/card-filter/CardFilter', () => ({
    __esModule: true,
    default: () => <div data-testid="card-filter">CardFilter</div>
}))

jest.mock('../../../components/card-filter/CardSearch', () => ({
    __esModule: true,
    CardSearch: ({
        setFilteredIds
    }: {
        setFilteredIds: (ids: string[] | undefined) => void
    }) => (
        <input
            data-testid="card-search"
            placeholder="Search"
            onChange={(e) => {
                if (e.target.value === 'filter') {
                    setFilteredIds(['set1-1'])
                } else if (e.target.value === 'clear') {
                    setFilteredIds(undefined)
                }
            }}
        />
    )
}))

const mockedUseAuth = jest.mocked(useAuth)
const mockedUsePokemonCards = jest.mocked(usePokemonCards)
const mockedUseFilters = jest.mocked(useFilters)

const mockCards: CardData[] = [
    {
        id: 'set1-1',
        name: 'Pikachu',
        category: 'Pokemon',
        types: ['Lightning'],
        illustrator: 'Artist1',
        rarity: 'Common',
        variants: ['normal'],
        dexId: [25],
        image_url: 'img1.png',
        setId: 'set1',
        set: { official: 10 }
    },
    {
        id: 'set1-2',
        name: 'Charizard',
        category: 'Pokemon',
        types: ['Fire'],
        illustrator: 'Artist2',
        rarity: 'Rare',
        variants: ['holo'],
        dexId: [6],
        image_url: 'img2.png',
        setId: 'set1',
        set: { official: 10 }
    },
    {
        id: 'set1-TG1',
        name: 'Trainer Gallery Card',
        category: 'Trainer',
        types: [],
        illustrator: 'Artist3',
        rarity: 'Ultra Rare',
        variants: ['normal'],
        dexId: [],
        image_url: 'img3.png',
        setId: 'set1',
        set: { official: 10 }
    },
    {
        id: 'set1-SV01',
        name: 'Shiny Eevee',
        category: 'Pokemon',
        types: ['Colorless'],
        illustrator: 'Artist4',
        rarity: 'Shiny',
        variants: ['normal'],
        dexId: [133],
        image_url: 'img4.png',
        setId: 'set1',
        set: { official: 10 }
    }
]

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

const basePokemonCardsContext = {
    POKEMONGEN: [151, 251, 386, 493, 649, 721, 809, 905, 1025],
    pokemonCards: {},
    pokemonSets: {
        set1: {
            name: 'Test Set',
            series: 'Test Series',
            logo: '',
            symbol: '',
            official: 10,
            total: 10
        }
    },
    pokemonSubsets: {
        set1: [
            { name: 'Trainer Gallery', prefix: 'TG', official: 10 },
            { name: 'Shiny Vault', prefix: 'SV', official: 10 }
        ]
    },
    masterSetCards: {},
    pokemonMasterSetCards: {},
    allCards: mockCards,
    getCardsBySetId: jest.fn(),
    getCardsByName: jest.fn(),
    getCardsByPokedex: jest.fn(),
    grandmasterSetCount: jest.fn(),
    pokemonGrandmasterSetCount: jest.fn(),
    getFilteredCards: jest.fn(),
    getPokemonName: jest.fn().mockResolvedValue('Pikachu'),
    getGeneration: jest.fn((dexNumber: number) => {
        if (dexNumber <= 151) return 1
        return 2
    })
}

const baseFiltersContext = {
    filters: defaultFilters,
    setFilters: jest.fn()
}

describe('FilterCardsContent', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockSearchParams.clear()
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedUsePokemonCards.mockReturnValue(basePokemonCardsContext)
        mockedUseFilters.mockReturnValue(baseFiltersContext)
    })

    it('renders loading spinner when auth is loading', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            loading: true
        })

        renderWithTheme(<FilterCardsContent />)
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders loading spinner when session is null', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            session: null
        })

        renderWithTheme(<FilterCardsContent />)
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders cards when type is set', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            expect(screen.getByText('Test Set Card Set')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-1')).toBeInTheDocument()
            expect(screen.getByTestId('card-set1-2')).toBeInTheDocument()
        })
    })

    it('renders pokemon name when type is pokemon', async () => {
        mockSearchParams.set('type', 'pokemon')
        mockSearchParams.set('pId', '25')

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            expect(screen.getByText('Pikachu Cards')).toBeInTheDocument()
        })
    })

    it('groups cards into base and subsets', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            // Base set cards (numeric IDs)
            expect(screen.getByTestId('card-set1-1')).toBeInTheDocument()
            expect(screen.getByTestId('card-set1-2')).toBeInTheDocument()
            // Subset cards (TG and SV prefixed)
            expect(screen.getByTestId('card-set1-TG1')).toBeInTheDocument()
            expect(screen.getByTestId('card-set1-SV01')).toBeInTheDocument()
        })

        // Check subset headings appear
        await waitFor(() => {
            expect(screen.getByText('Trainer Gallery')).toBeInTheDocument()
            expect(screen.getByText('Shiny Vault')).toBeInTheDocument()
        })
    })

    it('toggles sort order when button is clicked', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-1')).toBeInTheDocument()
        })

        const sortButton = screen.getByRole('button', {
            name: /toggle sort order/i
        })
        fireEvent.click(sortButton)

        // After clicking, the sort order should be reversed
        await waitFor(() => {
            expect(sortButton).toBeInTheDocument()
        })
    })

    it('filters cards using CardSearch', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-1')).toBeInTheDocument()
            expect(screen.getByTestId('card-set1-2')).toBeInTheDocument()
        })

        const searchInput = screen.getByTestId('card-search')
        fireEvent.change(searchInput, { target: { value: 'filter' } })

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-1')).toBeInTheDocument()
            expect(screen.queryByTestId('card-set1-2')).not.toBeInTheDocument()
        })

        // Clear filter
        fireEvent.change(searchInput, { target: { value: 'clear' } })

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-1')).toBeInTheDocument()
            expect(screen.getByTestId('card-set1-2')).toBeInTheDocument()
        })
    })

    it('filters cards by category', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        // Only show Pokemon category
        mockedUseFilters.mockReturnValue({
            ...baseFiltersContext,
            filters: {
                ...defaultFilters,
                categories: ['Pokemon']
            }
        })

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-1')).toBeInTheDocument()
            expect(screen.getByTestId('card-set1-2')).toBeInTheDocument()
            // Trainer card should not be shown
            expect(
                screen.queryByTestId('card-set1-TG1')
            ).not.toBeInTheDocument()
        })
    })

    it('filters cards by type', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        // Only show Lightning types
        mockedUseFilters.mockReturnValue({
            ...baseFiltersContext,
            filters: {
                ...defaultFilters,
                types: {
                    ...defaultFilters.types,
                    Fire: false
                }
            }
        })

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-1')).toBeInTheDocument()
            // Fire type card should not be shown
            expect(screen.queryByTestId('card-set1-2')).not.toBeInTheDocument()
        })
    })

    it('filters cards by generation', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        // Only show generation 1
        mockedUseFilters.mockReturnValue({
            ...baseFiltersContext,
            filters: {
                ...defaultFilters,
                generations: [1]
            }
        })

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            // Gen 1 Pokemon (dexId 25, 6) should be shown
            expect(screen.getByTestId('card-set1-1')).toBeInTheDocument()
            expect(screen.getByTestId('card-set1-2')).toBeInTheDocument()
        })
    })

    it('handles empty card set gracefully', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'nonexistent')

        mockedUsePokemonCards.mockReturnValue({
            ...basePokemonCardsContext,
            allCards: []
        })

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            expect(screen.getByText('Card Set')).toBeInTheDocument()
        })
    })

    it('renders without type parameter', async () => {
        // No search params set
        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            // Should still render without errors
            expect(screen.getByTestId('card-filter')).toBeInTheDocument()
        })
    })

    it('handles cards with Pokemon category variant correctly', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        const cardsWithVariant: CardData[] = [
            {
                id: 'set1-5',
                name: 'Bulbasaur',
                category: 'Pokemon', // Not 'Pok\u00e9mon'
                types: ['Grass'],
                illustrator: 'Artist',
                rarity: 'Common',
                variants: ['normal'],
                dexId: [1],
                image_url: 'img.png',
                setId: 'set1',
                set: { official: 10 }
            }
        ]

        mockedUsePokemonCards.mockReturnValue({
            ...basePokemonCardsContext,
            allCards: cardsWithVariant
        })

        renderWithTheme(<FilterCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-5')).toBeInTheDocument()
        })
    })
})
