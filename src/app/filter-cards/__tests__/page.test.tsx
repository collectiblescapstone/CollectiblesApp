import { renderWithTheme } from '@/utils/testing-utils'
import FilterCardsPage from '../page'
import { useAuth } from '@/context/AuthProvider'
import { usePokemonCards } from '@/context/PokemonCardsProvider'
import { Session, User } from '@supabase/supabase-js'

// Mock dependencies using relative paths
jest.mock('../../../context/AuthProvider', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('../../../context/PokemonCardsProvider', () => ({
    __esModule: true,
    usePokemonCards: jest.fn()
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: () => null
    })
}))

// Mock utility functions
jest.mock('../../../utils/userPokemonCard', () => ({
    userMasterSet: jest.fn().mockResolvedValue([]),
    userPokemonMasterSet: jest.fn().mockResolvedValue([])
}))

jest.mock('../../../utils/sortCardId', () => ({
    sortCardId: jest.fn()
}))

jest.mock('../../../utils/formatCardNumber', () => ({
    formatCardNumber: jest.fn()
}))

// Mock child components
jest.mock(
    '../../../components/pokemon-cards/pokemon-card-mini/PokemonCardMini',
    () => ({
        __esModule: true,
        default: () => <div>PokemonCardMini</div>
    })
)

jest.mock('../../../components/card-filter/CardFilter', () => ({
    __esModule: true,
    default: () => <div>CardFilter</div>
}))

jest.mock('../../../components/card-filter/CardSearch', () => ({
    __esModule: true,
    CardSearch: () => <input data-testid="card-search" />
}))

const mockedUseAuth = jest.mocked(useAuth)
const mockedUsePokemonCards = jest.mocked(usePokemonCards)

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
    pokemonSets: {},
    pokemonSubsets: {},
    masterSetCards: {},
    pokemonMasterSetCards: {},
    allCards: [],
    getCardsBySetId: jest.fn(),
    getCardsByName: jest.fn(),
    getCardsByPokedex: jest.fn(),
    grandmasterSetCount: jest.fn(),
    pokemonGrandmasterSetCount: jest.fn(),
    getFilteredCards: jest.fn(),
    getPokemonName: jest.fn().mockResolvedValue('Pokemon'),
    getGeneration: jest.fn().mockReturnValue(1)
}

describe('FilterCardsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedUsePokemonCards.mockReturnValue(basePokemonCardsContext)
    })

    it('renders with FiltersProvider wrapper', () => {
        renderWithTheme(<FilterCardsPage />)
        // If FiltersProvider wasn't properly wrapping, useFilters would throw
        // The page renders successfully, proving the provider is in place
        expect(document.body).toBeInTheDocument()
    })

    it('renders loading spinner initially', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            loading: true
        })

        renderWithTheme(<FilterCardsPage />)
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })
})
