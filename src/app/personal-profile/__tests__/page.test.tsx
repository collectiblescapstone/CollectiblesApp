import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PersonalProfileScreen from '../page'
import { useHeader } from '@/context/HeaderProvider'
import { useAuth } from '@/context/AuthProvider'
import { renderWithTheme } from '@/utils/testing-utils'
import { fetchUserProfile } from '@/utils/profiles/userIDProfilePuller'
import { UserProfile, VisibilityValues } from '@/types/personal-profile'
import { ReactNode } from 'react'

jest.mock('../../../context/HeaderProvider.tsx', () => ({
    __esModule: true,
    useHeader: jest.fn()
}))

jest.mock('../../../context/AuthProvider.tsx', () => ({
    __esModule: true,
    useAuth: jest.fn()
}))

jest.mock('../../../utils/profiles/userIDProfilePuller', () => ({
    fetchUserProfile: jest.fn()
}))

const mockRouterPush = jest.fn()
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockRouterPush
    })
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

describe('PersonalProfileScreen', () => {
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

        renderWithTheme(<PersonalProfileScreen />)

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

        renderWithTheme(<PersonalProfileScreen />)

        const spinner = document.querySelector('.chakra-spinner')
        expect(spinner).toBeInTheDocument()
    })

    it('renders error when userID is missing', async () => {
        mockedUseAuth.mockReturnValue({
            session: { user: { id: undefined }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })

        renderWithTheme(<PersonalProfileScreen />)

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

        renderWithTheme(<PersonalProfileScreen />)

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

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalled()
        })

        consoleSpy.mockRestore()
    })

    it('renders profile layout with user data', async () => {
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByTestId('profile-layout')).toBeInTheDocument()
        })

        expect(
            screen.getByText('Profile Layout - testuser')
        ).toBeInTheDocument()
        expect(screen.getByTestId('star-rating')).toBeInTheDocument()
        expect(screen.getByText('Star Rating - 4.5 (10)')).toBeInTheDocument()
    })

    it('calls setProfileID with username when user is loaded', async () => {
        const mockUser = createMockUser({ username: 'myprofile' })
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(mockSetProfileID).toHaveBeenCalledWith('myprofile')
        })
    })

    it('navigates to edit profile when edit button is clicked', async () => {
        const user = userEvent.setup()
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'user-1' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(screen.getByTestId('left-interactible')).toBeInTheDocument()
        })

        const editButton = screen
            .getByTestId('left-interactible')
            .querySelector('button')
        expect(editButton).toBeInTheDocument()

        await user.click(editButton!)

        expect(mockRouterPush).toHaveBeenCalledWith(
            '/personal-profile/edit-profile'
        )
    })

    it('calls fetchUserProfile with correct userID', async () => {
        const mockUser = createMockUser()
        mockedUseAuth.mockReturnValue({
            session: { user: { id: 'my-user-id' }, access_token: 'token' },
            loading: false,
            signOut: jest.fn()
        })
        mockedFetchUserProfile.mockResolvedValue(mockUser)

        renderWithTheme(<PersonalProfileScreen />)

        await waitFor(() => {
            expect(mockedFetchUserProfile).toHaveBeenCalledWith('my-user-id')
        })
    })
})
