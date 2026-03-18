import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'

import WishScreen from '../page'
import { useHeader } from '@/context/HeaderProvider'
import { useAuth } from '@/context/AuthProvider'
import { renderWithTheme } from '@/utils/testing-utils'
import { fetchUserProfile } from '@/utils/profiles/userIDProfilePuller'
import { UserProfile, VisibilityValues } from '@/types/personal-profile'

jest.mock('../../../../context/HeaderProvider.tsx', () => ({
    __esModule: true,
    useHeader: jest.fn()
}))

jest.mock('../../../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('../../../../utils/profiles/userIDProfilePuller', () => ({
    fetchUserProfile: jest.fn()
}))

const mockedUseHeader = jest.mocked(useHeader)
const mockedUseAuth = useAuth as jest.Mock
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

describe('WishScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseHeader.mockReturnValue({
            profileId: 'Kollec',
            setProfileID: mockSetProfileID
        })
    })

    it('renders loading spinner when session is not available', () => {
        mockedUseAuth.mockReturnValue({
            session: null,
            loading: false,
            signOut: jest.fn()
        })

        renderWithTheme(<WishScreen />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders loading spinner while loading', () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockImplementation(() => new Promise(() => {}))

        renderWithTheme(<WishScreen />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders error when userID is missing', async () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: undefined }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByText('No user ID found')).toBeInTheDocument()
        })
    })

    it('renders error when fetchUserProfile fails', async () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockRejectedValue(new Error('Network error'))

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(
                screen.getByText('Failed to fetch user profile')
            ).toBeInTheDocument()
        })
    })

    it('logs error when fetchUserProfile throws', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockRejectedValue(new Error('API Error'))

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalled()
        })

        consoleSpy.mockRestore()
    })

    it('renders wish list with user full name when available', async () => {
        const mockUser = createMockUser({
            firstName: 'Jane',
            lastName: 'Smith',
            wishlist: [
                {
                    card: {
                        name: 'Mewtwo',
                        image_url: 'https://example.com/mewtwo.png'
                    }
                },
                {
                    card: {
                        name: 'Blastoise',
                        image_url: 'https://example.com/blastoise.png'
                    }
                }
            ]
        })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeInTheDocument()
        })

        expect(screen.getByText('Wish List - 2 Items')).toBeInTheDocument()
    })

    it('renders username as fallback when no first/last name', async () => {
        const mockUser = createMockUser({
            firstName: null,
            lastName: null,
            username: 'wishcollector'
        })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByText('wishcollector')).toBeInTheDocument()
        })
    })

    it('renders wish cards with correct image URLs', async () => {
        const mockUser = createMockUser({
            wishlist: [
                {
                    card: {
                        name: 'Mewtwo',
                        image_url: 'https://example.com/mewtwo.png'
                    }
                }
            ]
        })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            const img = screen.getByAltText('Mewtwo')
            expect(img).toBeInTheDocument()
            expect(img).toHaveAttribute('src', 'https://example.com/mewtwo.png')
        })
    })

    it('calls setProfileID with username when user is loaded', async () => {
        const mockUser = createMockUser({ username: 'wishuser' })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(mockSetProfileID).toHaveBeenCalledWith('wishuser')
        })
    })

    it('renders empty wish list correctly', async () => {
        const mockUser = createMockUser({ wishlist: [] })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByText('Wish List - 0 Items')).toBeInTheDocument()
        })
    })
})
