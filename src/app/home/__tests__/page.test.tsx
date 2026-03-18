import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import { User, Session } from '@supabase/supabase-js'

import HomePage from '../page'
import { useAuth } from '@/context/AuthProvider'
import { renderWithTheme } from '@/utils/testing-utils'
import { fetchUserData } from '@/utils/userDataPuller'

jest.mock('../../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('../../../components/home/PopularCards.tsx', () => ({
    __esModule: true,
    default: () => <div>Popular Cards Component</div>
}))

jest.mock('../../../components/home/Collection.tsx', () => ({
    __esModule: true,
    default: () => <div>Collection Component</div>
}))

jest.mock('../../../components/home/TradeSuggestions.tsx', () => ({
    __esModule: true,
    default: () => <div>Trade Suggestions Component</div>
}))

jest.mock('../../../utils/userDataPuller', () => ({
    fetchUserData: jest.fn()
}))

const mockedUseAuth = jest.mocked(useAuth)
const mockedFetchUserData = jest.mocked(fetchUserData)

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

const getMockUserData = (firstName = 'Test') => ({
    username: 'testuser',
    firstName,
    cardsInCollection: 100,
    cardsForTrade: 20,
    cardsLoggedthisMonth: 5,
    popularCards: [],
    recentCards: []
})

describe('Home Page', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the landing page with a user logged in', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedFetchUserData.mockResolvedValue(getMockUserData())

        renderWithTheme(<HomePage />)

        // Welcome message
        await waitFor(() => {
            expect(screen.getByText(/welcome back Test/i)).toBeInTheDocument()
        })

        // User statistics
        expect(mockedFetchUserData).toHaveBeenCalledWith('user-1', 'token-123')
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText(/cards logged this month/i)).toBeInTheDocument()
        expect(screen.getByText('100')).toBeInTheDocument()
        expect(
            screen.getByText(/total cards in collection/i)
        ).toBeInTheDocument()
        expect(screen.getByText('20')).toBeInTheDocument()
        expect(screen.getByText(/cards up for trade/i)).toBeInTheDocument()

        // Other components
        expect(screen.getByText(/Popular Cards Component/i)).toBeInTheDocument()
        expect(screen.getByText(/Collection Component/i)).toBeInTheDocument()
        expect(
            screen.getByText(/Trade Suggestions Component/i)
        ).toBeInTheDocument()
    })

    it('renders the spinner when auth is loading', () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            loading: true
        })

        renderWithTheme(<HomePage />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders user not found when session is missing', async () => {
        mockedUseAuth.mockReturnValue({
            ...baseAuthContext,
            session: null
        })

        renderWithTheme(<HomePage />)

        expect(await screen.findByText(/user not found/i)).toBeInTheDocument()
    })

    it('renders an error message when user data fetch fails', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedFetchUserData.mockRejectedValue(new Error('network error'))

        renderWithTheme(<HomePage />)

        expect(
            await screen.findByText(/failed to fetch user data/i)
        ).toBeInTheDocument()
    })

    it('falls back to username when firstName is missing', async () => {
        mockedUseAuth.mockReturnValue(baseAuthContext)
        mockedFetchUserData.mockResolvedValue(getMockUserData(''))

        renderWithTheme(<HomePage />)

        expect(
            await screen.findByText(/welcome back testuser/i)
        ).toBeInTheDocument()
    })
})
