import { renderWithTheme } from '@/utils/testing-utils'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import UserCardsPage from '../page'
import { useAuth } from '@/context/AuthProvider'
import { Session, User } from '@supabase/supabase-js'
import { getUserCards } from '@/utils/userPokemonCard'

jest.mock('../../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

const mockPush = jest.fn()
let mockCardId: string | null = 'card-id-123'

jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: () => mockCardId
    }),
    useRouter: () => ({
        push: mockPush
    })
}))

const mockedUseAuth = jest.mocked(useAuth)

jest.mock('../../../utils/userPokemonCard', () => ({
    getUserCards: jest.fn().mockResolvedValue(new Set(['card-1', 'card-2']))
}))

const mockedGetUserCards = jest.mocked(getUserCards)

jest.mock(
    '../../../components/pokemon-cards/pokemon-card-header/PokemonCardHeader',
    () => ({
        __esModule: true,
        default: ({ cardId }: { cardId: string }) => (
            <div className="pokemon-card-header" data-cardid={cardId}>
                Pokemon Card Header
            </div>
        )
    })
)

jest.mock(
    '../../../components/pokemon-cards/pokemon-card-info/PokemonCardInfo',
    () => ({
        __esModule: true,
        default: ({
            entryId,
            deleteCard
        }: {
            entryId: string
            deleteCard: boolean
        }) => (
            <div
                className="pokemon-card-info"
                data-entryid={entryId}
                data-deletecard={deleteCard.toString()}
            >
                Pokemon Card Info
            </div>
        )
    })
)

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

describe('user-cards page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockCardId = 'card-id-123'
        mockedGetUserCards.mockResolvedValue(new Set(['card-1', 'card-2']))
    })

    it('renders loading spinner when auth is loading', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            loading: true
        })

        renderWithTheme(<UserCardsPage />)
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders loading spinner when session is null', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            session: null
        })

        renderWithTheme(<UserCardsPage />)
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders loading spinner while data is loading', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            loading: false
        })
        // Make getUserCards not resolve immediately
        mockedGetUserCards.mockImplementation(() => new Promise(() => {}))

        renderWithTheme(<UserCardsPage />)
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders user cards when session is available', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<UserCardsPage />)

        await waitFor(() => {
            expect(screen.getByText('Pokemon Card Header')).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /add card/i })
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /delete cards/i })
            ).toBeInTheDocument()
        })
    })

    it('redirects to edit card page on add card click', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<UserCardsPage />)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /add card/i })
            ).toBeInTheDocument()
        })

        const addButton = screen.getByRole('button', { name: /add card/i })
        fireEvent.click(addButton)

        expect(mockPush).toHaveBeenCalledWith('/edit-card?cardId=card-id-123')
    })

    it('toggles delete mode when delete cards button is clicked', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<UserCardsPage />)

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /delete cards/i })
            ).toBeInTheDocument()
        })

        const deleteButton = screen.getByRole('button', {
            name: /delete cards/i
        })

        // Initial state - deleteCards is false
        const cardInfoElements = document.querySelectorAll('.pokemon-card-info')
        cardInfoElements.forEach((el) => {
            expect(el.getAttribute('data-deletecard')).toBe('false')
        })

        // Click to enable delete mode
        fireEvent.click(deleteButton)

        await waitFor(() => {
            const updatedCardInfoElements =
                document.querySelectorAll('.pokemon-card-info')
            updatedCardInfoElements.forEach((el) => {
                expect(el.getAttribute('data-deletecard')).toBe('true')
            })
        })

        // Click again to disable delete mode
        fireEvent.click(deleteButton)

        await waitFor(() => {
            const finalCardInfoElements =
                document.querySelectorAll('.pokemon-card-info')
            finalCardInfoElements.forEach((el) => {
                expect(el.getAttribute('data-deletecard')).toBe('false')
            })
        })
    })

    it('handles null cardId gracefully', async () => {
        mockCardId = null
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<UserCardsPage />)

        await waitFor(() => {
            expect(screen.getByText('Pokemon Card Header')).toBeInTheDocument()
        })

        // Verify cardId defaults to empty string
        const headerEl = document.querySelector('.pokemon-card-header')
        expect(headerEl?.getAttribute('data-cardid')).toBe('')

        // Verify getUserCards was called with empty string
        expect(mockedGetUserCards).toHaveBeenCalledWith('user-1', '')
    })

    it('renders multiple user cards', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedGetUserCards.mockResolvedValue(
            new Set(['card-1', 'card-2', 'card-3'])
        )

        renderWithTheme(<UserCardsPage />)

        await waitFor(() => {
            const cardInfoElements =
                document.querySelectorAll('.pokemon-card-info')
            expect(cardInfoElements).toHaveLength(3)
        })
    })

    it('renders no cards when user has none', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedGetUserCards.mockResolvedValue(new Set())

        renderWithTheme(<UserCardsPage />)

        await waitFor(() => {
            expect(screen.getByText('Pokemon Card Header')).toBeInTheDocument()
        })

        const cardInfoElements = document.querySelectorAll('.pokemon-card-info')
        expect(cardInfoElements).toHaveLength(0)
    })

    it('does not load data when session is null', async () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            session: null
        })

        renderWithTheme(<UserCardsPage />)

        // Wait a bit to ensure no async operations happen
        await new Promise((resolve) => setTimeout(resolve, 100))

        // getUserCards should not be called when session is null
        expect(mockedGetUserCards).not.toHaveBeenCalled()
    })

    it('triggers refresh after timeout', async () => {
        jest.useFakeTimers()
        mockedUseAuth.mockReturnValue(baseAuthContext)

        renderWithTheme(<UserCardsPage />)

        // Fast-forward the 500ms timeout to trigger setRefreshTrigger
        jest.advanceTimersByTime(500)

        await waitFor(() => {
            expect(screen.getByText('Pokemon Card Header')).toBeInTheDocument()
        })

        jest.useRealTimers()
    })
})
