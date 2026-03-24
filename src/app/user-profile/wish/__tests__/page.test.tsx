import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'

import WishScreen from '../page'
import { useHeader } from '@/context/HeaderProvider'
import { useProfileSelected } from '@/context/ProfileSelectionProvider'
import { renderWithTheme } from '@/utils/testing-utils'
import { fetchUserProfile } from '@/utils/profiles/userNameProfilePuller'
import { UserProfile, VisibilityValues } from '@/types/personal-profile'

jest.mock('../../../../context/HeaderProvider.tsx', () => ({
    __esModule: true,
    useHeader: jest.fn()
}))

jest.mock('../../../../context/ProfileSelectionProvider.tsx', () => ({
    __esModule: true,
    useProfileSelected: jest.fn()
}))

jest.mock('../../../../utils/profiles/userNameProfilePuller', () => ({
    fetchUserProfile: jest.fn()
}))

const mockedUseHeader = jest.mocked(useHeader)
const mockedUseProfileSelected = jest.mocked(useProfileSelected)
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

    it('renders loading spinner initially', () => {
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'testuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockImplementation(() => new Promise(() => {}))

        renderWithTheme(<WishScreen />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders error when profileSelected is missing', async () => {
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: '',
            setProfileSelected: jest.fn()
        })

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByText('No user name found')).toBeInTheDocument()
        })
    })

    it('renders error when fetchUserProfile fails', async () => {
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'testuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockRejectedValue(new Error('Network error'))

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(
                screen.getByText('Failed to fetch user profile')
            ).toBeInTheDocument()
        })
    })

    it('renders error when fetchUserProfile returns null (causes error accessing username)', async () => {
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'testuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(null as unknown as UserProfile)

        renderWithTheme(<WishScreen />)

        // When fetchUserProfile returns null, the code tries to access data.username
        // which throws an error and results in "Failed to fetch user profile"
        await waitFor(() => {
            expect(
                screen.getByText('Failed to fetch user profile')
            ).toBeInTheDocument()
        })
    })

    it('renders wish list with user full name when available', async () => {
        const mockUser = createMockUser({
            firstName: 'Jane',
            lastName: 'Smith',
            wishlist: [
                {
                    card: {
                        name: 'Mewtwo',
                        image_url: 'https://example.com/mewtwo'
                    }
                },
                {
                    card: {
                        name: 'Blastoise',
                        image_url: 'https://example.com/blastoise'
                    }
                }
            ]
        })
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'testuser',
            setProfileSelected: jest.fn()
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
            username: 'cardcollector'
        })
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'cardcollector',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByText('cardcollector')).toBeInTheDocument()
        })
    })

    it('renders wish cards with correct image URLs', async () => {
        const mockUser = createMockUser({
            wishlist: [
                {
                    card: {
                        name: 'Mewtwo',
                        image_url: 'https://example.com/mewtwo'
                    }
                }
            ]
        })
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'testuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            const img = screen.getByAltText('Mewtwo')
            expect(img).toBeInTheDocument()
            expect(img).toHaveAttribute('src', 'https://example.com/mewtwo')
        })
    })

    it('calls setProfileID with username when user is loaded', async () => {
        const mockUser = createMockUser({ username: 'wishuser' })
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'wishuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(mockSetProfileID).toHaveBeenCalledWith('wishuser')
        })
    })

    it('renders empty wish list correctly', async () => {
        const mockUser = createMockUser({ wishlist: [] })
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'testuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<WishScreen />)

        await waitFor(() => {
            expect(screen.getByText('Wish List - 0 Items')).toBeInTheDocument()
        })
    })
})
