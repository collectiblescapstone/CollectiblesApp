import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'

import ProfileScreen from '../page'
import { useHeader } from '@/context/HeaderProvider'
import { useProfileSelected } from '@/context/ProfileSelectionProvider'
import { renderWithTheme } from '@/utils/testing-utils'
import { fetchUserProfile } from '@/utils/profiles/userNameProfilePuller'
import { UserProfile, VisibilityValues } from '@/types/personal-profile'
import { ReactNode } from 'react'

jest.mock('../../../context/HeaderProvider.tsx', () => ({
    __esModule: true,
    useHeader: jest.fn()
}))

jest.mock('../../../context/ProfileSelectionProvider.tsx', () => ({
    __esModule: true,
    useProfileSelected: jest.fn()
}))

jest.mock('../../../utils/profiles/userNameProfilePuller', () => ({
    fetchUserProfile: jest.fn()
}))

jest.mock('../../../components/profiles/ProfileLayout.tsx', () => ({
    __esModule: true,
    default: ({
        user,
        leftInteractible,
        rightInteractible
    }: {
        user: UserProfile
        leftInteractible: ReactNode
        rightInteractible: ReactNode
    }) => (
        <div data-testid="profile-layout">
            Profile Layout - {user.username}
            <div data-testid="left-interactible">{leftInteractible}</div>
            <div data-testid="right-interactible">{rightInteractible}</div>
        </div>
    )
}))

jest.mock('../../../components/profiles/AccountOptions.tsx', () => ({
    __esModule: true,
    default: () => <div data-testid="account-options">Account Options</div>
}))

jest.mock('../../../components/profiles/StarRating.tsx', () => ({
    __esModule: true,
    default: ({
        rating,
        ratingCount
    }: {
        rating: number
        ratingCount: number
    }) => (
        <div data-testid="star-rating">
            Star Rating - {rating} ({ratingCount})
        </div>
    )
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

describe('ProfileScreen', () => {
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

        renderWithTheme(<ProfileScreen />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders spinner when profileSelected is empty (component shows spinner when user is null)', async () => {
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: '',
            setProfileSelected: jest.fn()
        })

        renderWithTheme(<ProfileScreen />)

        // The component sets error but still shows spinner because user is null
        // This tests the loading || !user condition at line 49
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders spinner when fetchUserProfile fails (user remains null)', async () => {
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'testuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockRejectedValue(new Error('Network error'))

        renderWithTheme(<ProfileScreen />)

        // Wait for the async operation to complete
        await waitFor(() => {
            expect(mockedFetchUserProfile).toHaveBeenCalled()
        })

        // The component shows spinner because loading || !user is true
        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders profile successfully with user data', async () => {
        const mockUser = createMockUser()
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'testuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<ProfileScreen />)

        await waitFor(() => {
            expect(screen.getByTestId('profile-layout')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Profile Layout - testuser')
        ).toBeInTheDocument()
        expect(screen.getByTestId('account-options')).toBeInTheDocument()
        expect(screen.getByTestId('star-rating')).toBeInTheDocument()
        expect(screen.getByText('Star Rating - 4.5 (10)')).toBeInTheDocument()
    })

    it('calls setProfileID with username when user is loaded', async () => {
        const mockUser = createMockUser()
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'testuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<ProfileScreen />)

        await waitFor(() => {
            expect(mockSetProfileID).toHaveBeenCalledWith('testuser')
        })
    })

    it('calls fetchUserProfile with correct username', async () => {
        const mockUser = createMockUser()
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: 'myuser',
            setProfileSelected: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<ProfileScreen />)

        await waitFor(() => {
            expect(mockedFetchUserProfile).toHaveBeenCalledWith('myuser')
        })
    })

    it('does not call fetchUserProfile when profileSelected is empty', async () => {
        mockedUseProfileSelected.mockReturnValue({
            profileSelected: '',
            setProfileSelected: jest.fn()
        })

        renderWithTheme(<ProfileScreen />)

        // Give time for any async operations
        await waitFor(() => {
            expect(mockedFetchUserProfile).not.toHaveBeenCalled()
        })
    })
})
