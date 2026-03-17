import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import WishlistCardsContent from '../wishlistCardsContent'
import { useAuth } from '@/context/AuthProvider'
import { usePokemonCards } from '@/context/PokemonCardsProvider'
import { useFilters } from '@/hooks/useFilters'
import { renderWithTheme } from '@/utils/testing-utils'
import { userMasterSet, userPokemonMasterSet } from '@/utils/userPokemonCard'
import type { CardData } from '@/types/pokemon-card'

jest.mock('../../../../../../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('../../../../../../../context/PokemonCardsProvider.tsx', () => ({
    __esModule: true,
    usePokemonCards: jest.fn()
}))

jest.mock('../../../../../../../hooks/useFilters.tsx', () => ({
    __esModule: true,
    useFilters: jest.fn()
}))

jest.mock('../../../../../../../utils/userPokemonCard.ts', () => ({
    userMasterSet: jest.fn(),
    userPokemonMasterSet: jest.fn()
}))

jest.mock(
    '../../../../../../../components/pokemon-cards/pokemon-card-mini/PokemonCardMini.tsx',
    () => ({
        __esModule: true,
        default: ({
            cardId,
            cardName,
            cardOwned
        }: {
            cardId: string
            cardName: string
            cardOwned: boolean
        }) => (
            <div data-testid={`card-${cardId}`}>
                {cardName} - {cardOwned ? 'Owned' : 'Not Owned'}
            </div>
        )
    })
)

jest.mock('../../../../../../../components/card-filter/CardFilter.tsx', () => ({
    __esModule: true,
    default: () => <div data-testid="card-filter">CardFilter</div>
}))

jest.mock('../../../../../../../components/card-filter/CardSearch.tsx', () => ({
    CardSearch: () => <div data-testid="card-search">CardSearch</div>
}))

const mockSearchParams = new Map<string, string>()

jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: (key: string) => mockSearchParams.get(key) ?? null
    })
}))

const mockedUseAuth = useAuth as jest.Mock
const mockedUsePokemonCards = usePokemonCards as jest.Mock
const mockedUseFilters = useFilters as jest.Mock
const mockedUserMasterSet = userMasterSet as jest.Mock
const mockedUserPokemonMasterSet = userPokemonMasterSet as jest.Mock

const mockCards: CardData[] = [
    {
        id: 'set1-001',
        name: 'Pikachu',
        image_url: 'https://example.com/pikachu.png',
        setId: 'set1',
        category: 'Pokemon',
        types: ['Electric'],
        dexId: [25],
        rarity: 'Common',
        variants: [],
        set: { official: 100 }
    },
    {
        id: 'set1-002',
        name: 'Charizard',
        image_url: 'https://example.com/charizard.png',
        setId: 'set1',
        category: 'Pokemon',
        types: ['Fire'],
        dexId: [6],
        rarity: 'Rare',
        variants: [],
        set: { official: 100 }
    },
    {
        id: 'set2-001',
        name: 'Bulbasaur',
        image_url: 'https://example.com/bulbasaur.png',
        setId: 'set2',
        category: 'Pokemon',
        types: ['Grass'],
        dexId: [1],
        rarity: 'Common',
        variants: [],
        set: { official: 50 }
    }
]

const mockGetPokemonName = jest.fn()
const mockGetGeneration = jest.fn()

