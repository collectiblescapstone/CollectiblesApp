import '@testing-library/jest-dom'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import WishScreen from '../page'
import { useAuth } from '@/context/AuthProvider'
import { usePokemonCards } from '@/context/PokemonCardsProvider'
import { renderWithTheme } from '@/utils/testing-utils'
import { getWishlist, updateWishlist } from '@/utils/wishlist/wishlistQueries'
import type { CardData } from '@/types/pokemon-card'

jest.mock('../../../../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('../../../../../context/PokemonCardsProvider.tsx', () => ({
    __esModule: true,
    usePokemonCards: jest.fn()
}))

jest.mock('../../../../../utils/wishlist/wishlistQueries.ts', () => ({
    getWishlist: jest.fn(),
    updateWishlist: jest.fn()
}))

const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush
    })
}))

const mockedUseAuth = useAuth as jest.Mock
const mockedUsePokemonCards = usePokemonCards as jest.Mock
const mockedGetWishlist = getWishlist as jest.Mock
const mockedUpdateWishlist = updateWishlist as jest.Mock

const mockCards: CardData[] = [
    {
        id: 'card-1',
        name: 'Pikachu',
        image_url: 'https://example.com/pikachu.png',
        setId: 'set-1',
        category: 'Pokemon',
        types: ['Electric'],
        dexId: [25],
        rarity: 'Common',
        variants: [],
        set: { official: 100 }
    },
    {
        id: 'card-2',
        name: 'Charizard',
        image_url: 'https://example.com/charizard.png',
        setId: 'set-1',
        category: 'Pokemon',
        types: ['Fire'],
        dexId: [6],
        rarity: 'Rare',
        variants: [],
        set: { official: 100 }
    }
]

const mockGetFilteredCards = jest.fn()

describe('WishScreen (Edit Wishlist)', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockRouterPush.mockClear()
        mockGetFilteredCards.mockResolvedValue(mockCards)
        mockedUsePokemonCards.mockReturnValue({
            getFilteredCards: mockGetFilteredCards
        })
        // Default mock to prevent undefined errors
        mockedGetWishlist.mockResolvedValue([])
    })

    it('renders loading state when session is not available', () => {
        mockedUseAuth.mockReturnValue({
            session: null,
            loading: false
        })

        renderWithTheme(<WishScreen />)

        expect(screen.getByText('Loading Wishlist')).toBeInTheDocument()
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders loading state while auth is loading', () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: true
        })

        renderWithTheme(<WishScreen />)

        expect(screen.getByText('Loading Wishlist')).toBeInTheDocument()
    })

    it('renders loading state while fetching wishlist', () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })
        mockedGetWishlist.mockImplementation(() => new Promise(() => {}))

        renderWithTheme(<WishScreen />)

        expect(screen.getByText('Loading Wishlist')).toBeInTheDocument()
    })

    it('renders wishlist cards when loaded', async () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })
        mockedGetWishlist.mockResolvedValue([
            { cardId: 'card-1' },
            { cardId: 'card-2' }
        ])

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByAltText('Pikachu')).toBeInTheDocument()
        })

        expect(screen.getByAltText('Charizard')).toBeInTheDocument()
    })

    it('navigates to add wishlist page when add button is clicked', async () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })
        mockedGetWishlist.mockResolvedValue([])
        mockGetFilteredCards.mockResolvedValue([])

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(
                screen.queryByText('Loading Wishlist')
            ).not.toBeInTheDocument()
        })

        // Find the add button by looking for the parent button containing the icon
        const addButton = screen.getAllByRole('button')[0] // Assuming the first button is "Add"
        expect(addButton).toBeInTheDocument()

        fireEvent.click(addButton!)

        expect(mockRouterPush).toHaveBeenCalledWith(
            '/personal-profile/edit-profile/wishlist/add'
        )
    })

    it('removes card from wishlist when remove button is clicked', async () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })
        mockedGetWishlist.mockResolvedValue([{ cardId: 'card-1' }])
        mockGetFilteredCards.mockResolvedValue([mockCards[0]])
        mockedUpdateWishlist.mockResolvedValue(undefined)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByAltText('Pikachu')).toBeInTheDocument()
        })

        // Find the remove button (second button)
        const removeButton = screen.getAllByRole('button')[1] // Assuming the first button is "Add" and the second is "Remove"

        fireEvent.click(removeButton)

        await waitFor(() => {
            expect(mockedUpdateWishlist).toHaveBeenCalledWith(
                'user-1',
                'card-1',
                true
            )
        })
    })

    it('updates local state after removing card', async () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' } },
            loading: false
        })
        mockedGetWishlist.mockResolvedValue([{ cardId: 'card-1' }])
        mockGetFilteredCards.mockResolvedValue([mockCards[0]])
        mockedUpdateWishlist.mockResolvedValue(undefined)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByAltText('Pikachu')).toBeInTheDocument()
        })

        const removeButton = screen.getAllByRole('button')[1]

        fireEvent.click(removeButton)

        await waitFor(() => {
            expect(screen.queryByAltText('Pikachu')).not.toBeInTheDocument()
        })
    })

    it('does not fetch wishlist when session is undefined', () => {
        mockedUseAuth.mockReturnValue({
            session: undefined,
            loading: false
        })

        renderWithTheme(<WishScreen />)

        expect(mockedGetWishlist).not.toHaveBeenCalled()
    })

    it('fetches wishlist with correct user id', async () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'test-user-id' } },
            loading: false
        })
        mockedGetWishlist.mockResolvedValue([])
        mockGetFilteredCards.mockResolvedValue([])

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(mockedGetWishlist).toHaveBeenCalledWith('test-user-id')
        })
    })
})
