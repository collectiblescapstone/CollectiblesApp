import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'

import TradeScreen from '../page'
import { useHeader } from '@/context/HeaderProvider'
import { renderWithTheme } from '@/utils/testing-utils'
import { fetchUserProfile } from '@/utils/profiles/userNameProfilePuller'
import { UserProfile, VisibilityValues } from '@/types/personal-profile'

jest.mock('../../../../context/HeaderProvider.tsx', () => ({
    __esModule: true,
    useHeader: jest.fn()
}))

jest.mock('../../../../utils/profiles/userNameProfilePuller', () => ({
    fetchUserProfile: jest.fn()
}))

const mockSearchParams = new Map<string, string>()

jest.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: (key: string) => mockSearchParams.get(key) ?? null
    })
}))

const mockedUseHeader = jest.mocked(useHeader)
const mockedFetchUserProfile = jest.mocked(fetchUserProfile)

const createMockUser = (overrides: Partial<UserProfile> = {}): UserProfile => ({
    id: 'user-1',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    bio: 'Test bio',
    location: 'Test Location',
    longitude: null,
    latitude: null,
    instagram: '',
    x: '',
    facebook: '',
    discord: '',
    whatsapp: '',
    profile_pic: 1,
    visibility: VisibilityValues.Public,
    rating: 4.5,
    rating_count: 10,
    wishlist: [],
    tradeList: [],
    showcaseList: [],
    ...overrides
})

const mockSetProfileID = jest.fn()

describe('TradeScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockSearchParams.clear()
        mockedUseHeader.mockReturnValue({
            profileId: 'Kollec',
            setProfileID: mockSetProfileID
        })
    })

    it('renders loading spinner initially', () => {
        mockSearchParams.set('username', 'testuser')
        mockedFetchUserProfile.mockImplementation(() => new Promise(() => {}))

        renderWithTheme(<TradeScreen />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders error when username search param is missing', async () => {
        renderWithTheme(<TradeScreen />)

        await waitFor(() => {
            expect(screen.getByText('No user name found')).toBeInTheDocument()
        })
    })

    it('renders error when fetchUserProfile fails', async () => {
        mockSearchParams.set('username', 'testuser')
        mockedFetchUserProfile.mockRejectedValue(new Error('Network error'))

        renderWithTheme(<TradeScreen />)

        await waitFor(() => {
            expect(
                screen.getByText('Failed to fetch user profile')
            ).toBeInTheDocument()
        })
    })

    it('renders error when fetchUserProfile returns null (causes error accessing username)', async () => {
        mockSearchParams.set('username', 'testuser')
        mockedFetchUserProfile.mockResolvedValue(null as unknown as UserProfile)

        renderWithTheme(<TradeScreen />)

        // When fetchUserProfile returns null, the code tries to access data.username
        // which throws an error and results in "Failed to fetch user profile"
        await waitFor(() => {
            expect(
                screen.getByText('Failed to fetch user profile')
            ).toBeInTheDocument()
        })
    })

    it('renders trade list with user full name when available', async () => {
        const mockUser = createMockUser({
            firstName: 'John',
            lastName: 'Doe',
            tradeList: [
                {
                    card: {
                        name: 'Pikachu',
                        image_url: 'https://example.com/pikachu'
                    }
                },
                {
                    card: {
                        name: 'Charizard',
                        image_url: 'https://example.com/charizard'
                    }
                }
            ]
        })
        mockSearchParams.set('username', 'testuser')
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<TradeScreen />)

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument()
        })

        expect(screen.getByText('Trade List - 2 Items')).toBeInTheDocument()
    })

    it('renders username as fallback when no first/last name', async () => {
        const mockUser = createMockUser({
            firstName: null,
            lastName: null,
            username: 'pokemontrader'
        })
        mockSearchParams.set('username', 'pokemontrader')
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<TradeScreen />)

        await waitFor(() => {
            expect(screen.getByText('pokemontrader')).toBeInTheDocument()
        })
    })

    it('renders trade cards with correct image URLs', async () => {
        const mockUser = createMockUser({
            tradeList: [
                {
                    card: {
                        name: 'Pikachu',
                        image_url: 'https://example.com/pikachu'
                    }
                }
            ]
        })
        mockSearchParams.set('username', 'testuser')
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<TradeScreen />)

        await waitFor(() => {
            const img = screen.getByAltText('Pikachu')
            expect(img).toBeInTheDocument()
            expect(img).toHaveAttribute(
                'src',
                'https://example.com/pikachu/high.png'
            )
        })
    })

    it('calls setProfileID with username when user is loaded', async () => {
        const mockUser = createMockUser({ username: 'myuser' })
        mockSearchParams.set('username', 'myuser')
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<TradeScreen />)

        await waitFor(() => {
            expect(mockSetProfileID).toHaveBeenCalledWith('myuser')
        })
    })

    it('renders empty trade list correctly', async () => {
        const mockUser = createMockUser({ tradeList: [] })
        mockSearchParams.set('username', 'testuser')
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<TradeScreen />)

        await waitFor(() => {
            expect(screen.getByText('Trade List - 0 Items')).toBeInTheDocument()
        })
    })
})