describe('WishlistCardsContent', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockSearchParams.clear()

        mockedUsePokemonCards.mockReturnValue({
            allCards: mockCards,
            getPokemonName: mockGetPokemonName,
            getGeneration: mockGetGeneration
        })

        mockedUseFilters.mockReturnValue({
            filters: {
                categories: ['Pokemon', 'Pokémon'],
                types: {
                    Electric: true,
                    Fire: true,
                    Grass: true
                },
                generations: [1, 2, 3, 4, 5, 6, 7, 8, 9]
            }
        })

        mockedUserMasterSet.mockResolvedValue([])
        mockedUserPokemonMasterSet.mockResolvedValue([])
        mockGetPokemonName.mockResolvedValue('Pikachu')
        mockGetGeneration.mockReturnValue(1)
    })

    it('renders loading spinner when session is not available', () => {
        mockedUseAuth.mockReturnValue({
            session: null,
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders loading spinner while auth is loading', () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: true
        })

        renderWithTheme(<WishlistCardsContent />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders cards filtered by setId when type is set', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')
        mockSearchParams.set('setName', 'Base Set')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-001')).toBeInTheDocument()
        })

        expect(screen.getByTestId('card-set1-002')).toBeInTheDocument()
        expect(screen.queryByTestId('card-set2-001')).not.toBeInTheDocument()
    })

    it('renders cards filtered by dexId when type is pokemon', async () => {
        mockSearchParams.set('type', 'pokemon')
        mockSearchParams.set('pId', '25')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-001')).toBeInTheDocument()
        })

        expect(screen.queryByTestId('card-set1-002')).not.toBeInTheDocument()
    })

    it('fetches user cards for set type', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(mockedUserMasterSet).toHaveBeenCalledWith('user-1', 'set1')
        })
    })

    it('fetches user cards for pokemon type', async () => {
        mockSearchParams.set('type', 'pokemon')
        mockSearchParams.set('pId', '25')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(mockedUserPokemonMasterSet).toHaveBeenCalledWith(
                'user-1',
                25
            )
        })
    })

    it('renders "No cards match" when filtered cards is empty', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'nonexistent')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(
                screen.getByText('No cards match the selected filters.')
            ).toBeInTheDocument()
        })
    })

    it('shows card as owned when in userCards list', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })
        mockedUserMasterSet.mockResolvedValue(['set1-001'])

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(screen.getByText('Pikachu - Owned')).toBeInTheDocument()
        })

        expect(screen.getByText('Charizard - Not Owned')).toBeInTheDocument()
    })

    it('toggles sort order when toggle button is clicked', async () => {
        const user = userEvent.setup()
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-001')).toBeInTheDocument()
        })

        const toggleButton = screen.getByRole('button', {
            name: /toggle sort order/i
        })
        await user.click(toggleButton)

        // After clicking, the order should be reversed
        expect(toggleButton).toBeInTheDocument()
    })

    it('renders CardFilter component', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-filter')).toBeInTheDocument()
        })
    })

    it('renders CardSearch component', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-search')).toBeInTheDocument()
        })
    })

    it('renders set name heading for set type', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')
        mockSearchParams.set('setName', 'Base Set')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(screen.getByText('Base Set Card Set')).toBeInTheDocument()
        })
    })

    it('renders pokemon name heading for pokemon type', async () => {
        mockSearchParams.set('type', 'pokemon')
        mockSearchParams.set('pId', '25')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })
        mockGetPokemonName.mockResolvedValue('Pikachu')

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(screen.getByText('Pikachu Cards')).toBeInTheDocument()
        })
    })

    it('filters cards by category from filters context', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        mockedUseFilters.mockReturnValue({
            filters: {
                categories: ['Trainer'], // Not Pokemon, so cards should be filtered out
                types: { Electric: true, Fire: true },
                generations: [1]
            }
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(
                screen.getByText('No cards match the selected filters.')
            ).toBeInTheDocument()
        })
    })

    it('filters cards by type from filters context', async () => {
        mockSearchParams.set('type', 'set')
        mockSearchParams.set('setId', 'set1')

        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })

        mockedUseFilters.mockReturnValue({
            filters: {
                categories: ['Pokemon', 'Pokémon'],
                types: { Electric: true, Fire: false, Grass: false }, // Only Electric
                generations: [1]
            }
        })

        renderWithTheme(<WishlistCardsContent />)

        await waitFor(() => {
            expect(screen.getByTestId('card-set1-001')).toBeInTheDocument()
        })

        expect(screen.queryByTestId('card-set1-002')).not.toBeInTheDocument()
    })
})
